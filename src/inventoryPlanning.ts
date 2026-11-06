import type {Item} from './Inventory';
import {INVENTORY_STORAGE_KEY} from './Inventory';
export type Need={name:string;unit:string;amount:number};
export type PurchaseLine=Need&{stock:number|null;shortage:number|null;supplier:string;price:number|null;cost:number|null;inventoryName:string|null};
const aliases:Record<string,string>={'Honingsiroop':'Honingstroop','Verse bramen':'Bramen','Verse salie':'Salie','Munt':'Verse munt'};
export function inventoryItems():Item[]{try{const raw=localStorage.getItem(INVENTORY_STORAGE_KEY);const value=raw?JSON.parse(raw):[];return Array.isArray(value)?value:[]}catch{return []}}
export function matchItem(name:string,items:Item[]):Item|undefined{const target=(aliases[name]||name).toLocaleLowerCase('nl');return items.find(i=>i.name.toLocaleLowerCase('nl')===target)}
function available(item:Item,unit:string):number|null{if(item.quantity==null)return null;const u=item.unit.toLowerCase();if(u===unit)return item.quantity;if(unit==='ml'&&u==='liter')return item.quantity*1000;if(unit==='gram'&&u==='kg')return item.quantity*1000;if(unit==='ml'&&u==='flessen')return null;return null}
export function purchaseLines(needs:Need[],items:Item[],margin:number):PurchaseLine[]{return needs.map(n=>{const item=matchItem(n.name,items);const amount=n.amount*(1+margin/100);const stock=item?available(item,n.unit):null;const shortage=stock==null?null:Math.max(0,amount-stock);const cost=item?.price!=null&&shortage!=null&&item.quantity!=null&&item.quantity>0&&stock!=null&&stock>0?shortage/stock*item.quantity*item.price:null;return {...n,amount,stock,shortage,supplier:item?.supplier||'Niet ingesteld',price:item?.price??null,cost,inventoryName:item?.name||null}})}
export type BatchRecipe={name:string;outputMl:number;ingredients:{name:string;amount:number;unit:string}[];instructions:string};
export const batchRecipes:BatchRecipe[]=[
{name:'Honingstroop',outputMl:1000,ingredients:[{name:'Honing',amount:500,unit:'ml'},{name:'Water',amount:500,unit:'ml'}],instructions:'Meng 50% honing met 50% warm water, roer glad, laat afkoelen en bewaar gekoeld.'},
{name:'Suikersiroop',outputMl:1000,ingredients:[{name:'Kristalsuiker',amount:500,unit:'gram'},{name:'Water',amount:500,unit:'ml'}],instructions:'Meng gelijke delen suiker en water op gewicht; verwarm zacht tot de suiker is opgelost en laat afkoelen. Het uiteindelijke volume kan afwijken.'}
];
export function saveBatch(recipe:BatchRecipe,quantityMl:number,items:Item[]):{ok:boolean;message:string;items:Item[]}{
 if(!Number.isFinite(quantityMl)||quantityMl<=0)return {ok:false,message:'Voer een positieve hoeveelheid in.',items};
 const output=matchItem(recipe.name,items);if(!output)return {ok:false,message:'Voeg het bereide product eerst toe aan de inventaris.',items};
 if(output.unit!=='ml'&&output.unit!=='liter')return {ok:false,message:'Stel de eenheid van '+output.name+' in op ml of liter voordat je een batch boekt.',items};
 const factor=quantityMl/recipe.outputMl;const deductions=new Map<string,number>();
 for(const ingredient of recipe.ingredients){const item=matchItem(ingredient.name,items);if(!item){if(ingredient.name==='Water')continue;return {ok:false,message:'Voorraadartikel ontbreekt: '+ingredient.name,items}}
 const amount=ingredient.amount*factor;let deduction:number|null=null;
 if(item.unit===ingredient.unit)deduction=amount;
 else if(item.unit==='liter'&&ingredient.unit==='ml')deduction=amount/1000;
 else if(item.unit==='kg'&&ingredient.unit==='gram')deduction=amount/1000;
 if(deduction==null)return {ok:false,message:'Eenheid van '+item.name+' is niet geschikt voor automatische afboeking.',items};
 if(item.quantity==null||item.quantity<deduction)return {ok:false,message:'Onvoldoende bekende voorraad van '+item.name,items};deductions.set(item.id,(deductions.get(item.id)||0)+deduction)
 }
 const updated=items.map(item=>{if(item.id===output.id)return {...item,quantity:(item.quantity||0)+(output.unit==='liter'?quantityMl/1000:quantityMl)};const deduction=deductions.get(item.id);return deduction==null?item:{...item,quantity:Math.max(0,(item.quantity||0)-deduction)}});
 try{localStorage.setItem(INVENTORY_STORAGE_KEY,JSON.stringify(updated));window.dispatchEvent(new Event('wandering-inventory-updated'));return {ok:true,message:'Batch geboekt. Grondstoffen zijn afgeschreven.',items:updated}}catch{return {ok:false,message:'Opslaan mislukt. Controleer de beschikbare opslagruimte.',items}}
}
