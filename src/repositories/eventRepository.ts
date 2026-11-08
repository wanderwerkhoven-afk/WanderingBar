import type {DeletedEvent,EventData} from '../types/event';
import {DELETED_EVENTS_STORAGE_KEY,EVENT_STORAGE_KEY} from './storageKeys';
/** JSON persistence helpers; callers own seed data and state. Existing keys remain unchanged. */
export function readStoredEvents():EventData[]|null{try{const raw=localStorage.getItem(EVENT_STORAGE_KEY);if(raw===null)return null;const parsed:unknown=JSON.parse(raw);return Array.isArray(parsed)?parsed as EventData[]:null}catch{return null}}
export function writeStoredEvents(events:EventData[]):void{localStorage.setItem(EVENT_STORAGE_KEY,JSON.stringify(events))}
export function readStoredDeletedEvents():DeletedEvent[]{try{const raw=localStorage.getItem(DELETED_EVENTS_STORAGE_KEY);const parsed:unknown=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed.filter((v):v is DeletedEvent=>Boolean(v&&typeof v==='object'&&'event' in v&&'deletedAt' in v)):[]}catch{return []}}
export function writeStoredDeletedEvents(events:DeletedEvent[]):void{localStorage.setItem(DELETED_EVENTS_STORAGE_KEY,JSON.stringify(events))}
