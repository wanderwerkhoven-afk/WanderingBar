import type {EventData} from '../types/event';
import {calculateCatering,normalizeCateringPlan,normalizeCateringPrices,type CateringPlan,type CateringPriceEndpoints} from './cateringPricing';
import {quoteDefaultValidity} from './workshopQuotes';
export type CateringQuote={
 id:string;createdAt:string;validUntil:string;client:string;notes:string;travelCost:number;
 eventTitle:string;eventDate:string;eventCity:string;eventAddress:string;
 plan:CateringPlan;prices:CateringPriceEndpoints;tiers:ReturnType<typeof calculateCatering>['tiers'];
 bookedTierMin:number;bookedTierMax:number|null;classicCount:number;signatureCount:number;
 classicRate:number;signatureRate:number;extraCocktailRate:number;
 classicTotal:number;signatureTotal:number;barTotal:number;secondBartenderTotal:number;
 subtotal:number;total:number;
};
export type CateringInvoiceLine={description:string;quantity:number;rate:number;amount:number};
export type CateringInvoice={id:string;createdAt:string;client:string;quoteId:string;eventTitle:string;eventDate:string;eventCity:string;eventAddress:string;lines:CateringInvoiceLine[];subtotal:number;total:number;notes:string};
const iso=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const numberId=(prefix:string,eventId:number,today:Date)=>prefix+'-'+iso(today).replace(/-/g,'')+'-'+String(eventId).slice(-6)+'-'+String(today.getTime()).slice(-5);
const amount=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function createCateringQuote(event:EventData,settings:{client:string;travelCost:number;notes:string;validUntil:string},today=new Date()):CateringQuote{
 const plan=normalizeCateringPlan(event.cateringPlan),calc=calculateCatering({...plan,extraCocktails:0});
 const travelCost=Math.max(0,Number(settings.travelCost)||0);
 const subtotal=amount(calc.barTotal+calc.classicTotal+calc.signatureTotal+calc.secondBartenderTotal);
 return {id:numberId('WB-OFF',event.id,today),createdAt:iso(today),validUntil:settings.validUntil||quoteDefaultValidity(today),client:settings.client.trim(),notes:settings.notes.trim(),travelCost,eventTitle:event.title,eventDate:event.date,eventCity:event.city,eventAddress:event.address||'',plan:{...plan,extraCocktails:0,prices:normalizeCateringPrices(calc.prices)},prices:normalizeCateringPrices(calc.prices),tiers:calc.tiers.map(t=>({...t})),bookedTierMin:calc.tier.min,bookedTierMax:calc.tier.max,classicCount:calc.classicCount,signatureCount:calc.signatureCount,classicRate:calc.tier.classic,signatureRate:calc.tier.signature,extraCocktailRate:calc.extraCocktailRate,classicTotal:calc.classicTotal,signatureTotal:calc.signatureTotal,barTotal:calc.barTotal,secondBartenderTotal:calc.secondBartenderTotal,subtotal,total:amount(subtotal+travelCost)};
}
export function createCateringInvoice(event:EventData,quote:CateringQuote,extraCocktails:number,today=new Date()):CateringInvoice{
 const lines:CateringInvoiceLine[]=[];
 const add=(description:string,quantity:number,rate:number)=>{if(quantity>0)lines.push({description,quantity,rate,amount:amount(quantity*rate)})};
 add('Mobiele bar + bartender ('+quote.plan.hours+' uur)',1,quote.barTotal);
 add('Classic cocktails',quote.classicCount,quote.classicRate);
 add('Signature cocktails',quote.signatureCount,quote.signatureRate);
 if(quote.plan.secondBartender)add('Tweede bartender ('+quote.plan.secondBartenderHours+' uur)',quote.plan.secondBartenderHours,45);
 add('Reiskosten',quote.travelCost>0?1:0,quote.travelCost);
 add('Extra cocktails',Math.max(0,Math.floor(extraCocktails)),quote.extraCocktailRate);
 const subtotal=amount(lines.reduce((sum,line)=>sum+line.amount,0));
 return {id:numberId('WB-FAC',event.id,today),createdAt:iso(today),client:quote.client,quoteId:quote.id,eventTitle:quote.eventTitle,eventDate:quote.eventDate,eventCity:quote.eventCity,eventAddress:quote.eventAddress,lines,subtotal,total:subtotal,notes:''};
}
