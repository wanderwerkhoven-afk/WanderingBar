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
