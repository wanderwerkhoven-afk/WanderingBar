import type {MenuPrintSize} from '../data/menuTemplates';

/**
 * Print the actual React menu preview as HTML instead of rebuilding its design
 * with a separate PDF drawing engine. The browser can save it as PDF.
 */
export function printMenuHtml(preview:HTMLElement,size:MenuPrintSize):void{
 const popup=window.open('','_blank');
 if(!popup){window.alert('Sta pop-ups toe om de menukaart af te drukken.');return}
 const clone=preview.cloneNode(true) as HTMLElement;
 // Preserve the preview's actual rendered canvas and typography instead of
 // forcing it into a narrower 460px layout during printing.
 const sourceWidth=preview.offsetWidth;
 const sourceHeight=preview.offsetHeight;
 if(sourceWidth<=0||sourceHeight<=0){popup.close();window.alert('Menukaart heeft geen geldige afmetingen.');return}
 const sourceNodes=[preview,...Array.from(preview.querySelectorAll<HTMLElement>('*'))];
 const cloneNodes=[clone,...Array.from(clone.querySelectorAll<HTMLElement>('*'))];
 sourceNodes.forEach((source,index)=>{
  const target=cloneNodes[index];if(!target)return;
  const computed=window.getComputedStyle(source);
  for(let i=0;i<computed.length;i++){
   const property=computed.item(i);
   // Copy computed typography, spacing and layout to avoid viewport-based
   // clamp()/media-query changes between app preview and print window.
   target.style.setProperty(property,computed.getPropertyValue(property),computed.getPropertyPriority(property));
  }
 });
 clone.classList.remove('ed-size-a5');
 clone.classList.add('ed-size-a4');
 const styleLinks=Array.from(document.querySelectorAll('link[rel="stylesheet"],style'))
  .map(node=>node.outerHTML).join('\n');
 const pageWidth=size==='A5'?'148mm':'210mm';
 const pageHeight=size==='A5'?'210mm':'297mm';
 const pagePixelWidth=size==='A5'?559.3701:793.7008;
 const pagePixelHeight=size==='A5'?793.7008:1122.5197;
 const scale=Math.min(pagePixelWidth/sourceWidth,pagePixelHeight/sourceHeight);
 const paperLabel=size==='A5'?'A5 · 148 × 210 mm':'A4 · 210 × 297 mm';
 // The printed document is a scaled copy of the actual preview, not a reflow.
 const printCss=`
 @page{size:${pageWidth} ${pageHeight};margin:0}
 @page :first{size:${pageWidth} ${pageHeight};margin:0}
 html,body{width:${pageWidth}!important;height:${pageHeight}!important;margin:0!important;padding:0!important;background:white!important;overflow:hidden!important}
 *,*::before,*::after{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 #print-root{width:${pageWidth};height:${pageHeight};position:relative;overflow:hidden}
 #print-root>.ed-menu-print{
   position:absolute!important;top:0!important;left:0!important;
   width:${sourceWidth}px!important;max-width:none!important;min-width:${sourceWidth}px!important;
   height:${sourceHeight}px!important;max-height:none!important;min-height:${sourceHeight}px!important;
   aspect-ratio:auto!important;margin:0!important;
   zoom:1!important;transform:scale(${scale})!important;transform-origin:top left!important;
   box-shadow:none!important;display:flex!important;overflow:hidden!important;
   print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important;
 }
 /* All child measurements are frozen from the live preview above. */
 @media screen{
   html,body{width:auto!important;height:auto!important;min-height:100vh!important;overflow:auto!important;background:#e7e2dc!important}
   #print-root{margin:24px auto;box-shadow:0 8px 28px #0002}
   #print-root>.ed-menu-print{box-shadow:none!important}
   #print-toolbar{position:sticky;top:0;z-index:20;background:#fff;padding:12px;text-align:center;font:14px Arial,sans-serif}
   #print-toolbar button{border:0;border-radius:9px;padding:12px 22px;background:#4b2c1d;color:#fff;cursor:pointer}
 }
 @media print{
  @page{size:${pageWidth} ${pageHeight};margin:0}
  html,body{width:${pageWidth}!important;height:${pageHeight}!important;max-width:${pageWidth}!important;max-height:${pageHeight}!important;overflow:hidden!important;}
  #print-toolbar{display:none!important}
  #print-root{position:fixed!important;inset:0!important;width:${pageWidth}!important;height:${pageHeight}!important;margin:0!important;padding:0!important;box-shadow:none!important;break-inside:avoid!important;page-break-inside:avoid!important}
  #print-root>.ed-menu-print{page-break-before:avoid!important;page-break-after:avoid!important;break-before:avoid!important;break-after:avoid!important}
 }
 `;
 const escapeTitle=(s:string)=>s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
 popup.document.open();
 popup.document.write('<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>'+escapeTitle(document.title)+' - Menukaart '+size+'</title><base href="'+document.baseURI+'">'+styleLinks+'<style>'+printCss+'</style></head><body><div id="print-toolbar"><button type="button" onclick="window.print()">Afdrukken / opslaan als PDF</button></div><div id="print-root">'+clone.outerHTML+'</div></body></html>');
 popup.document.close();
 popup.focus();
}
