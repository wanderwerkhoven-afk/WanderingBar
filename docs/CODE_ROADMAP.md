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
