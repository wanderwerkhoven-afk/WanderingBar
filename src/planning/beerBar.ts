import type {PackingItem} from '../types/event';
export const BLADE_BEERS=['Affligem Blond BLADE 8 L','Lagunitas IPA BLADE 8 L','Birra Moretti BLADE 8 L'] as const;
export const BOTTLED_BEERS=['Speciaalbier blond flesjes','Speciaalbier IPA flesjes','Speciaalbier tripel flesjes'] as const;
export type BeerBarPlan={taps:{beer:string;glasses:number}[];bottles:Record<string,number>;bottlesPerTub:number;iceKgPerTub:number};
export const defaultBeerBarPlan=():BeerBarPlan=>({taps:BLADE_BEERS.map(beer=>({beer,glasses:0})),bottles:{},bottlesPerTub:24,iceKgPerTub:8});
export function normalizeBeerBarPlan(input?:Partial<BeerBarPlan>):BeerBarPlan{
 const defaults=defaultBeerBarPlan();
 return {taps:Array.from({length:3},(_,i)=>({beer:input?.taps?.[i]?.beer||defaults.taps[i].beer,glasses:Math.max(0,Math.floor(Number(input?.taps?.[i]?.glasses)||0))})),bottles:input?.bottles&&typeof input.bottles==='object'?input.bottles:{},bottlesPerTub:Math.max(1,Math.floor(Number(input?.bottlesPerTub)||24)),iceKgPerTub:Math.max(0,Number(input?.iceKgPerTub)??8)};
}
export function beerBarRequirements(plan:BeerBarPlan){
 const tapped=plan.taps.map(t=>({...t,kegs:Math.ceil(t.glasses*0.25/8)}));
 const bottles=Object.entries(plan.bottles).map(([name,amount])=>({name,amount:Math.max(0,Math.floor(Number(amount)||0))})).filter(b=>b.amount>0);
 const totalBottles=bottles.reduce((sum,b)=>sum+b.amount,0);
 const tubs=Math.ceil(totalBottles/plan.bottlesPerTub);
 return {tapped,bottles,totalBottles,tubs,iceKg:tubs*plan.iceKgPerTub,totalGlasses:tapped.reduce((sum,t)=>sum+t.glasses,0)};
}
export function beerBarPacking(plan:BeerBarPlan):PackingItem[]{
 const req=beerBarRequirements(plan);
 const entries:[string,number,string][]=[
 ['Heineken BLADE biertap',req.tapped.filter(t=>t.glasses>0).length,'stuks'],
 ...req.tapped.filter(t=>t.kegs>0).map(t=>[t.beer,t.kegs,'fusten'] as [string,number,string]),
 ...req.bottles.map(b=>[b.name,b.amount,'flessen'] as [string,number,string]),
 ['Luxe grote ijsbak voor bierflesjes',req.tubs,'stuks'],
 ['IJsblokjes voor flesbier',req.iceKg,'kg']
 ];
 return entries.filter(([,quantity])=>quantity>0).map(([name,quantity,unit],i)=>({id:-(i+1),name,quantity,unit,done:false}));
}
