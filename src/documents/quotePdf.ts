import type {WorkshopQuote} from '../planning/workshopQuotes';
import type {CateringQuote} from '../planning/cateringDocuments';
import type {CustomQuote} from '../planning/customDocuments';

/** Dependency-free A4 PDF export for immutable quotation snapshots. Amounts are
 * copied from the stored quote; no VAT rate or business details are invented. */
type Quote = WorkshopQuote | CateringQuote | CustomQuote;
const money=(n:number)=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n);
const date=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)?s.slice(8,10)+'-'+s.slice(5,7)+'-'+s.slice(0,4):s;
const clean=(s:unknown)=>String(s??'').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim();
const encode=(s:string)=>Array.from(s).map(c=>{const n=c.charCodeAt(0);const special:Record<number,number>={8364:128,8216:145,8217:146,8220:147,8221:148,8211:150,8212:151,8230:133};return String.fromCharCode(special[n]??(n<=255?n:63))}).join('');
const esc=(s:string)=>encode(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
const bytes=(s:string)=>Uint8Array.from(s,c=>c.charCodeAt(0));
const wrap=(text:string,max:number)=>{const words=clean(text).split(' '),lines:string[]=[];let line='';for(const word of words){if((line+' '+word).trim().length>max&&line){lines.push(line);line=''}if(word.length>max){if(line){lines.push(line);line=''}for(let i=0;i<word.length;i+=max)lines.push(word.slice(i,i+max));continue}line=(line+' '+word).trim()}if(line)lines.push(line);return lines.length?lines:['']};

export function downloadQuotePdf(quote:Quote):void {
 const workshop='packageName' in quote;
 const custom='lines' in quote;
 const q=!workshop&&!custom?quote as CateringQuote:null;
 const w=workshop?quote as WorkshopQuote:null;
 const customQuote=custom?quote as CustomQuote:null;
 const rows:{label:string;qty:string;rate:string;sum:string}[]=[];
 if(w)rows.push({label:w.packageName,qty:String(w.guests),rate:money(w.pricePerPerson),sum:money(w.workshopTotal)});
 if(q){
  rows.push({label:'Mobiele bar + bartender ('+q.plan.hours+' uur)',qty:'1',rate:money(q.barTotal),sum:money(q.barTotal)});
  if(q.classicCount)rows.push({label:'Classic cocktails',qty:String(q.classicCount),rate:money(q.classicRate),sum:money(q.classicTotal)});
  if(q.signatureCount)rows.push({label:'Signature cocktails',qty:String(q.signatureCount),rate:money(q.signatureRate),sum:money(q.signatureTotal)});
  if(q.plan.secondBartender)rows.push({label:'Tweede bartender ('+q.plan.secondBartenderHours+' uur)',qty:String(q.plan.secondBartenderHours),rate:money(45),sum:money(q.secondBartenderTotal)});
 }
 if(customQuote)for(const item of customQuote.lines)rows.push({label:item.description,qty:String(item.quantity),rate:money(item.rate),sum:money(item.amount)});
 if('travelCost' in quote&&quote.travelCost)rows.push({label:'Reiskosten',qty:'1',rate:money(quote.travelCost),sum:money(quote.travelCost)});
 const pages:string[][]=[[]];
 const cmd=(s:string)=>pages[0].push(s);
 const rect=(x:number,y:number,width:number,height:number,r:number,g:number,b:number)=>cmd(r+' '+g+' '+b+' rg '+x+' '+y+' '+width+' '+height+' re f');
 const text=(s:string,x:number,y:number,size=9,bold=false,color='0.15 0.12 0.10')=>cmd('BT /'+(bold?'F2':'F1')+' '+size+' Tf '+color+' rg 1 0 0 1 '+x+' '+y+' Tm ('+esc(s)+') Tj ET');
 const line=(y:number)=>cmd('0.85 0.79 0.68 RG 0.5 w 42 '+y+' m 553 '+y+' l S');
 const section=(s:string,y:number)=>text(s.toUpperCase(),43,y,9,true,'0.61 0.40 0.15');
 // Fixed single-page A4. Sections scale vertically to accommodate full stored tier table.
 rect(0,0,595.28,841.89,0.982,0.969,0.945);
 rect(0,660,595.28,181.89,0.15,0.10,0.075);
 rect(43,688,55,3,0.77,0.52,0.24);
 text('WANDERING BAR',43,803,21,true,'0.98 0.94 0.87');
 text('COCKTAIL EXPERIENCE ON LOCATION',44,785,8,false,'0.87 0.71 0.48');
 text('OFFERTE',43,725,36,true,'1 1 1');
 text(w?'COCKTAILWORKSHOP':custom?'DIENSTVERLENING OP MAAT':'COCKTAILBAR CATERING',44,704,11,true,'0.89 0.74 0.53');
 section('Jullie evenement',640);
 text(clean(quote.eventTitle).slice(0,45),43,616,20,true);
 const intro='Bedankt voor jullie aanvraag! Met plezier verzorgen wij een sfeervolle en smaakvolle cocktailervaring op locatie.';
 for(const [i,l] of wrap(intro,48).slice(0,3).entries())text(l,43,594-i*13,9);
 text('Opdrachtgever',341,630,9,true);text(clean(quote.client).slice(0,35),427,630,9);
 text('Datum',341,611,9,true);text(date(quote.eventDate),427,611,9);
 text('Locatie',341,592,9,true);text(clean([quote.eventAddress,quote.eventCity].filter(Boolean).join(', ')||'Nog te bevestigen').slice(0,28),427,592,8);
 text(w?'Deelnemers':custom?'Offerte':'Cocktails',341,573,9,true);text(custom?'Op maat':String(w?.guests??q?.plan.cocktails),427,573,9);
 line(550);
 section('Wat wij verzorgen',530);
 const inclusions=custom?['Dienstverlening volgens afspraak','Gespecificeerde werkzaamheden','Transparante prijsopbouw','Uitvoering op locatie']:w?['Professionele cocktailworkshop','Begeleiding bij het bereiden','Drie cocktails per deelnemer','Benodigde ingredienten en materialen']:['Mobiele cocktailbar op locatie','Professionele bartender'+(q?.plan.secondBartender?'s':''),'Classic en Signature cocktails','Ingredienten, ijs en garnering','Barbenodigdheden en glaswerk','Op- en afbouw'];
 inclusions.forEach((item,i)=>{const col=i%2,row=Math.floor(i/2);text('+',43+col*259,509-row*18,12,true,'0.69 0.45 0.19');text(item,59+col*259,510-row*18,9)});
 const priceTop=451;
 // Keep the whole custom quotation on one A4; never print an empty extra sheet.
 if(customQuote&&rows.length>12)throw new Error('Deze offerte bevat meer dan 12 posten. Verdeel de werkzaamheden over minder regels voor een leesbare A4-offerte.');
 line(priceTop+8);section('Investering',priceTop-9);
 text('Omschrijving',43,priceTop-30,8,true);text('Aantal',347,priceTop-30,8,true);text('Tarief',412,priceTop-30,8,true);text('Bedrag',491,priceTop-30,8,true);
 line(priceTop-38);
 let yy=priceTop-55;
 for(const row of rows){
  text(row.label.slice(0,47),43,yy,8.5);text(row.qty,347,yy,8.5);text(row.rate,412,yy,8.5);text(row.sum,491,yy,8.5);yy-=15;
 }
 line(yy+7);
 rect(38,yy-43,519,40,0.94,0.88,0.79);
 text('TOTAAL (btw niet uitgesplitst)',49,yy-28,11,true);
 text(money(quote.total),432,yy-28,17,true);
 yy-=53;
 if(q){
  section('Cocktailstaffel',yy);
  yy-=15;
  text('Aantal cocktails',44,yy,8,true);text('Classic',350,yy,8,true);text('Signature',462,yy,8,true);yy-=12;
  for(const tier of q.tiers){
   const selected=tier.min===q.bookedTierMin;
   if(selected)rect(39,yy-5,517,17,0.94,0.88,0.79);
   text(tier.min+(tier.max===null?'+':' - '+tier.max)+(selected?'  (geboekt)':''),44,yy,8,selected);
   text(money(tier.classic),350,yy,8,selected);text(money(tier.signature),462,yy,8,selected);yy-=14;
  }
  yy-=5;
  for(const [i,l] of wrap('Extra cocktails: '+money(q.extraCocktailRate)+' per stuk volgens de geboekte staffel. Extra afname wijzigt de afgesproken staffel niet.',100).slice(0,2).entries())text(l,44,yy-i*12,8);
  yy-=25;
 }else if(w){
  section('Cocktailselectie',yy);
  yy-=17;
  for(const l of wrap((w?.cocktails||[]).join('  /  '),94).slice(0,2)){text(l,44,yy,8);yy-=12}
  yy-=10;
 }
 if(customQuote){yy-=5;section('Afspraken',yy);yy-=16;text('De genoemde werkzaamheden en tarieven zijn opgenomen in deze offerte.',44,yy,8);yy-=20}
 if(quote.notes){section('Aanvullende afspraken',yy);yy-=15;for(const l of wrap(quote.notes,108).slice(0,3)){text(l,44,yy,8);yy-=11}}
 // Never silently clip the tier table or notes. Warn rather than issuing a misleading document.
 if(yy<70)throw new Error('De offerte bevat te veel informatie voor een leesbare A4. Verkort de opmerkingen of controleer de staffel.');
 line(66);
 text('Offerte '+quote.id,43,50,7.5);text('Geldig tot '+date(quote.validUntil),430,50,7.5);
 text('Concept: btw, bedrijfsgegevens en voorwaarden controleren voor verzending.',43,34,7);
 const objects:string[]=['','<< /Type /Catalog /Pages 2 0 R >>','','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
 const pageIds:number[]=[];
 for(const page of pages){const stream=page.join('\n')+'\n';const contentId=objects.length;objects.push('<< /Length '+bytes(stream).length+' >>\nstream\n'+stream+'endstream');const pageId=objects.length;objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents '+contentId+' 0 R >>');pageIds.push(pageId)}
 objects[2]='<< /Type /Pages /Count '+pageIds.length+' /Kids ['+pageIds.map(n=>n+' 0 R').join(' ')+'] >>';
 let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const offsets=[0];for(let i=1;i<objects.length;i++){offsets[i]=bytes(pdf).length;pdf+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}const xref=bytes(pdf).length;pdf+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';for(let i=1;i<objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';pdf+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
 const blob=new Blob([bytes(pdf)],{type:'application/pdf'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Wandering-Bar-Offerte-'+quote.id.replace(/[^a-zA-Z0-9_-]/g,'_')+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}