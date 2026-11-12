export type MenuKind='Cocktail'|'Mocktail'|'Wijn'|'Speciaalbier'|'G&T';
export type MenuEntry={name:string;type:MenuKind;ingredients:[string,number,string][];tasteProfile?:string;alcoholPercentage?:number;wineCategory?:string;cocktailCategory?:'Signature'|'Classics'|'Show';mocktailCategory?:'Signature'|'Classics'|'Show';beerStyle?:string;beerPackaging?:'Fles'|'Blik'|'Tap';grapes?:string;country?:string;region?:string;sourceUrl?:string;imageUrl?:string;image?:string};
export const SERVICE_OPTIONS=['Cocktail workshop','Cocktail catering','Mobiele cocktailbar','Wijnbar','Speciaalbierbar','G&T bar'] as const;
export function serviceMenuKinds(service?:string):MenuKind[]{const s=(service||'').toLocaleLowerCase('nl');if(s.includes('wijn'))return ['Wijn'];if(s.includes('speciaalbier')||s.includes('bierbar'))return ['Speciaalbier'];if(s.includes('g&t')||s.includes('gin & tonic'))return ['G&T'];if(s.includes('cocktail'))return ['Cocktail','Mocktail'];return ['Cocktail','Mocktail','Wijn','Speciaalbier','G&T']}
export const CATALOG_STORAGE_KEY='wandering-barback-catalog-v1';
export function readMenuCatalog():MenuEntry[]{try{const raw=localStorage.getItem(CATALOG_STORAGE_KEY);if(!raw)return [];const saved:unknown=JSON.parse(raw);return Array.isArray(saved)?saved as MenuEntry[]:[]}catch{return []}}
export function writeMenuCatalog(entries:MenuEntry[]){localStorage.setItem(CATALOG_STORAGE_KEY,JSON.stringify(entries));window.dispatchEvent(new Event('wandering-catalog-updated'))}
export function getMenuEntry(name:string):MenuEntry|undefined{return readMenuCatalog().find(entry=>entry.name===name)}
export const BEER_CLUSTERS=[
 {name:'Licht en toegankelijk',styles:['Pils','Lager']},
 {name:'Tarwebieren',styles:['Witbier','Weizen','Dunkelweizen']},
 {name:'Hoppige bieren',styles:['Pale Ale','IPA']},
 {name:'Belgische en kruidige stijlen',styles:['Blond','Dubbel','Tripel','Saison']},
 {name:'Donkere bieren',styles:['Bock','Porter','Stout']},
 {name:'Fruitbier',styles:['Fruitbier']},
 {name:'Alcoholvrij',styles:['Alcoholvrij','Alcoholvrij IPA']},
 {name:'Overig',styles:['Overig']},
] as const;
export function isTapBeer(entry:MenuEntry){return entry.beerPackaging==='Tap'||(!entry.beerPackaging&&/BLADE|\\bfust\\b/i.test(entry.name))}
export function beerCluster(entry:MenuEntry){return BEER_CLUSTERS.find(cluster=>(cluster.styles as readonly string[]).includes(entry.beerStyle||''))?.name||'Overig'}
export function compareBeerEntries(a:MenuEntry,b:MenuEntry){
 const aTap=isTapBeer(a),bTap=isTapBeer(b);
 if(aTap!==bTap)return aTap?-1:1;
 const byName=()=>a.name.localeCompare(b.name,'nl',{sensitivity:'base',numeric:true});
 if(aTap)return byName();
 const aCluster=BEER_CLUSTERS.findIndex(cluster=>cluster.name===beerCluster(a));
 const bCluster=BEER_CLUSTERS.findIndex(cluster=>cluster.name===beerCluster(b));
 if(aCluster!==bCluster)return aCluster-bCluster;
 const styles=BEER_CLUSTERS[aCluster]?.styles as readonly string[]|undefined;
 const aStyle=styles?.indexOf(a.beerStyle||'')??-1,bStyle=styles?.indexOf(b.beerStyle||'')??-1;
 return aStyle-bStyle||byName();
}

