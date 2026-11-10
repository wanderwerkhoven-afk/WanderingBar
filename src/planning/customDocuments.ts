import type {EventData} from '../types/event';
import {quoteDefaultValidity} from './workshopQuotes';

export type CustomFinancialLine={id:number;description:string;quantity:number;unitPrice:number};
export type CustomDocumentLine={description:string;quantity:number;rate:number;amount:number};
export type CustomQuote={id:string;createdAt:string;validUntil:string;client:string;notes:string;eventTitle:string;eventDate:string;eventCity:string;eventAddress:string;lines:CustomDocumentLine[];subtotal:number;total:number};
export type CustomInvoice={id:string;createdAt:string;client:string;quoteId:string;eventTitle:string;eventDate:string;eventCity:string;eventAddress:string;lines:CustomDocumentLine[];subtotal:number;total:number;notes:string};

const iso=(date:Date)=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const docId=(prefix:string,eventId:number,today:Date)=>prefix+'-'+iso(today).replace(/-/g,'')+'-'+String(eventId).slice(-6)+'-'+String(today.getTime()).slice(-5);

export function calculateCustomLines(lines:CustomFinancialLine[]):CustomDocumentLine[]{
 return lines.filter(line=>line.description.trim()&&Number.isFinite(line.quantity)&&line.quantity>0&&Number.isFinite(line.unitPrice)&&line.unitPrice>=0).map(line=>({description:line.description.trim(),quantity:line.quantity,rate:money(line.unitPrice),amount:money(line.quantity*line.unitPrice)}));
}
export function createCustomQuote(event:EventData,settings:{client:string;validUntil:string;notes:string},today=new Date()):CustomQuote{
 const lines=calculateCustomLines(event.customFinancialLines||[]);
 const subtotal=money(lines.reduce((sum,line)=>sum+line.amount,0));
 return {id:docId('WB-OFF',event.id,today),createdAt:iso(today),validUntil:settings.validUntil||quoteDefaultValidity(today),client:settings.client.trim(),notes:settings.notes.trim(),eventTitle:event.title,eventDate:event.date,eventCity:event.city,eventAddress:event.address||'',lines,subtotal,total:subtotal};
}
export function createCustomInvoice(event:EventData,quote:CustomQuote,today=new Date()):CustomInvoice{
 return {id:docId('WB-FAC',event.id,today),createdAt:iso(today),client:quote.client,quoteId:quote.id,eventTitle:quote.eventTitle,eventDate:quote.eventDate,eventCity:quote.eventCity,eventAddress:quote.eventAddress,lines:quote.lines.map(line=>({...line})),subtotal:quote.subtotal,total:quote.total,notes:quote.notes};
}
