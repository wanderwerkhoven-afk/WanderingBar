import {calculateVat,suggestedVatRate,type VatRate,type VatSummary} from './vat';
import type {EventData} from '../types/event';
import {WORKSHOP_PACKAGES,workshopPricing} from './workshopPricing';
export type WorkshopQuote={id:string;createdAt:string;validUntil:string;client:string;travelCost:number;notes:string;guests:number;eventDate:string;eventTitle:string;eventCity:string;eventAddress:string;packageName:string;cocktails:string[];pricePerPerson:number;workshopTotal:number;total:number;vat?:VatSummary};
export type QuoteSettings={client:string;travelCost:number;notes:string;validUntil:string};
const iso=(date:Date)=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export function quoteDefaultValidity(today=new Date()){const d=new Date(today);d.setDate(d.getDate()+14);return iso(d)}
export function createWorkshopQuote(event:EventData,settings:QuoteSettings,today=new Date()):WorkshopQuote{
 const price=workshopPricing(event.workshopPricing),pkg=WORKSHOP_PACKAGES[price.packageId];
 const guests=Math.max(0,event.guests),travelCost=Math.max(0,Number(settings.travelCost)||0);
 const workshopTotal=guests*price.pricePerPerson;
 return {id:'WB-'+iso(today).replace(/-/g,'')+'-'+String(event.id).slice(-6)+'-'+String(today.getTime()).slice(-5),createdAt:iso(today),validUntil:settings.validUntil||quoteDefaultValidity(today),client:settings.client.trim(),travelCost,notes:settings.notes.trim(),guests,eventDate:event.date,eventTitle:event.title,eventCity:event.city,eventAddress:event.address||'',packageName:pkg.name,cocktails:[...pkg.cocktails],pricePerPerson:price.pricePerPerson,workshopTotal,total:workshopTotal+travelCost,vat:calculateVat([{description:'Cocktailworkshop',quantity:guests,rate:price.pricePerPerson,amount:workshopTotal,vatRate:21},{description:'Reiskosten',quantity:1,rate:travelCost,amount:travelCost,vatRate:21}])};
}

export type WorkshopInvoiceLine={description:string;quantity:number;rate:number;amount:number;vatRate?:VatRate};
export type WorkshopInvoice={id:string;createdAt:string;client:string;quoteId:string;eventTitle:string;eventDate:string;eventCity:string;eventAddress:string;lines:WorkshopInvoiceLine[];subtotal:number;total:number;notes:string;vat?:VatSummary};
export function createWorkshopInvoice(event:EventData,quote:WorkshopQuote,today=new Date()):WorkshopInvoice{
 const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
 const lines:WorkshopInvoiceLine[]=[{description:'Cocktailworkshop · '+quote.packageName,quantity:quote.guests,rate:quote.pricePerPerson,amount:round(quote.guests*quote.pricePerPerson),vatRate:21}];
 if(quote.travelCost>0)lines.push({description:'Reiskosten',quantity:1,rate:quote.travelCost,amount:round(quote.travelCost),vatRate:21});
 const subtotal=round(lines.reduce((sum,line)=>sum+line.amount,0));
 return {id:'WB-FAC-'+iso(today).replace(/-/g,'')+'-'+String(event.id).slice(-6)+'-'+String(today.getTime()).slice(-5),createdAt:iso(today),client:quote.client,quoteId:quote.id,eventTitle:quote.eventTitle,eventDate:quote.eventDate,eventCity:quote.eventCity,eventAddress:quote.eventAddress,lines,subtotal,total:subtotal,notes:'',vat:calculateVat(lines)};
}
