import {
  collection, doc, getDocFromServer, getDocsFromServer, onSnapshot, setDoc, writeBatch,
  type DocumentData, type QuerySnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CATALOG_CATEGORIES, INVENTORY_CATEGORIES, v3Paths } from './firestoreV3';
import { CATALOG_STORAGE_KEY } from '../data/menuCatalog';
import {
  DELETED_EVENTS_STORAGE_KEY, EVENT_STORAGE_KEY, INVENTORY_STORAGE_KEY,
} from '../repositories/storageKeys';
import { rowsFromLocal, type Dataset, type Row } from './localRows';

export const DATASETS = ['events', 'deletedEvents', 'inventory', 'catalog'] as const;
export type { Dataset } from './localRows';
export type RawLocal = Record<Dataset, string | null>;
type RemoteData = Record<Dataset, Row[]>;
const KEYS: Record<Dataset, string> = {
  events: EVENT_STORAGE_KEY,
  deletedEvents: DELETED_EVENTS_STORAGE_KEY,
  inventory: INVENTORY_STORAGE_KEY,
  catalog: CATALOG_STORAGE_KEY,
};
const OWNER_KEY = 'barback-firebase-local-owner-v1';
const SYNC_PREFIX = 'barback-firebase-synced-v1-';
const INVENTORY_MIGRATION_KEY = 'wandering-barback-inventory-expanded-zero-v1';

const collectionRef = (uid: string, dataset: Dataset) => collection(db, 'users', uid, dataset);
type SyncMode = 'legacy' | 'v3';
const v3Collections = (dataset: Dataset) => dataset === 'catalog'
  ? CATALOG_CATEGORIES.map(category => collection(db, [...v3Paths.workspace(), 'catalog', category, 'products'].join('/')))
  : dataset === 'inventory'
    ? INVENTORY_CATEGORIES.map(category => collection(db, [...v3Paths.workspace(), 'inventory', category, 'items'].join('/')))
    : [collection(db, [...v3Paths.workspace(), dataset].join('/'))];
function v3Rows(snapshot: QuerySnapshot<DocumentData>): Row[] {
  return snapshot.docs.map(entry => {
    const data = entry.data();
    if (typeof data.legacyValue !== 'string' || typeof data.legacyId !== 'string' || !Number.isInteger(data.position)) {
      throw new Error('Onbekend v3-record. De lokale gegevens zijn niet gewijzigd.');
    }
    return { id: data.legacyId, value: data.legacyValue, position: data.position as number };
  });
}
function v3Category(dataset: Dataset, row: Row): string {
  const value = JSON.parse(row.value) as Record<string, unknown>;
  const type = String(dataset === 'catalog' ? value.type ?? '' : value.category ?? '').toLowerCase();
  if (dataset === 'catalog') {
    if (type.includes('mocktail') || type.includes('alcoholvrij')) return 'Mocktail';
    if (type.includes('wine') || type.includes('wijn')) return 'Wijn';
    if (type.includes('beer') || type.includes('bier')) return 'Bier';
    if (type.includes('cocktail') || type.includes('gin') || type.includes('g&t')) return 'Cocktail';
  } else if (dataset === 'inventory') {
    if (/drank|alcohol|bier|wijn|gin|spirit|siroop|fris|beverage/.test(type)) return 'Dranken';
    if (/garner|fruit|garnish|kruid/.test(type)) return 'Garneringen';
    if (/verbruik|dispos|servet|rietje/.test(type)) return 'Verbruiksartikelen';
    if (/bar|materiaal|glas|apparatuur|equipment|tools/.test(type)) return 'BarMaterialen';
  }
  throw new Error('Onbekende v3-categorie voor ' + dataset + ': ' + type);
}
function v3Path(dataset: Dataset, row: Row): string {
  if (dataset === 'events') return v3Paths.event(row.id).join('/');
  if (dataset === 'deletedEvents') {
    const event = (JSON.parse(row.value) as { event?: { id?: string } }).event;
    return v3Paths.deletedEvent(String(event?.id ?? row.id)).join('/');
  }
  if (dataset === 'inventory') return v3Paths.inventoryItem(v3Category(dataset, row) as typeof INVENTORY_CATEGORIES[number], row.id).join('/');
  const productId = 'prod_' + Array.from(new TextEncoder().encode(row.id), n => n.toString(16).padStart(2, '0')).join('');
  return v3Paths.catalogProduct(v3Category(dataset, row) as typeof CATALOG_CATEGORIES[number], productId).join('/');
}
async function detectMode(uid: string): Promise<SyncMode> {
  let root;
  try {
    root = await getDocFromServer(doc(db, v3Paths.workspace().join('/')));
  } catch (error) {
    // A denied v3 root read must never lock the user out of their existing
    // owner-scoped legacy workspace. Legacy access is checked separately.
    if (error && typeof error === 'object' && 'code' in error &&
        error.code === 'permission-denied') {
      await getDocFromServer(doc(db, 'users', uid, 'meta', 'workspace'));
      return 'legacy';
    }
    throw error;
  }
  if (!root.exists()) return 'legacy';
  const data = root.data();
  if (data.ownerUid !== uid) throw new Error('De WanderingBar-workspace hoort bij een ander account.');
  if (data.migrationStatus !== 'copied-not-active' && data.migrationStatus !== 'active') return 'legacy';
  if (!Number.isInteger(data.verifiedRecords)) throw new Error('De v3-kopie is niet aantoonbaar gecontroleerd.');
  const legacy = await fetchRemote(uid, 'legacy');
  const fresh = await fetchRemote(uid, 'v3');
  const count = DATASETS.reduce((n, dataset) => n + fresh[dataset].length, 0);
  if (count !== data.verifiedRecords || DATASETS.some(dataset =>
    JSON.stringify(legacy[dataset].map(r => [r.id,r.value]).sort((a,b) => String(a[0]).localeCompare(String(b[0])))) !==
    JSON.stringify(fresh[dataset].map(r => [r.id,r.value]).sort((a,b) => String(a[0]).localeCompare(String(b[0]))))
  )) throw new Error('De v3-kopie wijkt af van de oude cloudgegevens. Er is niets overschreven; herstel de migratie eerst.');
  return 'v3';
}

export function localOwner(): string | null { return localStorage.getItem(OWNER_KEY); }
export function claimLocalOwner(uid: string): void {
  const owner = localOwner();
  if (owner && owner !== uid) throw new Error('Deze browser bevat BarBack-gegevens van een ander Google-account. Log in met dat account of gebruik een ander browserprofiel.');
  localStorage.setItem(OWNER_KEY, uid);
}

export function readLocal(): RawLocal {
  return Object.fromEntries(DATASETS.map(k => [k, localStorage.getItem(KEYS[k])])) as RawLocal;
}

function snapshotRows(snapshot: QuerySnapshot<DocumentData>): Row[] {
  return snapshot.docs.map(entry => {
    const data = entry.data();
    if (typeof data.value !== 'string' || !Number.isInteger(data.position)) {
      throw new Error('Cloudgegevens hebben een onbekend formaat. Er is niets lokaal overschreven.');
    }
    return { id: entry.id, value: data.value, position: data.position as number };
  }).sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
}

/** Queryable Firestore fields alongside the legacy value envelope (v1-compatible). */
function structuredRecord(dataset: Dataset, row: Row): Record<string, unknown> {
  const value: unknown = JSON.parse(row.value);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ongeldig cloudrecord.');
  const record = value as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name : '';
  const slug = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  const fields: Record<string, unknown> = { schemaVersion: 2, recordId: row.id, slug, name };
  const keys = dataset === 'catalog'
    ? ['type','ingredients','tasteProfile','alcoholPercentage','wineCategory','grapes','country','region','sourceUrl','image','imageUrl']
    : dataset === 'inventory'
      ? ['id','category','subcategory','quantity','unit','location','notes','brand','price','supplier','priceCheckedAt','webLink','image','imageUrl','recipe']
      : ['id','title','name','date','status'];
  for (const key of keys) {
    const field = record[key];
    if (field !== undefined && field !== null && typeof field !== 'function') fields[key] = field;
  }
  return fields;
}

function toRaw(rows: Row[]): string { return JSON.stringify(rows.map(row => JSON.parse(row.value))); }
function remoteRaws(remote: RemoteData): RawLocal {
  return Object.fromEntries(DATASETS.map(k => [k, toRaw(remote[k])])) as RawLocal;
}

function fingerprint(local: RawLocal): string {
  // Stable, compact cache marker; never duplicates large image data in localStorage.
  let hash = 2166136261;
  for (const dataset of DATASETS) {
    const value = dataset + ':' + String(local[dataset]);
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return String(hash >>> 0);
}

function markSynced(uid: string, expected?: RawLocal): void {
  if (expected && DATASETS.some(dataset => readLocal()[dataset] !== expected[dataset])) return;
  try { localStorage.setItem(SYNC_PREFIX + uid, fingerprint(readLocal())); } catch { /* Cache marker is optional. */ }
}

function replaceLocal(remote: RemoteData): void {
  const values = remoteRaws(remote);
  for (const dataset of DATASETS) {
    // Cloud-only must reproduce an intentionally empty workspace as [] too.
    // Leaving a missing key would re-seed sample records on this device.
    localStorage.setItem(KEYS[dataset], values[dataset] ?? '[]');
  }
}

async function fetchRemote(uid: string, mode: SyncMode): Promise<RemoteData> {
  const entries = await Promise.all(DATASETS.map(async dataset =>
    [dataset, mode === 'legacy' ? snapshotRows(await getDocsFromServer(collectionRef(uid, dataset))) :
      (await Promise.all(v3Collections(dataset).map(ref => getDocsFromServer(ref)))).flatMap(v3Rows)
        .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))] as const));
  return Object.fromEntries(entries) as RemoteData;
}

async function writeDataset(uid: string, dataset: Dataset, desired: Row[], previous: Row[], mode: SyncMode): Promise<void> {
  const existing = new Map(previous.map(row => [row.id, row]));
  const wanted = new Map(desired.map(row => [row.id, row]));
  const changes: Array<{ type: 'set'; row: Row } | { type: 'delete'; id: string }> = [];
  for (const row of desired) {
    const old = existing.get(row.id);
    if (!old || old.value !== row.value || old.position !== row.position) {
      changes.push({ type: 'set', row });
    }
  }
  for (const old of previous) {
    if (!wanted.has(old.id)) changes.push({ type: 'delete', id: old.id });
  }
  // Firestore batches are atomic. Chunking keeps migrations safe for large inventories.
  for (let start = 0; start < changes.length; start += 250) {
    const batch = writeBatch(db);
    for (const change of changes.slice(start, start + 250)) {
      if (change.type === 'set') {
        if (mode === 'legacy') {
          batch.set(doc(collectionRef(uid, dataset), change.row.id), {
            value: change.row.value, position: change.row.position,
            ...structuredRecord(dataset, change.row),
          });
        } else {
          const path = v3Path(dataset, change.row);
          const record = JSON.parse(change.row.value) as Record<string, unknown>;
          batch.set(doc(db, path), {
            ...record, legacyValue: change.row.value, legacyId: change.row.id,
            position: change.row.position, schemaVersion: 3,
            ...(dataset === 'catalog' ? { productId: path.split('/').pop() } : {}),
          });
          const old = existing.get(change.row.id);
          if (old && v3Path(dataset, old) !== path) batch.delete(doc(db, v3Path(dataset, old)));
        }
      } else {
        const old = existing.get(change.id);
        if (old) batch.delete(mode === 'legacy' ? doc(collectionRef(uid, dataset), change.id) : doc(db, v3Path(dataset, old)));
      }
    }
    await batch.commit();
  }
}

function mergeRows(dataset: Dataset, remote: Row[], local: string | null): Row[] {
  const localRows = rowsFromLocal(dataset, local);
  const localIds = new Set(localRows.map(row => row.id));
  return [...localRows, ...remote.filter(row => !localIds.has(row.id))]
    .map((row, position) => ({ ...row, position }));
}

export type PreparedSync = {
  uid: string;
  remote: RemoteData;
  mode: SyncMode;
  hasConflict: boolean;
  canMerge: boolean;
  localProblem: string | null;
  exportBackup: () => void;
  activate: (choice?: 'cloud' | 'merge') => Promise<RemoteData>;
};

export async function prepareSync(uid: string): Promise<PreparedSync> {
  const differentOwner = Boolean(localOwner() && localOwner() !== uid);
  const local = readLocal();
  // Do not validate or normalize local rows before offering a cloud-only choice.
  // Legacy/corrupt browser records must not lock users out of their cloud data.
  const mode = await detectMode(uid);
  const [remote, workspace] = await Promise.all([
    fetchRemote(uid, mode), getDocFromServer(doc(db, 'users', uid, 'meta', 'workspace')),
  ]);
  // Keep a permanent initialization marker. Without this, an intentionally
  // empty workspace could be mistaken for a new account and old events revived.
  const cloudHasData = workspace.exists() || DATASETS.some(dataset => remote[dataset].length > 0);
  const localHasData = DATASETS.some(dataset => local[dataset] !== null && local[dataset] !== '[]');
  let localProblem: string | null = null;
  try { for (const dataset of DATASETS) rowsFromLocal(dataset, local[dataset]); }
  catch (error) { localProblem = error instanceof Error ? error.message : 'Onleesbare lokale gegevens.'; }
  const cloudRaw = remoteRaws(remote);
  const same = DATASETS.every(dataset => (local[dataset] ?? '[]') === cloudRaw[dataset]);
  const lastSynced = localStorage.getItem(SYNC_PREFIX + uid) === fingerprint(local);
  const hasConflict = differentOwner || Boolean(localProblem) || (cloudHasData && localHasData && !same && !lastSynced);

  return {
    uid, remote, mode, hasConflict, canMerge: !differentOwner && !localProblem,
    localProblem: differentOwner ? 'Dit apparaat heeft lokale gegevens van een ander Google-account.' : localProblem,
    exportBackup() {
      const file = { format: 'WanderingBarBack-backup-v1', exportedAt: new Date().toISOString(),
        project: 'barback-20df5', local: readLocal(), cloud: remoteRaws(remote) };
      const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `barback-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    async activate(choice = 'cloud') {
      if (hasConflict && choice === 'merge' && (differentOwner || localProblem)) {
        throw new Error('Deze lokale gegevens kunnen niet veilig worden samengevoegd. Download de back-up en kies daarna dit apparaat opnieuw instellen.');
      }
      if (!cloudHasData && !(hasConflict && choice === 'cloud')) {
        for (const dataset of DATASETS) {
          const wanted = rowsFromLocal(dataset, local[dataset]);
          await writeDataset(uid, dataset, wanted, [], mode);
          remote[dataset] = wanted;
          // Correct duplicate legacy inventory IDs in the local working copy
          // only after the cloud upload has completed successfully.
          if (local[dataset] !== null && toRaw(wanted) !== local[dataset]) {
            localStorage.setItem(KEYS[dataset], toRaw(wanted));
          }
        }
      } else if (choice === 'merge' && hasConflict) {
        for (const dataset of DATASETS) {
          const merged = mergeRows(dataset, remote[dataset], local[dataset]);
          await writeDataset(uid, dataset, merged, remote[dataset], mode);
          remote[dataset] = merged;
        }
        replaceLocal(remote);
      } else {
        replaceLocal(remote);
      }
      await setDoc(doc(db, 'users', uid, 'meta', 'workspace'), {
        version: 1, initializedAt: workspace.data()?.initializedAt ?? new Date().toISOString(),
      }, { merge: true });
      // Set owner only once cloud read/write has succeeded. Never clear legacy data.
      // The old inventory screen has a one-time migration that resets quantities
      // to zero. Do not run that on restored cloud inventory on a new device.
      localStorage.setItem(INVENTORY_MIGRATION_KEY, 'yes');
      if (differentOwner && choice === 'cloud') localStorage.setItem(OWNER_KEY, uid);
      claimLocalOwner(uid);
      markSynced(uid);
      return remote;
    },
  };
}

export function startLiveSync(
  uid: string, initial: RemoteData, mode: SyncMode,
  onRemote: () => void, onError: (message: string) => void,
  onStatus: (status: 'synced' | 'syncing' | 'error') => void,
): () => void {
  let stopped = false;
  let conflict = false;
  const busy = new Set<Dataset>();
  const baseline = readLocal();
  const remote: RemoteData = initial;
  const unsubscribers: Unsubscribe[] = [];
  onStatus('synced');

  for (const dataset of DATASETS) {
    const refs = mode === 'v3' ? v3Collections(dataset) : [collectionRef(uid, dataset)];
    const segments = new Map<string, Row[]>();
    for (const ref of refs) {
      const unsubscribe = onSnapshot(ref, snapshot => {
        if (stopped || snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites || busy.has(dataset)) return;
        try {
          segments.set(ref.path, mode === 'v3' ? v3Rows(snapshot) : snapshotRows(snapshot));
          if (segments.size !== refs.length) return;
          const next = Array.from(segments.values()).flat()
            .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
          if (JSON.stringify(next) === JSON.stringify(remote[dataset])) return;
          if (readLocal()[dataset] !== baseline[dataset]) {
            conflict = true;
            onStatus('error');
            onError('Er zijn tegelijkertijd lokale en online wijzigingen. Maak een back-up en herlaad de pagina om ze samen te voegen.');
            return;
          }
          remote[dataset] = next;
          localStorage.setItem(KEYS[dataset], toRaw(next));
          baseline[dataset] = readLocal()[dataset];
          markSynced(uid, baseline);
          conflict = true;
          onRemote();
        } catch (error) { onStatus('error'); onError(error instanceof Error ? error.message : 'Cloudgegevens lezen mislukt.'); }
      }, error => { onStatus('error'); onError('Firestore: ' + error.message); });
      unsubscribers.push(unsubscribe);
    }
  }

  const flush = () => {
    if (stopped || conflict) return;
    const current = readLocal();
    for (const dataset of DATASETS) {
      if (busy.has(dataset) || current[dataset] === baseline[dataset]) continue;
      busy.add(dataset);
      onStatus('syncing');
      const raw = current[dataset];
      void (async () => {
        try {
          const wanted = rowsFromLocal(dataset, raw);
          await writeDataset(uid, dataset, wanted, remote[dataset], mode);
          remote[dataset] = wanted;
          baseline[dataset] = raw;
          markSynced(uid, baseline);
        } catch (error) {
          onStatus('error');
          onError(error instanceof Error ? error.message : 'Synchroniseren mislukt. Lokale gegevens zijn behouden.');
        } finally {
          busy.delete(dataset);
          if (!stopped && !conflict && busy.size === 0 &&
              DATASETS.every(key => readLocal()[key] === baseline[key])) onStatus('synced');
        }
      })();
    }
  };
  const poll = window.setInterval(flush, 1200);
  window.addEventListener('barback-sync-request', flush);

  return () => {
    stopped = true;
    window.clearInterval(poll);
    window.removeEventListener('barback-sync-request', flush);
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
}
