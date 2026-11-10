// Curated product-level wine records, sourced from Gall & Gall product pages.
// ABV can vary with vintage/batch; check the physical bottle before service.
export type WineCatalogItem={name:string;category:'Wit'|'Rood'|'Rosé'|'Mousserend';grapes:string;country:string;region:string;alcoholPercentage:number;tasteProfile:string;sourceUrl:string};
export const GALL_WINE_CATALOG:WineCatalogItem[]=[
  {
    "name": "Yealands Reserve Sauvignon Blanc",
    "category": "Wit",
    "grapes": "Sauvignon blanc",
    "country": "Nieuw-Zeeland",
    "region": "Marlborough",
    "alcoholPercentage": 12.5,
    "tasteProfile": "Passiefruit · citrus · groene appel",
    "sourceUrl": "https://www.gall.nl/yealands-reserve-sauvignon-blanc-wit-75cl-382795.html"
  },
  {
    "name": "Yealands Estate Sauvignon Blanc",
    "category": "Wit",
    "grapes": "Sauvignon blanc",
    "country": "Nieuw-Zeeland",
    "region": "Marlborough",
    "alcoholPercentage": 12.5,
    "tasteProfile": "Elegant · intens · mineraal",
    "sourceUrl": "https://www.gall.nl/yealands-estate-sauvignon-blanc-wit-75cl-389838.html"
  },
  {
    "name": "Yealands Estate Single Block S1",
    "category": "Wit",
    "grapes": "Sauvignon blanc",
    "country": "Nieuw-Zeeland",
    "region": "Marlborough",
    "alcoholPercentage": 12.5,
    "tasteProfile": "Fris · aromatisch · mineraal",
    "sourceUrl": "https://www.gall.nl/yealands-estate-single-block-s1-wit-75cl-113212.html"
  },
  {
    "name": "Yealands Estate L5 Sauvignon Blanc",
    "category": "Wit",
    "grapes": "Sauvignon blanc",
    "country": "Nieuw-Zeeland",
    "region": "Marlborough",
    "alcoholPercentage": 13,
    "tasteProfile": "Elegant · fris · aromatisch",
    "sourceUrl": "https://www.gall.nl/yealands-estate-l5-sauvignon-blanc-wit-75cl-116335.html"
  },
  {
    "name": "Clearwater Cove Sauvignon Blanc",
    "category": "Wit",
    "grapes": "Sauvignon blanc",
    "country": "Nieuw-Zeeland",
    "region": "Marlborough",
    "alcoholPercentage": 12.5,
    "tasteProfile": "Passiefruit · groene appel · fris",
    "sourceUrl": "https://www.gall.nl/clearwater-cove-sauvignon-blanc-wit-75cl-389773.html"
  },
  {
    "name": "Lawson's Dry Hills Sauvignon Blanc Lighter",
    "category": "Wit",
    "grapes": "Sauvignon blanc",
    "country": "Nieuw-Zeeland",
    "region": "Marlborough",
    "alcoholPercentage": 9,
    "tasteProfile": "Limoen · kiwi · groene appel",
    "sourceUrl": "https://www.gall.nl/lawsons-dry-hills-sauvignon-blanc-lighter-wit-75cl-472255.html"
  },
  {
    "name": "Librandi Critone Bianco Val di Neto",
    "category": "Wit",
    "grapes": "Chardonnay, sauvignon blanc",
    "country": "Italië",
    "region": "Calabrië",
    "alcoholPercentage": 12.5,
    "tasteProfile": "Perzik · tropisch fruit · citroen",
    "sourceUrl": "https://www.gall.nl/librandi-critone-bianco-val-di-neto-wit-75cl-257486.html"
  },
  {
    "name": "Glorioso Rioja Blanco",
    "category": "Wit",
    "grapes": "Viura",
    "country": "Spanje",
    "region": "Rioja",
    "alcoholPercentage": 12,
    "tasteProfile": "Bloemen · appel · geroosterd brood",
    "sourceUrl": "https://www.gall.nl/glorioso-rioja-blanco--wit-75cl-463345.html"
  },
  {
    "name": "Ondarre Rioja Reserva",
    "category": "Rood",
    "grapes": "Tempranillo, mazuelo, garnacha",
    "country": "Spanje",
    "region": "Rioja",
    "alcoholPercentage": 13.5,
    "tasteProfile": "Rijk · rond · houtgerijpt",
    "sourceUrl": "https://www.gall.nl/ondarre-rioja-reserva-rood-75cl-309605.html"
  },
  {
    "name": "Ondarre Rioja Gran Reserva",
    "category": "Rood",
    "grapes": "Tempranillo, mazuelo",
    "country": "Spanje",
    "region": "Rioja",
    "alcoholPercentage": 13.5,
    "tasteProfile": "Gerijpt · complex · vol",
    "sourceUrl": "https://www.gall.nl/ondarre-rioja-gran-reserva-rood-75cl-156442.html"
  },
  {
    "name": "Bideona L3Z4 Leza",
    "category": "Rood",
    "grapes": "Tempranillo",
    "country": "Spanje",
    "region": "Rioja",
    "alcoholPercentage": 14.5,
    "tasteProfile": "Kersen · kruidig · rijk",
    "sourceUrl": "https://www.gall.nl/bideona-l3z4---leza-rood-75cl-466646.html"
  },
  {
    "name": "Bideona S4MG0 Samaniego",
    "category": "Rood",
    "grapes": "Tempranillo",
    "country": "Spanje",
    "region": "Rioja",
    "alcoholPercentage": 14.5,
    "tasteProfile": "Zure kersen · munt · kruidig",
    "sourceUrl": "https://www.gall.nl/bideona-s4mg0---samaniego-rood-75cl-466492.html"
  },
  {
    "name": "Viña Real Rioja Gran Reserva",
    "category": "Rood",
    "grapes": "Tempranillo, graciano",
    "country": "Spanje",
    "region": "Rioja",
    "alcoholPercentage": 13.9,
    "tasteProfile": "Intens · gelaagd · lange afdronk",
    "sourceUrl": "https://www.gall.nl/vi%C3%B1a-real-rioja-gran-reserva-rood-75cl-411116.html"
  },
  {
    "name": "Conde Valdemar Rioja Reserva",
    "category": "Rood",
    "grapes": "Maturana tinta",
    "country": "Spanje",
    "region": "Rioja",
    "alcoholPercentage": 14,
    "tasteProfile": "Karamel · toast · vanille",
    "sourceUrl": "https://www.gall.nl/conde-valdemar-rioja-reserva-rood-75cl-258016.html"
  },
  {
    "name": "Cape Nat Rosé",
    "category": "Rosé",
    "grapes": "Pinotage",
    "country": "Zuid-Afrika",
    "region": "Stellenbosch",
    "alcoholPercentage": 12.5,
    "tasteProfile": "Fruitig · toegankelijk · fris",
    "sourceUrl": "https://www.gall.nl/cape-nat-rose-rose-75cl-474614.html"
  },
  {
    "name": "Onze Tros Rosé",
    "category": "Rosé",
    "grapes": "Cuvée",
    "country": "Nederland",
    "region": "Bentelo",
    "alcoholPercentage": 12,
    "tasteProfile": "Fris · fruitig · licht",
    "sourceUrl": "https://www.gall.nl/onze-tros-rose-rose-75cl-476579.html"
  },
  {
    "name": "Saint X Rosé",
    "category": "Rosé",
    "grapes": "Grenache, syrah, cinsault, vermentino, viognier",
    "country": "Frankrijk",
    "region": "Provence",
    "alcoholPercentage": 12.5,
    "tasteProfile": "Fruitig · toegankelijk · zomers",
    "sourceUrl": "https://www.gall.nl/saint-x-rose-rose-75cl-476552.html"
  }
];
