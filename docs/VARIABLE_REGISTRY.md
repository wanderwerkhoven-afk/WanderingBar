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

## Tijdelijke bierimport (2026-11-12)
- `src/data/temporaryBeerSeed.ts`: 32 unieke biernamen uit gebruikerslijst, drie BLADE-vaten en 29 flesbieren. Dubbele vermeldingen van Birra Moretti BLADE en Lagunitas IPA BLADE zijn samengevoegd; fles en vat blijven afzonderlijke producten.
- `src/Catalog.tsx`: zichtbare handmatige knop onder tab Bieren; pas na inloggen en synchroniseren te gebruiken. Import dedupliceert op naam, voegt alleen ontbrekende items toe aan bestaande lokale catalogus en vraagt cloudsync aan. Geen automatische seed bij opstart.
- `tasteProfile` bevat tijdelijk uitsluitend de aangeleverde verpakkingstype-aanduiding; alcoholpercentage, afbeeldingen en overige ontbrekende productgegevens zijn niet verzonnen.
- Na verificatie van 32 producten in Firestore v3: importknop, seedbestand en tijdelijke styling verwijderen; behoud cloudgegevens.

## Geverifieerde bierproductlinks en beeldmetadata (2026-11-12)
- Vier exacte, publiek gevonden productpagina's toegevoegd aan tijdelijke bierseed: Affligem BLADE, Lagunitas BLADE, Birra Moretti BLADE (Beerwulf UK), BrewDog Punk IPA (HANOS). Overige 28 hebben nog geen geverifieerde directe productpagina; geen fictieve URLs.
- Bij handmatige import probeert `enrichBeerImages` voor deze geverifieerde pagina's de HTTPS productafbeelding via Microlink te achterhalen en als `imageUrl` op te slaan. Afbeelding kan ontbreken als externe metadata niet bereikbaar is. Andere bieren blijven zonder afbeelding totdat exacte bron is gecontroleerd.
- Geen import uitgevoerd; Firebase nog niet gewijzigd. Externe metadata is best-effort, geen garantie dat de foto de juiste verpakking toont.

## Bierimport bronlinks vervolgonderzoek (2026-11-12)
- 17 extra bieren hebben een specifiek gevonden bron-/verkooppagina gekregen; 21 van 32 seeditems hebben nu een sourceUrl. Productpagina's zijn niet allemaal flesvarianten: o.a. Funky Falcon (blik), Crank the Juice (blik), Bird of Prey (vergelijkingspagina); controleer verpakking voor gebruik.
- Microlink image metadata wordt bij import best-effort opgehaald voor alle toegestane bronhosts. Dit is geen geverifieerde directe afbeeldingslink; indien ontbrekend blijft imageUrl leeg. Geen Firestore-mutatie voor importknop wordt aangeklikt.

## Bierbronlinks afronding (2026-11-12)
- Negen extra gevonden product-/categoriepagina's toegevoegd (Affligem, Birra Moretti, Kees, Corona, Frontaal, Moersleutel Motor Oil, Sol, Tripel Karmeliet, Uiltje Wit). Totaal 30/32 items met bronlink.
- Uiltje Wit is alleen een witbiercategorie (huidig product heet Wizard Wit); Sol bij Jumbo is uit assortiment; Corona is een categoriepagina. Links niet gelijkstellen aan actuele bestelbaarheid.
- `Brouwerij Noordt Noordtsingle` en `Speciaalbier tripel flesjes` blijven zonder specifieke URL omdat geen exact identificeerbare, betrouwbare kooplink bevestigd is. Blik is toegestaan. Afbeeldingsmetadata wordt pas tijdens handmatige import geprobeerd; niet gegarandeerd.

## Firebase authoritative cloud (2026-11-12)
- Firestore v3 `WanderingBar/main` is de enige bron van waarheid. Bij inloggen wordt de serverinhoud gelezen; lokale gegevens worden nooit bij login naar Firestore geüpload of samengevoegd.
- `verifiedRecords` is uitsluitend migratie-auditmetadata en geen minimum voor huidige aantallen; verwijderingen blijven geldig.
- Afwijkende niet eerder gesynchroniseerde cache vereist eerst een back-up en expliciete keuze voor Firebase. De merge-optie is uitgeschakeld.
- Live cloud snapshots werken de lokale cache bij als er geen ongesynchroniseerde lokale wijziging is; gelijktijdige wijziging stopt synchronisatie met foutmelding, in plaats van stil te overschrijven. De eerdere permanente `conflict=true` bij normale remote updates is verwijderd.
- Lokale bewerkingen in een geopende sessie worden voorlopig via bestaande 1,2-seconde synchronisatie naar Firestore geschreven; offline wijzigingen zijn nog niet als transactionele queue geïmplementeerd. Deze aanpak is cloud-authoritative bij login, maar geen volledig server-first CRUD.

## Buildherstel 2026-11-12
- `src/Catalog.tsx`: extra JSX `}` in de tijdelijke bierimportknop verwijderd. Dit veroorzaakte TS1003/TS1382 en blokkeerde alle GitHub Pages-deployments sinds de importfunctie.
- De Firebase source-of-truth-fix was daardoor nog niet gepubliceerd. Nieuwe deploy controleren vóór gebruik.

## Bierimport metadataherstel (2026-11-12)
- Importknop vult nu bij reeds geïmporteerde bieren ontbrekende `sourceUrl` aan; bestaande gebruikerslinks en productdata blijven behouden. Ontbrekende bieren worden toegevoegd.
- `enrichBeerImages` probeert nu afbeeldingen op zowel nieuwe als bestaande bieritems met bronlink op te halen; `imageUrl` blijft leeg wanneer de externe metadata niet beschikbaar is. Geen claim van 32 geverifieerde afbeeldingen.
- Bierkaarten tonen product-/leverancierslink; biereditor heeft een bewerkbaar veld voor `sourceUrl` naast `imageUrl`.

## Biersoort en verpakking (2026-11-12)
- `MenuEntry.beerStyle?: string`: bierstijl (Blond, IPA, Witbier, Stout, enz.), zichtbaar als badge op bierkaart en als select in biereditor.
- `MenuEntry.beerPackaging?: 'Fles'|'Blik'|'Tap'`: fysieke verpakking; aparte select in editor en zichtbaar op bierkaart. BLADE 8L is Tap, expliciete blikproducten Blik, overige aangeleverde flesbierproducten Fles als initiële importwaarde.
- `temporaryBeerSeed` heeft 32 bierstijlen en verpakkingen; bestaande Firestore-catalogusitems worden via handmatige import uitsluitend voor ontbrekende velden aangevuld, bestaande handmatige waarden worden niet overschreven.
- `tasteProfile` blijft apart bestaan; oude seedwaarden Flesbier/BLADE 8 L blijven voor achterwaartse compatibiliteit zichtbaar totdat inhoudelijke smaakprofielen worden toegevoegd.

## Bierkaart tags (2026-11-12)
- `Catalog.tsx` toont `beerStyle` als primaire categorie-badge (zoals `wineCategory` bij wijn) en `beerPackaging` als tweede compacte tag in de bovenste kaartregel.
- Verpakking en bierstijl worden niet meer herhaald in de beschrijving; `tasteProfile` is uitsluitend voor echte smaaknotities, historische importwaarden `Flesbier`/`BLADE 8 L` worden in de kaart verborgen.
- `Catalog.css`: `.catalog-product-packaging` en flex-layout voor `.catalog-product-top`; geen wijziging aan Firestore-schema of opgeslagen bierrecords.

## Biercatalogus sortering (2026-11-12)
- `compareBeerEntries` sorteert alleen de weergave, niet de Firestore-records: Tap/BLADE/fust eerst alfabetisch; daarna fles en blik samen in stijlclusters Pils, Lager, Blond, Witbier, Weizen, Dunkelweizen, Pale Ale, IPA, Dubbel, Tripel, Saison, Bock, Porter, Stout, Fruitbier, Alcoholvrij IPA, Overig; onbekende stijlen achteraan. Binnen stijlen alfabetisch op naam.
- Wijnsortering blijft ongewijzigd totdat de gewenste wijnvolgorde is opgegeven.

## Bierclusterfilters (2026-11-12)
- `beerClusterFilter` is lokale UI-state, standaard `Alle bieren`. Filteropties: Tapbier, Licht en toegankelijk, Tarwebieren, Hoppige bieren, Belgische en kruidige stijlen, Donkere bieren, Fruitbier, Alcoholvrij IPA, Overig.
- `beerClusters` groepeert biersoorten volgens de bestaande vaste sortering; bij geselecteerd stijlcluster worden alleen fles- en blikbieren getoond, omdat Tapbier een afzonderlijke eerste groep is. `isTapBeer` ondersteunt expliciete Tap en oude BLADE/fust-naam.
- `shownBeers` filtert en sorteert zonder Firestore of localStorage te muteren; teller toont aantal zichtbare resultaten. Onbekende bierstijlen vallen onder Overig.

## Tijdelijke bierimport verwijderd (2026-11-12)
- `src/data/temporaryBeerSeed.ts` is uit de repository verwijderd, inclusief alle hardcoded bierrecords, leverancierslinks, automatische metadata-import en backfillfuncties.
- `src/Catalog.tsx`: tijdelijke importknop, importstatus en import-afhankelijke state en import verwijderd. De biercatalogus leest uitsluitend bestaande records uit de normale catalogus/Firebase-synchronisatie; bestaande biersoort/verpakking-tags, bewerken en bierclusterfilters blijven intact.
- `src/Catalog.css`: ongebruikte `.catalog-beer-import`-styling verwijderd.
- Er is geen Firestore-delete of migratie uitgevoerd: bestaande gesynchroniseerde bierrecords blijven bewaard. Eerdere documentatie over de tijdelijke import is historische context, niet langer actief.

## Cocktailcategorieën en filters (2026-11-12)
- `MenuEntry.cocktailCategory?: 'Signature'|'Classics'|'Show'` is optionele persistente categorisatie van cocktailrecords; geen automatische toekenning of seed.
- `cocktailFilter` is lokale UI-state, standaard Alle cocktails; opties Signature, Classics, Show en Niet ingedeeld voor oude records.
- Cocktailkaarten tonen de categorie als badge boven de afbeelding, of Cocktail als fallback; editor biedt een categorie-select. Filter wijzigt alleen weergave en schrijft niets naar Firestore.

## Mocktailcategorieën en filters (2026-11-12)
- `MenuEntry.mocktailCategory?: 'Signature'|'Classics'|'Show'` is optionele categorie voor mocktails, los van `cocktailCategory`; wordt via bestaande catalogusopslag en Firebase v3 gesynchroniseerd.
- `mocktailFilter` is lokale UI-state met Alle mocktails, Signature, Classics, Show en Niet ingedeeld; bestaande mocktails krijgen niet automatisch een categorie.
- Mocktailkaarten tonen de geselecteerde categorie als bovenste tag, of Mocktail als fallback. In de mocktaileditor is een categorie-select toegevoegd. Filter wijzigt alleen de weergave.

## Bier alcoholpercentage editor (2026-11-12)
- Biereditor heeft een invoerveld `Alcoholpercentage (%)` met numerieke validatie 0–100, stap 0,1 en lege waarde toegestaan.
- Gebruikt het bestaande `MenuEntry.alcoholPercentage?: number` (geen schemawijziging); opslag via `writeMenuCatalog` en bestaande Firestore v3 sync.
- Bierkaart toont reeds `alcoholPercentage` als percentage-tag. `EventDetail.tsx` leest dit bestaande veld al bij het genereren van de biermenukaart; ontbrekende waarden worden niet ingevuld of verzonnen.

## Alcoholvrij bierstijl (2026-11-12)
- De bierstijl en clusterfilter heten voortaan `Alcoholvrij` in plaats van `Alcoholvrij IPA`; editor biedt `Alcoholvrij` als keuze.
- `displayBeerStyle` toont oudere catalogusrecords met `beerStyle: 'Alcoholvrij IPA'` eveneens als Alcoholvrij. `beerCluster` accepteert beide opslagwaarden, zodat bestaande Firestore-records zichtbaar en filterbaar blijven zonder automatische datamigratie.
- Bij het opnieuw opslaan vanuit de editor wordt de genormaliseerde nieuwe waarde `Alcoholvrij` opgeslagen. Andere bierstijlen blijven ongewijzigd.

## Blond bier verplaatst naar Belgisch cluster (2026-11-12)
- `beerClusters`: Licht en toegankelijk bevat alleen Pils en Lager; Blond valt onder Belgische en kruidige stijlen, samen met Dubbel, Tripel en Saison.
- `beerStyleOrder` sorteert Blond voortaan binnen het Belgische cluster (na IPA, vóór Dubbel). Bestaande `beerStyle: 'Blond'` records blijven ongewijzigd in Firestore; alleen filtergroepering en weergavevolgorde wijzigen.

## Eventselecties gekoppeld aan catalogus (2026-11-12)
- `EventDetail` leest bestaande catalogusrecords via `readMenuCatalog`, luistert naar `wandering-catalog-updated` en `storage`, en gebruikt dezelfde objecten voor selectie, beschrijvingen, alcoholpercentages en inkoopberekening.
- `BEER_CLUSTERS`, `beerCluster`, `isTapBeer`, `compareBeerEntries` in `src/data/menuCatalog.ts` zijn gedeelde biercategorie- en verpakkingsregels voor events; tapbier en fles/blik worden afzonderlijk geselecteerd, inclusief historische eventselecties.
- `eventBeerFilter` ondersteunt Alle bieren, Tapbier en alle actuele bierclusters; `eventCategoryFilter` ondersteunt Signature, Classics, Show en Niet ingedeeld voor cocktail-/mocktailevents. Eventlijst toont de cataloguscategorietags.
- Ingrediënten voor inkoop worden uit de actieve catalogusstate afgeleid en opnieuw berekend bij cataloguswijziging (niet uit een apart opnieuw gelezen snapshot). Geen catalogusdata gekopieerd naar eventrecords; events bewaren alleen namen, aantallen en menukaartinstellingen.

## Afzonderlijke menukaartteksten per catalogusproduct (2026-11-12)
- `MenuEntry.menuDescriptionFull`, `menuDescriptionShort`, `menuDescriptionKeywords` zijn optionele bewerkbare velden voor 3-, 2- en 1-regelige eventmenukaartvarianten, onafhankelijk van `tasteProfile`.
- De cataloguseditor toont deze velden voor alle producttypen; de bestaande catalogusopslag/Firebase-sync bewaart ze zonder migratie.
- Bij bier- en wijnmenukaarten wordt de gekozen tekstvariant rechtstreeks uit de catalogus gelezen. Indien leeg, blijft de bestaande automatische omschrijvingslogica werken. Alcoholpercentage blijft apart uit `alcoholPercentage` komen. Bij andere menu's heeft de uitgebreide tekst voorrang boven smaakprofiel en ingrediënten.

## Eventselectie buildcorrectie (2026-11-12)
- De `visibleMenu`-filterexpressie in `EventDetail.tsx` had een ontbrekende afsluitende haak; dit is gecorrigeerd zodat de TypeScript-build kan slagen. Filtergedrag is ongewijzigd.

## Datasheet-export bieren en wijnen (2026-11-12)
- `Catalog.exportDatasheet(type)` downloadt een UTF-8 CSV met BOM en puntkomma-scheiding van alle actuele catalogusproducten van type `Speciaalbier` of `Wijn`, ongeacht actieve zoek- of clusterfilters.
- Exportvelden: naam, type, bierstijl, biercluster, verpakking, alcoholpercentage, smaakprofiel, wijnsoort, druiven, land, regio, productlink, `menuDescriptionFull`, `menuDescriptionShort`, `menuDescriptionKeywords`.
- Bestandsnamen `wanderingbar-bieren-datasheet.csv` en `wanderingbar-wijnen-datasheet.csv`. Alleen-lezen export; geen mutaties in lokale opslag of Firebase; productfoto's en base64 uitgesloten.

## Inventarisafbeeldingen gecentreerd (2026-11-12)
- `.inventory-product-media img` gebruikt `object-fit: cover` en `object-position: center center` zodat zowel geüploade Base64-foto's als afbeeldingslinks het volledige afbeeldingsvlak van de inventariskaart vullen zonder onderaan te hangen. De bestaande afbeeldingbytes en Firebase-inventarisdata worden niet gewijzigd. Foto's kunnen aan de randen worden bijgesneden.

## Inventarisafbeelding: robuuste framepositionering (2026-11-12)
- Correctie op vorige CSS: `.inventory-product-media` is een `position:relative` flexcontainer; directe `img`-kinderen worden absoluut met `inset:0`, `object-fit:cover` en `object-position:50% 50%` geplaatst. Dit voorkomt dat de browser de afbeelding als intrinsiek klein grid-item onderaan toont. Geen afbeeldingsbestanden of Firestore-data aangepast.

## Inventariskaarten gelijk aan catalogus (2026-11-12)
- `src/inventory.css`: inventariskaarten gebruiken dezelfde productfotohoogte (230px desktop, 185px mobiel), binnenpadding, `object-fit:contain`, gecentreerde foto, achtergrond en kaartpadding als de cataloguskaarten. De eerdere `cover`/absolute-positioning overrides worden expliciet overschreven zodat productfoto's volledig zichtbaar blijven.
- Geen aanpassing aan inventarisrecords, afbeeldingsbytes, Firebase of eventgegevens. Geüploade foto's met ingebakken witruimte kunnen die witruimte nog tonen; CSS kan dat niet betrouwbaar verwijderen zonder bijsnijden.

## Inventarisfoto hover en lightbox (2026-11-12)
- `InventoryProductImage` in `src/Inventory.tsx` hergebruikt de bestaande catalogus-hover-preview en fullscreen-lightbox styling. Desktop-hover toont grote preview; klikken/tikken op foto opent een modal met sluitknop, buitenklik en Escape.
- De fotoknop is los van de productdetails-/bewerkknop, zodat foto vergroten niet de inventariseditor opent. `inventory-product-zoom-hint` en `inventory-product-details` zijn in `src/inventory.css` vastgelegd. Geen wijziging aan data of afbeeldingen.

## Inventaris gebruikt cataloguskaartcomponentstijlen (2026-11-12)
- `Inventory.tsx` importeert `Catalog.css` en past de echte catalogusklassen `catalog-product-grid`, `catalog-card`, `catalog-product-card`, `catalog-product-top`, `catalog-product-type`, `catalog-product-media`, `catalog-product-image-button`, `catalog-product-zoom-hint`, `catalog-product-footer` toe op inventarisproducten.
- `inventory.css` harmoniseert uitsluitend inventaris-specifieke layoutverschillen en behoudt dezelfde afmetingen, fotohoogtes, hover, lightbox, mobiele 2-koloms grid en kaartuitstraling als de catalogus. Bestaande inventarisvelden, bewerkactie, recepten en data blijven intact.

## Transparante productfoto's behouden (2026-11-12)
- `imageToBase64` in `src/eventImage.ts` controleert het alpha-kanaal na resizen: afbeeldingen met transparante pixels worden als `image/png` opgeslagen, ondoorzichtige foto's blijven compacte `image/jpeg`.
- Hiermee wordt voorkomen dat transparante inventaris-/catalogus-PNG's bij upload een zwarte achtergrond krijgen. De bestaande Firestore-limiet van 700.000 tekens blijft gelden; een te grote PNG krijgt een foutmelding en wordt niet opgeslagen.
- Eerder naar JPEG omgezette bestanden zijn niet automatisch te herstellen: upload daarvoor het originele PNG-bestand opnieuw. Bestaande opgeslagen data worden niet gemigreerd of overschreven.

## Automatische compressie van transparante PNG's (2026-11-12)
- `imageToBase64` probeert tot 12 resolutiestappen (80% per as) tot een data-URL onder 700.000 tekens past. Bij transparantie wordt op iedere stap PNG met alpha-kanaal behouden; ondoorzichtige foto's blijven JPEG. Dit verhelpt Firestore-afwijzing van grote PNG's zonder zwart vlak te introduceren.
- Geen mutatie aan bestaande Firestore-afbeeldingen of records; nieuwe uploads krijgen automatisch de kleinst noodzakelijke resolutie.

## Firestore-documentlimiet inventaris (2026-11-12)
- `imageToBase64` verkleint transparante PNG's stapsgewijs tot maximaal 400.000 data-URL-tekens, met behoud van alpha. Dit reserveert ruimte voor overige productvelden en Firestore-serialisatie.
- `Inventory.save` meet de UTF-8-grootte van het volledige artikel vóór opslag en blokkeert artikelen boven 750.000 bytes met een concrete melding. Zo wordt een te grote reeds lokaal aanwezige afbeelding niet opnieuw naar Firestore geschreven. Herupload origineel PNG of verwijder oude afbeelding; bestaande data worden niet automatisch verwijderd.

## Inventarisfoto's: Firestore dubbele opslag en synchronisatiefout (2026-11-12)
- Cloud v3 slaat inventarisvelden én `legacyValue` (het volledige JSON-object als string) in hetzelfde document op. Daarom is de werkelijke Firestore-documentgrootte ongeveer tweemaal de lokale JSON-grootte.
- `imageToBase64` reduceert afbeeldingen automatisch tot maximaal 180.000 data-URL-tekens, inclusief transparante PNG met intact alpha-kanaal.
- `Inventory.save` controleert voortaan `2 × JSON-bytegrootte + 10 KB` tegen een conservatieve grens van 700 KB, in plaats van enkel de lokale recordgrootte.
- Syncfouten melden expliciet dat Firebase niet heeft opgeslagen en dat herstarten lokale wijzigingen kan laten verdwijnen. Bestaande cloudrecords worden niet gewijzigd. Na update moeten eerder te grote PNG's opnieuw worden geselecteerd en opgeslagen.

## Inventaris opslaan: toast (2026-11-12)
- `Inventory.tsx`: na geslaagde lokale kaartopslag verschijnt 3,5 seconden een toegankelijke toast `Artikel lokaal opgeslagen · synchronisatie met Firebase volgt`.
- De toast wordt niet getoond bij validatiefouten of te grote afbeeldingen en claimt geen succesvolle cloudsync voordat Firebase heeft bevestigd. `inventory-save-toast` is vormgegeven in `inventory.css`.

## Inventarisfoto's blijven na herstart behouden (2026-11-12)
- Root cause: Firestore v3 schreef de Base64-afbeelding tweemaal in één document (`image` én `legacyValue`). `storageSync.writeDataset` schrijft `image` niet meer als afgevlakt veld voor inventaris; `legacyValue` behoudt de volledige afbeelding en bestaande records blijven leesbaar. Andere velden en datasets blijven onveranderd.
- `Inventory.save` schrijft de volledige nieuwe inventaris eerst expliciet naar `localStorage` en toont bij quota-/opslagfouten een fout in plaats van een misleidende succes-toast. Ook achtergrondopslagfouten worden zichtbaar. De cloud blijft autoritatief; toast betekent uitsluitend lokaal opgeslagen, niet cloudbevestigd.
- Geen bestaande cloudrecords of afbeeldingen verwijderd. Al mislukte uploads moeten na deployment opnieuw worden opgeslagen.

## Inventarisafbeelding verwijderen uit opslag (2026-11-12)
- `Inventory.removeImage()` verwijdert zowel `image` (Base64) als `imageUrl` (link) zodat geen fallbackafbeelding terugkomt.
- Bij een bestaand artikel slaat de verwijderknop onmiddellijk het gewijzigde record op in lokale opslag en triggert de bestaande Firestore-sync; de gebruiker hoeft niet apart op Opslaan te klikken. De modal sluit na lokale opslag, met een expliciete toast dat cloudsync nog volgt.
- Firestore v3 gebruikt `batch.set` zonder merge en herschrijft `legacyValue` zonder de afbeelding; daarmee verdwijnen ook eventuele oudere afgevlakte `image`-velden uit het document na succesvolle sync. Bij lokale opslagfout blijft de bestaande afbeelding behouden. Een externe afbeeldings-URL wordt alleen als verwijzing verwijderd; de externe bron zelf wordt niet gewist.

## Firestore afbeeldingen los van inventaris (2026-11-12)
- `src/cloud/inventoryImages.ts`: PNG/JPEG data-URL in Firestore `WanderingBar/main/inventoryImages/{imageRef}/chunks/{index}`; chunks van 160.000 tekens, browsercache alleen in geheugen, geen Firebase Storage vereist.
- `Item.imageRef` verwijst naar externe Firestore-afbeelding. Nieuwe uploads worden eerst in de aparte Firestore-collectie geschreven en daarna wordt de kleine referentie lokaal opgeslagen en door bestaande synchronisatie overgenomen.
- `InventoryProductImage` laadt `imageRef` asynchroon; bestaande embedded `image` blijft compatibel en wordt niet automatisch verwijderd. Afbeelding verwijderen wist referentie en gekoppelde chunks. De afbeeldings-URL van een externe website wordt uitsluitend uit het record verwijderd.
- Bestaande Base64-foto's zijn voorlopig compatibel en moeten pas na gecontroleerde migratie uit legacy records worden verwijderd; verwijder geen oude data voordat de nieuwe afbeelding is geverifieerd.
