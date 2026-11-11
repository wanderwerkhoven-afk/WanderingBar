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
