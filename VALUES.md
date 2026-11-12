# Wandering BarBack — Values, opslag en data-contracten
**Gecontroleerd tegen broncode main op 11 november 2026.** Leidende wijzigingskaart: [docs/VARIABLE_REGISTRY.md](docs/VARIABLE_REGISTRY.md). Actuele taken: [docs/CODE_ROADMAP.md](docs/CODE_ROADMAP.md).

## Ononderhandelbare principes
1. **Geen stilzwijgend gegevensverlies.** Nooit bestaande lokale of Firestore-records verwijderen op basis van aannames over migratie of synchronisatie.
2. **Eén Google-account per lokale workspace.** Cloudgegevens staan onder `users/{uid}`; accountwisseling en conflicten worden in de cloudgate behandeld.
3. **GitHub Pages blijft hosting.** Firebase levert authenticatie en database, niet de sitehosting.
4. **Geen schijnzekerheid.** Een codecommit, een 'Gesynchroniseerd'-label of een geslaagde build bewijst niet op zichzelf dat alle cloudrecords juist zijn.
5. **Datamodel en afnemers samen onderhouden.** Nieuwe velden, hernoemen of verwijderen: altijd editor, evenementselecties, inkoop, documenten, opslag en synchronisatie nalopen.
6. **Documentatie is een kaart van de code.** Variabelenregister en roadmap in dezelfde wijziging bijwerken; verouderde claims corrigeren, niet blijven herhalen.

## Huidige opslagarchitectuur (NIET Firestore-only)
| Dataset | Browser-key | Firestore-collectie | Broncode |
|---|---|---|---|
| Evenementen | `wandering-barback-events-v1` | `users/{uid}/events/{recordId}` | `src/repositories/eventRepository.ts`, `src/main.tsx` |
| Verwijderde evenementen | `wandering-barback-deleted-events-v1` | `users/{uid}/deletedEvents/{recordId}` | `src/repositories/eventRepository.ts`, `src/main.tsx` |
| Inventaris | `wandering-barback-inventory-v1` | `users/{uid}/inventory/{recordId}` | `src/Inventory.tsx`, `src/repositories/inventoryRepository.ts` |
| Catalogus | `wandering-barback-catalog-v1` | `users/{uid}/catalog/{recordId}` | `src/data/menuCatalog.ts`, `src/Catalog.tsx` |

`src/cloud/storageSync.ts` synchroniseert de vier lokale datasets met Firestore via een poll van 1200 ms en detecteert externe wijzigingen via `onSnapshot`. De UI leest op dit moment in hoofdzaak uit lokale opslag. Het schema bewaart `value` (JSON-string) en `position`; nieuwe/gewijzigde records krijgen daarnaast `schemaVersion:2`, `recordId`, `slug`, `name` en datasetspecifieke velden. **Bestaande records zijn niet aantoonbaar allemaal gemigreerd.**

## Identiteit en relaties — belangrijk bij wijzigingen
- **Catalogus**: Firestore-ID = `encodeURIComponent(MenuEntry.name)`. Productnaam is dus op dit moment een technische sleutel; `slug` is alleen een leesbaar veld. **Niet claimen dat catalogus-ID's al stabiel zijn bij hernoemen.**
- **Inventaris**: Firestore-ID = geëncodeerde `Item.id`; dubbele lokale inventaris-ID's kunnen bij conversie een `-local-N` suffix krijgen.
- **Evenementen**: Firestore-ID = geëncodeerde `EventData.id`; verwijderde evenementen gebruiken `DeletedEvent.event.id`.
- **Evenementmenu's**: `EventData.menu` bewaart productnamen; `quantities` is een map op productnaam. Bierplanning bewaart eveneens namen in `taps[].beer` en `bottles`. Producthernoemen of -verwijderen kan verwijzingen breken; eerst impactanalyse en migratie.
- **Productfoto's**: `sourceUrl` (catalogus-productpagina), `imageUrl` (rechtstreekse afbeelding), `image` (upload/base64); inventaris heeft `webLink` in plaats van `sourceUrl`. De catalogus probeert bij een Gall & Gall-link zonder eigen afbeelding een externe metadatafallback; die fallback wordt niet automatisch in `imageUrl` opgeslagen.

## Conflict- en herstelgedrag
- `prepareSync()` leest lokale en cloudrecords en controleert initialisatie via `users/{uid}/meta/workspace`.
- Bij verschil kan de gebruiker na back-up kiezen voor **cloudversie** of **samenvoegen**, voor zover de lokale records geldig zijn en van dezelfde eigenaar komen.
- Samenvoegen gebeurt op record-ID, niet op semantisch identieke productinhoud; dit is **geen gegarandeerde deduplicatie**.
- De synchronisatie gebruikt `barback-firebase-local-owner-v1` voor lokale eigenaar en `barback-firebase-synced-v1-{uid}` als fingerprint.
- Externe wijzigingen leiden tot een verversmelding; niet alle geopende formulieren worden live op afstand aangepast.
- Bij schrijffouten moeten lokale gegevens behouden blijven en moet een fout zichtbaar zijn.
- Bij grotere records is er een beschermende limiet in `src/cloud/localRows.ts` (900.000 bytes per record); base64-foto's verdienen extra aandacht.

## Welke hardcoded gegevens zijn er echt nog?
**Geen vaste drankproductlijst in de catalogusmodule** (`src/data/menuCatalog.ts`, `src/Catalog.tsx`). De evenementbierkaart leest de opgeslagen catalogus. **Wel nog aanwezig**:
- `src/Inventory.tsx`: inventarisstartproducten, bierinventarisopties, prijsdefaults en huisgemaakte recepten/migratieaanvullingen.
- `src/main.tsx`: demo-evenementen bij ontbrekende events-sleutel.
- `src/EventDetail.tsx`: startpaklijst en startdraaiboek.
- `src/planning/beerBar.ts`: materiaalnamen en aantallen voor BLADE-paklijst; geen vaste biermerken als tapdefaults.
- `src/planning/workshopPricing.ts`, `src/planning/cateringPricing.ts`: vaste standaardtarieven/pakketten.
- `src/data/menuTemplates.ts`: vaste visuele menukaartpresets (geen producten).

Deze waarden **niet verwijderen omdat er mogelijk al data in Firestore staat**: eerst echte cloudrecords, afhankelijkheden en herstelpad controleren. De openstaande opschoning staat in de roadmap.

## Verificatie vóór 'klaar'
- Controleer echte Firestore-documenten en aantallen, niet alleen de broncode.
- Test login, tweede apparaat, conflict/merge, productwijzigingen, bestaande evenementen en inventaris.
- Draai `npm test` en `npm run build`, controleer CI/deploy en bekijk de live UI.
- Update bij elke codewijziging de exacte koppelingen in `docs/VARIABLE_REGISTRY.md` en de status in `docs/CODE_ROADMAP.md`.

**Status:** documentatie gebaseerd op gecontroleerde GitHub-code; daadwerkelijke cloudinhoud en browsergedrag moeten afzonderlijk worden geverifieerd.

## Wijzigingscontrole
- 2026-11-11 — De verplichte documentatieprocedure staat in `AGENTS.md`; de GitHub Actions-controle in `.github/workflows/documentation-contract.yml` verlangt updates aan alle drie de referentiedocumenten bij code-/configuratiewijzigingen. Geen wijziging aan opslagcontract of runtime-architectuur. Deze workflow controleert bestandswijzigingen, niet inhoudelijke juistheid.

## Firestore v3 — overeengekomen doelarchitectuur (niet live)
- Bedrijfsroot: collectie `WanderingBar`, document `main` (Firestore vereist afwisseling van collectie en document).
- Catalogus: `catalog/{Cocktail|Mocktail|Wijn|Bier}/products/{productId}`; G&T onder Cocktail.
- Inventaris: `inventory/{Dranken|BarMaterialen|Garneringen|Verbruiksartikelen}/items/{itemId}`; bestaande categorieën eerst expliciet mappen.
- Evenementen: `events/{eventId}`, met aanpasbare naam als veld en subcollecties `menu`, `schedule`, `packing`, `tasks`, `staff`, `documents`. Verwijderde evenementen: `deletedEvents/{eventId}`.
- Stabiele ID's onafhankelijk van product-/evenementnamen. Historische documenten bewaren relevante snapshots. Eén eigenaar voor nu, toekomstig team optioneel.
- **Veiligheidscontract:** geen destructieve migratie, geen automatische omschakeling, geen verwijdering van legacy-data vóór back-up, productieaudit, gepubliceerde en geteste Security Rules, referentiemigratie en geslaagde controles.
- `src/cloud/firestoreV3.ts` is alleen een schema-/paddefinitie; `docs/FIRESTORE_V3_MIGRATION.md` is het uitvoeringsplan. Live Firestore en localStorage blijven vooralsnog ongewijzigd.

## V3-migratiewizard — uitvoeringscontract
- In de ingelogde app staat een optionele wizard die legacy-cloudgegevens controleert, lokale data vergelijkt, JSON-back-up laat downloaden en een niet-destructieve kopie naar v3 schrijft.
- De wizard stopt bij onbekende categorieën of ontbrekende lokale/cloudrecords en verifieert gekopieerde documenten.
- Nieuwe regels in `firestore.rules` moeten eerst apart worden gepubliceerd. De oude `users/{uid}`-synchronisatie blijft actief; de wizard schakelt niet automatisch over en ruimt niets op.
- Een geslaagde GitHub-commit is **geen** bewijs dat de daadwerkelijke Firebase-database is gemigreerd.

- Correctie: v3-workspace leesrecht apart van update-recht gedefinieerd; leesoperaties vereisen geen `request.resource`.

- Buildcorrectie migratiewizard: Firestore `doc()` krijgt een volledig pad, indexering zonder `Array.at`, en wizard wordt uitsluitend gerenderd wanneer de gebruiker bekend is. Geen data- of syncmigratie uitgevoerd.

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

## Live synchronisatie inventarisafbeeldingen tussen apparaten (2026-11-12)
- `CloudGate` verhoogt `cloudVersion` bij een bevestigde remote Firestore-wijziging. De app-inhoud wordt opnieuw gemount op basis van de bijgewerkte localStorage, zonder handmatig op Vernieuwen te hoeven klikken. Dit maakt nieuwe `imageRef`-verwijzingen en andere records direct zichtbaar op een reeds ingelogd apparaat.
- `InventoryProductImage` reset de laad-/foutstatus ook bij een wijziging van `imageRef`, zodat een eerder mislukte afbeelding opnieuw geladen wordt.
- Dit is alleen een UI-refresh na een geaccepteerde remote snapshot; de bestaande conflictdetectie en cloud-authoriteit blijven behouden. Er wordt geen data gewist of overschreven buiten de bestaande synchronisatielogica.

## Legacy-inventarisafbeeldingen opruimen (2026-11-12)
- Inventarispagina toont een expliciete actie `Veilig migreren naar Firestore` als een of meer items nog `image: data:image/...` bevatten. Dit voorkomt een onzichtbare achtergrondmigratie die met live-sync kan botsen.
- `migrateLegacyInventoryImage`: schrijf afbeelding naar `inventoryImages/{ref}/chunks`, verwijder geheugen-cache, lees de volledige afbeelding opnieuw uit Firestore en vergelijk byte-voor-byte met het origineel. Pas daarna wordt de lokale `image` vervangen door `imageRef`.
- Migratie gebeurt artikel voor artikel. Bij fout blijft het origineel behouden en stopt de migratie. Bestaande sync schrijft vervolgens de kleine inventarisrecords naar Firestore; wacht op `Gesynchroniseerd` voordat de app wordt gesloten.
- Historische backups en ongebruikte chunks worden niet automatisch verwijderd. Opschonen daarvan vereist afzonderlijke gecontroleerde referentie-audit. Geen automatische bulk-delete of datareset.

## Firestore-opslagcontrole (2026-11-12)
- Inventaris heeft een altijd zichtbare knop `Opslag controleren`, die via `inspectInventoryImageStorage` de vier inventariscategorieën rechtstreeks vanaf Firestore leest, afbeeldingsverwijzingen telt, legacy Base64-records identificeert en controleert of gebruikte chunkcollecties bestaan.
- Read-only: geen automatische deletions. Firestore kan chunk-only afbeeldingen zonder parent-document/index niet veilig enumereren; daarom is orphan cleanup expliciet geblokkeerd totdat een volledig afbeeldingsregister en verificatie zijn geïmplementeerd.

## Afbeeldingsopslag: controle en opschoning (2026-11-12)
- Inventariscontrole gebruikt een Firestore collection-group query op `chunks` om ook afbeeldingen zonder parent-document te ontdekken; vergelijkt de gevonden refs met alle vier v3-inventariscategorieën.
- De UI toont aantallen afbeeldingen/chunks, ontbrekende refs en ongebruikte refs. Verwijderen vereist een aparte bevestiging en hercontrole vanaf de server; bij wijzigingen stopt de actie.
- `firestore.rules` bevat een eigenaar-beperkte collection-group leesregel voor `chunks`. **Publiceer de bijgewerkte regels in Firebase Console** voordat de nieuwe controle werkt; GitHub Pages publiceert Firestore Rules niet automatisch.
- Nog te verifiëren: daadwerkelijke Firebase collection-group toegang, audit op productiegegevens, build en opschoning. Er zijn vanuit deze codewijziging geen live chunks verwijderd.
