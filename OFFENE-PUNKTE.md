# Offene Punkte vor dem finalen Go-Live

**Stand: 2026-06-27** · Website: https://nord-lerchenau.vercel.app · Zieldomain: `svnord-lerchenau.de`
Saisonstart in ca. 2 Wochen.

Diese Übersicht sagt: was ist fertig, was fehlt noch, und **wer** macht es (Ralf/Verein oder Alpie/Dev).
Legende: 🧑‍💼 = Ralf/Verein liefert oder entscheidet · 👨‍💻 = Alpie/Dev baut ein.

---

## ✅ Bereits erledigt und live

- Alle umsetzbaren Punkte aus dem Änderungsdokument **Stand 2026_06_02** ("Was noch fehlt").
- Sponsoren: alte/falsche raus (Check24, Autohaus Walter, M-net, Bromberger), korrekte Liste live.
- Neue Seite **Kinder- & Jugendschutz** (`/verein/jugendschutz`), verlinkt aus Vorstand, Verein-Übersicht und Navigation.
- Vorstand: Überschrift "Abteilungsleitung", Trainerin Abbrederis ausgeblendet, Volleyball-Ansprechpartnerin Elisabeth Schillinger.
- Google-Maps (Waldmeisterschule) auf Gymnastik und Volleyball.
- Volleyball-Trainingszeit auf 19:00 bis 20:00 korrigiert.
- Mitgliedschaft "Was du davon hast", Förderverein-Link auf Sponsorenseite, Shop (Starterpaket zuerst), Termine Betreuer-Essen.
- Ski-Foto-Bug behoben (zeigt jetzt zuverlässig das hinterlegte Bild).
- Garmisch-Spieltagfotos (27.06) im Startseiten-Bilderlauf und in der Fan-Galerie.
- Produktiv-Datenbank neu eingespielt (Reseed), alles oben ist live verifiziert.

---

## 🔴 Blocker (muss vor dem "scharf schalten" auf die echte Domain)

### 1. Domain `svnord-lerchenau.de` auf Vercel zeigen 🧑‍💼 + 👨‍💻

- **Ralf:** beim Domain-Anbieter die DNS-Einträge auf Vercel setzen (A-Record / CNAME, genaue Werte liefert Alpie).
  **Wichtig:** die **MX-Einträge für `info@svnord.de` (E-Mail) NICHT anfassen**, sonst kommen keine Vereins-Mails mehr an.
- **Alpie:** Domain im Vercel-Projekt hinzufügen, SSL prüfen.
- Die Server-URL in den Einstellungen steht bereits auf `https://svnord-lerchenau.de`, sobald DNS live ist greift sie automatisch.

### 2. Kontaktformular verschickt keine E-Mails 🧑‍💼 + 👨‍💻

- Aktuell: Nachrichten aus `/kontakt` werden **im System gespeichert** (gehen nicht verloren), aber es wird **keine E-Mail** verschickt, weil der Mailversand (Resend) in der Produktivumgebung nicht aktiv ist.
- **Alpie:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` in den Vercel-Produktiv-Einstellungen setzen.
- **Ralf/Domain:** Absender-Domain (`svnord.de`) bei Resend verifizieren (kleine DNS-Einträge nötig, Werte liefert Alpie).
- Ziel-Postfach klären: an welche Adresse sollen Kontaktanfragen gehen (Vorschlag: `info@svnord.de`)?

---

## 🟡 Inhalte und Dateien (Verein liefert, Dev baut ein)

### 3. Sponsoren-Logos 🧑‍💼 → 👨‍💻

- `/sponsoren` zeigt aktuell die korrekten Namen und Links, **aber ohne Logos**.
- **Ralf:** echte Logo-Dateien schicken für: a+b Pertler, Ballauf & Schopp, BTU Hartmeier, Seethaler, Württembergische (Stichaner & Borowski), Wohnen und gut leben, BrandSchutz Hagenbusch, SWM, Get Flashed Media.
- **Alpie:** Logos einpflegen und Reseed.

### 4. Echte Mannschaftsfotos 🧑‍💼 → 👨‍💻

- Junioren- und Herren-Mannschaftsfotos fehlen noch (es werden Platzhalter gezeigt).
- Der frühere HiDrive-Link zum Bilderordner ist **abgelaufen**.
- **Ralf:** neuen Zugang/Dateien zum Bilderordner schicken.

### 5. Jugend-Daten 🧑‍💼 → 👨‍💻

- **Jahrgänge** in den Jugend-Titeln (z. B. A1-Jugend U19 = Jahrgänge 2006, 2007, 2008) fehlen.
- **Trainer** bei den Jugend-Mannschaften fehlen.
- **Ralf:** Liste mit Jahrgängen und Trainern pro Team. **Alpie:** einpflegen.

### 6. AH-Mannschaft (9. Mannschaft Herren) 🧑‍💼 → 👨‍💻

- Eigene Unterseite war im Dokument als "später" markiert. Inhalt liefert laut Dokument **Heinz Fessenmayer**.

---

## 🟢 Bestätigungen / Entscheidungen (kurze Rückmeldung von Ralf reicht)

| #   | Punkt                                                         | Aktueller Stand                                                                          | Frage an Ralf                                     |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 7   | Spenden-QR-Code                                               | Liegt bereits auf der Sponsorenseite                                                     | Platzierung so ok, oder woanders/zusätzlich?      |
| 8   | Vorstand-Kachel "Abteilungen"                                 | Zeigt **6** (Fußball, Gymnastik, Volleyball, eSport, Schiri, Ski)                        | Soll es genau **5** sein? Wenn ja, welche zählen? |
| 9   | Vorstand-Kachel "Jugendleitung"                               | Zeigt **2** (Großfeld + Kleinfeld)                                                       | Auf **1** ändern?                                 |
| 10  | Link "Bayerischer Fußball-Verband" auf der Jugendschutz-Seite | Zeigt auf `bfv.de`                                                                       | Richtiges Ziel?                                   |
| 11  | Trainerin Abbrederis                                          | Aus dem Vorstand ausgeblendet, steht aber noch als Trainerin auf der **Gymnastik-Seite** | Soll sie auch dort raus?                          |
| 12  | Volleyball-Trainingszeit                                      | Jetzt **Freitag 19:00 bis 20:00**                                                        | Korrekt? (vorher war 19 bis 21 hinterlegt)        |
| 13  | Startseiten-Fotos + Garmisch-Fan-Fotos                        | Im Bilderlauf und in der Galerie                                                         | Geschmacklich ok?                                 |

---

## 🔵 Später (von Ralf selbst zurückgestellt, kein Go-Live-Blocker)

- Unterseite **Jugendkonzept** (Ergin oder altes Konzept übernehmen).
- Unterseite **Förderverein** im Detail + **digitaler Antrag** (Ralf).
- Unterseite **AH** (siehe Punkt 6).

---

## 📋 Zum Durchklicken für Ralf (Sicht-Check auf der Live-Seite)

Bitte einmal durchgehen und melden, was nicht passt:

- **Startseite:** Bilderlauf oben, Wochenendplan, soziale Medien, Sportarten.
- **Fußball:** Tabelle (alle Teams, S/U/N), Torjäger, Mannschaften.
- **Verein → Vorstand:** Namen, Funktionen, keine privaten Telefonnummern, Link zu Kinder- & Jugendschutz.
- **Verein → Kinder- & Jugendschutz:** Text vollständig und korrekt.
- **Verein → Chronik / Vereinsheim / Förderverein.**
- **Gymnastik / Volleyball / Ski / eSport:** Texte, Trainingszeiten, Fotos, Karte.
- **Mitgliedschaft:** 3-Schritte, die 4 Online-Formulare öffnen korrekt, Vorteile-Liste.
- **Shop:** Starterpaket zuerst, dann Vereinsshop.
- **Sponsoren:** richtige Firmen, Links funktionieren, Spenden-QR.
- **Termine:** Sommerfest, Sommercup, Betreuer-Essen.
- **Kontakt / Impressum / Datenschutz.**

---

## 🛠 Technische Notiz (für Dev)

- Inhaltsänderungen an CMS-Daten (Sponsoren, Sport-Texte, Personen, Teams) werden mit einem **Reseed** wirksam:
  `bun --env-file=.env.local.production scripts/seed.ts` (idempotent, löscht nichts).
- Reine Code-/Seiten-Änderungen gehen automatisch mit dem Vercel-Deploy live.
- Standard-Checks vor jedem Merge: `prettier --write`, `bun run lint`, `bunx tsc --noEmit`, `bun run build` (alle aktuell grün).
