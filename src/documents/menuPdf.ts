import {MENU_TEMPLATES,type MenuTemplateId,type MenuFrameStyle,type MenuPrintSize} from '../data/menuTemplates';

type MenuItem={name:string;description:string};
type MenuPdfOptions={eventTitle:string;heading:string;items:MenuItem[];design:MenuTemplateId;frame:MenuFrameStyle;size:MenuPrintSize};

const clean=(s:unknown)=>String(s??'').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim();
const encode=(s:string)=>Array.from(s).map(c=>{const n=c.charCodeAt(0);const special:Record<number,number>={8364:128,8216:145,8217:146,8220:147,8221:148,8211:150,8212:151,8230:133,183:183};return String.fromCharCode(special[n]??(n<=255?n:63))}).join('');
const esc=(s:string)=>encode(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
const bytes=(s:string)=>Uint8Array.from(s,c=>c.charCodeAt(0));
const rgb=(hex:string)=>[1,3,5].map(i=>(parseInt(hex.slice(i,i+2),16)/255).toFixed(3)).join(' ');
const wrap=(s:string,max:number)=>{const words=clean(s).split(' ');const result:string[]=[];let line='';for(const word of words){if(word.length>max){if(line){result.push(line);line=''}for(let i=0;i<word.length;i+=max)result.push(word.slice(i,i+max));continue}if((line+' '+word).trim().length>max&&line){result.push(line);line=''}line=(line+' '+word).trim()}if(line)result.push(line);return result};

export function downloadMenuPdf({eventTitle,heading,items,design,frame,size}:MenuPdfOptions):void{
 if(!items.length)throw new Error('Selecteer eerst dranken voor de menukaart.');
 const template=MENU_TEMPLATES.find(t=>t.id===design)||MENU_TEMPLATES[0];
 const width=size==='A5'?419.53:595.28,height=size==='A5'?595.28:841.89;
 const scale=width/595.28,margin=42*scale,usable=width-2*margin;
 const fg=rgb(template.foreground),bg=rgb(template.background),accent=rgb(template.accent);
 const commands:string[]=[];
 const rect=(x:number,y:number,w:number,h:number,color:string)=>commands.push(color+' rg '+x.toFixed(2)+' '+y.toFixed(2)+' '+w.toFixed(2)+' '+h.toFixed(2)+' re f');
 const stroke=(x:number,y:number,w:number,h:number,color:string,lineWidth:number)=>commands.push(color+' RG '+lineWidth.toFixed(2)+' w '+x.toFixed(2)+' '+y.toFixed(2)+' '+w.toFixed(2)+' '+h.toFixed(2)+' re S');
 const text=(s:string,x:number,y:number,fontSize:number,bold=false,color=fg)=>commands.push('BT /'+(bold?'F2':'F1')+' '+fontSize.toFixed(2)+' Tf '+color+' rg 1 0 0 1 '+x.toFixed(2)+' '+y.toFixed(2)+' Tm ('+esc(s)+') Tj ET');
 const rule=(y:number)=>rect(margin,y,usable,0.9*scale,accent);
 rect(0,0,width,height,bg);
 if(frame==='ornate'){
  stroke(19*scale,19*scale,width-38*scale,height-38*scale,accent,1.4*scale);
  stroke(24*scale,24*scale,width-48*scale,height-48*scale,accent,.45*scale);
  for(const [x,y] of [[29*scale,29*scale],[width-29*scale,29*scale],[29*scale,height-29*scale],[width-29*scale,height-29*scale]])rect(x-2*scale,y-2*scale,4*scale,4*scale,accent);
 }
 const centerText=(s:string,center:number,y:number,fontSize:number,bold=false,color=fg)=>{
  const estimatedWidth=clean(s).length*fontSize*(bold?0.48:0.51);
  text(s,Math.max(34*scale,center-estimatedWidth/2),y,fontSize,bold,color);
 };
 const center=width/2;
 if(frame==='ornate'){centerText('~',center,height-66*scale,21*scale,true,fg)}
 centerText('T H E  W A N D E R I N G  B A R',center,height-91*scale,10.5*scale,true,fg);
 const header=clean(heading).toUpperCase();
 const titleLines=header==='THE DRINKS MENU'?['THE DRINKS','MENU']:wrap(header,17).slice(0,2);
 const titleY=height-151*scale;
 titleLines.forEach((line,i)=>centerText(line,center,titleY-i*35*scale,29*scale,true,fg));
 const eventY=titleY-titleLines.length*35*scale-4*scale;
 wrap(eventTitle.toUpperCase(),38).slice(0,2).forEach((line,i)=>centerText(line,center,eventY-i*14*scale,10.5*scale,false,fg));
 const top=eventY-48*scale,bottom=83*scale;
 const available=top-bottom;
 const columns=items.length>3?2:1;
 const rows=columns===2?Math.ceil(items.length/2):items.length;
 const gap=18*scale;
 const columnWidth=columns===2?(usable-gap)/2:usable;
 const maxName=columns===2?22:42,maxDescription=columns===2?28:62;
 const formatted=items.map(item=>({name:wrap(item.name,maxName).slice(0,2),description:wrap(item.description,maxDescription).slice(0,3)}));
 const rowHeight=available/Math.max(1,rows);
 const baseName=columns===2?16:20,baseDescription=columns===2?9:11;
 const factor=Math.min(1,(rowHeight-8*scale)/(scale*(2*19+3*12+4)));
 if(factor<.55)throw new Error('Te veel dranken voor één leesbare '+size+'-menukaart. Kies minder dranken of A4.');
 for(let i=0;i<formatted.length;i++){
  const item=formatted[i],row=columns===2?Math.floor(i/2):i;
  const centeredLast=columns===2&&items.length%2===1&&i===items.length-1;
  const col=columns===2?i%2:0;
  const x=centeredLast?margin+(usable-columnWidth)/2:margin+col*(columnWidth+gap);
  const itemCenter=x+columnWidth/2;
  const nameHeight=item.name.length*19*scale*factor;
  const descHeight=item.description.length*12*scale*factor;
  let y=top-row*rowHeight-(rowHeight-nameHeight-descHeight)/2;
  for(const line of item.name){centerText(line,itemCenter,y,baseName*scale*factor,true,fg);y-=19*scale*factor}
  y-=4*scale*factor;
  for(const line of item.description){centerText(line,itemCenter,y,baseDescription*scale*factor,false,accent);y-=12*scale*factor}
 }
 const stream=commands.join('\n')+'\n';
 const objects=['','<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Count 1 /Kids [6 0 R] >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>','<< /Length '+bytes(stream).length+' >>\nstream\n'+stream+'endstream','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+width+' '+height+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 5 0 R >>'];
 let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const offsets=[0];
 for(let i=1;i<objects.length;i++){offsets[i]=bytes(pdf).length;pdf+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}
 const xref=bytes(pdf).length;pdf+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
 for(let i=1;i<objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
 pdf+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
 const blob=new Blob([bytes(pdf)],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='Wandering-Bar-Menukaart-'+clean(eventTitle).replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,48)+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
