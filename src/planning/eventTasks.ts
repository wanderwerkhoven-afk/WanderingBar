import type {EventData} from '../types/event';
import {parseEventDate} from '../eventDates';
import {getServiceConcept} from './serviceConcepts';
import {normalizeBeerBarPlan,beerBarRequirements} from './beerBar';
export type TaskUrgency='Kritiek'|'Zeer hoog'|'Hoog'|'Gemiddeld'|'Laag'|'Datum ontbreekt';
export type EventTask={urgency:TaskUrgency;daysUntil:number|null;key:string;eventId:number;eventTitle:string;label:string;kind:'schedule'|'packing'|'missing'|'menu';itemId?:number;priority:number;date:string;action:'complete'|'open'};
const missing=(value?:string)=>!value||!value.trim()||/^(datum|locatie) (nog invullen|onbekend)$/i.test(value.trim());
export function getEventTasks(events:EventData[],today=new Date()):EventTask[]{
 const start=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 const result:EventTask[]=[];
 for(const event of events){
  if(event.status==='Afgerond')continue;
  const date=parseEventDate(event.date);if(date&&date<start)continue;
  const days=date?Math.round((date.getTime()-start.getTime())/86400000):null;
  const urgency:TaskUrgency=days===null?'Datum ontbreekt':days<=1?'Kritiek':days<=3?'Zeer hoog':days<=7?'Hoog':days<=14?'Gemiddeld':'Laag';
  // Date priority dominates task type. An event this week always outranks a later event.
  const dateRank=days===null?5:days<=1?0:days<=3?1:days<=7?2:days<=14?3:4;
  const base=dateRank*10000+(days??999)*100;
  const add=(kind:EventTask['kind'],key:string,label:string,priority:number,action:EventTask['action'],itemId?:number)=>result.push({key:event.id+':'+key,eventId:event.id,eventTitle:event.title,label,kind,itemId,priority,urgency,daysUntil:days,date:event.date,action});
  if(!date)add('missing','date','Datum inclusief jaar bevestigen',base,'open');
  if(missing(event.city))add('missing','city','Locatie invullen',base+1,'open');
  if(!event.address?.trim())add('missing','address','Adres bevestigen',base+4,'open');
  if(!event.contact?.trim())add('missing','contact','Contactpersoon invullen',base+7,'open');
  if(!event.start?.trim())add('missing','start','Starttijd invullen',base+6,'open');
  const concept=getServiceConcept(event.service);
  if(concept.needsMenu){
   const beer=concept.usesBeerPlan?beerBarRequirements(normalizeBeerBarPlan(event.beerBarPlan)):null;
   const hasBeer=Boolean(beer&&(beer.totalGlasses>0||beer.totalBottles>0));
   if(concept.usesBeerPlan?!hasBeer:!(event.menu||[]).length)add('menu','menu','Drankselectie voor '+concept.name+' afronden',base+3,'open');
  }
  for(const s of event.schedule||[])if(!s.done&&s.title.trim())add('schedule','schedule:'+s.id,s.title,base+15,'complete',s.id);
  for(const p of event.packing||[])if(!p.done&&p.quantity>0)add('packing','packing:'+p.id,p.name+' inpakken',base+12,'complete',p.id);
 }
 return result.sort((a,b)=>a.priority-b.priority||(parseEventDate(a.date)?.getTime()??Infinity)-(parseEventDate(b.date)?.getTime()??Infinity)||a.eventTitle.localeCompare(b.eventTitle,'nl'));
}
