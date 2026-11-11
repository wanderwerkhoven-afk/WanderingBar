# Repositoryregels — Wandering BarBack

Deze instructies gelden voor **iedere wijziging** in deze repository, ongeacht of die via ChatGPT, een ontwikkelaar, een editor of een automatisering wordt uitgevoerd.

## Verplicht: documentatie bij elke codewijziging
Elke wijziging aan applicatiecode, configuratie, Firebase-regels, scripts of CI-workflows moet **in dezelfde commit of pull request** gepaard gaan met een bijgewerkte versie van **alle drie**:
1. `docs/VARIABLE_REGISTRY.md` — actuele symbolen, bestanden, afhankelijkheden, datastromen en wijzigingsimpact. Controleer verwijzingen tegen de werkelijke broncode.
2. `docs/CODE_ROADMAP.md` — status, gereed/open, risico's, tests en relevante mijlpalen.
3. `VALUES.md` — blijvende architectuur-/opslagafspraken en belangrijke beperkingen.

Als de inhoud van een document door de wijziging niet verandert, voeg dan een korte, feitelijke vermelding toe aan de sectie **Wijzigingscontrole** met het onderwerp, de geraakte bestanden en 'geen inhoudelijke wijziging aan dit contract'. Zo is de controle aantoonbaar.

## Werkwijze
1. Lees de drie documenten en de relevante broncode **vóór** het aanpassen.
2. Zoek alle afnemers van gewijzigde types, functies, gegevensvelden en opslagkeys.
3. Pas code en alle gekoppelde onderdelen aan. Behoud bestaande gebruikersgegevens.
4. Voer waar mogelijk tests en build uit; maak niet-gecontroleerde onderdelen expliciet.
5. Werk **alle drie documenten** bij vóór commit/push. Documentatie moet de code beschrijven zoals die **na** de wijziging bestaat.
6. Beschrijf in het eindbericht wat is veranderd, welke documenten zijn bijgewerkt en wat niet is geverifieerd.

## Waarheidsgetrouwheid
- Geen claims over Firestore-inhoud zonder echte cloudcontrole.
- Geen claims over geslaagde builds zonder buildresultaat.
- Geen verouderde symbolen als actueel presenteren.
- Geen codewijzigingen zonder documentatie-update.
- De historische roadmap in `docs/ROADMAP_HISTORY_2026-11-11.md` is archief en geen actuele waarheid.

## Geautomatiseerde controle
`.github/workflows/documentation-contract.yml` controleert op pushes en pull requests of codewijzigingen ook de drie vereiste documenten wijzigen. Deze check controleert aanwezigheid van updates, **niet** hun inhoudelijke juistheid: inhoudelijke code-audit blijft verplicht.
