import {collection,doc,getDocs,writeBatch} from 'firebase/firestore';
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
export async function deleteInventoryImage(ref:string):Promise<void>{
 const rows=await getDocs(collection(doc(root,ref),'chunks'));
 for(let i=0;i<rows.docs.length;i+=400){const batch=writeBatch(db);rows.docs.slice(i,i+400).forEach(x=>batch.delete(x.ref));await batch.commit();}
 cache.delete(ref);
}
