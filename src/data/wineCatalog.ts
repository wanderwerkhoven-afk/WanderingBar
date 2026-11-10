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
  },
  {"name":"Cune Rueda Verdejo","category":"Wit","grapes":"Verdejo","country":"Spanje","region":"Rueda","alcoholPercentage":13,"tasteProfile":"Tropisch fruit · citroen · venkel","sourceUrl":"https://www.gall.nl/cune-rueda-verdejo-wit-75cl-106313.html"},
  {"name":"Sarría Verdejo","category":"Wit","grapes":"Verdejo","country":"Spanje","region":"Rueda","alcoholPercentage":13.5,"tasteProfile":"Nectarine · appel · sappig","sourceUrl":"https://www.gall.nl/sarria-verdejo-wit-75cl-308587.html"},
  {"name":"Bruce Jack Pinot Grigio","category":"Wit","grapes":"Pinot grigio","country":"Zuid-Afrika","region":"Napier","alcoholPercentage":12.5,"tasteProfile":"Citrus · peer · abrikoos","sourceUrl":"https://www.gall.nl/bruce-jack-pinot-grigio-wit-75cl-470732.html"},
  {"name":"Inycon Estate Pinot Grigio","category":"Wit","grapes":"Pinot grigio","country":"Italië","region":"Sicilië","alcoholPercentage":12,"tasteProfile":"Peer · appel · bloemig","sourceUrl":"https://www.gall.nl/inycon-estate-pinot-grigio-wit-75cl-104353.html"},
  {"name":"Masi Masianco","category":"Wit","grapes":"Pinot grigio, verduzzo","country":"Italië","region":"Veneto","alcoholPercentage":13,"tasteProfile":"Citroen · perzik · honing","sourceUrl":"https://www.gall.nl/masi-masianco-wit-75cl-259586.html"},
  {"name":"Argento AG 47 Malbec","category":"Rood","grapes":"Malbec","country":"Argentinië","region":"Mendoza","alcoholPercentage":13,"tasteProfile":"Pruimen · rood fruit · tabak","sourceUrl":"https://www.gall.nl/argento-ag-47-malbec-rood-75cl-465712.html"},
  {"name":"August Kesseler The Daily August","category":"Wit","grapes":"Riesling","country":"Duitsland","region":"Rheingau","alcoholPercentage":12,"tasteProfile":"Fris · sappig · citrus","sourceUrl":"https://www.gall.nl/august-kesseler-the-daily-august-wit-75cl-125083.html"},
  {"name":"Immel Riesling","category":"Wit","grapes":"Riesling","country":"Duitsland","region":"Rheinhessen","alcoholPercentage":11.5,"tasteProfile":"Appel · limoen · mineralig","sourceUrl":"https://www.gall.nl/immel-riesling-wit-75cl-469572.html"},
  {"name":"The Pledge Our Old Vines Chenin Blanc","category":"Wit","grapes":"Chenin blanc","country":"Zuid-Afrika","region":"Stellenbosch","alcoholPercentage":13.5,"tasteProfile":"Meloen · appel · honing","sourceUrl":"https://www.gall.nl/the-pledge-our-old-vines-chenin-blanc-wit-75cl-442313.html"},
  {"name":"Vallée Loire Vouvray Chenin Blanc","category":"Wit","grapes":"Chenin blanc","country":"Frankrijk","region":"Loire","alcoholPercentage":12,"tasteProfile":"Gele appel · nectarine · lichtzoet","sourceUrl":"https://www.gall.nl/vallee-loire-vouvray-chenin-blanc-wit-75cl-159026.html"},
  {"name":"Grüner Veltliner","category":"Wit","grapes":"Grüner veltliner","country":"Oostenrijk","region":"Oostenrijk","alcoholPercentage":12.5,"tasteProfile":"Citrus · witte peper · fris","sourceUrl":"https://www.gall.nl/gr%C3%BCner-veltliner-wit-75cl-482323.html"},
  {"name":"Gruber Röschitz Grüner Veltliner Terrasse Reipersberg","category":"Wit","grapes":"Grüner veltliner","country":"Oostenrijk","region":"Niederösterreich","alcoholPercentage":13,"tasteProfile":"Appel · pruim · witte peper","sourceUrl":"https://www.gall.nl/gruber-roschitz-gr%C3%BCner-veltliner-terrasse-reipersberg-biologisch-wit-75cl-110698.html"},
  {"name":"Tolloy Gewürztraminer","category":"Wit","grapes":"Gewürztraminer","country":"Italië","region":"Alto Adige","alcoholPercentage":13.5,"tasteProfile":"Lychee · rijp fruit · kruidig","sourceUrl":"https://www.gall.nl/tolloy-gew%C3%BCrztraminer-wit-75cl-474517.html"},
  {"name":"Lavis Classici Gewürztraminer","category":"Wit","grapes":"Gewürztraminer","country":"Italië","region":"Trentino","alcoholPercentage":13.5,"tasteProfile":"Lychee · rozen · specerijen","sourceUrl":"https://www.gall.nl/lavis-classici-gew%C3%BCrztraminer-wit-75cl-258288.html"},
  {"name":"Errazuriz Estate Reserva Cabernet Sauvignon","category":"Rood","grapes":"Cabernet sauvignon","country":"Chili","region":"Aconcagua Valley","alcoholPercentage":13.5,"tasteProfile":"Cassis · cederhout · krachtig","sourceUrl":"https://www.gall.nl/errazuriz-estate-reserva-cabernet-sauvignon-rood-75cl-409448.html"},
  {"name":"Lanzerac Cabernet Sauvignon","category":"Rood","grapes":"Cabernet sauvignon","country":"Zuid-Afrika","region":"Stellenbosch","alcoholPercentage":14,"tasteProfile":"Cederhout · krachtig · lang","sourceUrl":"https://www.gall.nl/lanzerac-cabernet-sauvignon-rood-75cl-149527.html"},
  {"name":"Ezimit Viognier","category":"Wit","grapes":"Viognier","country":"Noord-Macedonië","region":"Povardarie","alcoholPercentage":12.5,"tasteProfile":"Nectarine · grapefruit · vanille","sourceUrl":"https://www.gall.nl/ezimit-viognier-wit-75cl-451975.html"},
  {"name":"F. Chauvenet Pinot Noir","category":"Rood","grapes":"Pinot noir","country":"Frankrijk","region":"Vin de France","alcoholPercentage":12.5,"tasteProfile":"Kersen · koffie · chocolade","sourceUrl":"https://www.gall.nl/f.-chauvenet-pinot-noir-rood-75cl-439827.html"},
  {"name":"Andrian Pinot Noir","category":"Rood","grapes":"Pinot noir","country":"Italië","region":"Alto Adige","alcoholPercentage":13.5,"tasteProfile":"Aardbei · kersen · aards","sourceUrl":"https://www.gall.nl/andrian-pinot-noir-rood-75cl-110620.html"},
  {"name":"J. de Villebois Pinot Noir","category":"Rood","grapes":"Pinot noir","country":"Frankrijk","region":"Loire","alcoholPercentage":13,"tasteProfile":"Kersen · bessen · zacht","sourceUrl":"https://www.gall.nl/j.-de-villebois-pinot-noir-rood-75cl-105651.html"},
  {"name":"P Primitivo Satone","category":"Rood","grapes":"Primitivo","country":"Italië","region":"Puglia","alcoholPercentage":13.5,"tasteProfile":"Rijp fruit · vol · soepel","sourceUrl":"https://www.gall.nl/p-primitivo-satone-rood-75cl-460672.html"},
  {"name":"Poliziano Chianti","category":"Rood","grapes":"Sangiovese, mammolo","country":"Italië","region":"Toscane","alcoholPercentage":13.5,"tasteProfile":"Kersen · frambozen · rabarber","sourceUrl":"https://www.gall.nl/poliziano-chianti-rood-75cl-257370.html"},
  {"name":"Frescobaldi Castiglioni Chianti","category":"Rood","grapes":"Sangiovese, merlot","country":"Italië","region":"Toscane","alcoholPercentage":13,"tasteProfile":"Bosbessen · kersen · peper","sourceUrl":"https://www.gall.nl/frescobaldi-castiglioni-chianti-rood-75cl-259683.html"},
  {"name":"Tenuta Perano Chianti Classico","category":"Rood","grapes":"Sangiovese, merlot","country":"Italië","region":"Toscane","alcoholPercentage":13.5,"tasteProfile":"Kersen · frambozen · kruidnagel","sourceUrl":"https://www.gall.nl/tenuta-perano-chianti-classico-rood-75cl-443379.html"},
  {"name":"Antinori La Braccesca Syrah Cortona Bramasole","category":"Rood","grapes":"Syrah","country":"Italië","region":"Toscane","alcoholPercentage":13.5,"tasteProfile":"Zwart fruit · tabak · peper","sourceUrl":"https://www.gall.nl/antinori-la-braccesca-syrah-cortona-bramasole-rood-75cl-256765.html"},
  {"name":"Domaine Denis Carré Bourgogne Hautes Côtes de Beaune Chardonnay","category":"Wit","grapes":"Chardonnay","country":"Frankrijk","region":"Bourgogne","alcoholPercentage":13,"tasteProfile":"Citrus · bloesem · mineraal","sourceUrl":"https://www.gall.nl/domaine-denis-carre-bourgogne-hautes-c%C3%B4tes-de-beaune-chardonnay-wit-75cl-472689.html"},
  {"name":"Kaapse Veer Chardonnay","category":"Wit","grapes":"Chardonnay","country":"Zuid-Afrika","region":"Stellenbosch","alcoholPercentage":6,"tasteProfile":"Perzik · citroen · ananas","sourceUrl":"https://www.gall.nl/kaapse-veer-chardonnay-wit-75cl-446025.html"},
  {"name":"De Saint-Gall Blanc de Blancs Premier Cru","category":"Mousserend","grapes":"Chardonnay","country":"Frankrijk","region":"Champagne","alcoholPercentage":12.5,"tasteProfile":"Witte bloesem · citrus · amandel","sourceUrl":"https://www.gall.nl/de-saint-gall-blanc-de-blancs-premier-cru-wit-75cl-404993.html"},
  {"name":"Yannick Görgen Pinot Noir","category":"Rood","grapes":"Pinot noir","country":"Duitsland","region":"Pfalz","alcoholPercentage":13,"tasteProfile":"Kersen · framboos · aards","sourceUrl":"https://www.gall.nl/yannick-gorgen-pinot-noir-rood-75cl-469521.html"}
];
