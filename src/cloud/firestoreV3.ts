/**
 * Proposed Firestore v3 paths. This module is intentionally NOT used by live sync
 * until the owner-specific security rules and a verified copy migration are deployed.
 *
 * Firestore alternates collection / document at each level.
 */
export const WORKSPACE_COLLECTION = 'WanderingBar';
export const WORKSPACE_DOCUMENT = 'main';
export const WORKSPACE_ROOT = [WORKSPACE_COLLECTION, WORKSPACE_DOCUMENT] as const;
export const CATALOG_CATEGORIES = ['Cocktail', 'Mocktail', 'Wijn', 'Bier'] as const;
export type CatalogCategory = typeof CATALOG_CATEGORIES[number];
export const INVENTORY_CATEGORIES = ['Dranken', 'BarMaterialen', 'Garneringen', 'Verbruiksartikelen'] as const;
export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];

export const v3Paths = {
  workspace: () => [...WORKSPACE_ROOT],
  catalogProduct: (category: CatalogCategory, productId: string) =>
    [...WORKSPACE_ROOT, 'catalog', category, 'products', productId],
  inventoryItem: (category: InventoryCategory, itemId: string) =>
    [...WORKSPACE_ROOT, 'inventory', category, 'items', itemId],
  event: (eventId: string) => [...WORKSPACE_ROOT, 'events', eventId],
  eventItem: (eventId: string, section: 'menu' | 'schedule' | 'packing' | 'tasks' | 'staff' | 'documents', itemId: string) =>
    [...WORKSPACE_ROOT, 'events', eventId, section, itemId],
  deletedEvent: (eventId: string) => [...WORKSPACE_ROOT, 'deletedEvents', eventId],
  customer: (customerId: string) => [...WORKSPACE_ROOT, 'customers', customerId],
  setting: (settingId: string) => [...WORKSPACE_ROOT, 'settings', settingId],
} as const;

/** Stable IDs must never be regenerated from editable names. */
export function newRecordId(prefix: 'prod' | 'item' | 'evt' | 'cust'): string {
  return prefix + '_' + crypto.randomUUID();
}
