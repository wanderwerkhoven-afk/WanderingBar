/** Canonical event dates are YYYY-MM-DD. Legacy labels without a year are deliberately not guessed. */
export function parseEventDate(value:string):Date|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const [year,month,day]=value.split('-').map(Number);
 const date=new Date(year,month-1,day);
 return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day?date:null;
}
export function formatEventDate(value:string):string{
 const date=parseEventDate(value);
 return date?new Intl.DateTimeFormat('nl-NL',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(date):value;
}
export function nextUpcomingEvent<T extends {date:string;status:string}>(events:T[]):T|null{
 const today=new Date();today.setHours(0,0,0,0);
 const dated=events.filter(e=>e.status!=='Afgerond').map(event=>({event,date:parseEventDate(event.date)})).filter((entry):entry is {event:T;date:Date}=>entry.date!==null&&entry.date>=today).sort((a,b)=>a.date.getTime()-b.date.getTime());
 return dated[0]?.event??events.find(e=>e.status!=='Afgerond'&&!parseEventDate(e.date))??null;
}
