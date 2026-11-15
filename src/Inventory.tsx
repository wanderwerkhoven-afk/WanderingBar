import {useEffect,useMemo,useState} from 'react';
import {createPortal} from 'react-dom';
import {Martini, Wine, Citrus, Package, Search, Plus, ChevronRight, X, Pencil, Trash2, ArrowLeft, BookOpen, type LucideIcon} from 'lucide-react';
import './inventory.css';
import './Catalog.css';
import {imageToBase64} from './eventImage';
import {readInventoryImage,writeInventoryImage,deleteInventoryImage,cachedInventoryImage,migrateLegacyInventoryImage} from './cloud/inventoryImages';

import type {Category,Item} from './types/inventory';
import {INVENTORY_STORAGE_KEY} from './repositories/storageKeys';
import {readStoredInventory,writeStoredInventory} from './repositories/inventoryRepository';
import {readMenuCatalog,writeMenuCatalog} from './data/menuCatalog';
export type {Item} from './types/inventory';
export {INVENTORY_STORAGE_KEY} from './repositories/storageKeys';
function InventoryProductImage({item}:{item:Item}){
 const [open,setOpen]=useState(false);
 const [hover,setHover]=useState<{top:number;left:number;width:number;height:number}|null>(null);
 const [failed,setFailed]=useState(false);
 const [remoteImage,setRemoteImage]=useState(item.imageRef?cachedInventoryImage(item.imageRef):'');
 useEffect(()=>{let active=true;if(item.imageRef){void readInventoryImage(item.imageRef).then(value=>{if(active)setRemoteImage(value)}).catch(()=>{if(active)setFailed(true)})}else setRemoteImage('');return()=>{active=false}},[item.imageRef]);
 const src=item.image||remoteImage||item.imageUrl;
 useEffect(()=>{setFailed(false);setOpen(false);setHover(null)},[src,item.imageRef]);
 useEffect(()=>{if(!open)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open]);
 useEffect(()=>{if(!hover)return;const dismiss=()=>setHover(null);window.addEventListener('scroll',dismiss,true);window.addEventListener('resize',dismiss);return()=>{window.removeEventListener('scroll',dismiss,true);window.removeEventListener('resize',dismiss)}},[hover]);
 return <><div className="inventory-product-media catalog-product-media">{src&&!failed?<button type="button" className="inventory-product-image-button catalog-product-image-button" aria-label={'Vergroot foto van '+item.name} title="Foto vergroten" onMouseEnter={event=>{if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;const rect=event.currentTarget.closest('.inventory-product-card')?.getBoundingClientRect();if(rect)setHover({top:rect.top,left:rect.left,width:rect.width,height:rect.height})}} onMouseLeave={()=>setHover(null)} onClick={()=>{setHover(null);setOpen(true)}}><img src={src} alt={item.name} loading="lazy" onError={()=>setFailed(true)}/><span className="inventory-product-zoom-hint catalog-product-zoom-hint">Vergroten</span></button>:<Package size={27}/>}</div>{hover&&src&&!failed&&!open&&createPortal(<div className="catalog-hover-preview" aria-hidden="true" style={{top:Math.max(8,hover.top),left:hover.left,width:hover.width,height:Math.min(hover.height,window.innerHeight-16)}}><img src={src} alt=""/><span className="catalog-hover-preview-close">×</span></div>,document.body)}{open&&src&&!failed&&createPortal(<div className="catalog-image-lightbox" role="dialog" aria-modal="true" aria-label={'Productfoto van '+item.name} onClick={()=>setOpen(false)}><div className="catalog-image-lightbox-inner" onClick={event=>event.stopPropagation()}><button type="button" className="catalog-image-lightbox-close" onClick={()=>setOpen(false)} aria-label="Sluiten">×</button><img src={src} alt={item.name}/><p>{item.name}</p></div></div>,document.body)}</>;
}
const categories:{name:Category;description:string;icon:LucideIcon;subcategories:string[]}[]=[
{name:'Bar & materialen',description:'Tools, glaswerk, deco',icon:Martini,subcategories:['Bar & inrichting','Bar tools','Glaswerk','Logistiek']},
{name:'Dranken',description:'Spirits, mixers, siropen',icon:Wine,subcategories:['Spirits','Likeuren','Sappen','Siropen','Mixers','Frisdranken','Wijn & bubbels','Bier','Overig']},
{name:'Garneringen',description:'Fruit, kruiden, gedroogd',icon:Citrus,subcategories:['Vers fruit','Kruiden','Gedroogd','Fruitpurees','Overig']},
{name:'Verbruiksartikelen',description:'Servetten, schoonmaak',icon:Package,subcategories:['Servetten','Schoonmaak','Workshopmateriaal','Drukwerk','Overig']}
];
// Productlijsten worden niet langer uit code geïmporteerd. Bieren en wijnen
// komen uit de door Firestore gesynchroniseerde catalogus.
const key=INVENTORY_STORAGE_KEY;
const load=():Item[]=>readStoredInventory()??[];
function catalogStock(entries:ReturnType<typeof readMenuCatalog>,stored:Item[]):Item[]{
 const products=entries.filter(entry=>entry.type==='Wijn'||entry.type==='Speciaalbier');
 return products.map(entry=>{
  const expected=entry.type==='Wijn'?'Wijn & bubbels':'Bier';
  const matches=stored.filter(item=>item.category==='Dranken'&&item.subcategory===expected&&item.name.trim().toLocaleLowerCase('nl')===entry.name.trim().toLocaleLowerCase('nl'));
  const linked=entry.inventoryItemId?stored.find(item=>item.id===entry.inventoryItemId):undefined;
  const existing=linked||(matches.length===1?matches[0]:undefined);
  const id=existing?.id||entry.inventoryItemId||'catalog-'+entry.type+'-'+encodeURIComponent(entry.name);
  return {...(existing||{id,category:'Dranken' as Category,quantity:null,location:'',notes:'',unit:entry.type==='Wijn'?'flessen':entry.beerPackaging==='Tap'?'fusten':'flessen'}),name:entry.name,subcategory:expected,
   image:existing?.image||entry.image||'',imageUrl:existing?.imageUrl||entry.imageUrl||''};
 });
}
const blank=(category:Category):Item=>({id:'',name:'',category,subcategory:categories.find(c=>c.name===category)!.subcategories[0],quantity:0,unit:category==='Dranken'?'flessen':'stuks',location:'',notes:''});
export default function Inventory(){
const [items,setItems]=useState<Item[]>(load);
const [catalogEntries,setCatalogEntries]=useState(readMenuCatalog);
useEffect(()=>{const refresh=()=>{setItems(load());setCatalogEntries(readMenuCatalog())};window.addEventListener('storage',refresh);window.addEventListener('wandering-catalog-updated',refresh);window.addEventListener('barback-inventory-updated',refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('wandering-catalog-updated',refresh);window.removeEventListener('barback-inventory-updated',refresh)}},[]);
const catalogProducts=useMemo(()=>catalogStock(catalogEntries,items),[catalogEntries,items]);
const displayedItems=useMemo(()=>[...items.filter(item=>!(item.category==='Dranken'&&(item.subcategory==='Bier'||item.subcategory==='Wijn & bubbels'))||catalogProducts.some(product=>product.id===item.id)).filter(item=>!catalogProducts.some(product=>product.id===item.id)),...catalogProducts],[items,catalogProducts]);
const [category,setCategory]=useState<Category|null>(null);
const [sub,setSub]=useState('Alles');
const [search,setSearch]=useState('');
const [draft,setDraft]=useState<Item|null>(null);
const [confirmDelete,setConfirmDelete]=useState(false);
const [imageBusy,setImageBusy]=useState(false);
const [imageError,setImageError]=useState('');
const [saveToast,setSaveToast]=useState('');
const [storageError,setStorageError]=useState('');
const [pendingImage,setPendingImage]=useState('');
const [migrationBusy,setMigrationBusy]=useState(false);
const [migrationProgress,setMigrationProgress]=useState('');
const legacyImageCount=items.filter(i=>typeof i.image==='string'&&i.image.startsWith('data:image/')).length;
async function migrateLegacyImages(){
 if(migrationBusy||!legacyImageCount)return;
 setMigrationBusy(true);setMigrationProgress('Migratie voorbereiden…');
 let migrated=0;
 try{
  // Work on one item at a time, keeping all originals until cloud data is verified.
  for(const original of items){
   if(!original.image?.startsWith('data:image/'))continue;
   setMigrationProgress('Afbeelding '+(migrated+1)+' van '+legacyImageCount+' controleren…');
   const ref=await migrateLegacyInventoryImage(original.image);
   const raw=localStorage.getItem(key);
   if(!raw)throw new Error('Lokale inventaris ontbreekt. Migratie gestopt.');
   const current=JSON.parse(raw) as Item[];
   const index=current.findIndex(i=>i.id===original.id&&i.image===original.image);
   if(index<0)throw new Error('Artikel is ondertussen gewijzigd. Originele gegevens behouden.');
   const next=[...current];next[index]={...current[index],image:'',imageRef:ref};
   writeStoredInventory(next);
   setItems(next);migrated++;
   window.dispatchEvent(new Event('barback-sync-request'));
  }
  setMigrationProgress(migrated+' afbeeldingen lokaal gemigreerd. Wacht op status Gesynchroniseerd voor je de app sluit.');
 }catch(error){setMigrationProgress('Migratie gestopt na '+migrated+' afbeeldingen: '+(error instanceof Error?error.message:String(error))+'. Overige afbeeldingen zijn behouden.');}
 finally{setMigrationBusy(false)}
}
useEffect(()=>{if(!saveToast)return;const timer=window.setTimeout(()=>setSaveToast(''),3500);return()=>window.clearTimeout(timer)},[saveToast]);
const [recipeItem,setRecipeItem]=useState<Item|null>(null);
// Bewaar nooit automatisch een weergave in Firebase; alleen expliciete mutaties schrijven.
const visible=useMemo(()=>displayedItems.filter(i=>(!category||i.category===category)&&(sub==='Alles'||i.subcategory===sub)&&i.name.toLocaleLowerCase('nl').includes(search.toLocaleLowerCase('nl'))).sort((a,b)=>a.name.localeCompare(b.name,'nl')),[displayedItems,category,sub,search]);
function persistItem(item:Item, successMessage:string):boolean{
 const next=items.some(existing=>existing.id===item.id)?items.map(existing=>existing.id===item.id?item:existing):[...items,item];
 const size=new Blob([JSON.stringify(item)]).size;
 if(size>750000){setImageError('Dit artikel is te groot voor Firebase ('+Math.round(size/1024)+' KB). Upload de afbeelding opnieuw.');return false}
 try{writeStoredInventory(next)}catch{setImageError('Opslagruimte van dit apparaat is vol. De wijziging is niet opgeslagen.');return false}
 setStorageError('');setItems(next);setDraft(null);setSaveToast(successMessage);return true;
}
async function save(){
 if(imageBusy||!draft||!draft.name.trim())return;
 setImageBusy(true);
 try{
 const item={...draft,name:draft.name.trim(),id:draft.id||('item-'+Date.now())};
 if(pendingImage){const ref='img_'+crypto.randomUUID();await writeInventoryImage(ref,pendingImage);item.image='';item.imageRef=ref;item.imageUrl='';}
 const next=items.some(i=>i.id===item.id)?items.map(i=>i.id===item.id?item:i):[...items,item];
 const size=new Blob([JSON.stringify(item)]).size;
 if(size>750000){setImageError('Dit artikel is te groot voor Firebase ('+Math.round(size/1024)+' KB). Upload de afbeelding opnieuw.');return}
 try{writeStoredInventory(next)}catch{setImageError('Opslagruimte van dit apparaat is vol. De wijziging is niet opgeslagen.');return}
 setStorageError('');setItems(next);setDraft(null);setPendingImage('');
 const catalog=readMenuCatalog();
 const normalized=item.name.trim().toLocaleLowerCase('nl');
 const uniqueStock=next.filter(row=>row.category==='Dranken'&&row.name.trim().toLocaleLowerCase('nl')===normalized).length===1;
 const nextCatalog=catalog.map(entry=>{
  if(entry.inventoryItemId===item.id)return {...entry,name:item.name,image:undefined,imageUrl:undefined};
  if(item.category==='Dranken'&&uniqueStock&&!entry.inventoryItemId&&(entry.type==='Wijn'||entry.type==='Speciaalbier')&&entry.name.trim().toLocaleLowerCase('nl')===normalized){
   return {...entry,inventoryItemId:item.id,image:undefined,imageUrl:undefined};
  }
  return entry;
 });
 if(nextCatalog.some((entry,index)=>entry!==catalog[index])){try{writeMenuCatalog(nextCatalog)}catch(error){setStorageError('Inventaris opgeslagen, maar cataloguskoppeling bijwerken is mislukt: '+String(error))}}
 setSaveToast(draft.id ? `Wijzigingen voor ${item.name} zijn opgeslagen` : `${item.name} is toegevoegd aan ${item.category} inventaris`);
 }catch(error){setImageError(error instanceof Error?error.message:'Afbeelding opslaan in Firebase mislukt.');}finally{setImageBusy(false)}
}
async function removeImage(){
 if(imageBusy||!draft)return;
 // Clear both possible image sources. Otherwise the URL would reappear as a fallback.
 const cleared={...draft,image:'',imageUrl:'',imageRef:''};
 if(draft.id){
  if(!persistItem(cleared,'Afbeelding lokaal verwijderd · synchronisatie met Firebase volgt'))return;
  if(draft.imageRef){try{await deleteInventoryImage(draft.imageRef)}catch(error){setStorageError('Afbeeldingsverwijdering in Firebase mislukt: '+String(error))}}
 }else setDraft(cleared);
 setPendingImage('');
}
return <section className="inventory-page">
{storageError&&<p role="alert" className="inventory-storage-error">{storageError}</p>}

{legacyImageCount>0&&<div className="inventory-storage-error"><strong>{legacyImageCount} oudere inventarisafbeeldingen</strong> staan nog in de oude opslag. <button type="button" disabled={migrationBusy} onClick={()=>void migrateLegacyImages()}>{migrationBusy?'Migreren…':'Veilig migreren naar Firestore'}</button></div>}
{migrationProgress&&<p role="status" className="inventory-storage-error">{migrationProgress}</p>}
{saveToast&&<div className="inventory-save-toast" role="status" aria-live="polite"><span aria-hidden="true">✓</span>{saveToast}</div>}
<div className="inventory-heading">{category?<button className="inventory-back" onClick={()=>{setCategory(null);setSub('Alles');setSearch('')}} aria-label="Terug naar categorieën"><ArrowLeft size={23}/></button>:<Package size={25}/>}<h1>{category||'Inventaris'}</h1></div>
{!category?<><div className="inventory-summary"><span>INVENTARISOVERZICHT</span><strong>{items.length} <small>artikelen</small></strong><p>{items.filter(i=>i.quantity===0||i.quantity===null).length} artikelen op nul</p></div><div className="inventory-categories">{categories.map(({name,description,icon:Icon})=><button key={name} className="inventory-category" onClick={()=>{setCategory(name);setSub('Alles')}}><Icon size={28}/><strong>{name}</strong><span>{description}<ChevronRight size={17}/></span><em>{items.filter(i=>i.category===name).length} artikelen</em></button>)}</div></>:<><div className="inventory-search"><Search size={18}/><input placeholder="Zoek artikelen..." aria-label="Zoek artikelen" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="inventory-subfilters">{['Alles',...categories.find(c=>c.name===category)!.subcategories].map(s=><button key={s} className={sub===s?'selected':''} onClick={()=>setSub(s)}>{s}</button>)}</div><p className="inventory-count">{visible.length} artikelen</p><div className="inventory-items catalog-product-grid">{visible.map(item=><article className="inventory-product-card catalog-card catalog-product-card" key={item.id}>
<div className="inventory-product-top catalog-product-top"><span className="inventory-product-type catalog-product-type">{item.subcategory}</span><span className="inventory-product-stock">{item.quantity===null?'0':item.quantity} {item.unit}</span></div>
<div className="inventory-product-main">
<InventoryProductImage item={item}/>
<button type="button" className="inventory-product-details" onClick={()=>{setDraft({...item});setConfirmDelete(false)}} aria-label={'Bewerk '+item.name}>
<strong>{item.name}</strong>
{item.brand&&<span className="inventory-product-brand">{item.brand}</span>}
<span className="inventory-product-meta">{[item.price!=null?'€ '+item.price.toFixed(2).replace('.',','):null,item.location].filter(Boolean).join(' · ')||'Bekijk artikelgegevens'}</span>
</button>
</div>
<div className="inventory-product-footer catalog-product-footer"><button type="button" className="inventory-product-edit" onClick={()=>{setDraft({...item});setConfirmDelete(false)}}><Pencil size={14}/> Bewerken</button>{item.recipe?.trim()&&<button type="button" className="inventory-recipe-button" aria-label={'Bekijk recept voor '+item.name} onClick={()=>setRecipeItem(item)}><BookOpen size={15}/><span>Recept</span></button>}</div>
</article>)}{visible.length===0&&<p className="inventory-empty">Geen artikelen gevonden.</p>}</div></>}
<button className={category?'inventory-fab':'inventory-add'} onClick={()=>{setDraft(blank(category||'Bar & materialen'));setConfirmDelete(false)}} aria-label="Artikel toevoegen"><Plus size={23}/>{!category&&' Artikel toevoegen'}</button>
{recipeItem&&<div className="overlay" onClick={()=>setRecipeItem(null)}><div className="modal inventory-modal inventory-recipe-modal" role="dialog" aria-modal="true" aria-label={'Recept '+recipeItem.name} onClick={e=>e.stopPropagation()}><div className="inventory-modal-head"><h2>{recipeItem.name}</h2><button type="button" onClick={()=>setRecipeItem(null)} aria-label="Sluiten"><X size={21}/></button></div><div className="inventory-recipe-text">{recipeItem.recipe}</div><button type="button" className="inventory-save" onClick={()=>{setDraft({...recipeItem});setRecipeItem(null)}}>Recept bewerken</button></div></div>}
{draft&&<div className="overlay" onClick={()=>setDraft(null)}><form className="modal inventory-modal" role="dialog" aria-modal="true" aria-label="Inventarisartikel" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();save()}}><div className="inventory-modal-head"><h2>{draft.id?'Artikel bewerken':'Artikel toevoegen'}</h2><button type="button" onClick={()=>setDraft(null)} aria-label="Sluiten"><X size={21}/></button></div><label>Afbeeldingslink (https)<input type="url" placeholder="https://…/productfoto.jpg" value={draft.imageUrl||''} onChange={e=>setDraft({...draft,imageUrl:e.target.value})}/></label><label>Productafbeelding (Base64)<input type="file" accept="image/*" disabled={imageBusy} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setImageBusy(true);setImageError('');try{const image=await imageToBase64(file);setPendingImage(image);setDraft(current=>current?{...current,image:'',imageUrl:''}:current)}catch(error){setImageError(error instanceof Error?error.message:'Afbeelding verwerken mislukt.')}finally{setImageBusy(false)}}}/></label>{imageBusy&&<p>Afbeelding verwerken…</p>}{imageError&&<p role="alert">{imageError}</p>}{(pendingImage||draft.image||draft.imageRef||draft.imageUrl)&&<div className="inventory-image-preview"><img src={pendingImage||draft.image||(draft.imageRef?cachedInventoryImage(draft.imageRef):'')||draft.imageUrl} alt="Voorbeeld productafbeelding"/><button type="button" disabled={imageBusy} onClick={removeImage}>Afbeelding verwijderen</button></div>}<label>Naam<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Categorie<select value={draft.category} onChange={e=>{const value=e.target.value as Category;setDraft({...draft,category:value,subcategory:categories.find(c=>c.name===value)!.subcategories[0]})}}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label>Subcategorie<select value={draft.subcategory} onChange={e=>setDraft({...draft,subcategory:e.target.value})}>{categories.find(c=>c.name===draft.category)!.subcategories.map(s=><option key={s}>{s}</option>)}</select></label><div className="inventory-fields"><label>Aantal<input type="number" min="0" step="any" placeholder="Nog niet geteld" value={draft.quantity??''} onChange={e=>setDraft({...draft,quantity:e.target.value===''?null:Math.max(0,Number(e.target.value))})}/></label><label>Eenheid<select value={draft.unit} onChange={e=>setDraft({...draft,unit:e.target.value})}>{['stuks','flessen','liter','ml','kg','gram','pakken','kratten'].map(s=><option key={s}>{s}</option>)}</select></label></div><label>Merk<input value={draft.brand??''} onChange={e=>setDraft({...draft,brand:e.target.value})}/></label><label>Leverancier<select value={draft.supplier??(draft.category==='Garneringen'||draft.subcategory==='Sappen'?'Albert Heijn':draft.category==='Dranken'?'Drankgigant':'')} onChange={e=>setDraft({...draft,supplier:e.target.value})}><option value="">Niet gekozen</option><option>Gall & Gall</option><option>Drankgigant</option><option>Albert Heijn</option><option>DrankDozijn</option><option>Overig</option></select></label><label>Inkoopprijs per eenheid (€)<input type="number" min="0" step="0.01" value={draft.price??''} onChange={e=>setDraft({...draft,price:e.target.value===''?null:Number(e.target.value),priceCheckedAt:e.target.value===''?'':new Date().toISOString().slice(0,10)})}/></label><label>Prijs gecontroleerd op<input type="date" value={draft.priceCheckedAt??''} onChange={e=>setDraft({...draft,priceCheckedAt:e.target.value})}/></label><label>Productlink<input type="url" value={draft.webLink??''} onChange={e=>setDraft({...draft,webLink:e.target.value})}/></label><label>Opslaglocatie<input placeholder="Bijv. Krat B02" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})}/></label><label>Recept (optioneel, voor zelfgemaakte siropen en sappen)<textarea rows={6} placeholder={'Ingrediënten:\n- ...\n\nBereiding:\n1. ...'} value={draft.recipe??''} onChange={e=>setDraft({...draft,recipe:e.target.value})}/></label><label>Notities<textarea rows={2} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label><div className="inventory-modal-actions">{draft.id&&!catalogEntries.some(entry=>(entry.type==='Wijn'||entry.type==='Speciaalbier')&&(entry.inventoryItemId===draft.id||catalogProducts.some(product=>product.id===draft.id&&product.name===entry.name)))&&<button className="inventory-delete" type="button" onClick={()=>{if(!confirmDelete){setConfirmDelete(true);return}try{const next=items.filter(i=>i.id!==draft.id);writeStoredInventory(next);setItems(next);setDraft(null)}catch(error){setStorageError('Verwijderen mislukt: '+String(error))}}}><Trash2 size={17}/>{confirmDelete?'Bevestig verwijderen':'Verwijderen'}</button>}<button className="inventory-save" type="submit" disabled={imageBusy}><Pencil size={16}/> Opslaan</button></div></form></div>}
</section>
}
