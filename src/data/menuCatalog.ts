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
export type MenuEntry={name:string;type:MenuKind;ingredients:[string,number,string][]};
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
{name:'Classic G&T',type:'G&T',ingredients:[['Gin',50,'ml'],['Tonic',150,'ml'],['Limoen',1,'stuks']]},
{name:'Pink G&T',type:'G&T',ingredients:[['Pink gin',50,'ml'],['Tonic',150,'ml'],['Aardbei',1,'stuks']]},
{name:'Mediterranean G&T',type:'G&T',ingredients:[['Gin',50,'ml'],['Mediterranean tonic',150,'ml'],['Rozemarijn',1,'takjes']]},
{name:'Alcoholvrije G&T',type:'G&T',ingredients:[['Alcoholvrije gin',50,'ml'],['Tonic',150,'ml'],['Limoen',1,'stuks']]}
];
export function getMenuEntry(name:string):MenuEntry|undefined{return MENU_CATALOG.find(entry=>entry.name===name)}
