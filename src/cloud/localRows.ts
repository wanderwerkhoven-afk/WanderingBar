/** Browser-data conversion, kept independent of Firebase for regression testing. */
export type Dataset = 'events' | 'deletedEvents' | 'inventory' | 'catalog';
export type Row = { id: string; value: string; position: number };

export function parsed(raw: string | null, dataset: Dataset): Record<string, unknown>[] {
  if (raw === null) return [];
  const records: unknown = JSON.parse(raw);
  if (!Array.isArray(records)) throw new Error(`De lokale ${dataset}-gegevens zijn ongeldig; ze zijn niet gewijzigd.`);
  if (records.some(record => !record || typeof record !== 'object' || Array.isArray(record))) {
    throw new Error(`De lokale ${dataset}-gegevens bevatten een ongeldig record; gegevens zijn behouden.`);
  }
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

export function rowsFromLocal(dataset: Dataset, raw: string | null): Row[] {
  const entries = parsed(raw, dataset);
  const originalIds = new Set(entries.map(entry => recordId(dataset, entry)));
  const ids = new Set<string>();
  return entries.map((original, position) => {
    let entry = original;
    let id = recordId(dataset, entry);
    if (ids.has(id)) {
      // Legacy inventory seed rows sometimes reuse starter IDs. Retain both.
      // No original browser data is modified until the user accepts a sync.
      if (dataset !== 'inventory') throw new Error(`Dubbel ${dataset}-record (${id}); download eerst de back-up en gebruik de cloudversie.`);
      const originalId = String(entry.id);
      let copy = 2;
      let candidate = '';
      do { candidate = encodeURIComponent(`${originalId}-local-${copy++}`); }
      while (originalIds.has(candidate) || ids.has(candidate));
      id = candidate;
      entry = { ...entry, id: decodeURIComponent(id) };
    }
    ids.add(id);
    const value = JSON.stringify(entry);
    if (new Blob([value]).size > 900_000) {
      throw new Error(`Een ${dataset}-record is te groot voor Firestore. De lokale kopie blijft behouden.`);
    }
    return { id, value, position };
  });
}
