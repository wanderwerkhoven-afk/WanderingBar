# Wandering BarBack — Code Roadmap

Status: 2026-11-08 · branch: main · eerste compatibele model- en opslagrefactor uitgevoerd; verdere fasen open.

## Doel en werkafspraken
De app blijft mobile-first. Alle nieuwe functionaliteit krijgt een expliciet datamodel, een eigenaar-module, opslagstrategie, foutafhandeling en een test. Bewaar bestaande localStorage-data; migreer via versienummers. Voeg nieuwe velden optioneel toe tot migratie is afgerond. Documenteer nieuwe gedeelde variabelen in VARIABLE_REGISTRY.md bij iedere wijziging.

## Huidige architectuur
- `src/main.tsx`: app-shell, navigatie, eventlijst, eventaanmaak, eventopslag, voorbeelddata.
- `src/EventDetail.tsx`: evenementdetails, cocktailcatalogus, menu, draaiboek, inkoop, paklijst, planning, batch-UI.
- `src/Inventory.tsx`: inventariscatalogus, prijsbronnen, migratie, opslag, voorraad-UI.
- `src/inventoryPlanning.ts`: matching, eenheden, tekortberekening en batchafboeking.
- `src/eventImage.ts`: afbeelding → gecomprimeerde JPEG data-URL (Base64).
- `src/style.css`, `src/EventDetail.css`, `src/inventory.css`: UI-styling.
- `package.json`: React 18, TypeScript 5.7, Vite 6; build = `tsc -b && vite build`.

## Fase 0 — Stabiliseren en testen (eerst)
- [ ] `npm run build` draaien en bestaande TypeScript-/bundelfouten oplossen.
- [ ] Mobiele weergave testen (320/375/390/430 px), ook eventkaarten en modals.
- [ ] Testcases voor opslag, nieuwe events, inventaris, prijzen, afbeeldingen, batches en inkoop.
- [ ] Bescherm tegen localStorage-quota bij Base64-afbeeldingen; geen stille dataverliesfouten.
- [ ] Controleer prijs-/leveranciersbronnen en verschil tussen richtprijzen en geverifieerde prijzen.
- [ ] Herstel inconsistenties in cocktail- versus inventarisnamen met expliciete item-ID's.
- [ ] Verifieer dat batchproductie grondstoffen correct afboekt en het werkelijk geproduceerde volume registreert.

## Fase 1 — Datamodellen losmaken
- [x] `src/types/event.ts`: bestaand EventData-model, ScheduleItem, PackingItem, StaffMember en DeletedEvent centraal gezet; MenuSelection blijft voorlopig in legacy-vorm.
- [x] `src/types/inventory.ts`: bestaande Item en Category centraal gezet; InventoryUnit, Supplier, PriceQuote en Recipe volgen later.
- [x] `src/data/menuCatalog.ts`: cocktailrecepten plus startcatalogus voor wijn, speciaalbier en G&T; stabiele ingredient-ID's volgen nog.
- [ ] `src/data/inventorySeed.ts`: standaardproducten; geen prijsbronnen in UI.
- [ ] `src/data/prices.ts`: prijzen met bron, datum, btw-status, verpakking en verificatiestatus.
- [ ] UI-componenten losmaken van bedrijfslogica; bestaande opslagvelden compatibel houden.

## Fase 2 — Eén voorraad- en receptmotor
- [ ] Centraal `ingredientId` in plaats van alleen naamvergelijking.
- [ ] Verpakkingsinhoud expliciet opslaan (`packageSize`, `packageUnit`), niet uit merknaam afleiden.
- [ ] Omrekenen van ml/l, g/kg, stuks en flessen met controle op dimensies.
- [ ] `stockMovements` als logboek voor ontvangsten, verbruik, correcties en productie.
- [ ] Batchrecepten met werkelijke opbrengst, verspilling, bereidingsdatum en grondstofafschrijving.
- [ ] Reserveren voor evenementen gescheiden houden van daadwerkelijk afboeken.

## Fase 3 — Inkoop
- [ ] Tekorten bepalen op basis van beschikbaar minus reserveringen.
- [ ] Afronden op bestelverpakking, met kosten inclusief/exclusief btw.
- [ ] Leveranciersvoorkeuren (bijv. AH/Raak versus DrankDozijn/Monin) vastleggen.
- [ ] Inkooplijst genereren, handmatig aanpassen en afvinken; ontvangst boekt voorraad bij.
- [ ] Alternatieven alleen gebruiken als receptkwaliteit en concentratie passen.

## Fase 4 — Opslaglaag en Firestore
- [x] `src/repositories/` met eerste opslagmodules voor events en inventaris; interfaces voor recepten en bewegingen volgen.
- [ ] Alle bestaande localStorage-operaties achter repositories plaatsen (event-opslag is aangesloten; inventaris-UI nog niet volledig).
- [ ] Versieerbare migratie en export/back-up van bestaande lokale gegevens.
- [ ] Daarna pas Firestore-adapter, auth, rechten en beveiligingsregels toevoegen.
- [ ] Firestore-documentlimiet en afbeeldingopslag evalueren; Firebase Storage voor grotere afbeeldingen.
- [ ] Offline synchronisatie, conflictafhandeling en loading/error-states testen.

## Fase 5 — Operationele kwaliteit
- [ ] Kostprijs per cocktail, eventmarge en budgetoverzicht.
- [ ] Recept-/voorraad-/inkoop-unit- en integratietests.
- [ ] CI: typecheck, tests en build bij iedere PR.
- [ ] Toegankelijkheid, performance, mobiele navigatie en consistente componenten.
- [ ] Logging en foutmeldingen; documentatie actualiseren bij iedere wijziging.

## Definition of Done per feature
1. Datamodel + eigenaar-module gedocumenteerd.
2. Opslag en eventuele migratie geregeld.
3. Tests voor normale en foutscenario's.
4. `npm run build` succesvol.
5. Handmatige mobiele controle.
6. VARIABLE_REGISTRY.md en deze roadmap bijgewerkt.

## Bekende technische aandachtspunten
- `main.tsx` bevat voorbeeld-events en slaat events op onder `wandering-barback-events-v1`.
- `Inventory.tsx` bevat veel afzonderlijke prijs-batch-maps en complexe merge-logica.
- `inventoryPlanning.ts` probeert flesinhoud uit `brand` te lezen; dat is fragiel.
- `purchaseLines` kan geen betrouwbaar tekort berekenen als eenheid of flesinhoud onbekend is.
- `saveBatch` werkt rechtstreeks op localStorage; latere UI-/Firestore-synchronisatie vereist één repository.
- `eventImage.ts` maakt Base64 JPEG; let op documentlimieten en lokale opslagquota.
- `EventDetail.tsx` bevat recepten hardcoded in `RECIPES`; inventaris- en cocktailnamen zijn niet overal gelijk.
- De roadmap beschrijft beoogd werk; aangevinkte items zijn pas afgerond na verificatie.

## Uitgevoerde refactor — 8 november 2026
- Nieuwe centrale domeintypes: `src/types/event.ts` en `src/types/inventory.ts`.
- Centrale opslagkeys: `src/repositories/storageKeys.ts`; de drie bestaande `*-v1` keys blijven **ongewijzigd**.
- `src/repositories/eventRepository.ts` verzorgt laden en opslaan van actieve en verwijderde evenementen. `main.tsx` gebruikt deze functies.
- `src/repositories/inventoryRepository.ts` biedt getypeerde lees-/schrijffuncties; `Inventory.tsx` gebruikt nog zijn bestaande seed-, merge- en schrijfgedrag om bestaande gegevens niet te verstoren.
- `EventDetail.tsx`, `Inventory.tsx` en `inventoryPlanning.ts` gebruiken de centrale types. Oude type-exports blijven compatibel.
- **Geen migratie of verwijdering van bestaande lokale gegevens uitgevoerd.** De daadwerkelijke browsergegevens zijn niet vanaf GitHub inzichtelijk.
- Nog te verifiëren: GitHub Actions build, browser-test met bestaande lokale data, en restore na herladen.

## Dienstspecifieke menukaart — 8 november 2026
- [x] Catalogus verplaatst naar `src/data/menuCatalog.ts` met `MenuKind`, `MenuEntry`, `MENU_CATALOG`, `serviceMenuKinds` en `getMenuEntry`.
- [x] Cocktail workshop/catering/mobiele cocktailbar: cocktails en mocktails (maximaal drie).
- [x] Wijnbar: wijnkaart; Speciaalbierbar: bierkaart; G&T bar: gin-toniccombinaties. Andere diensten tonen de volledige catalogus.
- [x] Bestaande `event.menu` (string[]) en `event.quantities` (naam → aantal) behouden: geen opslagmigratie.
- [x] Bij dienstwissel blijven bestaande geselecteerde items zichtbaar onder 'Eerder geselecteerde items' en zijn ze handmatig te verwijderen.
- [x] Inkoop gebruikt ingrediënten en eenheden uit dezelfde catalogus; onbekende inventarisartikelen krijgen geen verzonnen voorraad.
- [ ] Build en handmatige tests met dienstwissel, bestaande events en alle vier de menutypes.
- [ ] Catalogus uitbreiden met echte product-ID's, merken, volumes en beheerscherm; huidige wijn-/bier-/G&T-items zijn startvoorbeelden.

## G&T bar — drie signatures (8 november 2026)
- [x] G&T-catalogus teruggebracht tot drie vaste signatures met elk een eigen gin: Pink Pepper & Grapefruit (London Dry), Cucumber Mint (Hendrick's), Mediterranean Sunset (Mediterranean Gin).
- [x] Ingrediënten en serveerhoeveelheden per G&T zijn opgenomen in `src/data/menuCatalog.ts` en tellen mee in de bestaande inkoopberekening.
- [ ] Koppel de specifieke ginmerken en garneringen aan concrete inventarisartikelen en controleer leveranciers/verpakkingseenheden.
- [ ] Test build en bestaande G&T-events; oude selecties blijven als eerder geselecteerde items zichtbaar.

## Speciaalbierbar — BLADE en flesbier (8 november 2026)
- [x] Drie 8-liter BLADE-fustopties toegevoegd: Affligem Blond, Lagunitas IPA en Birra Moretti.
- [x] Materiaalopties: Heineken BLADE biertap en luxe grote ijsbak voor bierflesjes.
- [x] Flesbier-catalogusopties: blond, IPA en tripel; merk en inhoud nog te kiezen.
- [x] Bestaande inventarisrecords behouden: nieuwe catalogusregels worden op naam/categorie aangevuld, niet overschreven. Nieuwe voorraad is `null` (nog niet geteld).
- [ ] BLADE-fustbeschikbaarheid en prijzen per leverancier bevestigen, vooral Lagunitas.
- [ ] Biertap- en flesbierplanning koppelen aan evenementen, aantallen en paklijst.
- [ ] Productiebuild en browserdata-test uitvoeren.

## Speciaalbierbar eventplanning — 8 november 2026
- [x] Drie afzonderlijk configureerbare BLADE-taps met fustselectie en verwacht aantal 25cl-glazen.
- [x] Flesbier op ijs met aantallen per bier, instelbare bakcapaciteit en kg ijs per bak.
- [x] `src/planning/beerBar.ts` berekent 8L-fusten, ijsbakken, flesjes en ijs voor de paklijst.
- [x] Inkoop verwerkt fusten, flesjes en ijs met bestaande inventarismatch; onbekende voorraad blijft onbekend.
- [x] Optioneel `event.beerBarPlan` bewaart de configuratie in de bestaande eventrecords; geen destructieve migratie.
- [ ] Productiebuild en end-to-end browsertest; koppeling aan echte productverpakkingen en eventueel tapverlies.

## Flesbiercatalogus (8 november 2026)
- [x] 16 zomerse en klassieke flesbieren plus 12 craftbieropties van Moersleutel, Uiltje, 't IJ, Jopen, Two Chefs, Frontaal, Kees, De Molen en Noordt toegevoegd aan Inventaris > Dranken > Bier.
- [x] Bestaande records en aantallen behouden; nieuwe records starten met onbekende voorraad.
- [ ] Flesinhoud, alcoholpercentage, actuele leverbaarheid en prijzen per variant verifiëren.
- [ ] Flesbierkeuze in de evenementplanner uitbreiden van drie generieke soorten naar het volledige inventarisassortiment.

- [x] Bij dienst Speciaalbierbar toont EventDetail alle 28 merkgebonden flesbieropties, naast eventuele bestaande selecties. Andere diensten tonen deze specifieke bierbarsectie niet. Valt terug op vaste catalogus indien inventarisopslag nog niet is geïnitialiseerd.

## Dienstspecifieke menukaarten (9 november 2026)
- [x] Cocktail workshop/catering/mobiele cocktailbar: cocktails en mocktails, maximum 3.
- [x] Wijnbar: alleen wijn en prosecco; G&T bar: alleen drie G&T signatures.
- [x] Speciaalbierbar: uitsluitend BLADE-tapbier en 28+ inventarisgebonden flesbierkeuzes; geen dubbele generieke bierkaart.
- [x] Dienst wijzigen via selectielijst in eventdetails. Niet-passende oude selecties blijven opgeslagen maar tellen niet mee in actuele inkoop.
- [ ] Productiebuild en interactietests voor wisselen van dienst en berekeningen.

## Catalogus (9 november 2026)
- [x] Meer → Catalogus: aparte pagina voor cocktails, mocktails, wijnen, gin-tonics en read-only bieroverzicht.
- [x] Recepten toevoegen, bewerken en verwijderen met ingrediënten, hoeveelheden en eenheden; localStorage-persistent.
- [x] EventDetail leest de bewerkbare catalogus en koppelt ingrediënten aan de inkoop.
- [ ] Foto's, bereidingswijze en receptenmaterialen toevoegen.
- [ ] End-to-end productiebuild, mobiele UX en wijziging van bestaande receptnamen controleren.

## Actuele navigatie en code-audit — 9 november 2026
**Routevorm:** de huidige app gebruikt React-state en conditionele rendering, geen URL-router. De onderstaande paden zijn UI-navigatiepaden, geen afzonderlijke URL's.

| Navigatiepad | Eigenaar | Status |
|---|---|---|
| Home | `src/main.tsx` | Dashboard |
| Evenementen | `src/main.tsx` | Eventoverzicht, zoeken, filters, eventaanmaak |
| Evenementen → Evenementdetail → Overzicht/Menukaart/Inkoop/Paklijst/Planning | `src/EventDetail.tsx` | Modal met vijf tabbladen; dienstspecifieke menu's |
| Inventaris | `src/Inventory.tsx` | Producten, voorraad en prijzen |
| Voorbereiding | `src/main.tsx` | Placeholder, nog niet geïmplementeerd |
| Meer → Catalogus | `src/main.tsx`, `src/Catalog.tsx`, `src/Catalog.css` | Recepten en wijn/G&T beheren, bieroverzicht |
| Meer → Verwijderde evenementen | `src/main.tsx` | Herstellen van soft-deleted events |

### Actuele opslag en afhankelijkheden
- `src/data/menuCatalog.ts`: `COCKTAIL_RECIPES`, `MENU_CATALOG`, `serviceMenuKinds`, `getMenuEntry`, `readMenuCatalog`, `writeMenuCatalog`, `CATALOG_STORAGE_KEY`.
- `src/Catalog.tsx`: beheert recepten via `readMenuCatalog`/`writeMenuCatalog`; wijzigingen gaan via browser-event `wandering-catalog-updated`.
- `src/EventDetail.tsx`: filtert de bewerkbare catalogus per dienst en gebruikt de recepten voor inkoop; de speciaalbierbar gebruikt `src/planning/beerBar.ts`.
- `src/Inventory.tsx`: beheert producten; bierassortiment wordt met `beerBarStarter` en `bottledBeerCatalog` aangevuld.
- `src/repositories/storageKeys.ts`: centrale keys voor events, verwijderde events en inventaris. **Cataloguskey is nog in `menuCatalog.ts` gedefinieerd**, dus centralisatie is nog open.
- Alle vier persistente hoofdcollecties staan momenteel in localStorage: events, verwijderde events, inventaris en catalogus.

### Documentatiecorrecties en resterende verificatie
- De eerdere roadmapregel dat `EventDetail.tsx` `RECIPES` hardcoded bevat is **achterhaald**; recepten worden via `getMenuEntry` uit `menuCatalog.ts` gelezen.
- De eerdere open taak om bierbarplanning aan evenementen te koppelen is **achterhaald**; `EventData.beerBarPlan` en `beerBarPacking` zijn geïmplementeerd.
- De eerdere open taak om 28 flesbierkeuzes in evenementen te tonen is **achterhaald**; deze zijn beschikbaar bij Speciaalbierbar.
- [ ] Verwijder of herschrijf verouderde historische regels in de oorspronkelijke hoofdstukken, zonder auditgeschiedenis te verliezen.
- [ ] Centraliseer `CATALOG_STORAGE_KEY` in `storageKeys.ts`.
- [ ] Controleer alle imports/exports en types via `npm run build`; de audit is een broncode-/documentatiecontrole, geen geslaagde build.
- [ ] Test navigatie, opslag, bewerken/hernoemen van recepten, dienstwissel en bestaande browserdata.

## Verplicht onderhoudsprotocol — vanaf 9 november 2026
Dit document en `docs/VARIABLE_REGISTRY.md` zijn de actuele referentie bij iedere wijziging.
1. **Vooraf:** zoek bestaande routes, componenten, types, functies en opslagkeys; hergebruik waar mogelijk. Controleer op naam- en functieduplicaten.
2. **Implementatie:** houd één eigenaar per domeinmodel, berekening en persistente key aan. Vermijd tweede bronnen van waarheid en destructieve opslagwijzigingen.
3. **In dezelfde wijzigingsronde:** werk de roadmap bij voor architectuur, UI-navigatie, status en open taken; werk het variabelenregister bij voor gedeelde symbolen, afhankelijkheden en opslag.
4. **Correctie:** verouderde actuele uitspraken verwijderen of duidelijk als historisch markeren; documentatie mag geen tegenstrijdige actuele definities bevatten.
5. **Verificatie:** voer beschikbare typecheck, build en gerichte regressietests uit; noteer expliciet wat niet getest is. Claim geen geslaagde build zonder bewijs.
6. **Afronding:** noem gewijzigde modules, documentatiestatus, compatibiliteit en resterende risico's in het wijzigingsoverzicht.

**Reikwijdte:** deze afspraak geldt voor alle toekomstige wijzigingen in Wandering BarBack, niet alleen de catalogus. Een documentatie-update alleen vervangt geen automatische CI-controle.

## Meer — schermvullende detailpagina's (9 november 2026)
- [x] Meer → Catalogus en Meer → Verwijderde evenementen openen in een afzonderlijke viewport-vullende overlay, analoog aan de evenementdetailweergave.
- [x] Gedeelde terug-/sluitbalk, eigen scrollcontainer, iOS safe-area en desktopbegrenzing.
- [x] Bestaande catalogus- en herstelgegevensstromen behouden; geen opslagmigratie.
- [ ] Mobiele browser-/buildtest uitvoeren en terugnavigatie bij systeem-back/escape controleren.

## Automatisch ontworpen evenementmenukaarten — 9 november 2026
- [x] Evenement → Menukaart toont live een ontworpen kaart op basis van geselecteerde dranknamen en maximaal vier receptingrediënten.
- [x] Ondersteunt cocktail-, mocktail-, wijn-, G&T- en speciaalbierbarselecties, inclusief BLADE-taps en geselecteerd flesbier.
- [x] Drie lokale presentatievarianten: Signature, Minimal en Elegant; A4-printstylesheet en browserprint/PDF-knop.
- [x] Gebruikt bestaande `event.menu`, `event.beerBarPlan` en `readMenuCatalog`; geen dubbele receptopslag of nieuwe localStorage-key.
- [ ] Printvoorbeeld, paginering bij veel drankopties en mobiele rendering controleren; productiebuild niet geverifieerd.
- [ ] Optioneel later: huisstijllogo, afbeeldingen, afzonderlijke PDF-download en opgeslagen designvoorkeur per evenement.

## Herbruikbare menukaarttemplates en gouden fotolijst (9 november 2026)
- [x] Canonieke stijldefinities in `src/data/menuTemplates.ts`: Signature (#F2E5D1/#4B2C1D), Minimal (#FFFDF8/#2E2A25), Elegant (#2E251F/#E8C99A).
- [x] Keuze tussen een eenvoudige afwerking en sierlijke dubbele rand met ornamenten, geschikt als ontwerp voor presentatie in een gouden fotolijst.
- [x] Printmarges en sierlijsten worden in `src/EventDetail.css` geregeld; bestaande receptdata blijven ongewijzigd.
- [ ] Exacte lijstmaat, fysieke afdrukproef en eventuele definitieve illustraties/ornamenten later bepalen.
- [ ] Build en browserprint nog niet geverifieerd.

## A4- en A5-fotolijstformaten (9 november 2026)
- [x] Canonieke printformaten A4 (210 × 297 mm) en A5 (148 × 210 mm) in `src/data/menuTemplates.ts`.
- [x] Formaatselector toegevoegd aan Event → Menukaart, met A5-preview, printpagina's en aangepaste ornament-/tekstmarges.
- [ ] Browserprint op iOS/desktop en fysieke afdruk in gouden lijsten testen; printdialoog kan paginaformaat afhankelijk van browser/printer overschrijven.

## Dashboard synchroniseren met evenementen — 9 november 2026
- [x] Hardcoded dashboard-evenement vervangen door selectie uit dezelfde persistente `events`-state als de evenementenpagina.
- [x] Kies het eerstvolgende niet-afgeronde evenement met geldige toekomstige datum; als geen gedateerd toekomstig evenement bestaat, toon een ongedateerd evenement of een lege toestand.
- [x] Dashboard toont actuele titel, afbeelding, datum, locatie, gasten, status en voortgang; kaart opent het echte eventdetail.
- [x] Voorbeeldtaken vervangen door maximaal vijf open draaiboek-/paklijsttaken van het geselecteerde evenement; afvinken schrijft terug naar het event.
- [ ] Browsercontrole, build en tests van datuminterpretatie nog uitvoeren; oudere Nederlandstalige datums zonder jaartal blijven een migratierisico.

## Eenduidige evenementdatums — 9 november 2026
- [x] Nieuwe events bewaren `date` als ISO-kalenderdatum `YYYY-MM-DD`, inclusief jaar.
- [x] Canonieke `src/eventDates.ts` verzorgt ISO-validatie, Nederlandse weergave en chronologische selectie van het eerstvolgende event.
- [x] Evenementenlijst, dashboard en detailweergave gebruiken gedeelde formattering; detailbewerking gebruikt `input type=date`.
- [x] Oude tekstuele datums worden bewaard en niet automatisch van een gegokt jaartal voorzien. Gebruiker kan ze in eventdetails expliciet bevestigen.
- [ ] Build/browsercheck en test van oude datumrecords uitvoeren; oude ongedateerde records kunnen nog als fallback op het dashboard verschijnen.

## Slimme eventtaken en eerste dienstconcept-koppelingen — 9 november 2026
- [x] `src/planning/eventTasks.ts` leidt taken af uit alle actieve, niet-verlopen evenementen: ontbrekende datum/locatie/adres/contact/starttijd, niet-gekozen dranken en onafgeronde draaiboek-/paklijstitems.
- [x] Urgentie gebruikt de ISO-evenementdatum en taaktype; dashboard toont top 5, Voorbereiding alle taken, inclusief eventnaam en doorklik.
- [x] Handmatige draaiboek-/paklijsttaken worden in de bestaande eventopslag afgevinkt; automatische ontbrekende-gegevensmeldingen openen het event en verdwijnen zodra gegevens worden ingevuld.
- [x] `src/planning/serviceConcepts.ts` hergebruikt `SERVICE_OPTIONS` en `serviceMenuKinds` als eerste conceptlaag voor cocktailworkshop/catering/mobiele bar, wijnbar, G&T en speciaalbierbar; geen dubbele receptcatalogus.
- [ ] Inkooptekorten nog niet meegenomen: voorraadhoeveelheden zijn vaak onbekend; vermijd onterechte inkoopclaims.
- [ ] Verdere dienstconcepten: centrale vereisten, service-specifieke paklijsten en draaiboeken, inkoop en voorraadreserveringen, capaciteit en echte taakdeadlines.
- [ ] Productiebuild, mobile UI en datamigratie-/regressietests nog uitvoeren.

## Deadline-gedreven taakprioriteit — 9 november 2026
- [x] Evenementdatum heeft altijd voorrang op taaksoort: vandaag/morgen = Kritiek; 2–3 dagen = Zeer hoog; 4–7 dagen = Hoog; 8–14 dagen = Gemiddeld; later = Laag.
- [x] Binnen dezelfde urgentieklasse wordt op resterende dagen gesorteerd; pas daarna op taaksoort en evenementnaam.
- [x] Dashboard en Voorbereiding tonen een urgentielabel en dagen tot het evenement.
- [x] Datumloze evenementen blijven zichtbaar als 'Datum ontbreekt' met correctietaak, maar kunnen een gedateerd evenement deze week niet verdringen.
- [ ] Build en browser-/regressietests nog niet geverifieerd.

## Eventtaken met individuele deadlines — 9 november 2026
- [x] `EventData.tasks?: EventActionTask[]` toegevoegd: titel, optionele ISO-deadline, afgerondstatus, id; oudere opgeslagen evenementen blijven compatibel.
- [x] In evenement → Overzicht een apart onderdeel 'Acties & deadlines' om taken toe te voegen, te bewerken, af te vinken en te verwijderen.
- [x] `getEventTasks` voegt individuele eventacties toe aan het dashboard en Voorbereiding; eigen deadline bepaalt de urgentie en kan de evenementdatum overrulen. Verlopen deadlines krijgen Kritiek.
- [x] Direct afvinken op dashboard werkt ook voor `action`-taken en schrijft naar bestaande eventopslag.
- [ ] Verlopen actieve evenementen worden nu nog uitgesloten uit het algemene taakoverzicht; latere afhandeling van oude onvoltooide acties onderzoeken.
- [ ] Build en mobiele regressietests nog uitvoeren.

## Cocktailworkshop arrangement- en prijstool — 10 november 2026
- [x] `src/planning/workshopPricing.ts`: canonieke pakketten Classics (€35 p.p.; Woo Woo/Daiquiri/Mojito) en Times (€45 p.p.; Bee's Knees/Lychacha/Zombie), 3 cocktails p.p., circa 2 uur, minimaal 10 deelnemers, reiskosten apart.
- [x] `EventData.workshopPricing` optioneel en per event persistent; oudere evenementen krijgen zonder migratie standaard Classics €35.
- [x] Event → Overzicht toont voor cocktailworkshops pakketkeuze, deelnemerschuiver (10–60+), bewerkbare prijs per persoon, live omzet, aantal cocktails en personeelsindicatie.
- [x] Deelnemerschuiver past canoniek `event.guests` aan, zodat overige evenementcalculaties dezelfde aantallen gebruiken.
- [x] Tot 20 deelnemers één begeleider; 21–29 een suggestie, vanaf 30 advies voor twee. Geen automatische personeelskosten.
- [ ] De pakketcocktails zijn nog niet automatisch gekoppeld aan de menukaart/receptcalculatie: voorkom overschrijven van bestaande menu's voordat de recepten zijn gevalideerd.
- [ ] Btw, kilometervergoeding, offerte-export, build en mobiele regressietests nog verifiëren.

## Automatische cocktailworkshopoffertes — 10 november 2026
- [x] Canonieke offerteberekening in `src/planning/workshopQuotes.ts`: arrangement, aantal deelnemers, aangepaste prijs, losse reiskosten, geldigheidsdatum en totaal.
- [x] `EventData.workshopQuotes?: WorkshopQuote[]`: gegenereerde offertes als onveranderlijke momentopnames bij het evenement opgeslagen; oude records compatibel.
- [x] Event → Overzicht → Offerte aanmaken: opdrachtgever, reiskosten, geldigheid, opmerkingen, offertegeschiedenis, afdrukvoorbeeld en browserfunctie 'Opslaan als PDF'.
- [x] A4-printstylesheet met offertegegevens, regels, totaal en waarschuwing voor ontbrekende btw-/bedrijfsgegevens.
- [ ] Voor definitieve klantoffertes nog bedrijfsnaam-/adres-/KvK-/btw-gegevens, btw-tarief en algemene voorwaarden bevestigen; offerte is nu expliciet een concept.
- [ ] Browserprint en productiebuild nog niet geverifieerd; geen directe PDF-library/export of e-mailverzending.

## Cocktail Catering calculator — 10 november 2026
- [x] `src/planning/cateringPricing.ts` is canonieke bron voor staffel: 25–49 €6,50/€7,50; 50–99 €6/€7; 100–149 €5,50/€6,50; 150–199 €5/€6; 200+ €4,50/€5,50 (Classic/Signature).
- [x] Mobiele bar met 1 bartender: minimaal 3 uur €175, daarna €45/uur; optionele tweede bartender €45/uur met apart urenveld; reiskosten buiten calculatie.
- [x] `EventData.cateringPlan?` voor optionele persistente eventconfiguratie en backwards compatibility.
- [x] Event → Overzicht → Cocktail Catering: aantallen, signature-aandeel, duur, tweede bartender, staffeloverzicht en live totaal; enkel zichtbaar voor dienst 'Cocktail catering'.
- [ ] Cocktails per recept/menukaart en automatische inkoop zijn nog niet verbonden aan de prijsverdeling; percentage is voorlopig een begrotingsinstrument.
- [ ] Btw, reiskosten, offerte-export en productiebuild/mobiele regressietests nog te valideren.
- [ ] Volumestaffel past één tarief op alle cocktails toe; omzet kan dalen op staffelgrenzen. Later zakelijke keuze voor progressieve staffel of minimumbedrag.

- [x] Extra cocktailafname: `cateringPlan.extraCocktails` optioneel; alle extra cocktails worden tegen het Classic-tarief van de vooraf geboekte staffel verrekend, zonder herstaffeling. Eventcalculator toont aparte nacalculatieregel en verhoogd totaal. Geen factuurautomatisering.

## Dynamische cateringstaffel en documenten — 10 november 2026
- [x] Vier instelbare endpoints per evenement: Classic standaard €6,50 → €4,50 en Signature €7,50 → €5,50. Vaste grenzen 25–49, 50–99, 100–149, 150–199, 200+; lineaire interpolatie per staffelniveau met afronding op centen.
- [x] `src/planning/cateringDocuments.ts`: offerte-snapshot van alle vier endpoints, vijf berekende staffels, geselecteerde staffel, afgesproken meerwerktarief, klant, reiskosten en prijsregels.
- [x] Offertepreview markeert geboekte staffel en vermeldt de Classic-meerwerkregel tenzij afwijkend tarief vastgelegd; opslag per evenement in `cateringQuotes`.
- [x] Factuur vanuit opgeslagen offerte met alleen posten en totalen, inclusief eventueel extra cocktails; opslag per evenement in `cateringInvoices`.
- [ ] Documenten zijn concepten: KvK-, btw-, adres- en betaalgegevens, btw-berekening, nummerreeks en juridische factuurcontrole moeten nog worden ingericht. Geen verzendintegratie.
- [ ] Productiebuild en PDF-printcontrole nog niet uitgevoerd.
