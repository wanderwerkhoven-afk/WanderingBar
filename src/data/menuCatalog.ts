export type MenuKind='Cocktail'|'Mocktail'|'Wijn'|'Speciaalbier'|'G&T';
export type MenuEntry={name:string;type:MenuKind;ingredients:[string,number,string][];tasteProfile?:string;alcoholPercentage?:number;wineCategory?:string;grapes?:string;country?:string;region?:string;sourceUrl?:string;imageUrl?:string;image?:string};
export const SERVICE_OPTIONS=['Cocktail workshop','Cocktail catering','Mobiele cocktailbar','Wijnbar','Speciaalbierbar','G&T bar'] as const;
export function serviceMenuKinds(service?:string):MenuKind[]{const s=(service||'').toLocaleLowerCase('nl');if(s.includes('wijn'))return ['Wijn'];if(s.includes('speciaalbier')||s.includes('bierbar'))return ['Speciaalbier'];if(s.includes('g&t')||s.includes('gin & tonic'))return ['G&T'];if(s.includes('cocktail'))return ['Cocktail','Mocktail'];return ['Cocktail','Mocktail','Wijn','Speciaalbier','G&T']}
export const CATALOG_STORAGE_KEY='wandering-barback-catalog-v1';
export function readMenuCatalog():MenuEntry[]{try{const raw=localStorage.getItem(CATALOG_STORAGE_KEY);if(!raw)return [];const saved:unknown=JSON.parse(raw);return Array.isArray(saved)?saved as MenuEntry[]:[]}catch{return []}}
export function writeMenuCatalog(entries:MenuEntry[]){localStorage.setItem(CATALOG_STORAGE_KEY,JSON.stringify(entries));window.dispatchEvent(new Event('wandering-catalog-updated'))}
export function getMenuEntry(name:string):MenuEntry|undefined{return readMenuCatalog().find(entry=>entry.name===name)}

