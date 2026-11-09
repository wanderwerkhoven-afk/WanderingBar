import type {EventData} from '../types/event';
import {parseEventDate} from '../eventDates';
import {getServiceConcept} from './serviceConcepts';
import {normalizeBeerBarPlan,beerBarRequirements} from './beerBar';
export type EventTask={key:string;eventId:number;eventTitle:string;label:string;kind:'schedule'|'packing'|'missing'|'menu';itemId?:number;priority:number;date:string;action:'complete'|'open'};
const missing=(value?:string)=>!value||!value.trim()||/^(datum|locatie) (nog invullen|onbekend)$/i.test(value.trim());
export function getEventTasks(events:EventData[],today=new Date()):EventTask[]{
 const start=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 const result:EventTask[]=[];
 for(const event of events){
  if(event.status==='Afgerond')continue;
  const date=parseEventDate(event.date);if(date&&date<start)continue;
  const days=date?Math.round((date.getTime()-start.getTime())/86400000):null;
  const urgency=days===null?20:days<=2?0:days<=7?5:days<=14?10:20;
  const add=(kind:EventTask['kind'],key:string,label:string,priority:number,action:EventTask['action'],itemId?:number)=>result.push({key:event.id+':'+key,eventId:event.id,eventTitle:event.title,label,kind,itemId,priority,date:event.date,action});
  if(!date)add('missing','date','Datum inclusief jaar bevestigen',0,'open');
  if(missing(event.city))add('missing','city','Locatie invullen',urgency+1,'open');
  if(!event.address?.trim())add('missing','address','Adres bevestigen',urgency+4,'open');
  if(!event.contact?.trim())add('missing','contact','Contactpersoon invullen',urgency+7,'open');
  if(!event.start?.trim())add('missing','start','Starttijd invullen',urgency+6,'open');
  const concept=getServiceConcept(event.service);
  if(concept.needsMenu){
   const beer=concept.usesBeerPlan?beerBarRequirements(normalizeBeerBarPlan(event.beerBarPlan)):null;
   const hasBeer=Boolean(beer&&(beer.totalGlasses>0||beer.totalBottles>0));
   if(concept.usesBeerPlan?!hasBeer:!(event.menu||[]).length)add('menu','menu','Drankselectie voor '+concept.name+' afronden',urgency+3,'open');
  }
  for(const s of event.schedule||[])if(!s.done&&s.title.trim())add('schedule','schedule:'+s.id,s.title,urgency+15,'complete',s.id);
  for(const p of event.packing||[])if(!p.done&&p.quantity>0)add('packing','packing:'+p.id,p.name+' inpakken',urgency+12,'complete',p.id);
 }
 return result.sort((a,b)=>a.priority-b.priority||(parseEventDate(a.date)?.getTime()??Infinity)-(parseEventDate(b.date)?.getTime()??Infinity)||a.eventTitle.localeCompare(b.eventTitle,'nl'));
}
