import {collection,collectionGroup,doc,getDocs,getDocsFromServer,writeBatch} from 'firebase/firestore';
import {db} from '../firebase';
const root=collection(db,'WanderingBar/main/inventoryImages');
const cache=new Map<string,string>();
export const cachedInventoryImage=(ref:string)=>cache.get(ref)||'';
export async function readInventoryImage(ref:string):Promise<string>{
 if(cache.has(ref))return cache.get(ref)!;
 const rows=await getDocs(collection(doc(root,ref),'chunks'));
 const data=rows.docs.map(x=>({id:Number(x.id),value:x.data().value as string})).sort((a,b)=>a.id-b.id).map(x=>x.value).join('');
 if(!data.startsWith('data:image/'))throw new Error('Afbeelding niet gevonden.');
 cache.set(ref,data);return data;
}
export async function writeInventoryImage(ref:string,data:string):Promise<void>{
 if(!data.startsWith('data:image/'))throw new Error('Ongeldige afbeelding.');
 const parts=data.match(/.{1,160000}/g)||[];
 const rows=await getDocs(collection(doc(root,ref),'chunks'));
 const batch=writeBatch(db);
 parts.forEach((value,i)=>batch.set(doc(root,ref,'chunks',String(i)),{value}));
 rows.docs.forEach(x=>{if(Number(x.id)>=parts.length)batch.delete(x.ref)});
 await batch.commit();cache.set(ref,data);
}
export async function migrateLegacyInventoryImage(data:string):Promise<string>{
 if(!data.startsWith('data:image/'))throw new Error('Geen geldige Base64-afbeelding om te migreren.');
 const ref='img_'+crypto.randomUUID();
 await writeInventoryImage(ref,data);
 // Read from the server rather than trusting the in-memory upload cache.
 cache.delete(ref);
 const verified=await readInventoryImage(ref);
 if(verified!==data)throw new Error('Migratiecontrole mislukt: originele afbeelding behouden.');
 return ref;
}
export async function deleteInventoryImage(ref:string):Promise<void>{
 const rows=await getDocs(collection(doc(root,ref),'chunks'));
 for(let i=0;i<rows.docs.length;i+=400){const batch=writeBatch(db);rows.docs.slice(i,i+400).forEach(x=>batch.delete(x.ref));await batch.commit();}
 cache.delete(ref);
}

/** Collection-group discovery also finds chunks whose image parent document does not exist. */
async function allImageChunks():Promise<Map<string,number>>{
 const snapshot=await getDocsFromServer(collectionGroup(db,'chunks'));
 const result=new Map<string,number>();
 for(const entry of snapshot.docs){
  const path=entry.ref.path;
  const match=/^WanderingBar\/main\/inventoryImages\/([^/]+)\/chunks\/[^/]+$/.exec(path);
  if(!match)continue;
  const ref=match[1];
  result.set(ref,(result.get(ref)||0)+1);
 }
 return result;
}
async function inventoryReferences():Promise<{items:number;legacy:number;refs:Set<string>}>{
 const categories=['Dranken','BarMaterialen','Garneringen','Verbruiksartikelen'];
 let items=0,legacy=0;
 const refs=new Set<string>();
 for(const category of categories){
  const snapshot=await getDocsFromServer(collection(db,'WanderingBar','main','inventory',category,'items'));
  for(const row of snapshot.docs){
   items++;
   const data=row.data();
   const record=typeof data.legacyValue==='string'?JSON.parse(data.legacyValue):data;
   if(typeof record.image==='string'&&record.image.startsWith('data:image/'))legacy++;
   for(const value of [record.imageRef,data.imageRef])if(typeof value==='string'&&value)refs.add(value);
  }
 }
 return {items,legacy,refs};
}
/** Read-only audit: all chunk groups versus authoritative inventory references. */
export async function inspectInventoryImageStorage():Promise<{items:number;references:number;legacy:number;broken:string[];storedImages:number;storedChunks:number;orphanRefs:string[];orphanChunks:number}>{
 const [{items,legacy,refs},chunks]=await Promise.all([inventoryReferences(),allImageChunks()]);
 const broken=[...refs].filter(ref=>!chunks.has(ref));
 const orphanRefs=[...chunks.keys()].filter(ref=>!refs.has(ref)).sort();
 return {items,references:refs.size,legacy,broken,storedImages:chunks.size,
  storedChunks:[...chunks.values()].reduce((sum,n)=>sum+n,0),orphanRefs,
  orphanChunks:orphanRefs.reduce((sum,ref)=>sum+(chunks.get(ref)||0),0)};
}
/** Delete only after fresh server-side inventory recheck, aborting if references changed. */
export async function cleanupOrphanInventoryImages(expectedRefs:string[]):Promise<{deletedImages:number;deletedChunks:number}>{
 const expected=[...new Set(expectedRefs)].sort();
 const first=await inspectInventoryImageStorage();
 if(JSON.stringify(first.orphanRefs)!==JSON.stringify(expected))throw new Error('Afbeeldingsopslag is gewijzigd. Voer de controle opnieuw uit.');
 const current=await inventoryReferences();
 if(expected.some(ref=>current.refs.has(ref)))throw new Error('Een afbeelding is opnieuw in gebruik. Niets verwijderd.');
 let deletedChunks=0;
 for(const ref of expected){
  // Recheck references immediately before each image; never delete a referenced image.
  const latest=await inventoryReferences();
  if(latest.refs.has(ref))throw new Error('Opschoning gestopt: afbeelding '+ref+' is inmiddels in gebruik.');
  const rows=await getDocsFromServer(collection(doc(root,ref),'chunks'));
  for(let i=0;i<rows.docs.length;i+=400){
   const batch=writeBatch(db);
   const part=rows.docs.slice(i,i+400);
   part.forEach(entry=>batch.delete(entry.ref));
   await batch.commit();
   deletedChunks+=part.length;
  }
  cache.delete(ref);
 }
 return {deletedImages:expected.length,deletedChunks};
}
