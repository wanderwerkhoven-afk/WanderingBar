# Wandering BarBack — Values & Data

Dit document beschrijft de vaste waarden, opslagafspraken en principes voor de Firebase-integratie. De volledige technische symbolenlijst staat in [`docs/VARIABLE_REGISTRY.md`](docs/VARIABLE_REGISTRY.md); de uitvoering en resterende tests in [`docs/CODE_ROADMAP.md`](docs/CODE_ROADMAP.md).

## Kernwaarden

1. **Geen gegevensverlies:** bestaande browsergegevens worden nooit stilzwijgend gewist; bij conflicten is eerst een export van lokale én cloudgegevens nodig.
2. **Eén persoonlijke workspace:** alle Firestore-documenten vallen onder de UID van de Google-gebruiker. Firestore Security Rules blokkeren toegang tot de gegevens van andere UID's.
3. **App werkt via GitHub Pages:** Firebase levert authenticatie en Firestore, geen vervangende hosting.
4. **Zichtbare synchronisatie:** gebruikers zien of de lokale wijzigingen zijn gesynchroniseerd, nog worden geüpload of een fout hebben veroorzaakt.
5. **Compatibel blijven:** bestaande localStorage-sleutels en gegevensvormen blijven in gebruik tot een expliciet geteste migratie.

## Gegevenssets

| Dataset | Browseropslag | Firestore-pad |
|---|---|---|
| Evenementen | `wandering-barback-events-v1` | `users/{uid}/events/{recordId}` |
| Verwijderde evenementen | `wandering-barback-deleted-events-v1` | `users/{uid}/deletedEvents/{recordId}` |
| Inventaris | `wandering-barback-inventory-v1` | `users/{uid}/inventory/{recordId}` |
| Cocktail- en drankcatalogus | `wandering-barback-catalog-v1` | `users/{uid}/catalog/{recordId}` |

De definitieve catalogussleutel wordt in `src/data/menuCatalog.ts` beheerd; wijzigingen daarin vereisen een migratie. Ieder cloudrecord bewaart de JSON-inhoud (`value`) en sorteervolgorde (`position`). Een meta-document registreert dat de workspace ooit is geïnitialiseerd, ook als alle records later worden verwijderd.

## Synchronisatieregels

**Tweede apparaat met bestaande lokale cache:** na een downloadbare back-up mag de gebruiker kiezen tussen de vier lokale BarBack-datasets vervangen door de Firebase-versie of beide versies samenvoegen. Dit raakt de Firebase-gegevens op andere apparaten niet. Legacy-inventarisregels met dezelfde ID worden bij samenvoegen afzonderlijk behouden met unieke ID's. Bij onleesbare lokale records is alleen de cloudoptie beschikbaar. Er worden geen algemene browsergegevens gewist.

- Eerste aanmelding met een lege Firestore-workspace: aanwezige browsergegevens uploaden.
- Een bestaande cloudversie met andere lokale gegevens: back-up downloaden en daarna expliciet samenvoegen of cloudversie kiezen.
- Na aanmelden: lokale wijzigingen worden ongeveer elke 1,2 seconde gecontroleerd en naar Firestore geschreven; de status is zichtbaar in de cloudstatusbalk. Er is geen handmatige synchronisatieknop meer.
- Externe wijzigingen: verversmelding tonen, zodat open formulieren niet ongemerkt oude waarden terugschrijven.
- Bij verbindingsfouten: lokale gegevens laten staan, fout tonen en later opnieuw synchroniseren.

## Validatie die nog door de eigenaar moet gebeuren

- Google-login op GitHub Pages, en `users/{uid}` in Firebase Console controleren.
- Een evenement toevoegen en wijzigen; controleren of dit na herladen en op een tweede apparaat zichtbaar is.
- Een inventarisartikel en catalogusitem wijzigen; dezelfde controle uitvoeren.
- Conflictscenario en back-up export testen met twee verschillende versies.

**Let op:** de aanwezigheid van de synchronisatiecode bewijst nog niet dat het Firebase-project in de Console de juiste Auth-provider, database en Security Rules heeft. De eerste echte upload vindt plaats wanneer de eigenaar op het apparaat met lokale gegevens inlogt.

## Firestore v2 — gestructureerde records (11 november 2026)
- **Catalogus:** `users/{uid}/catalog/{stableRecordId}`; **inventaris:** `users/{uid}/inventory/{stableRecordId}`. Document-ID's blijven tijdens de overgang onveranderd om duplicaten, verbroken verwijzingen en gegevensverlies te voorkomen.
- Nieuwe of gewijzigde records krijgen naast het bestaande compatibiliteitsveld `value` en `position` ook `schemaVersion: 2`, `recordId`, `slug`, `name` en expliciete productvelden. Zo worden productnaam, categorie, voorraad, ingrediënten en bronlinks zichtbaar in de Firebase Console.
- **Cataloguslinks:** `sourceUrl` = productpagina, `imageUrl` = rechtstreekse afbeeldings-URL, `image` = handmatig geüploade afbeelding. **Inventaris:** `webLink` = productpagina, `imageUrl` = afbeeldings-URL, `image` = upload. Deze velden zijn onafhankelijk.
- Een slug is een leesbaar zoekveld, **niet** de document-ID; een productnaam kan wijzigen zonder dat een document zijn identiteit verliest.
- Bestaande v1-records blijven leesbaar en worden **niet automatisch verwijderd, hernoemd of overschreven**. De v2-velden worden momenteel toegevoegd wanneer een record opnieuw wordt opgeslagen. Dit is een compatibele tussenfase, **geen voltooide databasebrede migratie**.
- Een definitieve omschakeling naar Firestore-only en het vervangen van de v1 JSON-envelope vereisen een gecontroleerde back-up, volledige inventarisatie, migratie met idempotente controles, verificatie op aantallen en referenties, en pas daarna een afzonderlijke verwijderfase.


## Producten en UI — actuele afspraken (11 november 2026)
- De catalogus bevat **geen hardcoded standaardproducten**; producten worden door de gebruiker beheerd en via de huidige synchronisatielaag gedeeld met Firestore.
- Bierselecties in evenementen worden uit opgeslagen catalogusrecords opgebouwd; oude evenementselecties blijven zichtbaar. De bierplanning start zonder vaste tapmerken.
- Smaakprofielen en alcoholpercentages worden uit catalogusrecords gelezen, niet uit vaste tabellen in de broncode.
- Catalogus- en inventarisproducten bewaren de productlink en afbeeldingslink in afzonderlijke velden; een geüploade foto blijft een aparte bron.
- Catalogusfoto's tonen een begrensde afbeelding, een hoverpreview en een fullscreenviewer bij klik.
- De **lokale cache is nog de primaire applicatiebron**; Firestore-only en volledige v2-migratie zijn openstaande werkzaamheden. De daadwerkelijke inhoud van Firestore is niet vanuit de GitHub-repository te verifiëren.
