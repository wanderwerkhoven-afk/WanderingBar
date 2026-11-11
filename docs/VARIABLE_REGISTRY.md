# Wandering BarBack — Variable Registry / technische koppelingen
**Gecontroleerd tegen broncode op main: 11 november 2026.** Dit is het leidende **waar-wijzigen-wat-raakt-wat** register. Alleen daadwerkelijk aangetroffen symbolen worden als bestaand beschreven. Zie [CODE_ROADMAP.md](CODE_ROADMAP.md) voor werkstatus en [../VALUES.md](../VALUES.md) voor opslagafspraken.

## 1. Snelle wijzigingswijzer
| Ik wil wijzigen… | Begin hier | Controleer ook / afhankelijkheid |
|---|---|---|
| Catalogusproduct, wijn, bier, cocktail of G&T | `src/Catalog.tsx` | `src/data/menuCatalog.ts` (model, opslag), `src/EventDetail.tsx` (evenementkeuze), `src/cloud/storageSync.ts` (Firestore-velden) |
| Productfoto / hover / fullscreen | `src/Catalog.tsx`, `src/Catalog.css` | `MenuEntry.image`, `imageUrl`, `sourceUrl`; `src/eventImage.ts` (uploadconversie) |
| Inventarisartikel / foto / voorraad | `src/Inventory.tsx`, `src/inventory.css` | `src/types/inventory.ts`, `src/repositories/inventoryRepository.ts`, `src/inventoryPlanning.ts`, `src/cloud/storageSync.ts` |
| Voorraad koppelen aan recept of inkoop | `src/inventoryPlanning.ts` | `src/EventDetail.tsx`, `src/data/menuCatalog.ts`, `src/Inventory.tsx` |
| Bierkeuze voor evenement / tap / fles | `src/EventDetail.tsx` | `src/planning/beerBar.ts`, `src/data/menuCatalog.ts`, `src/types/event.ts` |
| Wijnkaart, cocktailkaart of menukaartselectie | `src/EventDetail.tsx` | `src/data/menuCatalog.ts`, `src/data/menuTemplates.ts`, `src/EventDetail.css`, `src/documents/menuHtmlPrint.ts` |
| Menukaart afdrukken A4/A5 | `src/documents/menuHtmlPrint.ts` | `src/EventDetail.tsx`, `src/EventDetail.css`, `src/data/menuTemplates.ts` |
| Evenement aanmaken/bewerken/verwijderen | `src/main.tsx` | `src/types/event.ts`, `src/repositories/eventRepository.ts`, `src/EventDetail.tsx`, `src/cloud/storageSync.ts` |
| Evenementplanning, paklijst, taken | `src/EventDetail.tsx` | `src/planning/eventTasks.ts`, `src/planning/beerBar.ts`, `src/inventoryPlanning.ts`, `src/types/event.ts` |
| Workshopprijs / offerte / factuur | `src/planning/workshopPricing.ts` | `src/planning/workshopQuotes.ts`, `src/EventDetail.tsx`, `src/documents/quotePdf.ts`, `src/planning/vat.ts` |
| Cateringprijs / offerte / factuur | `src/planning/cateringPricing.ts` | `src/planning/cateringDocuments.ts`, `src/EventDetail.tsx`, `src/documents/quotePdf.ts`, `src/planning/vat.ts` |
| Overige financiële regels/documenten | `src/planning/customDocuments.ts` | `src/EventDetail.tsx`, `src/documents/quotePdf.ts`, `src/planning/vat.ts` |
| Login / conflicten / synchronisatie | `src/cloud/CloudGate.tsx` | `src/cloud/storageSync.ts`, `src/cloud/localRows.ts`, `src/firebase.ts`, `firestore.rules` |
| Navigatie / dashboard / routes | `src/main.tsx`, `src/style.css` | `src/SwipeEventCard.tsx`, `src/eventDates.ts`, `src/planning/eventTasks.ts` |
| Deploy / build | `package.json`, `vite.config.ts` | `.github/workflows/deploy.yml`, `.github/workflows/event-detail-build.yml` |

## 2. Werkelijke gegevensstroom
```text
Google login → CloudGate → prepareSync → conflictkeuze/initialisatie → App
Catalogus UI → writeMenuCatalog → localStorage catalog → storageSync poll (1200 ms) → Firestore users/{uid}/catalog/{recordId}
Inventaris UI → localStorage inventory → storageSync poll → Firestore users/{uid}/inventory/{recordId}
Evenement UI → eventRepository → localStorage events/deletedEvents → storageSync poll → Firestore
Firestore onSnapshot → externe wijziging gesignaleerd → melding/verversen; GEEN directe live binding per formulier
EventDetail → readMenuCatalog + inventoryItems → menukaart / inkoop / paklijst / documentmodules
```
**Belangrijk:** Firestore is momenteel niet de directe primaire leesbron voor de React-schermen. De app gebruikt lokale JSON met synchronisatie. Geen bewijs vanuit GitHub dat alle records in de echte cloud staan.

## 3. Canonieke modellen en sleutels
| Symbool / veld | Definitie | Gebruikt door / gevolg |
|---|---|---|
| `MenuKind`, `MenuEntry` | `src/data/menuCatalog.ts` | Catalog, EventDetail, storageSync; types: Cocktail, Mocktail, Wijn, Speciaalbier, G&T |
| `MenuEntry.name` | `src/data/menuCatalog.ts` | Huidige catalogus-Firestore-document-ID via `encodeURIComponent(name)`; hernoemen kan dus documentidentiteit veranderen |
| `MenuEntry.ingredients` | `src/data/menuCatalog.ts` | Recepten, menukaart, berekening benodigdheden |
| `tasteProfile`, `alcoholPercentage`, `wineCategory`, `grapes`, `country`, `region` | `src/data/menuCatalog.ts` | Productweergave, filters, wijn-/bierkaart |
| `sourceUrl`, `imageUrl`, `image` | `src/data/menuCatalog.ts` | Productpagina, directe afbeeldingslink, geüploade base64-foto; upload heeft voorrang |
| `SERVICE_OPTIONS`, `serviceMenuKinds()` | `src/data/menuCatalog.ts` | Diensten en toegestane cataloguscategorieën |
| `Item`, `Category` | `src/types/inventory.ts` | Inventaris; `quantity:null` betekent niet geteld, niet nul |
| `Item.webLink`, `imageUrl`, `image` | `src/types/inventory.ts` | Inventarisproductpagina en productfoto's |
| `EventData`, `DeletedEvent`, `PackingItem`, `ScheduleItem`, `EventActionTask` | `src/types/event.ts` | Evenementdetail, planning, documenten en opslag |
| `BeerBarPlan` | `src/planning/beerBar.ts` | `taps: {beer,glasses}[]`, `bottles: Record<string,number>`, `bottlesPerTub`, `iceKgPerTub` |
| `EVENT_STORAGE_KEY` | `src/repositories/storageKeys.ts` | `wandering-barback-events-v1` |
| `DELETED_EVENTS_STORAGE_KEY` | `src/repositories/storageKeys.ts` | `wandering-barback-deleted-events-v1` |
| `INVENTORY_STORAGE_KEY` | `src/repositories/storageKeys.ts` | `wandering-barback-inventory-v1` |
| `CATALOG_STORAGE_KEY` | `src/data/menuCatalog.ts` | `wandering-barback-catalog-v1` |

## 4. Schermen en concrete symbolen
| Symbool | Bestand | Wat wordt geraakt |
|---|---|---|
| `paths`, `getRoute()`, `go()`, `App` | `src/main.tsx` | Hashroutes: dashboard, evenementen, inventaris, voorbereiding, meer, catalogus, verwijderde evenementen, evenementdetail |
| `sampleEvents`, `readEvents()` | `src/main.tsx` | **Nog aanwezige hardcoded demo-evenementen** als lokale sleutel ontbreekt; geen catalogusproducten |
| `Catalog`, `persist()`, `save()`, `remove()` | `src/Catalog.tsx` | Product-CRUD naar lokale catalogus; update-event `wandering-catalog-updated` |
| `CatalogProductImage`, `gallImage`, `hoverRect`, `previewOpen` | `src/Catalog.tsx` | Afbeelding, Gall & Gall-metadatafallback, hover en fullscreen |
| `.catalog-hover-preview img` | `src/Catalog.css` | Hoverfles: `translateY(-20px) scale(.97)` (stand 11-11-2026) |
| `Inventory`, `load()`, `starter`, `seed`, `beverageStarter`, `extraStarter`, `homemadeStarter` | `src/Inventory.tsx` | **Nog hardcoded inventarisstartdata**, uitbreidingen en recepten; niet gelijk aan catalogusproducten |
| `verifiedPrices`, `applyVerifiedPrices()`, `addBeerBarOptions()` | `src/Inventory.tsx` | In code aanwezige prijs-/bier-inventarisdefaults en migratiegedrag; wijziging kan bestaande lokale inventaris beïnvloeden |
| `readStoredInventory()`, `writeStoredInventory()` | `src/repositories/inventoryRepository.ts` | Inventarisopslaghulpen; `Inventory.tsx` gebruikt ook eigen `load()` en lokale writes |
| `inventoryItems()`, `matchItem()`, `purchaseLines()`, `batchRecipes()`, `saveBatch()` | `src/inventoryPlanning.ts` | Voorraad, naamkoppeling, inkoop, batchverbruik |
| `EventDetail`, `catalogEntries`, `availableMenu`, `activeMenu` | `src/EventDetail.tsx` | Productselectie op evenement vanuit opgeslagen catalogus |
| `bottledBeerOptions`, `beerDescription()`, `beerAlcoholLabel()` | `src/EventDetail.tsx` | Bierkeuzes uit catalogus + reeds geselecteerde flessen; omschrijving/ABV uit catalogus |
| `DEFAULT_PACK`, `DEFAULT_SCHEDULE` | `src/EventDetail.tsx` | **Hardcoded startpaklijst en startdraaiboek**; niet productcatalogus |
| `defaultBeerBarPlan()`, `normalizeBeerBarPlan()`, `beerBarRequirements()`, `beerBarPacking()` | `src/planning/beerBar.ts` | Geen vaste biermerken als tapdefaults; vaste BLADE-materiaalnaam en paklijstbenodigdheden bestaan nog |
| `MENU_TEMPLATES`, `MENU_PRINT_SIZES` | `src/data/menuTemplates.ts` | Vaste **ontwerppresets**, geen producten |
| `printMenuHtml()` | `src/documents/menuHtmlPrint.ts` | HTML-menukaartprint A4/A5 |
| `downloadQuotePdf()` | `src/documents/quotePdf.ts` | PDF-output voor offertes/documenten |
| `getEventTasks()` | `src/planning/eventTasks.ts` | Dashboard en voorbereiding |
| `parseEventDate()`, `formatEventDate()`, `nextUpcomingEvent()` | `src/eventDates.ts` | Datumweergave en eerstvolgende evenement |

## 5. Firebase: exacte verantwoordelijkheden
| Symbool | Bestand | Gedrag |
|---|---|---|
| `auth`, `db` | `src/firebase.ts` | Firebase-project `barback-20df5`; Google Auth en Firestore |
| `CloudGate`, `phase`, `syncStatus` | `src/cloud/CloudGate.tsx` | Login, conflictkeuze, status, foutmelding en toegang tot App |
| `DATASETS`, `KEYS` | `src/cloud/storageSync.ts` | Vier collecties: events, deletedEvents, inventory, catalog |
| `prepareSync()`, `PreparedSync.activate()` | `src/cloud/storageSync.ts` | Download cloud, vergelijk lokale data, back-up, cloud/merge keuze |
| `startLiveSync()`, `writeDataset()` | `src/cloud/storageSync.ts` | `onSnapshot`-detectie, 1200ms lokale poll, Firestore batch writes |
| `structuredRecord()` | `src/cloud/storageSync.ts` | v2-zoekvelden naast `value` JSON en `position`; niet alle bestaande documenten zijn gebackfilld |
| `rowsFromLocal()`, `recordId()` | `src/cloud/localRows.ts` | Dataset-ID's: catalogus op naam, events op id, deletedEvents op event.id, inventory op id; inventarisduplicaten krijgen lokale suffix |
| `OWNER_KEY`, `SYNC_PREFIX`, `INVENTORY_MIGRATION_KEY` | `src/cloud/storageSync.ts` | Browseraccount, fingerprint, migratiemarkering |
| `firestore.rules` | repositoryroot | Beveiligingsregels; publicatie in echte Firebase Console afzonderlijk verifiëren |

## 6. Impactcontrole bij wijzigingen
1. Wijzig het **model** in `src/data/menuCatalog.ts`, `src/types/inventory.ts` of `src/types/event.ts` wanneer velden veranderen.
2. Wijzig de **editor/kaart** in `Catalog.tsx`, `Inventory.tsx` of `EventDetail.tsx`.
3. Controleer **afnemers**: `EventDetail.tsx`, `inventoryPlanning.ts`, bierbar-/documentmodules en `main.tsx`.
4. Controleer **opslag en synchronisatie**: lokale sleutel, `localRows.ts` ID-regels, `storageSync.ts` v2-velden en conflictscenario.
5. Controleer **bestaande gegevens** op tweede apparaat, oudere evenementen, verwijderde items en inventarisduplicaten.
6. Draai `npm test` en `npm run build`; controleer GitHub Actions én de live app. Werk daarna dit register, roadmap en VALUES bij.

**Geen automatische Firestore-only migratie en geen gegarandeerde referentiële integriteit:** evenementmenu's bewaren productnamen, niet stabiele product-ID's. Hernoemen/verwijderen van catalogusproducten kan daardoor bestaande menuverwijzingen raken.

## Wijzigingscontrole
- 2026-11-11 — Repositorybrede documentatieplicht toegevoegd in `AGENTS.md`; automatische bestandscontrole in `.github/workflows/documentation-contract.yml`. De check vereist bij code-/configuratiewijzigingen updates aan dit register, `CODE_ROADMAP.md` en `VALUES.md`. Geen wijziging aan runtime-variabelen of datarelaties.

## Firestore v3 — nieuwe codekoppelingen (nog niet live)
- `src/cloud/firestoreV3.ts`: `WORKSPACE_COLLECTION='WanderingBar'`, `WORKSPACE_DOCUMENT='main'`, `WORKSPACE_ROOT`; `CATALOG_CATEGORIES`, `INVENTORY_CATEGORIES`, `v3Paths.workspace/catalogProduct/inventoryItem/event/eventItem/deletedEvent/customer/setting`; `newRecordId(prefix)` genereert naam-onafhankelijke UUID's. **Geen runtime-consumenten**: de bestaande synchronisatie blijft legacy.
- Huidige live eigenaar blijft `src/cloud/storageSync.ts` → `collectionRef(uid,dataset)` onder `users/{uid}`; Firestore-regels blijven onveranderd.
- Voor de geplande omschakeling moeten `src/cloud/localRows.ts` (catalogus-ID op naam), `src/data/menuCatalog.ts`, `src/types/event.ts`, `src/EventDetail.tsx`, `src/Inventory.tsx`, `src/Catalog.tsx`, repositories en alle planning-/documentafnemers samen gecontroleerd worden.
- Volledige migratie- en veiligheidsvoorwaarden: `docs/FIRESTORE_V3_MIGRATION.md`.

## V3-migratiewizard (code toegevoegd; geen cloudomschakeling)
- `src/cloud/MigrationV3.tsx`: `readCloud()` leest legacy Firestore rechtstreeks; `inspect()` vergelijkt lokale IDs en valideert doelcategorieën; `download()` maakt gecombineerde JSON-back-up; `copy()` schrijft v3-documenten in batches en controleert elk document.
- `target()` koppelt legacy catalogustype aan Cocktail/Mocktail/Wijn/Bier en inventariscategorie aan Dranken/BarMaterialen/Garneringen/Verbruiksartikelen; onbekende categorieën blokkeren kopiëren.
- `CloudGate.tsx` toont de handmatige wizard voor een ingelogd account. `firestore.rules` bevat een bootstrap voor het legacy-workspace-account en eigenaar-gebonden v3-subcollecties; publicatie is nog nodig.
- **Niet uitgevoerd:** live Firestore-kopie, referentiemigratie in UI, v3-sync-activatie, opruimen.

- Correctie: v3-workspace leesrecht apart van update-recht gedefinieerd; leesoperaties vereisen geen `request.resource`.

- Buildfix v3: Firestore-documentpaden als slash-pad aan `doc()` doorgeven, geen `Array.at()` wegens huidige TS-target; `CloudGate` rendert migratie uitsluitend bij bestaande gebruiker.

## V3 runtime-omschakeling (2026-11-11)
- `storageSync.ts` controleert bij inloggen de v3-root, eigenaar, `verifiedRecords` en exacte legacy/v3-inhoud per dataset. Bij overeenstemming kiest de app v3; anders wordt de sessie geblokkeerd zonder gegevens te overschrijven. Bij ontbrekende v3-root blijft legacy actief.
- V3 leest catalogus- en inventariscategorieën uit de nieuwe subcollecties, en events/deletedEvents rechtstreeks; schrijft met stabiele paden en `legacyValue`/`legacyId` voor compatibiliteit. Hernoemen van evenement verandert de document-ID niet. De oude Firestore blijft bewaard.
- `CloudGate` gebruikt de gekozen modus voor live sync. Migratiewizard verschijnt alleen in legacy-modus.
- **Nog niet live geverifieerd:** werkelijke browserflows, Firestore-regels, build en synchronisatie op twee apparaten. Er is geen opruimactie uitgevoerd.

- TypeScript-compatibiliteit: dynamische Firestore-collectie-/documentpaden als volledige slash-string aan `collection()`/`doc()` doorgegeven.

- Toegangsherstel: `detectMode()` valt bij geweigerde v3-root-read uitsluitend terug op de bestaande, UID-beveiligde legacy-workspace na geslaagde legacy-meta-read. Geen v3-writes of dataverwijdering; v3-autorisatie moet apart worden hersteld.

## Migratie-bootstrap herstel
- De migratiewizard controleert `users/{uid}/meta/workspace` en maakt het ontbrekende document aan vóór de eerste v3-write. De eigenaar-afgeschermde v3-root kan vóór creatie een `permission-denied` teruggeven; de wizard probeert dan de door Security Rules beveiligde create. Een reeds geclaimde workspace van een ander account wordt door de regels geweigerd.
- Geen bestaande records verwijderd. Een geslaagde kopie moet nog in de echte Firebase Console worden bevestigd; na herladen controleert de app de v3-kopie en kiest dan de nieuwe sync.

- Migratievoortgang: `MigrationV3.tsx` houdt `progress` bij met `done`, `total` en `phase`; toont toegankelijke voortgangsbalk met percentage en aantal tijdens kopiëren en documentverificatie. Bij fout blijft de fase 'Migratie onderbroken' zichtbaar. De knop blijft tijdens verwerking uitgeschakeld.

## Firestore nested-array foutcorrectie
- `src/cloud/firestoreSafeData.ts` zet uitsluitend direct geneste arrays in gestructureerde Firestore-velden om naar een herkenbare JSON-marker `__wanderingBarNestedArrayJson`, omdat Firestore arrays-in-arrays weigert. De volledige oorspronkelijke JSON blijft **ongewijzigd** in `legacyValue`, waarmee de app synchroniseert en de migratie controleert.
- Zowel migratiebatch (`MigrationV3.tsx`) als toekomstige v3-sync (`storageSync.ts`) gebruiken dezelfde omzetting. Herhaald kopiëren is idempotent per vast documentpad; oude clouddata blijven behouden.

- Buildfix: ontbrekende expliciete `firestoreSafeData`-import in `MigrationV3.tsx` toegevoegd na TypeScript `Cannot find name`-fout in GitHub Actions. Geen wijziging aan opgeslagen gegevens.

## V3-only cutover (2026-11-11)
- `src/cloud/storageSync.ts` leest/schrijft **uitsluitend** `WanderingBar/main`-subcollecties; geen `users/{uid}`-queries, meta-writes, legacy-modus of legacy-vergelijking meer.
- `prepareSync()` controleert ownerUid, migratiestatus, verifiedRecords en minimaal het geverifieerde aantal v3-records; bij fout wordt lokale data niet vervangen.
- `CloudGate.tsx` toont geen migratiewizard meer. `firestore.rules` bevat alleen owner-gebonden v3-rechten; de oude user-paden worden niet langer toegestaan **na handmatige publicatie**.
- Bestaande lokale cache en originele JSON-envelope `legacyValue` blijven behouden voor compatibiliteit; dit zijn geen verbindingen naar de oude Firestore-collecties.
- Oude Firestore-documenten zijn **niet verwijderd** en blijven een herstelkopie; de code kan ze niet meer lezen. Rules moeten nog in Firebase Console worden gepubliceerd en live tests moeten worden uitgevoerd.

- TypeScript cleanup v3-only: ongebruikte `setDoc`-import uit storageSync verwijderd.

## Wijncatalogus — vlag herkomstland (2026-11-11)
- `Catalog.tsx`: `WineCountryFlag` leest bestaande `MenuEntry.country` en toont op wijnfoto's een ronde vlag rechtsboven. Ondersteunt gangbare Nederlandse/Engelse landnamen; ontbrekend of onbekend land toont geen vlag.
- `Catalog.css`: `catalog-wine-country-flag` overlay (40px desktop / 34px mobiel) met lichte rand en schaduw. Geen wijzigingen aan catalogusdata, Firestore of afbeeldingslinks.

## Wijnvlaggen via flag-icons (2026-11-11)
- NPM dependency `flag-icons@^7.3.2`; CSS uit `flag-icons/css/flag-icons.min.css` wordt lokaal door Vite gebundeld, zonder runtime API of netwerkverzoek voor vlaggen.
- `WineCountryFlag` in `src/Catalog.tsx` zet landnaam (`MenuEntry.country`) om naar ISO alpha-2-code en rendert `fi fi-{code}`. Ook tweelettterige ISO-codes worden ondersteund.
- `src/Catalog.css` toont het SVG-vlagbeeld binnen de ronde badge. Geen wijzigingen aan Firestore-records of productfoto's.

- Landmapping uitgebreid: `Noord-Macedonië`, spellingvarianten en `North Macedonia` verwijzen naar ISO-code `mk` (`fi fi-mk`); bestaande catalogusgegevens blijven intact.
