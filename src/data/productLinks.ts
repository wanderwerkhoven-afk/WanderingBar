import type {MenuEntry} from './menuCatalog';
import type {Item} from '../types/inventory';
import {readStoredInventory} from '../repositories/inventoryRepository';
export const isStockProduct=(entry:MenuEntry)=>entry.type==='Wijn'||entry.type==='Speciaalbier';
export const linkedInventory=(entry:MenuEntry,inventory:Item[]=readStoredInventory()??[])=>inventory.find(item=>item.id===entry.inventoryItemId);
export const exactMatches=(entry:MenuEntry,inventory:Item[])=>inventory.filter(item=>item.category==='Dranken'&&item.name.trim().toLocaleLowerCase('nl')===entry.name.trim().toLocaleLowerCase('nl'));
export const makeStockItem=(entry:MenuEntry):Item=>({id:'catalog-stock-'+crypto.randomUUID(),name:entry.name,category:'Dranken',subcategory:entry.type==='Wijn'?'Wijn & bubbels':'Bier',quantity:null,unit:entry.type==='Wijn'?'flessen':'stuks',location:'',notes:'',image:entry.image||'',imageUrl:entry.imageUrl||''});
