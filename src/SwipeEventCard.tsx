import {useRef,useState} from 'react';
import {CalendarDays,ChevronRight,Trash2,Users} from 'lucide-react';
import type {EventData} from './EventDetail';

type Props={event:EventData;open:boolean;onOpen:()=>void;onReveal:()=>void;onClose:()=>void;onDelete:()=>void};
const ACTION_WIDTH=88;
export default function SwipeEventCard({event,open,onOpen,onReveal,onClose,onDelete}:Props){
 const [drag,setDrag]=useState(0);
 const start=useRef<{x:number;y:number;open:boolean}|null>(null);
 const dragged=useRef(false);
 const horizontal=useRef(false);
 const begin=(e:React.TouchEvent)=>{const t=e.touches[0];start.current={x:t.clientX,y:t.clientY,open};dragged.current=false;horizontal.current=false;setDrag(0)};
 const move=(e:React.TouchEvent)=>{if(!start.current)return;const t=e.touches[0];const dx=t.clientX-start.current.x;const dy=t.clientY-start.current.y;if(!horizontal.current&&Math.abs(dy)>Math.abs(dx)+8)return;if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){horizontal.current=true;dragged.current=true;const base=start.current.open?-ACTION_WIDTH:0;setDrag(Math.max(-ACTION_WIDTH,Math.min(0,base+dx))-base)}};
 const end=()=>{if(!start.current)return;if(horizontal.current){const base=start.current.open?-ACTION_WIDTH:0;const final=base+drag;if(final< -ACTION_WIDTH*.5)onReveal();else onClose()}start.current=null;setDrag(0)};
 const offset=Math.max(-ACTION_WIDTH,Math.min(0,(open?-ACTION_WIDTH:0)+drag));
 return <div className={'event-swipe'+(open?' is-open':'')} onTouchStart={begin} onTouchMove={move} onTouchEnd={end} onTouchCancel={end}>
  <button type="button" className="event-swipe-delete" aria-label={event.title+' verwijderen'} onClick={onDelete}><Trash2 size={23}/><span>Verwijder</span></button>
  <button type="button" className="event-list-card card event-swipe-content" style={{transform:`translateX(${offset}px)`,transition:start.current&&horizontal.current?'none':undefined}} onClick={()=>{if(dragged.current){dragged.current=false;return}if(open){onClose();return}onOpen()}} aria-label={event.title+' openen. Veeg naar links om te verwijderen.'}>
   <div className="event-thumbnail">{event.photo?<img src={event.photo} alt="" loading="lazy"/>:<span>🍸</span>}</div>
   <div className="event-card-details"><h2>{event.title}</h2><div className="event-meta"><CalendarDays size={17}/><span>{event.date} · {event.city}</span></div><div className="event-meta"><Users size={17}/><span>{event.guests} gasten</span></div><div className="event-progress"><div className="track"><span style={{width:event.progress+'%'}}/></div><strong>{event.progress}%</strong></div></div><ChevronRight className="event-chevron" size={23}/>
  </button>
 </div>
}
