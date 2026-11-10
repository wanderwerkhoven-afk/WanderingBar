import type {WorkshopQuote} from '../planning/workshopQuotes';
import type {CateringQuote} from '../planning/cateringDocuments';

/** Dependency-free A4 PDF export for immutable quotation snapshots. Amounts are
 * copied from the stored quote; no VAT rate or business details are invented. */
type Quote = WorkshopQuote | CateringQuote;
const money=(n:number)=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n);
const date=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)?s.slice(8,10)+'-'+s.slice(5,7)+'-'+s.slice(0,4):s;
const clean=(s:unknown)=>String(s??'').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim();
const encode=(s:string)=>Array.from(s).map(c=>{const n=c.charCodeAt(0);const special:Record<number,number>={8364:128,8216:145,8217:146,8220:147,8221:148,8211:150,8212:151,8230:133};return String.fromCharCode(special[n]??(n<=255?n:63))}).join('');
const esc=(s:string)=>encode(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
const bytes=(s:string)=>Uint8Array.from(s,c=>c.charCodeAt(0));
const wrap=(text:string,max:number)=>{const words=clean(text).split(' '),lines:string[]=[];let line='';for(const word of words){if((line+' '+word).trim().length>max&&line){lines.push(line);line=''}if(word.length>max){if(line){lines.push(line);line=''}for(let i=0;i<word.length;i+=max)lines.push(word.slice(i,i+max));continue}line=(line+' '+word).trim()}if(line)lines.push(line);return lines.length?lines:['']};

export function downloadQuotePdf(quote:Quote):void{
 const isWorkshop='packageName' in quote;
 const rows:{description:string;quantity:string;rate:string;amount:string}[]=[];
 if(isWorkshop){
  const q=quote as WorkshopQuote;
  rows.push({description:q.packageName,quantity:String(q.guests),rate:money(q.pricePerPerson),amount:money(q.workshopTotal)});
 }else{
  const q=quote as CateringQuote;
  rows.push({description:'Mobiele bar + bartender ('+q.plan.hours+' uur)',quantity:'1',rate:money(q.barTotal),amount:money(q.barTotal)});
  if(q.classicCount)rows.push({description:'Classic cocktails',quantity:String(q.classicCount),rate:money(q.classicRate),amount:money(q.classicTotal)});
  if(q.signatureCount)rows.push({description:'Signature cocktails',quantity:String(q.signatureCount),rate:money(q.signatureRate),amount:money(q.signatureTotal)});
  if(q.plan.secondBartender)rows.push({description:'Tweede bartender ('+q.plan.secondBartenderHours+' uur)',quantity:String(q.plan.secondBartenderHours),rate:money(45),amount:money(q.secondBartenderTotal)});
 }
 if(quote.travelCost)rows.push({description:'Reiskosten',quantity:'1',rate:money(quote.travelCost),amount:money(quote.travelCost)});
 const pages:string[][]=[[]];let y=0;
 const cmd=(s:string)=>pages[pages.length-1].push(s);
 const line=(x1:number,yy:number,x2:number)=>cmd('0.82 G 0.6 w '+x1+' '+yy+' m '+x2+' '+yy+' l S');
 const text=(s:string,x:number,yy:number,size=10,bold=false)=>cmd('BT /'+(bold?'F2':'F1')+' '+size+' Tf 0.15 g 1 0 0 1 '+x+' '+yy+' Tm ('+esc(s)+') Tj ET');
 const newPage=()=>{pages.push([]);y=758;header(false)};
 const ensure=(height:number)=>{if(y-height<75)newPage()};
 const paragraph=(value:string,max=92)=>{for(const l of wrap(value,max)){ensure(15);text(l,48,y,10);y-=15}};
 const heading=(value:string)=>{ensure(35);y-=12;text(value,48,y,12,true);y-=22};
 const header=(_first:boolean)=>{cmd('0.11 0.20 0.17 rg 0 782 595.28 60 re f');cmd('1 1 1 rg');cmd('BT /F2 16 Tf 1 0 0 1 48 804 Tm (THE WANDERING BAR) Tj ET');cmd('0.86 0.79 0.65 rg');cmd('BT /F1 9 Tf 1 0 0 1 460 806 Tm (OFFERTE) Tj ET');cmd('0.15 g');};
 // Cover: deliberately separate from the financial specification.
 cmd('0.965 0.95 0.91 rg 0 0 595.28 841.89 re f');
 cmd('0.11 0.20 0.17 rg 0 322 595.28 520 re f');
 cmd('0.70 0.56 0.37 RG 1.5 w 48 759 m 547 759 l S');
 cmd('0.90 0.84 0.71 rg');
 cmd('BT /F2 18 Tf 1 0 0 1 48 787 Tm (THE WANDERING BAR) Tj ET');
 cmd('BT /F1 10 Tf 1 0 0 1 48 732 Tm (EEN PERSOONLIJK VOORSTEL) Tj ET');
 cmd('0.98 0.97 0.93 rg');
 cmd('BT /F2 39 Tf 0.98 0.97 0.93 rg 1 0 0 1 48 655 Tm (Cocktails die) Tj ET');
 cmd('BT /F2 39 Tf 0.98 0.97 0.93 rg 1 0 0 1 48 605 Tm (bijblijven.) Tj ET');
 cmd('0.90 0.84 0.71 rg');
 for(const [i,l] of wrap('Een complete cocktailervaring voor '+quote.eventTitle+'.',38).entries())cmd('BT /F1 17 Tf 0.90 0.84 0.71 rg 1 0 0 1 48 '+(540-i*24)+' Tm ('+esc(l)+') Tj ET');
 cmd('0.70 0.56 0.37 RG 2 w 48 402 m 547 402 l S');
 cmd('0.11 0.20 0.17 rg');
 text('SAMEN MAKEN WE ER IETS BIJZONDERS VAN',48,281,12,true);
 cmd('0.15 g');
 for(const [i,l] of wrap('Beste '+(quote.client||'opdrachtgever')+', bedankt voor uw interesse in The Wandering Bar. Met dit voorstel verzorgen wij een gastvrije cocktailbeleving, afgestemd op uw evenement.',78).entries())text(l,48,248-i*18,11);
 text('EVENEMENT',48,138,9,true);text('DATUM',340,138,9,true);
 text(quote.eventTitle.slice(0,37),48,117,12,true);text(date(quote.eventDate),340,117,12,true);
 text('Offerte '+quote.id,48,63,9);text('Geldig tot '+date(quote.validUntil),380,63,9);
 newPage();
 heading('Uw arrangement');paragraph(isWorkshop?'Een interactieve cocktailworkshop waarin uw gasten zelf cocktails bereiden onder begeleiding.':'Een professionele mobiele cocktailbar met bartenders en cocktails op locatie.');y-=8;
 const meta:[string,string][]=[['Offertenummer',quote.id],['Offertedatum',date(quote.createdAt)],['Geldig tot',date(quote.validUntil)],['Opdrachtgever',quote.client],['Evenement',quote.eventTitle],['Evenementdatum',date(quote.eventDate)],['Locatie',[quote.eventAddress,quote.eventCity].filter(Boolean).join(', ')||'Nog te bevestigen']];
 for(const [label,value] of meta){ensure(20);text(label,48,y,9,true);for(const [i,l] of wrap(value,55).entries()){if(i)ensure(15);text(l,190,y,9);y-=i?14:0}y-=19}
 heading('Investering en prijsopbouw');
 if(isWorkshop){const q=quote as WorkshopQuote;paragraph('Arrangement: '+q.packageName);paragraph('Cocktails: '+q.cocktails.join(', '))}
 else{const q=quote as CateringQuote;paragraph('Geboekte hoeveelheid: '+q.plan.cocktails+' cocktails. Staffel: '+q.bookedTierMin+(q.bookedTierMax===null?'+':' - '+q.bookedTierMax)+'.')}
 y-=10;ensure(30);text('Omschrijving',48,y,9,true);text('Aantal',324,y,9,true);text('Tarief',395,y,9,true);text('Bedrag',481,y,9,true);y-=12;line(48,y,547);y-=19;
 for(const r of rows){for(const [i,l] of wrap(r.description,43).entries()){ensure(19);text(l,48,y,9);if(i===0){text(r.quantity,324,y,9);text(r.rate,395,y,9);text(r.amount,481,y,9)}y-=17}y-=5;line(48,y+8,547)}
 ensure(55);y-=18;text('Totaal (btw niet uitgesplitst)',48,y,11,true);text(money(quote.total),449,y,11,true);y-=32;
 if(!isWorkshop){const q=quote as CateringQuote;heading('Prijsafspraken en meerwerk');paragraph('Extra cocktails worden achteraf berekend tegen '+money(q.extraCocktailRate)+' per cocktail volgens de oorspronkelijk geboekte staffel, tenzij schriftelijk anders overeengekomen.')}
 if(quote.notes){heading('Opmerkingen');paragraph(quote.notes)}
 ensure(95);heading('De volgende stap');paragraph('Wilt u deze cocktailervaring vastleggen? Neem contact met ons op onder vermelding van het offertenummer. We bespreken graag de laatste details.');y-=8;paragraph('Conceptofferte: btw is niet uitgesplitst. Controleer voor verzending de btw-behandeling, bedrijfsgegevens en toepasselijke voorwaarden.',90);
 pages.forEach((p,i)=>{if(i===0)return;p.push('BT /F1 8 Tf 0.45 g 1 0 0 1 48 42 Tm ('+esc('Wandering Bar  |  '+quote.id)+') Tj ET');p.push('BT /F1 8 Tf 0.45 g 1 0 0 1 500 42 Tm ('+esc((i+1)+' / '+pages.length)+') Tj ET')});
 const objects:string[]=['','<< /Type /Catalog /Pages 2 0 R >>','','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
 const pageIds:number[]=[];
 for(const page of pages){const stream=page.join('\n')+'\n';const contentId=objects.length;objects.push('<< /Length '+bytes(stream).length+' >>\nstream\n'+stream+'endstream');const pageId=objects.length;objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents '+contentId+' 0 R >>');pageIds.push(pageId)}
 objects[2]='<< /Type /Pages /Count '+pageIds.length+' /Kids ['+pageIds.map(n=>n+' 0 R').join(' ')+'] >>';
 let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const offsets=[0];for(let i=1;i<objects.length;i++){offsets[i]=bytes(pdf).length;pdf+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}const xref=bytes(pdf).length;pdf+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';for(let i=1;i<objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';pdf+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
 const blob=new Blob([bytes(pdf)],{type:'application/pdf'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Wandering-Bar-Offerte-'+quote.id.replace(/[^a-zA-Z0-9_-]/g,'_')+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
