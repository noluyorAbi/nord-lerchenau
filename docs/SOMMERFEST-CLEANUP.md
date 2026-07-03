# Sommerfest 2026 – Auto-Cleanup

Die Sommerfest-Section auf der Landingpage ist zeitlich befristet und
verschwindet vollautomatisch.

## Ablauf

- **Event:** Samstag, 25.07.2026 (Ausklang mit Bar/DJ bis in die Nacht).
- **Deadline (Event-Ende):** Nacht 25./26.07.2026.
- **Auto-Ausblendung (Runtime):** ab **31.07.2026 00:00 Europe/Berlin**
  (= 5 Tage nach Event-Ende) rendert `SommerfestSection` `null`. Die Section
  ist ab dann für Besucher unsichtbar, ohne dass etwas deployt werden muss.
  - Guard: `SOMMERFEST_EXPIRES_AT` in
    `components/home/SommerfestSection.tsx`.
  - Funktioniert, weil die Landingpage `dynamic = "force-dynamic"` ist und pro
    Request neu ausgewertet wird.

## Code-Löschung (geplanter Cloud-Agent)

Am/nach dem **31.07.2026** entfernt ein geplanter Cloud-Agent (Routine) den
Code **komplett**, damit keine Altlast im Repo bleibt. Zu löschen bzw. zu
bereinigen:

1. `components/home/SommerfestSection.tsx` – Datei löschen.
2. `app/(frontend)/page.tsx` – Import `SommerfestSection` und das gerenderte
   `<SommerfestSection />` entfernen.
3. `public/news/sommerfest-2026.png` – Poster löschen.
4. Diese Datei (`docs/SOMMERFEST-CLEANUP.md`) löschen.
5. Pre-Handoff-Checks laufen lassen (prettier / lint / tsc), dann committen und
   nach `main` pushen.

Bis die Code-Löschung passiert, sorgt der Runtime-Guard dafür, dass Besucher
die Section nicht mehr sehen.
