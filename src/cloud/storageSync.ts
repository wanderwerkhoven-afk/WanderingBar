import {
  collection, doc, getDocFromServer, getDocsFromServer, onSnapshot, setDoc, writeBatch,
  type DocumentData, type QuerySnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CATALOG_STORAGE_KEY } from '../data/menuCatalog';
import {
  DELETED_EVENTS_STORAGE_KEY, EVENT_STORAGE_KEY, INVENTORY_STORAGE_KEY,
} from '../repositories/storageKeys';

export const DATASETS = ['events', 'deletedEvents', 'inventory', 'catalog'] as const;
export type Dataset = (typeof DATASETS)[number];
export type RawLocal = Record<Dataset, string | null>;
type Row = { id: string; value: string; position: number };
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

export function localOwner(): string | null { return localStorage.getItem(OWNER_KEY); }
export function claimLocalOwner(uid: string): void {
  const owner = localOwner();
  if (owner && owner !== uid) throw new Error('Deze browser bevat BarBack-gegevens van een ander Google-account. Log in met dat account of gebruik een ander browserprofiel.');
  localStorage.setItem(OWNER_KEY, uid);
}

export function readLocal(): RawLocal {
  return Object.fromEntries(DATASETS.map(k => [k, localStorage.getItem(KEYS[k])])) as RawLocal;
}

function parsed(raw: string | null, dataset: Dataset): Record<string, unknown>[] {
  if (raw === null) return [];
  const records: unknown = JSON.parse(raw);
  if (!Array.isArray(records)) throw new Error(`De lokale ${dataset}-gegevens zijn ongeldig; ze zijn niet gewijzigd.`);
  return records as Record<string, unknown>[];
}

function recordId(dataset: Dataset, value: Record<string, unknown>): string {
  const key = dataset === 'catalog' ? value.name
    : dataset === 'deletedEvents' ? (value.event as Record<string, unknown> | undefined)?.id
    : value.id;
  if ((typeof key !== 'string' && typeof key !== 'number') || String(key).length === 0) {
    throw new Error(`Een ${dataset}-record mist een geldige identificatie. Lokale gegevens zijn behouden.`);
  }
  return encodeURIComponent(String(key));
}

function rowsFromLocal(dataset: Dataset, raw: string | null): Row[] {
  const ids = new Set<string>();
  return parsed(raw, dataset).map((entry, position) => {
    const id = recordId(dataset, entry);
    if (ids.has(id)) throw new Error(`Dubbel ${dataset}-record (${id}); gegevens niet overschreven.`);
    ids.add(id);
    const value = JSON.stringify(entry);
    // Firestore has a 1 MiB document limit. Images are already compressed by the app.
    if (new Blob([value]).size > 900_000) throw new Error(`Een ${dataset}-record is te groot voor Firestore. De lokale kopie blijft behouden.`);
    return { id, value, position };
  });
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
    // No cloud records and no existing key means "use built-in starter data".
    // This matters for the bundled cocktail catalog and inventory defaults.
    if (!remote[dataset].length && localStorage.getItem(KEYS[dataset]) === null) continue;
    localStorage.setItem(KEYS[dataset], values[dataset] ?? '[]');
  }
}

async function fetchRemote(uid: string): Promise<RemoteData> {
  const entries = await Promise.all(DATASETS.map(async dataset =>
    [dataset, snapshotRows(await getDocsFromServer(collectionRef(uid, dataset)))] as const));
  return Object.fromEntries(entries) as RemoteData;
}

async function writeDataset(uid: string, dataset: Dataset, desired: Row[], previous: Row[]): Promise<void> {
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
        batch.set(doc(collectionRef(uid, dataset), change.row.id), {
          value: change.row.value, position: change.row.position,
        });
      } else {
        batch.delete(doc(collectionRef(uid, dataset), change.id));
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
  hasConflict: boolean;
  exportBackup: () => void;
  activate: (choice?: 'cloud' | 'merge') => Promise<RemoteData>;
};

export async function prepareSync(uid: string): Promise<PreparedSync> {
  if (localOwner() && localOwner() !== uid) {
    throw new Error('De lokale BarBack-gegevens horen bij een ander Google-account. Gebruik dat account of een ander browserprofiel.');
  }
  const local = readLocal();
  for (const dataset of DATASETS) rowsFromLocal(dataset, local[dataset]);
  const [remote, workspace] = await Promise.all([
    fetchRemote(uid), getDocFromServer(doc(db, 'users', uid, 'meta', 'workspace')),
  ]);
  // Keep a permanent initialization marker. Without this, an intentionally
  // empty workspace could be mistaken for a new account and old events revived.
  const cloudHasData = workspace.exists() || DATASETS.some(dataset => remote[dataset].length > 0);
  const localHasData = DATASETS.some(dataset => parsed(local[dataset], dataset).length > 0);
  const cloudRaw = remoteRaws(remote);
  const same = DATASETS.every(dataset => (local[dataset] ?? '[]') === cloudRaw[dataset]);
  const lastSynced = localStorage.getItem(SYNC_PREFIX + uid) === fingerprint(local);
  const hasConflict = cloudHasData && localHasData && !same && !lastSynced;

  return {
    uid, remote, hasConflict,
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
      if (!cloudHasData) {
        for (const dataset of DATASETS) {
          const wanted = rowsFromLocal(dataset, local[dataset]);
          await writeDataset(uid, dataset, wanted, []);
          remote[dataset] = wanted;
        }
      } else if (choice === 'merge' && hasConflict) {
        for (const dataset of DATASETS) {
          const merged = mergeRows(dataset, remote[dataset], local[dataset]);
          await writeDataset(uid, dataset, merged, remote[dataset]);
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
      claimLocalOwner(uid);
      markSynced(uid);
      return remote;
    },
  };
}

export function startLiveSync(
  uid: string, initial: RemoteData,
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
    const unsubscribe = onSnapshot(collectionRef(uid, dataset), snapshot => {
      if (stopped || snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites || busy.has(dataset)) return;
      try {
        const next = snapshotRows(snapshot);
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
        // Existing mounted screens still have their own React state; prevent an
        // edit in a stale screen from silently overwriting these remote changes.
        conflict = true;
        onRemote();
      } catch (error) { onStatus('error'); onError(error instanceof Error ? error.message : 'Cloudgegevens lezen mislukt.'); }
    }, error => { onStatus('error'); onError(`Firestore: ${error.message}`); });
    unsubscribers.push(unsubscribe);
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
          await writeDataset(uid, dataset, wanted, remote[dataset]);
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
