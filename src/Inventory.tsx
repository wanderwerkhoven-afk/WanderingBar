import {useEffect,useMemo,useState} from 'react';
import {createPortal} from 'react-dom';
import {Martini, Wine, Citrus, Package, Search, Plus, ChevronRight, X, Pencil, Trash2, ArrowLeft, BookOpen, type LucideIcon} from 'lucide-react';
import './inventory.css';
import './Catalog.css';
import {imageToBase64} from './eventImage';

import type {Category,Item} from './types/inventory';
import {INVENTORY_STORAGE_KEY} from './repositories/storageKeys';
export type {Item} from './types/inventory';
export {INVENTORY_STORAGE_KEY} from './repositories/storageKeys';
function InventoryProductImage({item}:{item:Item}){
 const [open,setOpen]=useState(false);
 const [hover,setHover]=useState<{top:number;left:number;width:number;height:number}|null>(null);
 const [failed,setFailed]=useState(false);
 const src=item.image||item.imageUrl;
 useEffect(()=>{setFailed(false);setOpen(false);setHover(null)},[src]);
 useEffect(()=>{if(!open)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open]);
 useEffect(()=>{if(!hover)return;const dismiss=()=>setHover(null);window.addEventListener('scroll',dismiss,true);window.addEventListener('resize',dismiss);return()=>{window.removeEventListener('scroll',dismiss,true);window.removeEventListener('resize',dismiss)}},[hover]);
 return <><div className="inventory-product-media catalog-product-media">{src&&!failed?<button type="button" className="inventory-product-image-button catalog-product-image-button" aria-label={'Vergroot foto van '+item.name} title="Foto vergroten" onMouseEnter={event=>{if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;const rect=event.currentTarget.closest('.inventory-product-card')?.getBoundingClientRect();if(rect)setHover({top:rect.top,left:rect.left,width:rect.width,height:rect.height})}} onMouseLeave={()=>setHover(null)} onClick={()=>{setHover(null);setOpen(true)}}><img src={src} alt={item.name} loading="lazy" onError={()=>setFailed(true)}/><span className="inventory-product-zoom-hint catalog-product-zoom-hint">Vergroten</span></button>:<Package size={27}/>}</div>{hover&&src&&!failed&&!open&&createPortal(<div className="catalog-hover-preview" aria-hidden="true" style={{top:Math.max(8,hover.top),left:hover.left,width:hover.width,height:Math.min(hover.height,window.innerHeight-16)}}><img src={src} alt=""/><span className="catalog-hover-preview-close">×</span></div>,document.body)}{open&&src&&!failed&&createPortal(<div className="catalog-image-lightbox" role="dialog" aria-modal="true" aria-label={'Productfoto van '+item.name} onClick={()=>setOpen(false)}><div className="catalog-image-lightbox-inner" onClick={event=>event.stopPropagation()}><button type="button" className="catalog-image-lightbox-close" onClick={()=>setOpen(false)} aria-label="Sluiten">×</button><img src={src} alt={item.name}/><p>{item.name}</p></div></div>,document.body)}</>;
}
const categories:{name:Category;description:string;icon:LucideIcon;subcategories:string[]}[]=[
{name:'Bar & materialen',description:'Tools, glaswerk, deco',icon:Martini,subcategories:['Bar & inrichting','Bar tools','Glaswerk','Logistiek']},
{name:'Dranken',description:'Spirits, mixers, siropen',icon:Wine,subcategories:['Spirits','Likeuren','Sappen','Siropen','Mixers','Frisdranken','Wijn & bubbels','Bier','Overig']},
{name:'Garneringen',description:'Fruit, kruiden, gedroogd',icon:Citrus,subcategories:['Vers fruit','Kruiden','Gedroogd','Fruitpurees','Overig']},
{name:'Verbruiksartikelen',description:'Servetten, schoonmaak',icon:Package,subcategories:['Servetten','Schoonmaak','Workshopmateriaal','Drukwerk','Overig']}
];
const seed:[string,Category,string][]=[
['Fysieke bar','Bar & materialen','Bar & inrichting'],['Barmat 20×60','Bar & materialen','Bar & inrichting'],['Barmat met logo 20×20','Bar & materialen','Bar & inrichting'],['Fleslampen','Bar & materialen','Bar & inrichting'],['Vaas','Bar & materialen','Bar & inrichting'],['Napkin holder','Bar & materialen','Bar & inrichting'],['Menu holder','Bar & materialen','Bar & inrichting'],['Visitekaartjeshouder','Bar & materialen','Bar & inrichting'],
['Boston shaker','Bar & materialen','Bar tools'],['IJsschep','Bar & materialen','Bar tools'],['IJsbak','Bar & materialen','Bar tools'],['IJsvoorraadbak 20 L','Bar & materialen','Bar tools'],['Muddler','Bar & materialen','Bar tools'],['Schenktuit','Bar & materialen','Bar tools'],['Hawthorne strainer','Bar & materialen','Bar tools'],['Barspoon','Bar & materialen','Bar tools'],['Jigger','Bar & materialen','Bar tools'],['Fine strainer','Bar & materialen','Bar tools'],
['Coupeglas','Bar & materialen','Glaswerk'],['Waterglas','Bar & materialen','Glaswerk'],['Tumblerglas','Bar & materialen','Glaswerk'],['Workshopflesje dun','Bar & materialen','Glaswerk'],['Workshopflesje dik','Bar & materialen','Glaswerk'],['Glazen fles 0,7 L','Bar & materialen','Glaswerk'],['Waterkaraf','Bar & materialen','Glaswerk'],
['Opbergkrat','Bar & materialen','Logistiek'],
['Servetten','Verbruiksartikelen','Servetten'],['Vaatdoekjes','Verbruiksartikelen','Schoonmaak'],['Theedoeken','Verbruiksartikelen','Schoonmaak'],['Zeep','Verbruiksartikelen','Schoonmaak'],['Workshopreceptkaarten','Verbruiksartikelen','Workshopmateriaal']
];
// Catalogusvoorstellen: geen bevestigde voorraad, merken of hoeveelheden.
const beverageCatalog:[string,string][]=[
['Vodka','Spirits'],['Gin','Spirits'],['Witte rum','Spirits'],['Bruine rum','Spirits'],['Tequila blanco','Spirits'],['Tequila reposado','Spirits'],['Bourbon whiskey','Spirits'],['Whisky','Spirits'],['Cognac','Spirits'],['Pisco','Spirits'],['Cachaça','Spirits'],['Mezcal','Spirits'],
['Triple sec','Likeuren'],['Cointreau','Likeuren'],['Amaretto','Likeuren'],['Koffielikeur','Likeuren'],['Perziklikeur','Likeuren'],['Vlierbloesemlikeur','Likeuren'],['Crème de cassis','Likeuren'],['Blue curaçao','Likeuren'],['Aperol','Likeuren'],['Campari','Likeuren'],['Limoncello','Likeuren'],['Vermouth rood','Likeuren'],['Vermouth droog','Likeuren'],
['Limoensap','Sappen'],['Citroensap','Sappen'],['Sinaasappelsap','Sappen'],['Ananassap','Sappen'],['Cranberrysap','Sappen'],['Grapefruitsap','Sappen'],['Appelsap','Sappen'],['Passievruchtsap','Sappen'],['Mangonectar','Sappen'],['Tomatensap','Sappen'],['Granaatappelsap','Sappen'],
['Suikersiroop','Siropen'],['Rietsuikersiroop','Siropen'],['Vanillesiroop','Siropen'],['Passievruchtsiroop','Siropen'],['Grenadine','Siropen'],['Vlierbloesemsiroop','Siropen'],['Frambozensiroop','Siropen'],['Aardbeiensiroop','Siropen'],['Kokossiroop','Siropen'],['Orgeat (amandelsiroop)','Siropen'],['Gembersiroop','Siropen'],['Karamelsiroop','Siropen'],['Lavendelsiroop','Siropen'],['Honingstroop','Siropen'],
['Tonic water','Mixers'],['Elderflower tonic','Mixers'],['Ginger beer','Mixers'],['Ginger ale','Mixers'],['Sodawater','Mixers'],['Bitter lemon','Mixers'],['Cola','Frisdranken'],['Cola zero','Frisdranken'],['Sprite / 7UP','Frisdranken'],['Fanta','Frisdranken'],['Bruiswater','Frisdranken'],['Plat water','Frisdranken'],
['Prosecco','Wijn & bubbels'],['Cava','Wijn & bubbels'],['Witte wijn','Wijn & bubbels'],['Rode wijn','Wijn & bubbels'],['Rosé','Wijn & bubbels'],['Bier pils','Bier'],['Alcoholvrij bier','Bier'],
['Angostura bitters','Overig'],['Orange bitters','Overig'],['Chocolate bitters','Overig'],['Kokosroom','Overig'],['Aquafaba','Overig']
];
const beverageStarter:Item[]=beverageCatalog.map(([name,subcategory],i)=>({id:'beverage-'+i,name,category:'Dranken',subcategory,quantity:0,unit:'flessen',location:'',notes:''}));

// Extra cocktailingrediënten en drankvarianten; voorraad begint op nul.
const extraCatalog:[string,Category,string,string][]=[
['London dry gin','Dranken','Spirits','flessen'],['Old Tom gin','Dranken','Spirits','flessen'],['Sloe gin','Dranken','Likeuren','flessen'],['Citroen vodka','Dranken','Spirits','flessen'],['Vanille vodka','Dranken','Spirits','flessen'],['Spiced rum','Dranken','Spirits','flessen'],['Overproof rum','Dranken','Spirits','flessen'],['Kokosrum','Dranken','Spirits','flessen'],['Rye whiskey','Dranken','Spirits','flessen'],['Scotch whisky','Dranken','Spirits','flessen'],['Irish whiskey','Dranken','Spirits','flessen'],['Brandy','Dranken','Spirits','flessen'],['Calvados','Dranken','Spirits','flessen'],['Absint','Dranken','Spirits','flessen'],['Pernod','Dranken','Spirits','flessen'],
['St-Germain vlierbloesemlikeur','Dranken','Likeuren','flessen'],['Maraschino likeur','Dranken','Likeuren','flessen'],['Crème de cacao','Dranken','Likeuren','flessen'],['Crème de menthe','Dranken','Likeuren','flessen'],['Frangelico','Dranken','Likeuren','flessen'],['Baileys','Dranken','Likeuren','flessen'],['Licor 43','Dranken','Likeuren','flessen'],['Bénédictine','Dranken','Likeuren','flessen'],['Chartreuse groen','Dranken','Likeuren','flessen'],['Chartreuse geel','Dranken','Likeuren','flessen'],['Sambuca','Dranken','Likeuren','flessen'],['Amaro','Dranken','Likeuren','flessen'],['Amaro Montenegro','Dranken','Likeuren','flessen'],['Select aperitivo','Dranken','Likeuren','flessen'],['Pimm’s No. 1','Dranken','Likeuren','flessen'],['Lillet Blanc','Dranken','Likeuren','flessen'],['Lillet Rosé','Dranken','Likeuren','flessen'],['Vermouth wit','Dranken','Likeuren','flessen'],
['Bloedsinaasappelsap','Dranken','Sappen','flessen'],['Perensap','Dranken','Sappen','flessen'],['Watermeloensap','Dranken','Sappen','flessen'],['Lycheesap','Dranken','Sappen','flessen'],['Guavesap','Dranken','Sappen','flessen'],['Wortelsap','Dranken','Sappen','flessen'],['Kersensap','Dranken','Sappen','flessen'],['Aloëveradrank','Dranken','Sappen','flessen'],
['Kaneelsiroop','Dranken','Siropen','flessen'],['Hazelnootsiroop','Dranken','Siropen','flessen'],['Rozenwater-siroop','Dranken','Siropen','flessen'],['Hibiscussiroop','Dranken','Siropen','flessen'],['Komkommersiroop','Dranken','Siropen','flessen'],['Basilicumsiroop','Dranken','Siropen','flessen'],['Muntsiroop','Dranken','Siropen','flessen'],['Perziksiroop','Dranken','Siropen','flessen'],['Lycheesiroop','Dranken','Siropen','flessen'],['Watermeloensiroop','Dranken','Siropen','flessen'],['Blauwebessensiroop','Dranken','Siropen','flessen'],['Chocoladesiroop','Dranken','Siropen','flessen'],['Pompoenkruidensiroop','Dranken','Siropen','flessen'],['Agavesiroop','Dranken','Siropen','flessen'],['Falernum','Dranken','Siropen','flessen'],
['Mediterranean tonic','Dranken','Mixers','flessen'],['Pink tonic','Dranken','Mixers','flessen'],['Light tonic','Dranken','Mixers','flessen'],['Yuzu tonic','Dranken','Mixers','flessen'],['Rabarbertonic','Dranken','Mixers','flessen'],['Grapefruit soda','Dranken','Mixers','flessen'],['Citroenlimonade','Dranken','Frisdranken','flessen'],['IJsthee','Dranken','Frisdranken','flessen'],['Kombucha','Dranken','Mixers','flessen'],['Alcoholvrije gin','Dranken','Spirits','flessen'],['Alcoholvrije aperitivo','Dranken','Overig','flessen'],['Alcoholvrije prosecco','Dranken','Wijn & bubbels','flessen'],['Champagne','Dranken','Wijn & bubbels','flessen'],['Rosé prosecco','Dranken','Wijn & bubbels','flessen'],['Stout bier','Dranken','Bier','flessen'],['IPA bier','Dranken','Bier','flessen'],
['Peychaud’s bitters','Dranken','Overig','flessen'],['Celery bitters','Dranken','Overig','flessen'],['Grapefruit bitters','Dranken','Overig','flessen'],['Rabarber bitters','Dranken','Overig','flessen'],['Zoutoplossing','Dranken','Overig','flessen'],['Rozenwater','Dranken','Overig','flessen'],['Oranjebloesemwater','Dranken','Overig','flessen'],['Espresso','Dranken','Overig','ml'],['Cold brew koffie','Dranken','Overig','ml'],['Kokosmelk','Dranken','Overig','ml'],['Volle melk','Dranken','Overig','ml'],['Havermelk','Dranken','Overig','ml'],['Slagroom','Dranken','Overig','ml'],['Eiwit gepasteuriseerd','Dranken','Overig','ml'],
['Limoen','Garneringen','Vers fruit','stuks'],['Citroen','Garneringen','Vers fruit','stuks'],['Sinaasappel','Garneringen','Vers fruit','stuks'],['Grapefruit','Garneringen','Vers fruit','stuks'],['Bloedsinaasappel','Garneringen','Vers fruit','stuks'],['Ananas','Garneringen','Vers fruit','stuks'],['Passievrucht','Garneringen','Vers fruit','stuks'],['Aardbei','Garneringen','Vers fruit','stuks'],['Framboos','Garneringen','Vers fruit','stuks'],['Blauwe bes','Garneringen','Vers fruit','stuks'],['Bramen','Garneringen','Vers fruit','stuks'],['Watermeloen','Garneringen','Vers fruit','stuks'],['Komkommer','Garneringen','Vers fruit','stuks'],['Appel','Garneringen','Vers fruit','stuks'],['Peer','Garneringen','Vers fruit','stuks'],['Granaatappel','Garneringen','Vers fruit','stuks'],['Kers','Garneringen','Vers fruit','stuks'],['Lychee','Garneringen','Vers fruit','stuks'],
['Verse munt','Garneringen','Kruiden','gram'],['Verse basilicum','Garneringen','Kruiden','gram'],['Verse rozemarijn','Garneringen','Kruiden','gram'],['Verse tijm','Garneringen','Kruiden','gram'],['Verse salie','Garneringen','Kruiden','gram'],['Verse gember','Garneringen','Kruiden','gram'],['Citroengras','Garneringen','Kruiden','stuks'],['Kaneelstokjes','Garneringen','Gedroogd','stuks'],['Steranijs','Garneringen','Gedroogd','stuks'],['Kruidnagel','Garneringen','Gedroogd','stuks'],['Gedroogde sinaasappelschijfjes','Garneringen','Gedroogd','stuks'],['Gedroogde limoenschijfjes','Garneringen','Gedroogd','stuks'],['Gedroogde citroenschijfjes','Garneringen','Gedroogd','stuks'],['Gedroogde grapefruitschijfjes','Garneringen','Gedroogd','stuks'],['Eetbare bloemen','Garneringen','Overig','stuks'],['Cocktailkersen','Garneringen','Overig','stuks'],['Olijven','Garneringen','Overig','stuks'],['Grof zeezout','Garneringen','Overig','gram'],['Rietsuiker','Garneringen','Overig','gram'],['Kristalsuiker','Garneringen','Overig','gram'],['Tajín kruidenmix','Garneringen','Overig','gram'],['Kokosrasp','Garneringen','Overig','gram'],['Passievruchtpuree','Garneringen','Fruitpurees','gram'],['Mangopuree','Garneringen','Fruitpurees','gram'],['Aardbeienpuree','Garneringen','Fruitpurees','gram'],['Frambozenpuree','Garneringen','Fruitpurees','gram'],['Perzikpuree','Garneringen','Fruitpurees','gram'],['Yuzupuree','Garneringen','Fruitpurees','gram']
];
const extraStarter:Item[]=extraCatalog.map(([name,category,subcategory,unit],i)=>({id:'extra-'+i,name,category,subcategory,quantity:0,unit,location:'',notes:''}));
const homemadeStarter:Item[]=[{id:'homemade-honey-syrup',name:'Honingstroop',category:'Dranken',subcategory:'Siropen',quantity:0,unit:'ml',location:'',notes:'Zelf maken; voorraad van honing en water afzonderlijk bijhouden.',recipe:'Ingrediënten (voor circa 1 liter):\n- 500 ml honing (50%)\n- 500 ml water (50%)\n\nBereiding:\n1. Verwarm het water licht (niet koken).\n2. Roer de honing erdoor tot alles is opgelost.\n3. Laat afkoelen en giet in een schone fles.\n4. Etiketteer met bereidingsdatum en bewaar gekoeld.'},{id:'homemade-sugar-syrup',name:'Zelfgemaakte suikersiroop',category:'Dranken',subcategory:'Siropen',quantity:0,unit:'ml',location:'',notes:'Zelfgemaakte suikersiroop; aparte voorraad naast ingekochte Monin suikersiroop.',recipe:'Ingrediënten (richtrecept):\\n- 500 g kristalsuiker\\n- 500 ml water\\n\\nBereiding:\\n1. Verwarm water en los de suiker op.\\n2. Laat afkoelen en bottel schoon.\\n3. Meet het werkelijke eindvolume.'},{id:'homemade-honey-stock',name:'Honing',category:'Garneringen',subcategory:'Overig',quantity:0,unit:'gram',location:'',notes:'Grondstof voor zelfgemaakte honingsiroop.'}];
const verifiedPrices:Record<string,{price:number;brand:string;supplier:string;webLink:string;notes:string}>={
'Sinaasappelsap':{price:1.59,brand:'AH',supplier:'Albert Heijn',webLink:'https://www.ah.nl/producten/product/wi377720/ah-sinaasappelsap',notes:'Prijsreferentie: 1 liter verpakking (4 nov 2026).'},
'Appelsap':{price:1.59,brand:'AH',supplier:'Albert Heijn',webLink:'https://www.ah.nl/producten/product/wi377726/ah-appelsap',notes:'Prijsreferentie: 1 liter verpakking (4 nov 2026).'},
'Bloedsinaasappelsap':{price:2.89,brand:'AH',supplier:'Albert Heijn',webLink:'https://www.ah.nl/producten/product/wi382448/ah-bloedsinaasappelsap',notes:'Prijsreferentie: 1 liter verpakking (4 nov 2026).'},
'Limoen':{price:0.69,brand:'AH',supplier:'Albert Heijn',webLink:'https://www.ah.nl/producten/product/wi231211/ah-limoen',notes:'Prijsreferentie: per stuk (4 nov 2026).'}
};
const gallPrices:Record<string,{price:number;brand:string;webLink:string}> = { 'Witte rum': {price:18.99,brand:'Bacardí Carta Blanca 70 cl',webLink:'https://www.gall.nl/bacardi-carta-blanca-70cl-762164.html'}, 'Gin': {price:24.49,brand:'Bombay Sapphire 70 cl',webLink:'https://www.gall.nl/bombay-sapphire-70cl-778818.html'}, 'Cointreau': {price:26.49,brand:'Cointreau 70 cl',webLink:'https://www.gall.nl/cointreau-70cl-671711.html'} };
const moreGallPrices:Record<string,{price:number;brand:string;webLink:string}> = {'Aperol':{price:15.49,brand:'Aperol 70 cl',webLink:'https://www.gall.nl/aperol-70cl-799092.html'},'Spiced rum':{price:18.99,brand:'Bacardí Spiced 70 cl',webLink:'https://www.gall.nl/bacardi-spiced-70cl-768766.html'},'London dry gin':{price:21.99,brand:'Beefeater London Dry 70 cl',webLink:'https://www.gall.nl/beefeater-london-dry-70cl-770299.html'}};
const newGallPrices:Record<string,{price:number;brand:string;webLink:string}>={"Bruine rum":{price:18.99,brand:"Bacardí Carta Negra 70 cl",webLink:"https://www.gall.nl/bacardi-carta-negra-70cl-768367.html"},"Licor 43":{price:21.49,brand:"Licor 43 Original 70 cl",webLink:"https://www.gall.nl/licor-43-70cl-670286.html"},"Kokosrum":{price:15.99,brand:"Malibu Coconut 70 cl",webLink:"https://www.gall.nl/malibu-coconut-70cl-678414.html"}};
const gallBatch2:Record<string,{price:number;brand:string;webLink:string}>={ 'Amaretto':{price:22.99,brand:'Disaronno Originale 70 cl',webLink:'https://www.gall.nl/disaronno-originale-70cl-670863.html'}, 'Whisky':{price:28.99,brand:'Jack Daniels Tennessee Whiskey 70 cl',webLink:'https://www.gall.nl/jack-daniels-tennessee-whiskey-70cl-729957.html'}, 'Limoncello':{price:19.99,brand:'Luxardo Limoncello 70 cl',webLink:'https://www.gall.nl/luxardo-limoncello-70cl-659509.html'} };
const gallBatch3:Record<string,{price:number;brand:string;webLink:string}>={"Vodka":{price:15.99,brand:"Bols Vodka 70 cl",webLink:"https://www.gall.nl/bols-vodka-70cl-789836.html"},"Vanille vodka":{price:17.99,brand:"Smirnoff Vanilla 70 cl",webLink:"https://www.gall.nl/smirnoff-vanilla-70cl-466468.html"},"Bourbon whiskey":{price:21.99,brand:"Jim Beam White 70 cl",webLink:"https://www.gall.nl/jim-beam-white-70cl-720062.html"},"Sambuca":{price:19.99,brand:"Luxardo Sambuca 70 cl",webLink:"https://www.gall.nl/luxardo-sambuca-70cl-659215.html"},"Koffielikeur":{price:15.49,brand:"Café Marakesh 70 cl",webLink:"https://www.gall.nl/cafe-marakesh-70cl-653063.html"}};
const gallBatch4:Record<string,{price:number;brand:string;webLink:string}>={"Tequila blanco":{price:21.49,brand:"Jose Cuervo Especial Silver 70 cl",webLink:"https://www.gall.nl/jose-cuervo-especial-silver-70cl-795100.html"},"Tequila reposado":{price:21.49,brand:"Jose Cuervo Especial Reposado 70 cl",webLink:"https://www.gall.nl/jose-cuervo-especial-reposado-70cl-795240.html"},"Campari":{price:20.99,brand:"Campari 70 cl",webLink:"https://www.gall.nl/campari-70cl-601020.html"},"Blue curaçao":{price:10.99,brand:"Bols Blue Curaçao 50 cl",webLink:"https://www.gall.nl/bols-blue-curacao-50cl-654108.html"},"Baileys":{price:24.99,brand:"Baileys Original Irish Cream 100 cl",webLink:"https://www.gall.nl/baileys-original-irish-cream-100cl-660027.html"}};
const gallBatch5:Record<string,{price:number|null;brand:string;webLink:string}>={"Frangelico":{"price":21.49,"brand":"Frangelico 70 cl","webLink":"https://www.gall.nl/frangelico-70cl-678805.html"},"Vermouth rood":{"price":10.99,"brand":"Martini Rosso 75 cl","webLink":"https://www.gall.nl/martini-rosso-75cl-430005.html"},"Scotch whisky":{"price":19.99,"brand":"The Famous Grouse 70 cl","webLink":"https://www.gall.nl/zoeken/?q=the%20famous%20grouse"},"Pernod":{"price":26.89,"brand":"Pernod 70 cl","webLink":"https://www.gall.nl/pernod-70cl-790915.html"},"Vermouth wit":{"price":null,"brand":"Martini Bianco 75 cl","webLink":"https://www.gall.nl/mixen/vermout/martini/"}};
const gallBatch6:Record<string,{price:number;brand:string;webLink:string}>={"Triple sec":{"price":12.99,"brand":"Bols Triple Sec 50 cl","webLink":"https://www.gall.nl/bols-triple-sec-50cl-676047.html"},"Irish whiskey":{"price":25.99,"brand":"Jameson 70 cl","webLink":"https://www.gall.nl/jameson-70cl-710067.html"},"St-Germain vlierbloesemlikeur":{"price":29.99,"brand":"St-Germain Vlierbloesem 50 cl","webLink":"https://www.gall.nl/st.-germain-vlierbloesem-50cl-118699.html"},"Lillet Rosé":{"price":15.99,"brand":"Lillet Rosé 75 cl","webLink":"https://www.gall.nl/lillet-rose-75cl-445568.html"},"Rye whiskey":{"price":59.99,"brand":"Sagamore Rye 70 cl","webLink":"https://www.gall.nl/sagamore-rye-70cl-467731.html"}};
const gallBatch7:Record<string,{price:number;brand:string;webLink:string}>={"Cognac":{"price":47.79,"brand":"Hennessy VS 70 cl","webLink":"https://www.gall.nl/hennessy-vs-70cl-740608.html"},"Calvados":{"price":27.99,"brand":"Père Magloire Fine 70 cl","webLink":"https://www.gall.nl/pere-magloire-fine-70cl-750883.html"},"Brandy":{"price":27.49,"brand":"St-Rémy XO 70 cl","webLink":"https://www.gall.nl/st-remy-xo-70cl-425257.html"},"Amaro":{"price":21.99,"brand":"Vecchio Amaro del Capo 70 cl","webLink":"https://www.gall.nl/vecchio-amaro-del-capo-70cl-427950.html"},"Citroen vodka":{"price":20.99,"brand":"Absolut Citron 70 cl","webLink":"https://www.gall.nl/zoeken/?q=Absolut%20Citron"},"Perziklikeur":{"price":15.99,"brand":"Bellini Distillati Crema Pesca 50 cl (roomlikeur)","webLink":"https://www.gall.nl/bellini-distillati-liquore-crema-pesca-50cl-457426.html"}};
const gallBatch8:Record<string,{price:number;brand:string;webLink:string}>={"Pisco":{"price":35,"brand":"Pisco La Caravedo 70 cl","webLink":"https://www.gall.nl/pisco-la-caravedo-70cl-423505.html"},"Cachaça":{"price":18,"brand":"Cachaça Pirassununga 70 cl","webLink":"https://www.gall.nl/cacha%C3%A7a-pirassununga-70cl-792101.html"},"Mezcal":{"price":24,"brand":"Monte Alban Mezcal 70 cl","webLink":"https://www.gall.nl/monte-alban-mezcal-70cl-426636.html"},"Absint":{"price":26,"brand":"Rodnik's Absinthe 70 cl","webLink":"https://www.gall.nl/rodniks-absinthe-70cl-608076.html"},"Maraschino likeur":{"price":13,"brand":"Bols Maraschino 70 cl","webLink":"https://www.gall.nl/mixen/mixlikeur/bols/"}};
const gallBatch9:Record<string,{price:number|null;brand:string;webLink:string}>={"Vlierbloesemlikeur":{"price":10.99,"brand":"Bols Elderflower 50 cl","webLink":"https://www.gall.nl/bols-elderflower-50cl-165085.html"},"Crème de cacao":{"price":null,"brand":"De Kuyper Crème de Cacao Dark 50 cl","webLink":"https://www.gall.nl/likeuren/chocoladelikeur/"},"Bénédictine":{"price":null,"brand":"DOM Bénédictine 70 cl","webLink":"https://www.gall.nl/dom-benedictine-70cl-671061.html"},"Lillet Blanc":{"price":null,"brand":"Lillet Blanc 75 cl","webLink":"https://www.gall.nl/zoeken/?q=Lillet%20Blanc"},"Pimm’s No. 1":{"price":null,"brand":"Pimm's No. 1","webLink":"https://www.gall.nl/likeuren/"}};
const gallBatch10:Record<string,{price:number|null;brand:string;webLink:string}>={"Crème de cassis":{"price":null,"brand":"Giffard Crème de Cassis 70 cl","webLink":"https://www.gall.nl/giffard-creme-de-cassis-70cl-459240.html"},"Crème de menthe":{"price":null,"brand":"De Kuyper Crème de Menthe Groen 50 cl","webLink":"https://www.gall.nl/likeuren/fruitlikeur/"},"Sloe gin":{"price":null,"brand":"Gordon's Sloe Gin (verpakking te controleren)","webLink":"https://www.gall.nl/mixen/gin/gordons/"},"Crème de cacao":{"price":null,"brand":"De Kuyper Crème de Cacao Dark 50 cl","webLink":"https://www.gall.nl/likeuren/"},"Vermouth droog":{"price":null,"brand":"Martini Extra Dry (verpakking te controleren)","webLink":"https://www.gall.nl/zoeken/?q=Martini%20Extra%20Dry"}};
const gallBatch11:Record<string,{price:number;brand:string;webLink:string;notes:string}>={"Crème de cassis":{"price":12.99,"brand":"Giffard Crème de Cassis 70 cl","webLink":"https://www.gall.nl/giffard-creme-de-cassis-70cl-459240.html","notes":"Indicatieve prijs: Gall & Gall toont circa €12; exacte centen niet bevestigd."},"Crème de menthe":{"price":11.99,"brand":"De Kuyper Crème de Menthe Groen 50 cl","webLink":"https://www.gall.nl/de-kuyper-creme-de-menthe-groen-50cl-657018.html","notes":"Indicatieve prijs: Gall & Gall toont circa €11; exacte centen niet bevestigd."},"Crème de cacao":{"price":10.99,"brand":"De Kuyper Crème de Cacao Dark 50 cl","webLink":"https://www.gall.nl/de-kuyper-creme-de-cacao-dark-50cl-657042.html","notes":"Indicatieve prijs: Gall & Gall toont circa €10; exacte centen niet bevestigd."},"Vermouth droog":{"price":14.99,"brand":"Martini Extra Dry 75 cl","webLink":"https://www.gall.nl/zoeken/?q=Martini%20Extra%20Dry","notes":"Geschatte prijs; product en actuele prijs nog controleren."},"Sloe gin":{"price":24.99,"brand":"Gordon's Sloe Gin (flesformaat te controleren)","webLink":"https://www.gall.nl/mixen/gin/gordons/","notes":"Geschatte prijs; productbeschikbaarheid en flesformaat nog controleren."}};
const gallBatch12:Record<string,{price:number;brand:string;webLink:string;notes:string}>={"Bénédictine":{"price":26.99,"brand":"DOM Bénédictine 70 cl","webLink":"https://www.gall.nl/dom-benedictine-70cl-671061.html","notes":"Indicatieve prijs: Gall & Gall toont €26 plus niet leesbare centen; €26,99 is niet bevestigd."},"Lillet Blanc":{"price":15.99,"brand":"Lillet Blanc 75 cl","webLink":"https://www.gall.nl/zoeken/?q=Lillet%20Blanc","notes":"Geschatte reguliere prijs; actuele Gall & Gall-prijs niet bevestigd."},"Pimm’s No. 1":{"price":17.99,"brand":"Pimm's No. 1 70 cl","webLink":"https://www.gall.nl/likeuren/pimms/","notes":"Geschatte reguliere prijs; flesformaat en actuele prijs controleren."},"Chartreuse groen":{"price":49.99,"brand":"Chartreuse Verte 70 cl","webLink":"https://www.gall.nl/zoeken/?q=Chartreuse","notes":"Geschatte prijs; verkrijgbaarheid en actuele prijs bij Gall & Gall niet bevestigd."},"Chartreuse geel":{"price":46.99,"brand":"Chartreuse Jaune 70 cl","webLink":"https://www.gall.nl/zoeken/?q=Chartreuse","notes":"Geschatte prijs; verkrijgbaarheid en actuele prijs bij Gall & Gall niet bevestigd."},"Select aperitivo":{"price":19.99,"brand":"Select Aperitivo 70 cl","webLink":"https://www.gall.nl/zoeken/?q=Select%20Aperitivo","notes":"Geschatte prijs; actuele prijs en verkrijgbaarheid bij Gall & Gall niet bevestigd."}};
const gallBatch13:Record<string,{price:number;brand:string;webLink:string;notes:string}>={"Angostura bitters":{"price":16.99,"brand":"Dr. Siegert Angostura Bitter 20 cl","webLink":"https://www.gall.nl/dr.-siegert-angostura-bitter-20cl-632023.html","notes":"Indicatief: Gall & Gall toont €16, exacte centen niet zichtbaar; €16,99 niet bevestigd."},"Alcoholvrije gin":{"price":17.89,"brand":"Gordon's Gin Alcoholvrij 70 cl","webLink":"https://www.gall.nl/gordon%E2%80%99s-gin-alcoholvrij-70cl-404683.html","notes":"Reguliere Gall & Gall-prijs €17,89; actieprijs kan afwijken."},"Alcoholvrije aperitivo":{"price":10.79,"brand":"Martini Vibrante 75 cl","webLink":"https://www.gall.nl/martini-vibrante-75cl-149292.html","notes":"Reguliere Gall & Gall-prijs €10,79; actieprijs kan afwijken."},"Prosecco":{"price":7.99,"brand":"Martini Prosecco 75 cl","webLink":"https://www.gall.nl/ontdek/cocktails/disaronno/","notes":"Indicatieve prijs: Gall & Gall toont circa €7; exacte centen en voorraad niet bevestigd."},"Cava":{"price":9.99,"brand":"Freixenet Cordon Negro Brut 75 cl","webLink":"https://www.gall.nl/zoeken/?q=Freixenet%20Cordon%20Negro","notes":"Geschatte reguliere prijs; actuele Gall & Gall-prijs en productpagina controleren."},"Orange bitters":{"price":16.99,"brand":"Angostura Orange Bitters 10 cl","webLink":"https://www.gall.nl/zoeken/?q=orange%20bitters","notes":"Geschatte prijs; verkrijgbaarheid, flesformaat en winkelprijs nog controleren."}};
const ahFruitMixerBatch:Record<string,{price:number;brand:string;webLink:string;notes:string}>={"Citroen":{"price":0.69,"brand":"AH citroen (per stuk)","webLink":"https://www.ah.nl/zoeken?query=citroen","notes":"GESCHATTE prijs per stuk; actuele Albert Heijn-prijs nog controleren."},"Sinaasappel":{"price":0.79,"brand":"AH handsinaasappel (per stuk)","webLink":"https://www.ah.nl/zoeken?query=sinaasappel","notes":"GESCHATTE prijs per stuk; actuele Albert Heijn-prijs nog controleren."},"Grapefruit":{"price":1.29,"brand":"AH grapefruit (per stuk)","webLink":"https://www.ah.nl/zoeken?query=grapefruit","notes":"GESCHATTE prijs per stuk; actuele Albert Heijn-prijs nog controleren."},"Komkommer":{"price":0.99,"brand":"AH komkommer (per stuk)","webLink":"https://www.ah.nl/zoeken?query=komkommer","notes":"GESCHATTE prijs per stuk; actuele Albert Heijn-prijs nog controleren."},"Tonic water":{"price":1.79,"brand":"Schweppes Indian Tonic 1 liter (referentie)","webLink":"https://www.ah.nl/zoeken?query=schweppes%20tonic","notes":"GESCHATTE prijs voor 1 liter; merk, formaat en actuele Albert Heijn-prijs nog controleren."},"Ginger beer":{"price":2.49,"brand":"Fever-Tree Ginger Beer 50 cl (referentie)","webLink":"https://www.ah.nl/zoeken?query=fever%20tree%20ginger%20beer","notes":"GESCHATTE prijs voor 50 cl; merk, formaat en actuele Albert Heijn-prijs nog controleren."}};
const newAhPrices={"Citroensap":{"price":1.35,"brand":"AH Biologisch citroensap 250 ml","supplier":"Albert Heijn","notes":"Geschatte richtprijs; winkelprijs en beschikbaarheid controleren.","webLink":"https://www.ah.nl/zoeken?query=Citroensap"},"Ananassap":{"price":2.19,"brand":"Ananassap 1 liter","supplier":"Albert Heijn","notes":"Geschatte richtprijs; winkelprijs en beschikbaarheid controleren.","webLink":"https://www.ah.nl/zoeken?query=Ananassap"},"Cranberrysap":{"price":2.69,"brand":"Cranberrysap 1 liter","supplier":"Albert Heijn","notes":"Geschatte richtprijs; winkelprijs en beschikbaarheid controleren.","webLink":"https://www.ah.nl/zoeken?query=Cranberrysap"},"Grapefruitsap":{"price":2.29,"brand":"Grapefruitsap 1 liter","supplier":"Albert Heijn","notes":"Geschatte richtprijs; winkelprijs en beschikbaarheid controleren.","webLink":"https://www.ah.nl/zoeken?query=Grapefruitsap"},"Mediterranean tonic":{"price":1.99,"brand":"Mediterranean tonic 20 cl","supplier":"Albert Heijn","notes":"Geschatte richtprijs; winkelprijs en beschikbaarheid controleren.","webLink":"https://www.ah.nl/zoeken?query=Mediterranean%20tonic"},"Pink tonic":{"price":1.99,"brand":"Pink tonic 20 cl","supplier":"Albert Heijn","notes":"Geschatte richtprijs; winkelprijs en beschikbaarheid controleren.","webLink":"https://www.ah.nl/zoeken?query=Pink%20tonic"},"Light tonic":{"price":1.79,"brand":"Light tonic 20 cl","supplier":"Albert Heijn","notes":"Geschatte richtprijs; winkelprijs en beschikbaarheid controleren.","webLink":"https://www.ah.nl/zoeken?query=Light%20tonic"}};
const ahBatchTen={"Passievrucht":{"price":1.29,"brand":"Passievrucht per stuk","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Passievrucht","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Ananas":{"price":2.99,"brand":"Ananas per stuk","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Ananas","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Aardbei":{"price":3.49,"brand":"Aardbeien 400 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Aardbei","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Framboos":{"price":3.29,"brand":"Frambozen 125 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Framboos","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Blauwe bes":{"price":2.99,"brand":"Blauwe bessen 125 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Blauwe%20bes","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Verse munt":{"price":1.49,"brand":"Verse munt 15 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Verse%20munt","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Verse basilicum":{"price":1.39,"brand":"Verse basilicum 15 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Verse%20basilicum","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Ginger ale":{"price":1.79,"brand":"Ginger ale 1 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Ginger%20ale","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Sodawater":{"price":0.99,"brand":"Sodawater 1 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Sodawater","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."},"Bitter lemon":{"price":1.79,"brand":"Bitter lemon 1 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Bitter%20lemon","notes":"Geschatte richtprijs per genoemde verpakking; actuele AH-prijs en beschikbaarheid controleren."}};
const ahBatchTwenty={"Bramen":{"price":2.99,"brand":"Bramen 125 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Bramen","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Watermeloen":{"price":4.49,"brand":"Watermeloen per stuk","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Watermeloen","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Appel":{"price":0.69,"brand":"Appel per stuk","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Appel","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Peer":{"price":0.79,"brand":"Peer per stuk","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Peer","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Granaatappel":{"price":1.99,"brand":"Granaatappel per stuk","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Granaatappel","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Verse rozemarijn":{"price":1.39,"brand":"Verse rozemarijn 15 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Verse%20rozemarijn","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Verse tijm":{"price":1.39,"brand":"Verse tijm 15 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Verse%20tijm","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Verse gember":{"price":1.99,"brand":"Verse gember 200 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Verse%20gember","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Elderflower tonic":{"price":1.99,"brand":"Elderflower tonic 20 cl","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Elderflower%20tonic","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."},"Grapefruit soda":{"price":1.99,"brand":"Grapefruit soda 20 cl","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Grapefruit%20soda","notes":"Geschatte richtprijs per genoemde verpakking; actuele winkelprijs en verkrijgbaarheid controleren."}};
const ahBatchThirty={"Kers":{"price":2.99,"brand":"Kersen 250 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Kers","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Lychee":{"price":2.49,"brand":"Lychees blik 425 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Lychee","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Verse salie":{"price":1.49,"brand":"Verse salie 15 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Verse%20salie","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Citroengras":{"price":1.49,"brand":"Citroengras 2 stuks","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Citroengras","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Kaneelstokjes":{"price":2.19,"brand":"Kaneelstokjes 20 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Kaneelstokjes","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Steranijs":{"price":2.49,"brand":"Steranijs 15 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Steranijs","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Kruidnagel":{"price":1.89,"brand":"Kruidnagel 30 g","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Kruidnagel","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Kombucha":{"price":2.49,"brand":"Kombucha 330 ml","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Kombucha","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Yuzu tonic":{"price":2.29,"brand":"Yuzu tonic 20 cl","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Yuzu%20tonic","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."},"Rabarbertonic":{"price":2.29,"brand":"Rabarbertonic 20 cl","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Rabarbertonic","notes":"Geschatte richtprijs per genoemde verpakking; assortiment en actuele winkelprijs controleren."}};
const ahBatchForty={"Cola":{"price":2.39,"brand":"Coca-Cola original 1,5 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Cola","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Cola zero":{"price":2.39,"brand":"Coca-Cola Zero 1,5 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Cola%20zero","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Sprite / 7UP":{"price":2.19,"brand":"7UP 1,5 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Sprite%20%2F%207UP","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Fanta":{"price":2.39,"brand":"Fanta Orange 1,5 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Fanta","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Bruiswater":{"price":0.89,"brand":"AH bruisend mineraalwater 1,5 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Bruiswater","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Plat water":{"price":0.79,"brand":"AH mineraalwater 1,5 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Plat%20water","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Citroenlimonade":{"price":1.99,"brand":"Citroenlimonade 1 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Citroenlimonade","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"IJsthee":{"price":1.79,"brand":"IJsthee 1,5 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=IJsthee","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Tomatensap":{"price":1.69,"brand":"Tomatensap 1 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Tomatensap","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."},"Passievruchtsap":{"price":2.99,"brand":"Passievruchtsap 1 liter","supplier":"Albert Heijn","webLink":"https://www.ah.nl/zoeken?query=Passievruchtsap","notes":"Geschatte richtprijs per genoemde verpakking; actuele prijs en assortiment bij Albert Heijn controleren."}};
const syrupBatchTen={"Suikersiroop":{"price":3.49,"brand":"Monin Pure Cane Sugar 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Suikersiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Vanillesiroop":{"price":8.99,"brand":"Monin Vanille 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Vanillesiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Passievruchtsiroop":{"price":9.49,"brand":"Monin Passion Fruit 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Passievruchtsiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Grenadine":{"price":6.99,"brand":"Monin Grenadine 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Grenadine","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Vlierbloesemsiroop":{"price":9.49,"brand":"Monin Elderflower 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Vlierbloesemsiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Frambozensiroop":{"price":8.99,"brand":"Monin Raspberry 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Frambozensiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Aardbeiensiroop":{"price":8.99,"brand":"Monin Strawberry 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Aardbeiensiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Kokossiroop":{"price":8.99,"brand":"Monin Coconut 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Kokossiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Orgeat (amandelsiroop)":{"price":9.49,"brand":"Monin Orgeat 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Orgeat%20(amandelsiroop)","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."},"Gembersiroop":{"price":9.49,"brand":"Monin Ginger 70 cl","supplier":"Albert Heijn (referentie; assortiment controleren)","webLink":"https://www.ah.nl/zoeken?query=Gembersiroop","notes":"Geschatte richtprijs per fles 70 cl; merk, verkrijgbaarheid en actuele prijs nog controleren."}};
const syrupBatchTwenty={"Karamelsiroop":{"price":8.99,"brand":"Monin Caramel 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Caramel%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Lavendelsiroop":{"price":9.49,"brand":"Monin Lavender 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Lavender%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Kaneelsiroop":{"price":9.49,"brand":"Monin Cinnamon 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Cinnamon%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Hazelnootsiroop":{"price":8.99,"brand":"Monin Hazelnut 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Hazelnut%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Hibiscussiroop":{"price":9.99,"brand":"Monin Hibiscus 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Hibiscus%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Komkommersiroop":{"price":9.99,"brand":"Monin Cucumber 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Cucumber%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Basilicumsiroop":{"price":9.99,"brand":"Monin Basil 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Basil%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Muntsiroop":{"price":8.99,"brand":"Monin Green Mint 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Green%20Mint%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Perziksiroop":{"price":8.99,"brand":"Monin Peach 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Peach%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."},"Lycheesiroop":{"price":9.99,"brand":"Monin Lychee 70 cl","supplier":"Nog te bevestigen","webLink":"https://www.google.com/search?q=Monin%20Lychee%2070%20cl%20kopen%20Nederland","notes":"GESCHATTE richtprijs per fles 70 cl; product, leverancier en actuele winkelprijs nog verifiëren."}};
const preferredSyrupPrices={"Grenadine":{"price":3.49,"brand":"Raak vruchtensiroop granaatappel (grenadinesmaak) 75 cl","supplier":"Albert Heijn","webLink":"https://www.ah.nl/producten/product/wi226945/raak-vruchtensiroop-granaatappel","notes":"Reguliere AH-referentieprijs; limonadesiroop, niet identiek aan cocktailsiroop. Controleer smaak en concentratie."},"Frambozensiroop":{"price":2.89,"brand":"Raak vruchtensiroop frambozensmaak 75 cl","supplier":"Albert Heijn","webLink":"https://www.ah.nl/producten/merk/raak/siroop","notes":"Reguliere AH-referentieprijs; limonadesiroop, niet identiek aan cocktailsiroop. Controleer smaak en concentratie."},"Aardbeiensiroop":{"price":2.89,"brand":"Raak vruchtensiroop aardbeien 75 cl","supplier":"Albert Heijn","webLink":"https://www.ah.nl/producten/merk/raak/siroop","notes":"Reguliere AH-referentieprijs; limonadesiroop, niet identiek aan cocktailsiroop. Controleer smaak en concentratie."},"Suikersiroop":{"price":7.95,"brand":"Monin Suikersiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Vanillesiroop":{"price":9.95,"brand":"Monin Vanillesiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Passievruchtsiroop":{"price":9.95,"brand":"Monin Passievruchtsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Vlierbloesemsiroop":{"price":9.95,"brand":"Monin Vlierbloesemsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Kokossiroop":{"price":9.95,"brand":"Monin Kokossiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Orgeat (amandelsiroop)":{"price":9.95,"brand":"Monin Orgeat (amandelsiroop) 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Gembersiroop":{"price":9.95,"brand":"Monin Gembersiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Karamelsiroop":{"price":9.95,"brand":"Monin Karamelsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Lavendelsiroop":{"price":9.95,"brand":"Monin Lavendelsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Kaneelsiroop":{"price":9.95,"brand":"Monin Kaneelsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Hazelnootsiroop":{"price":9.95,"brand":"Monin Hazelnootsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Hibiscussiroop":{"price":9.95,"brand":"Monin Hibiscussiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Komkommersiroop":{"price":9.95,"brand":"Monin Komkommersiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Basilicumsiroop":{"price":9.95,"brand":"Monin Basilicumsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Muntsiroop":{"price":9.95,"brand":"Monin Muntsiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Perziksiroop":{"price":9.95,"brand":"Monin Perziksiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."},"Lycheesiroop":{"price":9.95,"brand":"Monin Lycheesiroop 70 cl (referentie)","supplier":"DrankDozijn","webLink":"https://drankdozijn.nl/merk/monin","notes":"Monin 70 cl. Richtprijs op basis van DrankDozijn-assortiment; prijs van deze specifieke smaak nog controleren."}};
// Aanvullende speciaalbierbar-catalogus. Voorraad onbekend totdat de gebruiker telt.
const beerBarStarter:Item[]=[
{id:'beerbar-blade-affligem',name:'Affligem Blond BLADE 8 L',category:'Dranken',subcategory:'Bier',quantity:null,unit:'fusten',location:'',brand:'Affligem',notes:'BLADE-compatibel 8-literfust. Eén tappositie per fust; prijs en beschikbaarheid controleren.'},
{id:'beerbar-blade-lagunitas',name:'Lagunitas IPA BLADE 8 L',category:'Dranken',subcategory:'Bier',quantity:null,unit:'fusten',location:'',brand:'Lagunitas',notes:'BLADE-compatibiliteit en leverbaarheid per leverancier controleren voordat je bestelt.'},
{id:'beerbar-blade-moretti',name:'Birra Moretti BLADE 8 L',category:'Dranken',subcategory:'Bier',quantity:null,unit:'fusten',location:'',brand:'Birra Moretti',notes:'BLADE-compatibel 8-literfust. Eén tappositie per fust; prijs en beschikbaarheid controleren.'},
{id:'beerbar-blade-machine',name:'Heineken BLADE biertap',category:'Bar & materialen',subcategory:'Bar & inrichting',quantity:null,unit:'stuks',location:'',notes:'Gewenste opstelling: 3 losse BLADE-taps, elk met een 8-literfust. Nog niet als aanwezige voorraad geregistreerd.'},
{id:'beerbar-ice-tub',name:'Luxe grote ijsbak voor bierflesjes',category:'Bar & materialen',subcategory:'Bar & inrichting',quantity:null,unit:'stuks',location:'',notes:'Presentatie van gekoelde bierflesjes op ijs. Kies voedselveilige, waterdichte bak met afvoer en voldoende draagvermogen.'},
{id:'beerbar-bottle-blond',name:'Speciaalbier blond flesjes',category:'Dranken',subcategory:'Bier',quantity:null,unit:'flessen',location:'',notes:'Flesbier voor presentatie in luxe ijsbak; merk, flesinhoud en prijs later instellen.'},
{id:'beerbar-bottle-ipa',name:'Speciaalbier IPA flesjes',category:'Dranken',subcategory:'Bier',quantity:null,unit:'flessen',location:'',notes:'Flesbier voor presentatie in luxe ijsbak; merk, flesinhoud en prijs later instellen.'},
{id:'beerbar-bottle-tripel',name:'Speciaalbier tripel flesjes',category:'Dranken',subcategory:'Bier',quantity:null,unit:'flessen',location:'',notes:'Flesbier voor presentatie in luxe ijsbak; merk, flesinhoud en prijs later instellen.'}
];
// Bierflesjes zijn assortimentopties, geen getelde voorraad. Flesmaat, prijs en actuele leverbaarheid zijn te controleren.
const bottledBeerCatalog:Item[]=[
 {
  "id": "beerbar-bottle-catalog-0",
  "name": "Desperados Original",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Desperados",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: biermix / tequila-aroma. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-1",
  "name": "Corona Extra",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Corona",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: lager. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-2",
  "name": "Sol",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Sol",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: lager. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-3",
  "name": "Birra Moretti fles",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Birra Moretti",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: lager. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-4",
  "name": "Liefmans Fruitesse",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Liefmans",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: fruitbier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-5",
  "name": "Hoegaarden Wit",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Hoegaarden",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: witbier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-6",
  "name": "Vedett Extra White",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Vedett",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: witbier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-7",
  "name": "Oedipus Mannenliefde",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Oedipus",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: saison. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-8",
  "name": "Kasteel Rouge",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Kasteel",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: fruitbier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-9",
  "name": "Texels Skuumkoppe",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Texels",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: donker tarwebier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-10",
  "name": "Affligem Blond fles",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Affligem",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: blond. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-11",
  "name": "La Chouffe",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Chouffe",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: blond. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-12",
  "name": "Tripel Karmeliet",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Tripel Karmeliet",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: tripel. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-13",
  "name": "Jopen Mooie Nel IPA",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Jopen",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: IPA. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-14",
  "name": "BrewDog Punk IPA",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "BrewDog",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: IPA. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-15",
  "name": "vandeStreek Playground IPA 0.5",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "vandeStreek",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: alcoholarme IPA. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-16",
  "name": "Moersleutel Motor Oil",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "De Moersleutel",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: imperial stout. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-17",
  "name": "Moersleutel Crank the Juice",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "De Moersleutel",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: IPA. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-18",
  "name": "Uiltje Bird of Prey",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Uiltje",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: IPA. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-19",
  "name": "Uiltje Wit",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Uiltje",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: witbier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-20",
  "name": "Brouwerij 't IJ IJwit",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Brouwerij 't IJ",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: witbier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-21",
  "name": "Brouwerij 't IJ Zatte",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Brouwerij 't IJ",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: tripel. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-22",
  "name": "Jopen Adriaan Wit",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Jopen",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: witbier. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-23",
  "name": "Two Chefs Brewing Funky Falcon",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Two Chefs Brewing",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: pale ale. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-24",
  "name": "Frontaal Juice Punch",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Frontaal",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: IPA. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-25",
  "name": "Brouwerij Kees Caramel Fudge Stout",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Brouwerij Kees",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: stout. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-26",
  "name": "De Molen Hel & Verdoemenis",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Brouwerij De Molen",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: imperial stout. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 },
 {
  "id": "beerbar-bottle-catalog-27",
  "name": "Brouwerij Noordt Noordtsingle",
  "category": "Dranken",
  "subcategory": "Bier",
  "quantity": null,
  "unit": "flessen",
  "location": "",
  "brand": "Brouwerij Noordt",
  "notes": "Flesbier voor luxe ijsbakken. Stijl: blond. Flesinhoud, alcoholpercentage, leverancier en actuele beschikbaarheid nog verifiëren."
 }
];
function addBeerBarOptions(items:Item[]):Item[]{const known=new Set(items.map(i=>i.category+'|'+i.name.trim().toLocaleLowerCase('nl')));return [...items,...[...beerBarStarter,...bottledBeerCatalog].filter(i=>!known.has(i.category+'|'+i.name.trim().toLocaleLowerCase('nl')))];}
const key=INVENTORY_STORAGE_KEY;
const starter:Item[]=seed.map(([name,category,subcategory],i)=>({id:'starter-'+i,name,category,subcategory,quantity:0,unit:'stuks',location:'',notes:''}));
function priceLookup(record:object,key:string):any{return (record as Record<string,any>)[key]}
function applyVerifiedPrices(items:Item[]):Item[]{return items.map(i=>{const preferred=priceLookup(preferredSyrupPrices,i.name);const oldSyrup=priceLookup(syrupBatchTwenty,i.name)||priceLookup(syrupBatchTen,i.name);if(preferred&&(i.price==null||(oldSyrup&&i.price===oldSyrup.price&&(i.brand===oldSyrup.brand||!i.brand))))return {...i,...preferred,priceCheckedAt:''};const a=priceLookup(syrupBatchTwenty,i.name)||priceLookup(syrupBatchTen,i.name)||priceLookup(ahBatchForty,i.name)||priceLookup(ahBatchThirty,i.name)||priceLookup(ahBatchTwenty,i.name)||priceLookup(ahBatchTen,i.name)||priceLookup(newAhPrices,i.name)||priceLookup(ahFruitMixerBatch,i.name);if(a&&i.price==null)return {...i,...a,supplier:'Albert Heijn',priceCheckedAt:''};const p=priceLookup(verifiedPrices,i.name);const g=priceLookup(gallBatch13,i.name)||priceLookup(gallBatch12,i.name)||priceLookup(gallBatch11,i.name)||priceLookup(gallPrices,i.name)||priceLookup(moreGallPrices,i.name)||priceLookup(newGallPrices,i.name)||priceLookup(gallBatch2,i.name)||priceLookup(gallBatch3,i.name)||priceLookup(gallBatch4,i.name)||priceLookup(gallBatch5,i.name)||priceLookup(gallBatch6,i.name)||priceLookup(gallBatch7,i.name)||priceLookup(gallBatch8,i.name)||priceLookup(gallBatch9,i.name)||priceLookup(gallBatch10,i.name);if(g&&i.price==null)return {...i,...g,supplier:'Gall & Gall',priceCheckedAt:g.price==null?'':'2026-11-04'};return p&&i.price==null?{...i,...p,priceCheckedAt:'2026-11-04'}:i})}
function attachHomemadeRecipes(items:Item[]):Item[]{return items.map(item=>{const preset=homemadeStarter.find(s=>s.name===item.name&&s.category===item.category);const updated=preset?.recipe&&!item.recipe?{...item,recipe:preset.recipe}:item;return item.name==='Honingstroop'&&item.unit==='flessen'&&item.quantity===0?{...updated,unit:'ml'}:updated})}
function load():Item[]{
const all=[...starter,...beverageStarter,...extraStarter,...homemadeStarter].map(i=>verifiedPrices[i.name]?{...i,...verifiedPrices[i.name],priceCheckedAt:'2026-11-04'}:i);
try{
 const raw=localStorage.getItem(key);
 if(!raw)return addBeerBarOptions(applyVerifiedPrices(attachHomemadeRecipes(all)));
 const value:unknown=JSON.parse(raw);
 if(!Array.isArray(value))return applyVerifiedPrices(attachHomemadeRecipes(all));
 const existing=value as Item[];
 const migrationKey='wandering-barback-inventory-expanded-zero-v1';
 if(localStorage.getItem(migrationKey)==='yes'){const known=new Set(existing.map(i=>i.category+'|'+i.name.trim().toLocaleLowerCase('nl')));const missing=homemadeStarter.filter(i=>!known.has(i.category+'|'+i.name.trim().toLocaleLowerCase('nl')));return addBeerBarOptions(applyVerifiedPrices(attachHomemadeRecipes([...existing,...missing])));}
 const known=new Set(existing.map(i=>i.category+'|'+i.name.trim().toLocaleLowerCase('nl')));
 const missing=all.filter(i=>!known.has(i.category+'|'+i.name.trim().toLocaleLowerCase('nl')));
 const result=[...existing,...missing].map(i=>({...i,quantity:0}));
 localStorage.setItem(migrationKey,'yes');
 return addBeerBarOptions(applyVerifiedPrices(attachHomemadeRecipes(result)));
}catch{return applyVerifiedPrices(attachHomemadeRecipes(all))}
}
const blank=(category:Category):Item=>({id:'',name:'',category,subcategory:categories.find(c=>c.name===category)!.subcategories[0],quantity:0,unit:category==='Dranken'?'flessen':'stuks',location:'',notes:''});
export default function Inventory(){
const [items,setItems]=useState<Item[]>(load);
const [category,setCategory]=useState<Category|null>(null);
const [sub,setSub]=useState('Alles');
const [search,setSearch]=useState('');
const [draft,setDraft]=useState<Item|null>(null);
const [confirmDelete,setConfirmDelete]=useState(false);
const [imageBusy,setImageBusy]=useState(false);
const [imageError,setImageError]=useState('');
const [recipeItem,setRecipeItem]=useState<Item|null>(null);
useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(items))}catch{}},[items]);
const visible=useMemo(()=>items.filter(i=>(!category||i.category===category)&&(sub==='Alles'||i.subcategory===sub)&&i.name.toLocaleLowerCase('nl').includes(search.toLocaleLowerCase('nl'))).sort((a,b)=>a.name.localeCompare(b.name,'nl')),[items,category,sub,search]);
function save(){if(imageBusy||!draft||!draft.name.trim())return;const item={...draft,name:draft.name.trim(),id:draft.id||('item-'+Date.now())};const size=new Blob([JSON.stringify(item)]).size;/* Cloud v3 stores both flattened fields and legacyValue (the full JSON string). */if(size*2+10000>700000){setImageError('Dit artikel is te groot voor Firebase ('+Math.round(size/1024)+' KB, dubbel opgeslagen voor synchronisatie). Upload de originele PNG opnieuw zodat deze extra wordt verkleind.');return}setItems(old=>draft.id?old.map(i=>i.id===draft.id?item:i):[...old,item]);setDraft(null)}
return <section className="inventory-page">
<div className="inventory-heading">{category?<button className="inventory-back" onClick={()=>{setCategory(null);setSub('Alles');setSearch('')}} aria-label="Terug naar categorieën"><ArrowLeft size={23}/></button>:<Package size={25}/>}<h1>{category||'Inventaris'}</h1></div>
{!category?<><div className="inventory-summary"><span>INVENTARISOVERZICHT</span><strong>{items.length} <small>artikelen</small></strong><p>{items.filter(i=>i.quantity===0||i.quantity===null).length} artikelen op nul</p></div><div className="inventory-categories">{categories.map(({name,description,icon:Icon})=><button key={name} className="inventory-category" onClick={()=>{setCategory(name);setSub('Alles')}}><Icon size={28}/><strong>{name}</strong><span>{description}<ChevronRight size={17}/></span><em>{items.filter(i=>i.category===name).length} artikelen</em></button>)}</div></>:<><div className="inventory-search"><Search size={18}/><input placeholder="Zoek artikelen..." aria-label="Zoek artikelen" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="inventory-subfilters">{['Alles',...categories.find(c=>c.name===category)!.subcategories].map(s=><button key={s} className={sub===s?'selected':''} onClick={()=>setSub(s)}>{s}</button>)}</div><p className="inventory-count">{visible.length} artikelen</p><div className="inventory-items catalog-product-grid">{visible.map(item=><article className="inventory-product-card catalog-card catalog-product-card" key={item.id}>
<div className="inventory-product-top catalog-product-top"><span className="inventory-product-type catalog-product-type">{item.subcategory}</span><span className="inventory-product-stock">{item.quantity===null?'0':item.quantity} {item.unit}</span></div>
<div className="inventory-product-main">
<InventoryProductImage item={item}/>
<button type="button" className="inventory-product-details" onClick={()=>{setDraft({...item});setConfirmDelete(false)}} aria-label={'Bewerk '+item.name}>
<strong>{item.name}</strong>
{item.brand&&<span className="inventory-product-brand">{item.brand}</span>}
<span className="inventory-product-meta">{[item.price!=null?'€ '+item.price.toFixed(2).replace('.',','):null,item.location].filter(Boolean).join(' · ')||'Bekijk artikelgegevens'}</span>
</button>
</div>
<div className="inventory-product-footer catalog-product-footer"><button type="button" className="inventory-product-edit" onClick={()=>{setDraft({...item});setConfirmDelete(false)}}><Pencil size={14}/> Bewerken</button>{item.recipe?.trim()&&<button type="button" className="inventory-recipe-button" aria-label={'Bekijk recept voor '+item.name} onClick={()=>setRecipeItem(item)}><BookOpen size={15}/><span>Recept</span></button>}</div>
</article>)}{visible.length===0&&<p className="inventory-empty">Geen artikelen gevonden.</p>}</div></>}
<button className={category?'inventory-fab':'inventory-add'} onClick={()=>{setDraft(blank(category||'Bar & materialen'));setConfirmDelete(false)}} aria-label="Artikel toevoegen"><Plus size={23}/>{!category&&' Artikel toevoegen'}</button>
{recipeItem&&<div className="overlay" onClick={()=>setRecipeItem(null)}><div className="modal inventory-modal inventory-recipe-modal" role="dialog" aria-modal="true" aria-label={'Recept '+recipeItem.name} onClick={e=>e.stopPropagation()}><div className="inventory-modal-head"><h2>{recipeItem.name}</h2><button type="button" onClick={()=>setRecipeItem(null)} aria-label="Sluiten"><X size={21}/></button></div><div className="inventory-recipe-text">{recipeItem.recipe}</div><button type="button" className="inventory-save" onClick={()=>{setDraft({...recipeItem});setRecipeItem(null)}}>Recept bewerken</button></div></div>}
{draft&&<div className="overlay" onClick={()=>setDraft(null)}><form className="modal inventory-modal" role="dialog" aria-modal="true" aria-label="Inventarisartikel" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();save()}}><div className="inventory-modal-head"><h2>{draft.id?'Artikel bewerken':'Artikel toevoegen'}</h2><button type="button" onClick={()=>setDraft(null)} aria-label="Sluiten"><X size={21}/></button></div><label>Afbeeldingslink (https)<input type="url" placeholder="https://…/productfoto.jpg" value={draft.imageUrl||''} onChange={e=>setDraft({...draft,imageUrl:e.target.value})}/></label><label>Productafbeelding (Base64)<input type="file" accept="image/*" disabled={imageBusy} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setImageBusy(true);setImageError('');try{const image=await imageToBase64(file);setDraft(current=>current?{...current,image}:current)}catch(error){setImageError(error instanceof Error?error.message:'Afbeelding verwerken mislukt.')}finally{setImageBusy(false)}}}/></label>{imageBusy&&<p>Afbeelding verwerken…</p>}{imageError&&<p role="alert">{imageError}</p>}{draft.image&&<div className="inventory-image-preview"><img src={draft.image} alt="Voorbeeld productafbeelding"/><button type="button" onClick={()=>setDraft({...draft,image:''})}>Afbeelding verwijderen</button></div>}<label>Naam<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Categorie<select value={draft.category} onChange={e=>{const value=e.target.value as Category;setDraft({...draft,category:value,subcategory:categories.find(c=>c.name===value)!.subcategories[0]})}}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label>Subcategorie<select value={draft.subcategory} onChange={e=>setDraft({...draft,subcategory:e.target.value})}>{categories.find(c=>c.name===draft.category)!.subcategories.map(s=><option key={s}>{s}</option>)}</select></label><div className="inventory-fields"><label>Aantal<input type="number" min="0" step="any" placeholder="Nog niet geteld" value={draft.quantity??''} onChange={e=>setDraft({...draft,quantity:e.target.value===''?null:Math.max(0,Number(e.target.value))})}/></label><label>Eenheid<select value={draft.unit} onChange={e=>setDraft({...draft,unit:e.target.value})}>{['stuks','flessen','liter','ml','kg','gram','pakken','kratten'].map(s=><option key={s}>{s}</option>)}</select></label></div><label>Merk<input value={draft.brand??''} onChange={e=>setDraft({...draft,brand:e.target.value})}/></label><label>Leverancier<select value={draft.supplier??(draft.category==='Garneringen'||draft.subcategory==='Sappen'?'Albert Heijn':draft.category==='Dranken'?'Drankgigant':'')} onChange={e=>setDraft({...draft,supplier:e.target.value})}><option value="">Niet gekozen</option><option>Gall & Gall</option><option>Drankgigant</option><option>Albert Heijn</option><option>DrankDozijn</option><option>Overig</option></select></label><label>Inkoopprijs per eenheid (€)<input type="number" min="0" step="0.01" value={draft.price??''} onChange={e=>setDraft({...draft,price:e.target.value===''?null:Number(e.target.value),priceCheckedAt:e.target.value===''?'':new Date().toISOString().slice(0,10)})}/></label><label>Prijs gecontroleerd op<input type="date" value={draft.priceCheckedAt??''} onChange={e=>setDraft({...draft,priceCheckedAt:e.target.value})}/></label><label>Productlink<input type="url" value={draft.webLink??''} onChange={e=>setDraft({...draft,webLink:e.target.value})}/></label><label>Opslaglocatie<input placeholder="Bijv. Krat B02" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})}/></label><label>Recept (optioneel, voor zelfgemaakte siropen en sappen)<textarea rows={6} placeholder={'Ingrediënten:\n- ...\n\nBereiding:\n1. ...'} value={draft.recipe??''} onChange={e=>setDraft({...draft,recipe:e.target.value})}/></label><label>Notities<textarea rows={2} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label><div className="inventory-modal-actions">{draft.id&&<button className="inventory-delete" type="button" onClick={()=>{if(!confirmDelete){setConfirmDelete(true);return}setItems(old=>old.filter(i=>i.id!==draft.id));setDraft(null)}}><Trash2 size={17}/>{confirmDelete?'Bevestig verwijderen':'Verwijderen'}</button>}<button className="inventory-save" type="submit" disabled={imageBusy}><Pencil size={16}/> Opslaan</button></div></form></div>}
</section>
}
