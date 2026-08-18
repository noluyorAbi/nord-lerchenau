# Admin für Einsteiger: Rundgang, Video, Erklärungen

Stand: 2026-08-18. Ziel: ein Vorstandsmitglied ohne CMS-Erfahrung soll sich im
Admin allein zurechtfinden.

## Was der Verein jetzt sieht

1. **Deutsch durchgehend.** Payload lief bisher mit englischer Oberfläche
   ("Create New", "Save", "Login"), während alle unsere Hilfetexte von „Neu
   erstellen“ und „Speichern“ sprachen. `i18n.supportedLanguages = { de }` in
   `payload.config.ts` schaltet die komplette Payload-Oberfläche auf Deutsch;
   mit nur einer Sprache erscheint auch kein Sprachwähler.
2. **Seitenleiste in der Reihenfolge der Nummern.** Payload sortiert Gruppen
   nach erstem Auftreten in der Config, Collections vor Globals. Die
   Collections stehen jetzt nach Gruppennummer in `payload.config.ts`, und
   `payload/components/tour/help-nav.css` erledigt per `order` den Rest über
   die Grenze Collection/Global hinweg. Ergebnis: 1, 2, 3, 4, 5, 9 statt
   9, 2, 1, 3, 5, 4. Keine Datenbankauswirkung.
3. **Rundgang (driver.js).** Elf Schritte über Seitenleiste, Bereiche, Bilder
   & Medien, die Dashboard-Karten, das Video, das Glossar, das Konto und die
   Hilfe. Startet beim allerersten Besuch von selbst, danach nur auf Klick.
   Zwei Startpunkte: der Block **Hilfe** unten in der Seitenleiste (auf jeder
   Admin-Seite) und der Knopf im Willkommens-Kasten des Dashboards. Von einer
   anderen Seite aus navigiert er zuerst zum Dashboard und startet dort.
4. **Video „In zwei Minuten erklärt“** auf dem Dashboard, 1:45 Minuten, echte
   Bildschirmaufnahme dieses Admins mit deutscher Vertonung und Untertiteln.
   Kapitel-Chips springen direkt zu Anmelden, Bereiche, Bild hochladen,
   Artikel schreiben, Titelbild wählen, auf der Website.
5. **Glossar „Was bedeutet was?“**: Neu erstellen, Speichern,
   Veröffentlichungsdatum, Alt-Text, Bilder & Medien, Slug, Pflichtfeld, je
   in einem Satz, aufklappbar.
6. **Veröffentlichungsdatum vorbelegt.** Ohne Standardwert scheiterte der
   allererste Speicherversuch jedes Artikels an diesem Pflichtfeld, und die
   Meldung zeigt nicht, dass die Lösung ein Datumsfeld weiter unten ist. Jetzt
   steht „jetzt“ drin.

## Wo was liegt

| Datei                                       | Zweck                                                              |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `payload/components/tour/tour.ts`           | driver.js-Rundgang, Schritte, Auto-Start-Regel, Sidebar-Öffnen     |
| `payload/components/tour/tour-targets.ts`   | `data-tour`-Anker, bewusst ohne `"use client"` (siehe Kommentar)   |
| `payload/components/tour/HelpNav.tsx`       | Hilfe-Block in der Seitenleiste (`admin.components.afterNavLinks`) |
| `payload/components/tour/DashboardTour.tsx` | Knöpfe im Willkommens-Kasten, Auto-Start                           |
| `payload/components/tour/TutorialVideo.tsx` | Player mit Kapiteln                                                |
| `payload/components/tour/tutorial-video.ts` | URL, Poster, Kapitelzeiten des Videos                              |
| `payload/components/tour/*.css`             | Popover in Vereinsfarben, Hilfe-Block, Sidebar-Reihenfolge         |
| `payload/components/WelcomeDashboard.tsx`   | Dashboard-Karten, Glossar                                          |
| `video/`                                    | Remotion-Werkstatt, `storyboard.json` als einzige Quelle           |

## Verhalten im Detail

- Der Rundgang merkt sich in `localStorage` (`svnord.admin.tour.v1`), dass er
  einmal lief. Gesetzt wird das beim **Start**, nicht beim Ende: wer mittendrin
  neu lädt, wird nicht noch einmal überfallen. Die Knöpfe starten ihn immer.
- Wer über „Video ansehen“ auf dem Dashboard landet (`/admin#video`), bekommt
  keinen Auto-Rundgang über das Video gelegt.
- Unterhalb von Payloads großem Breakpoint liegt die Seitenleiste hinter dem
  Hamburger. Der Rundgang öffnet sie vor dem Start und wartet die Animation
  ab; bleibt sie zu, lässt er die Seitenleisten-Schritte weg statt ins Leere
  zu zeigen. Eingeklappte Gruppen werden vorher aufgeklappt.
- Ein `data-tour`-Anker aus einem `"use client"`-Modul in eine Server-Komponente
  zu importieren liefert dort eine Client-Referenz statt des Objekts, und das
  Attribut fällt stumm weg. Deshalb liegen die Anker in `tour-targets.ts`.
- Payload schreibt die Import-Map (`app/(payload)/admin/importMap.js`) nur bei
  einem Hot-Reload der Config neu; `payload generate:importmap` scheitert in
  diesem Projekt an den `@/`-Aliassen. Nach dem Registrieren einer neuen
  Komponente also `payload.config.ts` bei laufendem Dev-Server einmal
  anfassen.

## Video neu produzieren

Siehe `video/README.md`, Abschnitt „SV Nord: Admin-Tutorial“. Kurz: Dev-Server
mit `NEXT_HIDE_DEV_INDICATOR=1`, Szenen mit `agent-browser record` aufnehmen,
zu h264 wandeln, `narrate.js`, `assemble.js`, `render:wide-long`,
`finish.js`, mit neuem datierten Namen in den Blob-Store, URL und
Kapitelzeiten in `tutorial-video.ts` eintragen. Kosten pro Vertonung rund
drei Cent (steht in `video/costs.jsonl`).

## Geprüft

- Rundgang: alle 11 Schritte bei 1440x900 durchgeklickt, Screenshots je
  Schritt; bei 1280 breit öffnet er die Seitenleiste zuerst; „Fertig“ schließt
  und setzt das Flag; der Sidebar-Knopf auf `/admin/collections/posts`
  navigiert zum Dashboard und startet dort.
- Video: gerendert (1920x1080, h264, aac, 105 s, 8,3 MB), Stichproben-Frames
  über alle Szenen, im Blob-Store erreichbar (200, `video/mp4`), im Dashboard
  mit Poster und sechs Kapiteln sichtbar; Kapitel-Chip springt (Sekunde 39).
- Deutsch: `<html lang="de">`, Buttons „Neu erstellen“, „Speichern“,
  „Anmelden“.
- Gates: prettier, eslint, `tsc --noEmit`, 79 Tests.
