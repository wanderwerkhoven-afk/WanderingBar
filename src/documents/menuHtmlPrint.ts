import type {MenuPrintSize} from '../data/menuTemplates';

/**
 * Print the actual React menu preview as HTML instead of rebuilding its design
 * with a separate PDF drawing engine. The browser can save it as PDF.
 */
export function printMenuHtml(preview:HTMLElement,size:MenuPrintSize):void{
 const popup=window.open('','_blank');
 if(!popup){window.alert('Sta pop-ups toe om de menukaart af te drukken.');return}
 const clone=preview.cloneNode(true) as HTMLElement;
 clone.classList.remove('ed-size-a5');
 clone.classList.add('ed-size-a4');
 const styleLinks=Array.from(document.querySelectorAll('link[rel="stylesheet"],style'))
  .map(node=>node.outerHTML).join('\n');
 const pageWidth=size==='A5'?'148mm':'210mm';
 const pageHeight=size==='A5'?'210mm':'297mm';
 const scale=size==='A5'?559.3701/460:793.7008/460;
 // All styles use the exact same 460px A4 canvas, then scale the entire canvas.
 const printCss=`
 @page{size:${size} portrait;margin:0}
 html,body{width:${pageWidth}!important;height:${pageHeight}!important;margin:0!important;padding:0!important;background:white!important;overflow:hidden!important}
 *{box-sizing:border-box}
 #print-root{width:${pageWidth};height:${pageHeight};position:relative;overflow:hidden}
 #print-root>.ed-menu-print{
   position:absolute!important;top:0!important;left:0!important;
   width:460px!important;max-width:none!important;min-width:460px!important;
   height:650.57px!important;max-height:none!important;min-height:650.57px!important;
   aspect-ratio:auto!important;margin:0!important;
   zoom:1!important;transform:scale(${scale})!important;transform-origin:top left!important;
   box-shadow:none!important;display:flex!important;overflow:hidden!important;
   print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important;
 }
 #print-root .ed-menu-paper{width:100%!important;min-width:0!important;max-width:100%!important;height:100%!important;max-height:100%!important;transform:none!important;padding:44px!important}
 #print-root .ed-menu-print.ed-frame-ornate .ed-menu-paper{padding:44px!important}
 #print-root .ed-menu-paper h2{font-size:34px!important}
 #print-root .ed-menu-drinks-compact .ed-menu-drink h3{font-size:17px!important}
 #print-root .ed-menu-drinks-compact .ed-menu-drink p{font-size:11px!important}
 #print-root .ed-menu-drinks-grid{grid-template-rows:repeat(3,minmax(0,1fr))!important}
 #print-root .ed-menu-drinks-grid .ed-menu-drink{overflow:visible!important}
 @media screen{
   html,body{width:auto!important;height:auto!important;min-height:100vh!important;overflow:auto!important;background:#e7e2dc!important}
   #print-root{margin:24px auto;box-shadow:0 8px 28px #0002}
   #print-root>.ed-menu-print{box-shadow:none!important}
   #print-toolbar{position:sticky;top:0;z-index:20;background:#fff;padding:12px;text-align:center;font:14px Arial,sans-serif}
   #print-toolbar button{border:0;border-radius:9px;padding:12px 22px;background:#4b2c1d;color:#fff;cursor:pointer}
 }
 @media print{#print-toolbar{display:none!important}#print-root{margin:0!important;box-shadow:none!important}}
 `;
 const escapeTitle=(s:string)=>s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
 popup.document.open();
 popup.document.write('<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>'+escapeTitle(document.title)+' - Menukaart '+size+'</title><base href="'+document.baseURI+'">'+styleLinks+'<style>'+printCss+'</style></head><body><div id="print-toolbar"><button type="button" onclick="window.print()">Afdrukken / opslaan als PDF</button></div><div id="print-root">'+clone.outerHTML+'</div></body></html>');
 popup.document.close();
 popup.focus();
}
