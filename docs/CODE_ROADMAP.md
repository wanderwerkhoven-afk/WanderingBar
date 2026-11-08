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
