# Wandering BarBack — Code Roadmap

Status: 2026-11-06 · branch: main · documentatie van de bestaande code (geen afgeronde refactor).

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
- [ ] `src/types/event.ts`: Event, MenuSelection, ScheduleItem, PackingItem, StaffMember.
- [ ] `src/types/inventory.ts`: InventoryItem, InventoryUnit, Supplier, PriceQuote, Recipe.
- [ ] `src/data/cocktails.ts`: cocktailrecepten en stabiele ingredient-ID's.
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
- [ ] `src/repositories/` met interface voor events, items, recepten, bewegingen.
- [ ] Huidige localStorage-implementatie achter die interface plaatsen.
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
