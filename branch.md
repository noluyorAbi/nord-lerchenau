# feat/client-wishes-juni2026

Umsetzung der Kundenwünsche aus dem Änderungsdokument (Stand 1.6.2026).

## Quelle

Word-Dokument des Vereins mit gesammelten Änderungswünschen zur neuen
Webseite (nord-lerchenau.vercel.app), abgeglichen gegen die geplante
Live-Seite.

## Bereits in früheren Sessions erledigt (verifiziert)

- **Sponsoren**: Premium (a+b Pertler, Ballauf & Schopp, BTU Hartmeier,
  Seethaler, Württembergische/Stichaner & Borowski) + Weitere (BrandSchutz
  Hagenbusch, SWM, Get Flashed Media). Check24 / AutohausWalter / Mnet /
  Bromberger entfernt. → `lib/sponsors-fallback.ts`, `scripts/seed.ts`.
- **Chronik**: Reihenfolge neu→alt, Zeittafel vor Erzählung,
  Vorstandschaften-Tabelle, Ehrentafel, Zeitschriften-Link (HiDrive).
- **Spielklassen** U13 (Gruppe Nord) / U12 (Kreisklasse Nord) korrigiert.
- **Sport-Hero-Bilder** Gymnastik/Volleyball/Ski via statischem Fallback.
- **Termine**: Sommerfest 24./25.7.2026 + Sichtung A/B-Jugend 9.5.2026
  bereits im Seed.
- **Vereinsheim Eschengarten**: Google-Maps/Speisekarte-Link vorhanden.
- **Shop**: Reihenfolge Starterpaket → "Offizieller Partner · 11teamsports".
- **Mitgliedschaft**: alte Antrags-PDFs entfernt, nur Online-Formulare;
  Spielerpass/Satzung bleiben (gewünscht).
- **Ansprechpartner** Gymnastik/Volleyball = Elisabeth Schillinger.

## In diesem Branch gebaut

1. **Abteilungs-Reihenfolge** (Volleyball nach Gymnastik, Ski zuletzt):
   - `components/home/SportsGrid.tsx`
   - `components/site/Footer.tsx` (+ eSport ergänzt)
2. **ß-Konsistenz**: `app/(frontend)/opengraph-image.tsx` "Fussball"→"Fußball".
3. **Fußball-Übersicht** (`app/(frontend)/fussball/page.tsx`):
   - Säulen der Abteilung: **fünf Bereiche** — Schiedsrichter ergänzt
     (vor Block "PR, Events").
   - "Kategorien"-Block entfernt (gewünscht).
   - Sportliche Leitung: Felix Kirmeyer (Sportlicher Leiter),
     Felix Kirmeyer (Fußball-Erwachsene), Ergin Piker (Fußball-Jugend).
4. **Sportliche Leitung auf Unterseiten** (`components/fussball/CategoryPage.tsx`
   - `app/(frontend)/fussball/herren|junioren/page.tsx`):
   * Herren: Felix Kirmeyer (Sportlicher Leiter / Fußball-Erwachsene).
   * Junioren: Felix Kirmeyer (Sportlicher Leiter), Ergin Piker
     (Fußball-Jugend), Großfeld (Besel, Tiesler, Jeremic), Kompaktfeld
     (Helmreich, Wurm), Kleinfeld (Wimmer, Krusche), Mädl's (Piker, Yousaf).
5. **Vorstand** (`app/(frontend)/verein/vorstand/page.tsx`): Ski-Gruppe ans
   Ende verschoben.
6. **Schiedsrichter** (`app/(frontend)/schiedsrichter/page.tsx`): Anzahl-Stat
   auf **4** korrigiert (war irreführend "Aktiv" / Altbestand 12).

## Bewusst NICHT autonom umgesetzt (Input nötig)

- **Mannschaftsfotos Fußball**: keine Bilddateien geliefert.
- **AH-Mannschaft** als eigenes Team: Daten/Anträge von Heinz Fessenmayer
  ausstehend (Ü40 deckt es teilweise im Seed ab).
- **Unterseiten** Jugendkonzept / Förderverein / AH: Inhalte von
  Ergin/Felix/Heinz ausstehend.
- **Prod-DB-Writes** (Seed gegen Produktion): bleibt manueller Schritt —
  überschreibt Live-Daten, daher nicht autonom ausgeführt.

## Checks

`prettier --write`, `bun run lint`, `bunx tsc --noEmit` müssen grün sein.
