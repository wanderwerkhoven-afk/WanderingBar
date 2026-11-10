import type {EventData} from '../types/event';
import {WORKSHOP_PACKAGES,workshopPricing} from './workshopPricing';
export type WorkshopQuote={id:string;createdAt:string;validUntil:string;client:string;travelCost:number;notes:string;guests:number;eventDate:string;eventTitle:string;eventCity:string;eventAddress:string;packageName:string;cocktails:string[];pricePerPerson:number;workshopTotal:number;total:number};
export type QuoteSettings={client:string;travelCost:number;notes:string;validUntil:string};
const iso=(date:Date)=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export function quoteDefaultValidity(today=new Date()){const d=new Date(today);d.setDate(d.getDate()+14);return iso(d)}
export function createWorkshopQuote(event:EventData,settings:QuoteSettings,today=new Date()):WorkshopQuote{
 const price=workshopPricing(event.workshopPricing),pkg=WORKSHOP_PACKAGES[price.packageId];
 const guests=Math.max(0,event.guests),travelCost=Math.max(0,Number(settings.travelCost)||0);
 const workshopTotal=guests*price.pricePerPerson;
 return {id:'WB-'+iso(today).replaceAll('-','')+'-'+String(event.id).slice(-6)+'-'+String(today.getTime()).slice(-5),createdAt:iso(today),validUntil:settings.validUntil||quoteDefaultValidity(today),client:settings.client.trim(),travelCost,notes:settings.notes.trim(),guests,eventDate:event.date,eventTitle:event.title,eventCity:event.city,eventAddress:event.address||'',packageName:pkg.name,cocktails:[...pkg.cocktails],pricePerPerson:price.pricePerPerson,workshopTotal,total:workshopTotal+travelCost};
}
