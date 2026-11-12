# Wandering BarBack — Code Roadmap
**Broncode-audit main: 11 november 2026.** Deze roadmap beschrijft de actuele implementatie, niet de gewenste eindtoestand. **Technische koppelingen en exacte wijzigingslocaties:** [VARIABLE_REGISTRY.md](VARIABLE_REGISTRY.md). **Opslagregels:** [../VALUES.md](../VALUES.md). **Oude voortgangsnotities:** [ROADMAP_HISTORY_2026-11-11.md](ROADMAP_HISTORY_2026-11-11.md) (archief, niet leidend).

## Statuslegenda
- **Gereed in code** = aangetroffen in GitHub-broncode; niet automatisch bevestigd in live browser of Firebase.
- **Te verifiëren** = test of cloudcontrole ontbreekt.
- **Open** = nog niet geïmplementeerd of nog niet volledig afgerond.

## Werkende architectuur volgens de broncode
| Onderdeel | Status | Code-eigenaar | Afhankelijkheden / aandachtspunt |
|---|---|---|---|
| React/Vite app en hashroutes | Gereed in code | `src/main.tsx` | `src/style.css`, GitHub Pages |
| Google-login en cloudgate | Gereed in code | `src/cloud/CloudGate.tsx` | `src/firebase.ts`, `src/cloud/storageSync.ts` |
| Vier datasets lokaal + Firestore-sync | Gereed in code | `src/cloud/storageSync.ts` | `src/cloud/localRows.ts`, repositories; geen Firestore-only |
| Catalogus-CRUD en wijnfilters | Gereed in code | `src/Catalog.tsx` | `src/data/menuCatalog.ts` |
| Catalogusfoto's, hover, fullscreen | Gereed in code | `src/Catalog.tsx`, `src/Catalog.css` | `image` / `imageUrl` / Gall & Gall-metadatafallback |
| Catalogus als productbron voor evenement | Gereed in code | `src/EventDetail.tsx` | Naamgebaseerde koppeling; bierkeuzes uit opgeslagen catalogus |
| Biertap en flesplanning | Gereed in code | `src/planning/beerBar.ts` | Maximaal 3 taps; geen hardcoded tapmerken; BLADE-paklijstmateriaal wel vast |
| Inventarisbeheer | Gereed in code | `src/Inventory.tsx` | **Bevat nog hardcoded startproducten, prijsdefaults en migratie-aanvullingen** |
| Evenementen / verwijderd / herstel | Gereed in code | `src/main.tsx` | **Bevat nog hardcoded demo-evenementen bij ontbrekende lokale sleutel** |
| Evenementdetail: menu, inkoop, paklijst, planning | Gereed in code | `src/EventDetail.tsx` | **Bevat nog vaste startpaklijst en startdraaiboek** |
| Workshop-/cateringprijzen | Gereed in code | `src/planning/workshopPricing.ts`, `src/planning/cateringPricing.ts` | Prijsdefaults zijn codeconstanten; niet automatisch catalogusproducten |
| Offertes/facturen en menukaartprint | Gereed in code | `src/planning/*Documents.ts`, `src/planning/workshopQuotes.ts`, `src/documents/*` | Browserprint vs document-PDF onderscheiden |
| Firestore v2-velden | Deels gereed | `src/cloud/storageSync.ts` | Alleen bij schrijven van gewijzigde/nieuwe records; legacy `value` blijft |

## Prioriteit 1 — Gegevensveiligheid en cloudintegriteit
- [ ] **Firestore-inventarisatie met echt account**: per collectie aantallen, records, afbeeldingslinks en eventuele dubbele ID's controleren. GitHub-code geeft geen inzage in daadwerkelijke database-inhoud.
- [ ] **Back-up vóór migratie**: alle vier datasets lokaal én in Firestore exporteren; herstel testen.
- [ ] **Verifiëren op twee apparaten**: catalogusfoto's, nieuwe producten, inventaris, evenementen en conflictafhandeling.
- [ ] **Document-ID-strategie**: catalogus-ID wordt nu uit `name` afgeleid in `src/cloud/localRows.ts`; bij hernoemen verandert de identiteit. Plan stabiele product-ID's en migratie van evenementverwijzingen.
- [ ] **v1→v2 backfill**: bestaande Firestore-documenten idempotent migreren, zonder verlies of onbedoelde duplicaten; aantallen en verwijzingen vergelijken.
- [ ] **Firestore-only**: na succesvolle migratie UI-repositories direct op Firestore aansluiten; localStorage hooguit als cache/offline laag. **Nu niet geïmplementeerd.**
- [ ] Firestore Security Rules, Google Auth authorized domains en GitHub Pages deployment live verifiëren.

## Prioriteit 2 — Laatste hardcoded data opschonen
- [x] Productcatalogus zelf bevat geen ingebouwde standaarddranken meer: `src/data/menuCatalog.ts` en `src/Catalog.tsx`.
- [x] Evenementbierselectie gebruikt opgeslagen catalogusproducten: `src/EventDetail.tsx`.
- [x] Hardcoded biernamen, bier-ABV en bier-smaakprofielen uit biercatalogus-/evenementcode verwijderd.
- [ ] **Inventarisstartdata**: `src/Inventory.tsx` bevat `seed`, `starter`, `beverageStarter`, `extraStarter`, `homemadeStarter`, `verifiedPrices` en `addBeerBarOptions()`. Eerst clouddata controleren; vervolgens veilig uitschakelen/verwijderen, zonder bestaande voorraad te wissen.
- [ ] **Demo-evenementen**: `src/main.tsx` heeft `sampleEvents` fallback als events-sleutel ontbreekt. Na controle lege dataset expliciet ondersteunen zonder demo-injectie.
- [ ] **Startpaklijst/draaiboek**: `src/EventDetail.tsx` heeft `DEFAULT_PACK` en `DEFAULT_SCHEDULE`. Bepaal of dit configureerbare sjablonen moeten blijven; niet verwarren met producten.
- [ ] **Bierbar-materialen**: `src/planning/beerBar.ts` bevat vaste paklijstbenamingen (o.a. BLADE-biertap, ijsbak, ijsblokjes). Beslis of deze via inventarisartikelen moeten worden gekoppeld.
- [ ] **Overige businessdefaults**: prijzen, menu-ontwerppresets en dienstopties zijn nog vaste codeconfiguratie. Alleen naar database verplaatsen als dat functioneel gewenst is.

## Prioriteit 3 — Testdekking en regressie
- [ ] `npm test` (`tests/localRows.test.mjs`) en `npm run build` op de actuele main-revisie controleren; CI-status is geen bewijs van alle browserflows.
- [ ] Event: bierkaart met 0/1/3 taps, 0/meerdere flesbieren, oudere selecties en ontbrekende catalogusproducten testen.
- [ ] Menukaart: A4/A5, 3–6 cocktails, 11–16+ bieren, wijnfilters, afdruk in Chrome/Edge controleren.
- [ ] Foto: directe `imageUrl`, geüploade `image`, kapotte URL, Gall & Gall-fallback, hover op desktop en fullscreen op mobiel testen.
- [ ] Firestore: wijzigingen, verwijderingen, hernoemen, twee apparaten, conflict/merge, offline en grote afbeeldingen testen.
- [ ] Documenten: workshop, catering en overige offertes/facturen inclusief btw en prijzen testen.

## Wijzigingsprotocol (verplicht voor toekomstige werkzaamheden)
1. Zoek in [VARIABLE_REGISTRY.md](VARIABLE_REGISTRY.md) de functie, eigenaar en alle afnemers.
2. Controleer de **huidige broncode op main**; documentatie is een navigatiehulp, nooit vervanging voor code-inspectie.
3. Pas model, UI, afnemers, opslag en Firestore-velden samen aan; controleer legacy-data.
4. Test, controleer build en deploy; rapporteer ongeteste onderdelen expliciet.
5. Werk **in dezelfde wijzigingsronde** `VARIABLE_REGISTRY.md`, `CODE_ROADMAP.md` en zo nodig `VALUES.md` bij.
6. Verplaats afgeronde taken naar **Gereed in code**, maar markeer live-/cloudverificatie pas afgerond na echte controle.

**Laatste inhoudelijke productwijziging vóór deze audit:** vaste bierproductlijsten verwijderd en bierselectie catalogusgestuurd gemaakt. **Documentatiecorrectie van deze audit:** de inventaris bevat nog wel hardcoded producten; eerder geformuleerde claims dat álle hardcoded producten weg waren, waren te ruim.

## Documentatiebeheer — verplicht
- [x] `AGENTS.md` bevat het repositorybrede protocol: bij elke codewijziging alle drie de documenten actualiseren.
- [x] `.github/workflows/documentation-contract.yml` controleert bij push en pull request of code-/configuratiewijzigingen samen met updates aan `VARIABLE_REGISTRY.md`, `CODE_ROADMAP.md` en `VALUES.md` worden aangeleverd.
- [ ] Controleren dat de nieuwe workflow daadwerkelijk slaagt op GitHub Actions; inhoudelijke correctheid blijft een handmatige code-audit.

## Firestore v3 — implementatiestatus
- [x] V3-doelstructuur en veilige migratiegates gedocumenteerd in `docs/FIRESTORE_V3_MIGRATION.md`.
- [x] Paden en nieuwe naam-onafhankelijke ID-helper vastgelegd in `src/cloud/firestoreV3.ts` (nog niet aangesloten).
- [ ] Werkelijke Firestore-data, eigenaar-UID, duplicaten, categorieën en cloudback-up controleren.
- [ ] Eigenaar-beperkte v3 Security Rules voorbereiden, publiceren en testen; legacy-toegang behouden.
- [ ] Niet-destructieve kopie uitvoeren, manifest/ID-mapping en aantallen verifiëren.
- [ ] Alle catalogus-/evenementreferenties en opslagrepositories naar vaste ID's migreren.
- [ ] Sync op twee apparaten, event-hernoemen, verwijderde evenementen, conflict en rollback testen.
- [ ] Pas daarna v3 activeren; legacy-data voorlopig behouden.
**Live-status:** de applicatie gebruikt nog `users/{uid}`; er zijn geen Firestore-documenten verplaatst.

## V3-migratiewizard — voortgang
- [x] Handmatige wizard voor inspectie, lokale/cloudvergelijking, downloadback-up, kopiëren en document-voor-document controle toegevoegd.
- [x] Concept Security Rules voor v3 toegevoegd met eigenaarcontrole en behoud van legacy-regels.
- [ ] Regels publiceren in Firebase Console en autorisatie controleren.
- [ ] Wizard uitvoeren op echte accountdata; categorieën en ID-conflicten inspecteren.
- [ ] V3-referenties en live sync omschakelen na geverifieerde kopie; daarna pas legacy opruimen.

- Correctie: v3-workspace leesrecht apart van update-recht gedefinieerd; leesoperaties vereisen geen `request.resource`.

- [x] TypeScript-fouten uit GitHub Actions annotaties in migratiewizard en CloudGate verholpen (Firestore `doc` overload, `Array.at`, nullable user). Buildstatus afzonderlijk via Actions controleren.

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
