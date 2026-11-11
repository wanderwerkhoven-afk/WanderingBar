import { useState } from 'react';
import { collection, doc, getDocFromServer, getDocsFromServer, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { DATASETS, readLocal } from './storageSync';
import { rowsFromLocal, type Dataset, type Row } from './localRows';
import { v3Paths, type CatalogCategory, type InventoryCategory } from './firestoreV3';

type Data = Record<Dataset, Row[]>;
const legacy = (uid: string, dataset: Dataset) => collection(db, 'users', uid, dataset);
const parse = (row: Row): Record<string, unknown> => JSON.parse(row.value) as Record<string, unknown>;
const key = (id: string, prefix: string) => prefix + '_' + Array.from(new TextEncoder().encode(id), n => n.toString(16).padStart(2, '0')).join('');
function catalogCategory(record: Record<string, unknown>): CatalogCategory {
  const type = String(record.type ?? '').toLowerCase();
  if (type.includes('mocktail') || type.includes('alcoholvrij')) return 'Mocktail';
  if (type.includes('wine') || type.includes('wijn')) return 'Wijn';
  if (type.includes('beer') || type.includes('bier')) return 'Bier';
  if (type.includes('cocktail') || type.includes('gin') || type.includes('g&t')) return 'Cocktail';
  throw new Error('Onbekend catalogustype: ' + String(record.type) + '. Migratie gestopt zonder oude data te wijzigen.');
}
function inventoryCategory(record: Record<string, unknown>): InventoryCategory {
  const category = String(record.category ?? '').toLowerCase();
  if (/drank|alcohol|bier|wijn|gin|spirit|siroop|fris|beverage/.test(category)) return 'Dranken';
  if (/garner|fruit|garnish|kruid/.test(category)) return 'Garneringen';
  if (/verbruik|dispos|servet|rietje/.test(category)) return 'Verbruiksartikelen';
  if (/bar|materiaal|glas|apparatuur|equipment|tools/.test(category)) return 'BarMaterialen';
  throw new Error('Onbekende inventariscategorie: ' + String(record.category) + '. Migratie gestopt zonder oude data te wijzigen.');
}
async function readCloud(uid: string): Promise<Data> {
  const entries = await Promise.all(DATASETS.map(async dataset => {
    const snapshot = await getDocsFromServer(legacy(uid, dataset));
    return [dataset, snapshot.docs.map(d => {
      const value = d.data();
      if (typeof value.value !== 'string' || !Number.isInteger(value.position)) throw new Error('Onbekend oud Firestore-formaat: ' + dataset);
      return { id: d.id, value: value.value, position: value.position as number };
    }).sort((a, b) => a.position - b.position)] as const;
  }));
  return Object.fromEntries(entries) as Data;
}
function download(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = 'wanderingbar-v3-migratie-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
function target(dataset: Dataset, row: Row): string[] {
  const value = parse(row);
  if (dataset === 'catalog') return v3Paths.catalogProduct(catalogCategory(value), key(row.id, 'prod'));
  if (dataset === 'inventory') return v3Paths.inventoryItem(inventoryCategory(value), row.id);
  if (dataset === 'events') return v3Paths.event(row.id);
  const event = value.event as Record<string, unknown> | undefined;
  return v3Paths.deletedEvent(String(event?.id ?? row.id));
}
export default function MigrationV3({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<Data | null>(null);
  const [local, setLocal] = useState<ReturnType<typeof readLocal> | null>(null);
  const [backedUp, setBackedUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function inspect() {
    setBusy(true); setMessage('Cloudgegevens uitlezen…'); setBackedUp(false);
    try {
      const cloud = await readCloud(uid);
      const browser = readLocal();
      for (const dataset of DATASETS) {
        const localRows = rowsFromLocal(dataset, browser[dataset]);
        const remoteIds = new Set(cloud[dataset].map(row => row.id));
        const missing = localRows.filter(row => !remoteIds.has(row.id));
        if (missing.length) throw new Error(dataset + ': ' + missing.length + ' lokale records ontbreken in Firestore. Synchroniseer eerst; er is niets gewijzigd.');
        for (const row of cloud[dataset]) target(dataset, row);
      }
      setSnapshot(cloud); setLocal(browser);
      setMessage('Controle geslaagd. Download eerst de volledige back-up.');
    } catch (e) { setSnapshot(null); setMessage(e instanceof Error ? e.message : 'Controle mislukt.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    if (!snapshot || !local || !backedUp) return;
    setBusy(true);
    try {
      const current = await readCloud(uid);
      if (JSON.stringify(current) !== JSON.stringify(snapshot) || JSON.stringify(readLocal()) !== JSON.stringify(local)) {
        throw new Error('Gegevens zijn gewijzigd sinds de back-up. Start de controle opnieuw.');
      }
      // The v3 create rule requires this legacy marker. It may not exist for
      // older accounts; create it only after verifying that legacy records
      // are readable, and never overwrite an existing marker.
      const marker = doc(db, 'users', uid, 'meta', 'workspace');
      const existingMarker = await getDocFromServer(marker);
      if (!existingMarker.exists()) {
        await setDoc(marker, { version: 1, initializedAt: new Date().toISOString() });
      }
      const root = doc(db, v3Paths.workspace().join('/'));
      // The owner-only read rule intentionally denies GET before the root
      // exists. Attempt create in that case; Firestore rejects it if another
      // owner already claimed the workspace.
      let existing;
      try {
        existing = await getDocFromServer(root);
      } catch (error) {
        if (!error || typeof error !== 'object' || !('code' in error) ||
            error.code !== 'permission-denied') throw error;
      }
      if (existing?.exists() && existing.data().ownerUid !== uid) {
        throw new Error('De nieuwe workspace is van een ander account.');
      }
      if (!existing?.exists()) {
        await setDoc(root, {
          ownerUid: uid, schemaVersion: 3, migrationStatus: 'copying',
          createdAt: new Date().toISOString(),
        });
      }
      const items = DATASETS.flatMap(dataset => snapshot[dataset].map(row => ({ dataset, row, path: target(dataset, row) })));
      const unique = new Set(items.map(item => item.path.join('/')));
      if (unique.size !== items.length) throw new Error('Dubbele doel-ID ontdekt; kopiëren gestopt.');
      for (let start = 0; start < items.length; start += 150) {
        const batch = writeBatch(db);
        for (const item of items.slice(start, start + 150)) {
          const original = parse(item.row);
          batch.set(doc(db, item.path.join('/')), {
            ...original, legacyValue: item.row.value, legacyId: item.row.id,
            position: item.row.position, schemaVersion: 3,
            ...(item.dataset === 'catalog' ? { productId: item.path[item.path.length - 1] } : {}),
          });
        }
        await batch.commit();
        setMessage('Kopiëren: ' + Math.min(start + 150, items.length) + '/' + items.length);
      }
      for (const item of items) {
        const check = await getDocFromServer(doc(db, item.path.join('/')));
        if (!check.exists() || check.data().legacyValue !== item.row.value) throw new Error('Controle mislukt bij ' + item.path.join('/'));
      }
      await setDoc(root, { ownerUid: uid, schemaVersion: 3, migrationStatus: 'copied-not-active', verifiedRecords: items.length, verifiedAt: new Date().toISOString() }, { merge: true });
      setMessage('Kopie gecontroleerd (' + items.length + ' records). Vernieuw de app om v3 te activeren. Oude Firestore blijft bewaard.');
    } catch (e) { setMessage('Migratie niet afgerond: ' + (e instanceof Error ? e.message : 'onbekende fout') + '. Oude data blijft behouden.'); }
    finally { setBusy(false); }
  }
  return <div style={{padding:'8px 16px',background:'#f5eee6',color:'#42252c'}}>
    <button type="button" onClick={() => setOpen(!open)} style={{background:'transparent',border:'1px solid #9a7b70',padding:'7px 12px',borderRadius:8,cursor:'pointer'}}>Firestore v3 migratie {open ? 'sluiten' : 'openen'}</button>
    {open && <div style={{maxWidth:650,paddingTop:12}}>
      <strong>Veilige kopie naar WanderingBar/main</strong>
      <p>De bestaande app blijft actief op de oude database. Sluit andere apparaten en wijzig tijdens het kopiëren geen gegevens.</p>
      <p>1. Controleer de vier cloudcollecties. 2. Download de back-up. 3. Maak een gecontroleerde kopie. Er wordt niets verwijderd.</p>
      <button disabled={busy} onClick={() => void inspect()}>1. Gegevens controleren</button>{' '}
      <button disabled={busy || !snapshot || !local} onClick={() => {download({format:'WanderingBar-v3-backup',uid,exportedAt:new Date().toISOString(),cloud:snapshot,local});setBackedUp(true);}}>2. Back-up downloaden</button>{' '}
      <button disabled={busy || !backedUp} onClick={() => void copy()}>3. Kopiëren en verifiëren</button>
      {snapshot && <p>{DATASETS.map(d => d + ': ' + snapshot[d].length).join(' · ')}</p>}
      <p role="status">{message}</p>
      <small>De eerder gepubliceerde v3 Security Rules zijn vereist. Na een geslaagde kopie wordt v3 bij het opnieuw openen gecontroleerd en geactiveerd.</small>
    </div>}
  </div>;
}
