# Firestore v3 — structuur en gecontroleerde migratie

**Status: ontwerp technisch vastgelegd; productie nog NIET gemigreerd.** De live applicatie blijft `users/{uid}/{dataset}/{recordId}` gebruiken totdat regels, kopie, controle en omschakeling aantoonbaar zijn afgerond.

## Definitieve beoogde boom
Firestore wisselt **collectie / document** af. `WanderingBar` is de hoofdcollectie; `main` is het vaste bedrijfsdocument.

```text
WanderingBar/ [collection]
  main/ [document]
    catalog/ [collection]
      Cocktail/ [document] / products/ [collection] / {productId}
      Mocktail/ [document] / products/ [collection] / {productId}
      Wijn/ [document] / products/ [collection] / {productId}
      Bier/ [document] / products/ [collection] / {productId}
    inventory/ [collection]
      Dranken/ [document] / items/ [collection] / {itemId}
      BarMaterialen/ [document] / items/ [collection] / {itemId}
      Garneringen/ [document] / items/ [collection] / {itemId}
      Verbruiksartikelen/ [document] / items/ [collection] / {itemId}
    events/ [collection]
      {eventId}/ [document] (editable title/name, stable ID)
        menu/{itemId}
        schedule/{itemId}
        packing/{itemId}
        tasks/{itemId}
        staff/{itemId}
        documents/{itemId}
    deletedEvents/{eventId}
    customers/{customerId}
    settings/{settingId}
```

`finance` en `team` worden pas toegevoegd wanneer nodig. G&T valt onder Cocktail. Een product-ID en event-ID zijn onafhankelijk van de zichtbare naam. Document-ID's van bestaande records blijven bij voorkeur behouden of krijgen een expliciete mapping.

## Bestaande situatie en risico's
- `src/cloud/storageSync.ts` leest en schrijft `users/{uid}/events|deletedEvents|inventory|catalog/{recordId}`, inclusief `value` (JSON string) en `position`.
- `src/cloud/localRows.ts` gebruikt bij catalogus **naam** als record-ID. Een naamwijziging kan dus een document verplaatsen/verwijderen.
- `src/types/event.ts` en `src/EventDetail.tsx` gebruiken voor menuverwijzingen productnamen. V3-ID's vereisen ook migratie van alle afnemers.
- Inventaris bevat bestaande categoriewaarden; deze moeten eerst geïnventariseerd en gemapt worden, niet blind overschreven.
- `firestore.rules` staat nu uitsluitend de bestaande gebruikerspaden toe. Een onmiddellijke client-omschakeling zonder gepubliceerde nieuwe regels veroorzaakt toegangsfouten.
- De GitHub-connector kan broncode wijzigen, maar geeft geen rechtstreekse toegang tot de inhoud van de productie-Firestore-database. Werkelijke aantallen en eigenaars-UID zijn niet geverifieerd.

## Veilige uitvoering (gates)
1. **Back-up en audit:** exporteer alle vier de cloudcollecties én browserdata; tel documenten, valideer recordgroottes, identificeer dubbele ID's en onbekende categorieën. Controleer eigenaar-UID en bewaar checksum/manifest.
2. **Security Rules:** geef uitsluitend het bestaande eigenaar-UID toegang tot `WanderingBar/main` en onderliggende paden. Houd de legacy-regels actief tijdens migratie. Publiceer regels in Firebase; verifieer deny voor andere accounts.
3. **Kopie, geen move:** kopieer alle records naar v3; genereer eenmalig stabiele product-ID's en leg mapping legacy-naam → ID vast. Behoud alle oude documenten en `value`-velden tot validatie.
4. **Referenties:** migreer evenementmenu's, hoeveelheden, inkoop, paklijsten en documenten naar ID-gebaseerde verwijzingen met historische snapshots. Verifieer event-hernoemen.
5. **Verificatie:** vergelijk aantallen, inhoud en checksums, test op telefoon en laptop, test verwijderen/herstellen, hernoemen, offline en merge.
6. **Omschakeling:** pas `storageSync.ts` en UI-repositories pas aan na geslaagde validatie; voer rollback-test uit. Verwijder legacy nooit automatisch.
7. **Documentatie:** werk `docs/VARIABLE_REGISTRY.md`, `docs/CODE_ROADMAP.md` en `VALUES.md` bij elke codewijziging bij.

## Huidige implementatie
- `src/cloud/firestoreV3.ts` definieert uitsluitend de beoogde paden en een helper voor stabiele ID's.
- **Er is bewust geen productie-write of automatische migratie actief.** De oude app blijft functioneren met bestaande regels en gegevens.

## Wizard beschikbaar in code
`src/cloud/MigrationV3.tsx` is bereikbaar na inloggen via `CloudGate`. Controle → gecombineerde JSON-back-up → niet-destructieve kopie → Firestore-documentverificatie. De nieuwe `firestore.rules` moeten vooraf gepubliceerd worden. Bij onbekende categorieën stopt de controle; niet stilzwijgend indelen. De wizard activeert v3-sync niet en verwijdert niets.

## V3 runtime-omschakeling (2026-11-11)
- `storageSync.ts` controleert bij inloggen de v3-root, eigenaar, `verifiedRecords` en exacte legacy/v3-inhoud per dataset. Bij overeenstemming kiest de app v3; anders wordt de sessie geblokkeerd zonder gegevens te overschrijven. Bij ontbrekende v3-root blijft legacy actief.
- V3 leest catalogus- en inventariscategorieën uit de nieuwe subcollecties, en events/deletedEvents rechtstreeks; schrijft met stabiele paden en `legacyValue`/`legacyId` voor compatibiliteit. Hernoemen van evenement verandert de document-ID niet. De oude Firestore blijft bewaard.
- `CloudGate` gebruikt de gekozen modus voor live sync. Migratiewizard verschijnt alleen in legacy-modus.
- **Nog niet live geverifieerd:** werkelijke browserflows, Firestore-regels, build en synchronisatie op twee apparaten. Er is geen opruimactie uitgevoerd.
