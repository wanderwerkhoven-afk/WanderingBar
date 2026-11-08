import type {Item} from '../types/inventory';
import {INVENTORY_STORAGE_KEY} from './storageKeys';
export {INVENTORY_STORAGE_KEY} from './storageKeys';
export function readStoredInventory():Item[]|null{try{const raw=localStorage.getItem(INVENTORY_STORAGE_KEY);if(raw===null)return null;const parsed:unknown=JSON.parse(raw);return Array.isArray(parsed)?parsed as Item[]:null}catch{return null}}
export function writeStoredInventory(items:Item[]):void{localStorage.setItem(INVENTORY_STORAGE_KEY,JSON.stringify(items))}
