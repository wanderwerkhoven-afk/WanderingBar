export const COCKTAIL_RECIPES:{name:string;type:'Cocktail'|'Mocktail';ingredients:[string,number,string][]}[]=[
{name:'Last Sip',type:'Cocktail',ingredients:[['Vodka',40,'ml'],['Lycheelikeur',20,'ml'],['Yuzusap',15,'ml'],['Vanillesiroop',15,'ml'],['Lycheesap',20,'ml'],['Passievruchtschuim',20,'ml']]},
{name:'Spicy Guava Margarita',type:'Cocktail',ingredients:[['Tequila blanco',45,'ml'],['Guavepuree',25,'ml'],['Ananassap',20,'ml'],['Limoensap',20,'ml'],['Agavesiroop',10,'ml'],['Jalapeñosiroop',5,'ml']]},
{name:'Double Sunset',type:'Cocktail',ingredients:[['Tequila blanco',45,'ml'],['Bloedsinaasappelsap',35,'ml'],['Vlierbloesemlikeur',15,'ml'],['Limoensap',20,'ml'],['Agavesiroop',10,'ml']]},
{name:'Holy Jasmine',type:'Cocktail',ingredients:[['Gin',45,'ml'],['Cactusvijgpuree',25,'ml'],['Citroensap',20,'ml'],['Jasmijnsiroop',15,'ml'],['Gepasteuriseerd eiwit',20,'ml']]},
{name:'Cucumber Glow',type:'Cocktail',ingredients:[['Gin',45,'ml'],['Komkommersap',30,'ml'],['Yuzusap',15,'ml'],['Basilicumsiroop',15,'ml'],['Bruiswater',60,'ml']]},
{name:'Pear Rosemary Sour',type:'Cocktail',ingredients:[['Bourbon',45,'ml'],['Perensap',30,'ml'],['Citroensap',20,'ml'],['Rozemarijnsiroop',15,'ml'],['Gepasteuriseerd eiwit',15,'ml']]},
{name:'Royal Blackberry Fizz',type:'Cocktail',ingredients:[['Vodka',35,'ml'],['Bramenpuree',25,'ml'],['Citroensap',15,'ml'],['Suikersiroop',10,'ml'],['Prosecco',75,'ml']]},
{name:'Melón con Fuego',type:'Cocktail',ingredients:[['Mezcal',40,'ml'],['Watermeloensap',40,'ml'],['Limoensap',20,'ml'],['Tamarindesiroop',15,'ml'],['Agavesiroop',10,'ml']]},
{name:'Honey Piña',type:'Cocktail',ingredients:[['Tequila blanco',45,'ml'],['Ananaslikeur',20,'ml'],['Limoensap',20,'ml'],['Honingsiroop',15,'ml'],['Ananasschuim',20,'ml']]},
{name:'Blackberry Sage Smash',type:'Cocktail',ingredients:[['Bourbon',45,'ml'],['Verse bramen',6,'stuks'],['Citroensap',20,'ml'],['Saliesiroop',15,'ml'],['Verse salie',2,'blaadjes'],['Aromatic bitters',2,'dashes']]},
{name:'Virgin Mojito',type:'Mocktail',ingredients:[['Limoensap',25,'ml'],['Suikersiroop',20,'ml'],['Munt',10,'blaadjes'],['Bruiswater',120,'ml']]},
{name:'Passion Martini 0.0',type:'Mocktail',ingredients:[['Passievruchtpuree',50,'ml'],['Limoensap',20,'ml'],['Vanillesiroop',15,'ml'],['Alcoholvrije bubbels',40,'ml']]},
{name:'Strawberry Basil Fizz',type:'Mocktail',ingredients:[['Aardbeienpuree',40,'ml'],['Citroensap',20,'ml'],['Suikersiroop',15,'ml'],['Basilicum',4,'blaadjes'],['Bruiswater',100,'ml']]}
];

export type MenuKind='Cocktail'|'Mocktail'|'Wijn'|'Speciaalbier'|'G&T';
export type MenuEntry={name:string;type:MenuKind;ingredients:[string,number,string][];tasteProfile?:string};
export const SERVICE_OPTIONS=['Cocktail workshop','Cocktail catering','Mobiele cocktailbar','Wijnbar','Speciaalbierbar','G&T bar'] as const;
export function serviceMenuKinds(service?:string):MenuKind[]{const s=(service||'').toLocaleLowerCase('nl');if(s.includes('wijn'))return ['Wijn'];if(s.includes('speciaalbier')||s.includes('bierbar'))return ['Speciaalbier'];if(s.includes('g&t')||s.includes('gin & tonic'))return ['G&T'];if(s.includes('cocktail'))return ['Cocktail','Mocktail'];return ['Cocktail','Mocktail','Wijn','Speciaalbier','G&T']}
export const MENU_CATALOG:MenuEntry[]=[
...COCKTAIL_RECIPES,
{name:'Huiswijn wit',type:'Wijn',ingredients:[['Huiswijn wit',150,'ml']]},
{name:'Huiswijn rood',type:'Wijn',ingredients:[['Huiswijn rood',150,'ml']]},
{name:'Huiswijn rosé',type:'Wijn',ingredients:[['Huiswijn rosé',150,'ml']]},
{name:'Prosecco',type:'Wijn',ingredients:[['Prosecco',125,'ml']]},
{name:'Speciaalbier blond',type:'Speciaalbier',ingredients:[['Speciaalbier blond',1,'flessen']]},
{name:'Speciaalbier IPA',type:'Speciaalbier',ingredients:[['Speciaalbier IPA',1,'flessen']]},
{name:'Speciaalbier tripel',type:'Speciaalbier',ingredients:[['Speciaalbier tripel',1,'flessen']]},
{name:'Speciaalbier alcoholvrij',type:'Speciaalbier',ingredients:[['Speciaalbier alcoholvrij',1,'flessen']]},
{name:'Pink Pepper & Grapefruit G&T',type:'G&T',ingredients:[['London Dry Gin',50,'ml'],['Indian tonic',150,'ml'],['Roze peperkorrels',5,'stuks'],['Roze grapefruit',0.125,'stuks'],['Rozemarijn',1,'takjes']]},
{name:'Cucumber Mint G&T',type:'G&T',ingredients:[["Hendrick's Gin",50,'ml'],['Indian tonic',150,'ml'],['Komkommer',0.125,'stuks'],['Verse munt',2,'blaadjes']]},
{name:'Mediterranean Sunset G&T',type:'G&T',ingredients:[['Mediterranean Gin',50,'ml'],['Mediterranean tonic',150,'ml'],['Sinaasappel',0.125,'stuks'],['Tijm',1,'takjes']]}
];
// Starter taste profiles are editable suggestions, not verified brewery tasting notes.
export const BEER_TASTE_PROFILES:Record<string,string>={
 'Affligem Blond BLADE 8 L':'Blond · moutig · licht kruidig',
 'Lagunitas IPA BLADE 8 L':'IPA · citrus · hoppig · bitter',
 'Birra Moretti BLADE 8 L':'Lager · fris · zacht moutig',
 'Desperados Original':'Fris · licht zoet · citrus',
 'Corona Extra':'Licht · fris · mild',
 'Sol':'Licht · verfrissend · zacht',
 'Birra Moretti fles':'Lager · fris · moutig',
 'Liefmans Fruitesse':'Fruitig · zoetzuur · rood fruit',
 'Hoegaarden Wit':'Witbier · citrus · koriander',
 'Vedett Extra White':'Witbier · fris · citrus',
 'Oedipus Mannenliefde':'Saison · fruitig · kruidig',
 'Kasteel Rouge':'Kriek · zoet · donker fruit',
 'Texels Skuumkoppe':'Donker tarwebier · romig · moutig',
 'Affligem Blond fles':'Blond · zacht · kruidig',
 'La Chouffe':'Blond · kruidig · fruitig',
 'Tripel Karmeliet':'Tripel · vol · fruitig · kruidig',
 'Jopen Mooie Nel IPA':'IPA · citrus · tropisch · bitter',
 'BrewDog Punk IPA':'IPA · tropisch · hoppig · bitter',
 'vandeStreek Playground IPA 0.5':'Alcoholarm · IPA · citrus · hoppig',
 'Moersleutel Motor Oil':'Stout · koffie · chocolade · vol',
 'Moersleutel Crank the Juice':'IPA · sappig · tropisch',
 'Uiltje Bird of Prey':'IPA · citrus · tropisch · bitter',
 'Uiltje Wit':'Witbier · fris · fruitig',
 "Brouwerij 't IJ IJwit":'Witbier · citrus · kruidig',
 "Brouwerij 't IJ Zatte":'Tripel · fruitig · kruidig',
 'Jopen Adriaan Wit':'Witbier · fris · citrus',
 'Two Chefs Brewing Funky Falcon':'Pale ale · fruitig · hoppig',
 'Frontaal Juice Punch':'IPA · sappig · tropisch',
 'Brouwerij Kees Caramel Fudge Stout':'Stout · karamel · chocolade',
 'De Molen Hel & Verdoemenis':'Imperial stout · koffie · geroosterd',
 'Brouwerij Noordt Noordtsingle':'Blond · fris · moutig',
 'Speciaalbier blond':'Blond · zacht · moutig',
 'Speciaalbier IPA':'IPA · hoppig · bitter',
 'Speciaalbier tripel':'Tripel · vol · kruidig',
 'Speciaalbier alcoholvrij':'Alcoholvrij · fris · moutig'
};
export const CATALOG_STORAGE_KEY='wandering-barback-catalog-v1';
export function readMenuCatalog():MenuEntry[]{try{const raw=localStorage.getItem(CATALOG_STORAGE_KEY);if(!raw)return MENU_CATALOG;const saved=JSON.parse(raw);return Array.isArray(saved)?saved:MENU_CATALOG}catch{return MENU_CATALOG}}
export function writeMenuCatalog(entries:MenuEntry[]){localStorage.setItem(CATALOG_STORAGE_KEY,JSON.stringify(entries));window.dispatchEvent(new Event('wandering-catalog-updated'))}
export function getMenuEntry(name:string):MenuEntry|undefined{return readMenuCatalog().find(entry=>entry.name===name)}

