import { test } from 'node:test';
import { deepStrictEqual, equal, throws } from 'node:assert/strict';
import { rowsFromLocal } from '../src/cloud/localRows.ts';

test('duplicate legacy starter ID retains both inventory items without mutating source', () => {
  const raw = JSON.stringify([{ id: 'starter-8', name: 'A' }, { id: 'starter-8', name: 'B' }]);
  const records = rowsFromLocal('inventory', raw);
  deepStrictEqual(records.map(row => row.id), ['starter-8', 'starter-8-local-2']);
  equal(JSON.parse(records[1].value).name, 'B');
  equal(JSON.parse(records[1].value).id, 'starter-8-local-2');
  equal(JSON.parse(raw)[1].id, 'starter-8');
});

test('generated inventory ID cannot collide with an existing later record', () => {
  const raw = JSON.stringify([{ id: 'starter-8' }, { id: 'starter-8' }, { id: 'starter-8-local-2' }]);
  deepStrictEqual(rowsFromLocal('inventory', raw).map(row => row.id),
    ['starter-8', 'starter-8-local-3', 'starter-8-local-2']);
});

test('duplicate event IDs are not silently rewritten', () => {
  throws(() => rowsFromLocal('events', JSON.stringify([{ id: 1 }, { id: 1 }])), /Dubbel events-record/);
});

test('invalid JSON and non-object records do not leak to Firestore', () => {
  throws(() => rowsFromLocal('inventory', '{'), SyntaxError);
  throws(() => rowsFromLocal('inventory', '[null]'), /ongeldig record/);
});
