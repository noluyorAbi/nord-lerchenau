# Rollout-Checkliste SV Nord München-Lerchenau Website

> Handoff für den nächsten Agent. Stand: 2026-06-25.
> Quelle: zwei WhatsApp-Verläufe (Gruppe „SvNordWebNeuAlpie" + 1:1 „Ralf Kirmeyer SV NORD LERCHENAU"),
> die mitgeschickten Dokumente (Satzung, Datenschutz, Impressum, „Mitglied werden Seite.pdf",
> „E-Mail(7).pdf", „Web 20260514.docx") und ein Repo-Audit (5-Cluster-Fan-out) gegen den Code-Stand.
>
> Zweck: festhalten, **was vor dem Go-live noch offen ist** und **was schon erledigt ist**, jeweils mit
> wörtlichem Client-Zitat (Quelle + Datum) und Code-Beleg (`datei:zeile`).

---

## 0. Kontext für den nächsten Agent

- **Projekt:** Vereinswebsite, Next.js (App Router, `app/(frontend)`) + Payload CMS + Postgres (Neon), deployt auf **Vercel** (`nord-lerchenau.vercel.app`).
- **Inhalt teils statisch** (Komponenten, `lib/`, `*_content.ts`), **teils CMS-gesteuert** (Payload Collections/Globals, befüllt über `scripts/seed.ts`). Wichtig: Fixes im Seed/Code greifen live erst nach **Prod-Reseed** bzw. CMS-Pflege.
- **Beteiligte Personen:**
  - **Ralf Kirmeyer** — 1. Vorstand, Hauptansprechpartner, sammelt alle Wünsche.
  - **Felix Kirmeyer** — Sportleiter (entscheidet z.B. Suche vs. KI-Assistent, liefert Trainernamen).
  - **Thomas „Tom" Wurm** — liefert strukturiertes Feedback + Fotos (U8, D2).
  - **Steffen** — Quelle des D2-2014-Mannschaftsfotos.
  - **Birgit Höfer** — 2. Vorstand.
  - **Alexander** — Ralfs Sohn, meldet sich wegen separatem Webpflege-Auftrag (kein Rollout-Thema).
  - **alperen (Alpi)** — Entwickler (wir).
- **Sprache:** Kundentexte Deutsch, Code/Identifier/Commits Englisch.

---

## 1. ROLLOUT-BLOCKER (ohne diese kein Go-live)

### 1.1 Domain / DNS umstellen 🔒

> „https://www.svnord-lerchenau.de/ **diese adresse gehört uns**" — Ralf, Chat1 12.05 21:06

- `svnord-lerchenau.de` zeigt aktuell noch auf die **alte WIX-Seite**.
- Ralf hat am 13.06 (Chat1 18:42–18:45) Strato-Zugangsdaten geschickt:
  - Benutzer `su675971`, Server `5019092857.ssh.w2.strato.hosting`, Passwort als Einmal-Ansicht-Nachricht; zusätzlicher String in Chat2 13.06 19:21.
  - **Diese Credentials gehören NICHT in dieses Repo.** Separat sichern (Passwort-Manager). Hier nur der Verweis.
- **Achtung Hosting-Falle:** Strato „WordPress Hosting Plus" (Foto 00003020) ist PHP/MySQL-Shared-Hosting. **Next.js + Payload + Postgres läuft dort nicht.** Der SSH-Zugang ist für unseren Stack nutzlos.
- **Richtiger Weg:** App bleibt auf **Vercel**, nur **DNS bei Strato** auf Vercel zeigen (A-Record `76.76.21.21` bzw. CNAME laut Vercel-Domain-Setup). **MX-Records für `info@svnord.de` nicht kaputtmachen.**
- Bei Ralf erfragen: brauchen wir nur **DNS-Verwaltung** (nicht das WP-Hosting). Klären, wo die Mail `info@svnord.de` liegt, bevor DNS angefasst wird.

### 1.2 Nach Domain-Switch: `TODO.md` abarbeiten 🔒

Siehe `TODO.md` im Repo. Konkret:

1. `vercel env rm NEXT_PUBLIC_SERVER_URL production` + neu setzen auf neue Domain.
2. Prod redeployen (`NEXT_PUBLIC_` ist build-time).
3. Hardcoded-WIX-Fallbacks ändern: `app/(frontend)/layout.tsx:54`, `components/seo/SiteSchema.tsx:4`.

### 1.3 Prod-DB Re-Seed ❓🔒

Viele inhaltliche Fixes liegen in `scripts/seed.ts` / CMS, nicht im statischen Code. Ohne Reseed/CMS-Pflege zeigt die Live-Seite **alte Daten**. Betrifft u.a.: U13/U12-Spielklasse, Vorstand-Personen, Sponsoren, Team-Trainer, Jahrgänge. Vor/bei Go-live ausführen und im CMS verifizieren.

### 1.4 Datenschutz an Hosting-Entscheidung gekoppelt ✅ (bedingt)

> „für die Datenschutzerklärung benötige ich noch **[Hosting-Anbieter und Sitz ergänzen] [Name des Consent-Tools ergänzen]**" — Ralf, Chat1 12.05 17:38
> PDF E-Mail(7) (02.06): „4. Hosting … [Hosting-Anbieter und Sitz ergänzen]" / „5. Cookies und Consent-Management … [Name des Consent-Tools ergänzen]"

- `app/(frontend)/datenschutz/_content.ts` füllt das bereits: **Vercel + Neon + Resend**; Cookie-Abschnitt sagt „kein Tracking, nur funktional notwendige Cookies, Drittinhalte click-to-load" → **kein Consent-Tool nötig**.
- **Korrekt, SOLANGE auf Vercel gehostet.** Falls doch Strato → DSE wäre falsch. Also erst 1.1 fixieren.

---

## 2. Startseite

| Wunsch (Zitat)                                                                                                                       | Quelle                  | Status                             | Beleg / Notiz                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| „Start Seite mit **Bilderlauf** siehe fcschwabing.de"                                                                                | Ralf, Chat2 12.05 16:03 | ❌ offen                           | Hero = ein statisches Bild `components/home/Hero.tsx:128`, kein Carousel/Slideshow                                                                                        |
| „Der Verein in den **sozialen Medien** (analog FC Schwabing) auf die Start seite nehmen"                                             | Ralf, Chat2 12.05 16:05 | ⚠️ teilweise                       | `components/home/InstagramTeaser.tsx` ist Eigenbau-Clone mit lokalen Fotos + Fake-Zahlen (319/1.354/509), **kein echter IG-Feed**                                         |
| „Start Seite — **nicht so 1te Mannschaft lastig, Jugend** ist auch sehr wichtig — Foto übernehmen von unserer Web Seite"             | Ralf, Chat2 12.05 16:15 | ✅                                 | Jugend via Wochenplan/Hero-Fallback/U8-Galerie; alte Fotos übernommen                                                                                                     |
| „Startseite: **Anzahl Trainer mit Lizenz**" (Foto: 630+/25+/26)                                                                      | Ralf, Chat2 12.05 16:23 | ✅                                 | `components/home/StatStrip.tsx:4-6` exakt 630+ / 25+ / 26                                                                                                                 |
| „STARTSEITE **Überschrift ergänzen mit e. V.** → SV NORD MÜNCHEN-LERCHENAU e. V."                                                    | Docx 14.05              | ❌ offen                           | H1 ist „Einmal Nordler, immer Nordler." Voller Name nur klein im Header-Logo `components/Logo.tsx:29`. Andernorts „e.V." ohne schmales Leerzeichen (`layout.tsx:55`)      |
| „Etwas überladen, deshalb entfernen **Bereich Tabelle Bezirksliga → zu Fußball**; BLZ Bezirksliga → Fußball; **Torjäger → Fußball**" | Docx 14.05              | ❌ offen (Tabelle) / ✅ (Torjäger) | Tabelle noch auf Home `components/home/MatchdayBlock.tsx:315-411`. `/fussball`-Übersicht hat KEINE Tabelle. Torjäger ✅ auf `/fussball` (`components/home/FupaBlock.tsx`) |
| „**Aktuelles 02 nach Wochenplan** setzten"                                                                                           | Docx 14.05              | ✅                                 | `app/(frontend)/page.tsx:24-25` Wochenplan vor Aktuelles. Kosmetik: Eyebrow-Nummern unsortiert (01,02,04,03,06)                                                           |
| „**Esport ändern in eSport**"                                                                                                        | Docx 14.05              | ✅                                 | Nav/Home/Footer „eSport". Rest-Tippfehler nur Detailseite `esport/page.tsx:45` + `Heritage.tsx:34` (nicht auf Home)                                                       |
| „**Entfernen Kapitel 04, 05, 07**"                                                                                                   | Docx 14.05              | ✅                                 | Heritage(04)/Vereinsheim(05)/LocationMap(07) nicht mehr in `app/(frontend)/page.tsx` importiert                                                                           |
| „**Werde Norder. Statt 509, über 600 Mitglieder**"                                                                                   | Docx 14.05              | ✅                                 | 630+ / „Über 600". (509 lebt nur noch als IG-Follower-Fake-Zahl im Clone → ggf. verwirrend)                                                                               |

---

## 3. Fußball / Tabellen / Mannschaften

| Wunsch (Zitat)                                                                                                       | Quelle                                  | Status       | Beleg / Notiz                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| „**Spielbeginn ist 15:00 Uhr. Alle Anstoß Zeiten stimmen nicht.** Anscheinend sind hier die **Endzeiten** angezeigt" | Ralf, Chat2 12.05 16:16 (Foto 00000014) | ✅           | Code zeigt Anstoß: `lib/bfv.ts:193` `parseBfvKickoff`, `lib/format-date.ts:27` `formatKickoff`. BFV-API hat kein End-Feld. Live-Wert hängt an BFV-Daten |
| „die **Spielklassen** bei den Junioren stimmen teilweise nicht (U13 steht Kreisklasse, soll Gruppe; U12 umgekehrt)"  | Tom, Chat1 28.05 21:41                  | ✅❓         | Im Seed gefixt `scripts/seed.ts:819` (U13 „Gruppe Nord"), `:833` (U12 „Kreisklasse"). Greift live nach Prod-Reseed                                      |
| „**Mannschaftsfotos fehlen** noch"                                                                                   | Tom, Chat1 28.05                        | ⚠️ teilweise | Teams nutzen BFV-Media-Bild, sonst grauer Verlauf-Platzhalter. CMS-Feld `team.photo` (`payload/collections/Teams.ts:208`) ungenutzt im UI               |
| „**Trainer fehlen** bei den Jugend Mannschaften" + „7. **Trainer bei den Teams anzeigen**"                           | Ralf Chat2 12.05 16:20 + Docx 14.05     | ⚠️❓         | UI kann's (`components/TeamCard.tsx:19`), aber Seed setzt für Fußball/Jugend keine Trainer (`scripts/seed.ts:368`). → im CMS eintragen                  |
| „**Jugendmannschaften Titel mit Jahrgang** ergänzen: A1 – Jugend (U19) Jahrgänge 2006, 2007, 2008"                   | Ralf, Chat2 12.05 16:42                 | ❌❓         | Feld `birthYears` (`payload/collections/Teams.ts:89`) leer; Titel zeigt nur Teamname. Format „A1 – Jugend (U19) Jahrgänge …" nirgends erzeugt           |
| „bitte die **Namen und Vornamen ergänzen**" (Lizenz-Tabelle) → Felix liefert 26 Namen                                | Ralf 28.05 15:58, Felix 16:06           | ✅           | `app/(frontend)/sport/page.tsx` TRAINER_LICENSES, „Übungsleiter mit Trainerlizenz C und B"                                                              |
| „Mannschaftsfoto der **D2 2014** … Anfrage von Steffen"                                                              | Tom, Chat1 14.06 18:06 (Foto 00003079)  | ❌ offen     | D2-2014-Foto nirgends im Repo. Foto liegt im WhatsApp-Export (`chat1/00003079-…jpg`)                                                                    |

---

## 4. Abteilungen (Volleyball / Gymnastik / Ski / Schiri)

| Wunsch (Zitat)                                                                                                    | Quelle                  | Status | Beleg / Notiz                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| „**Foto der Gymnastik-/Volleyball-/Skiabteilung wird nicht dargestellt**"                                         | Tom, Chat1 28.05        | ✅     | Statische Hero-Fallbacks `public/sport/{gymnastik,volleyball,ski}-hero.jpg`, `components/.../SportSectionPage.tsx:154`                                                     |
| „Auf der Schiedsrichterseite werden **12 aktive Schiedsrichter** angegeben - stimmt das?"                         | Tom, Chat1 28.05        | ✅     | Jetzt hartcodiert „4 Aktive Schiris" `app/(frontend)/schiedsrichter/page.tsx:20`. 12 ist weg                                                                               |
| „**Ski Abteilung zum Schluß** verschieben und **entferne alle Skilehrer außer Hafner Korbinian und Tins Tobias**" | Docx 14.05              | ✅     | Ski überall zuletzt; nur Korbinian Hafner + Tobias Tins `app/(frontend)/ski/page.tsx:46-58`. (Lizenz-Tabelle auf `/sport` listet weiter alle Ski-Alpin-Lizenzen — separat) |
| „**Gymnastik Simone Roth entfernen**"                                                                             | Docx 14.05              | ✅     | Raus + auf Vorstand-Seite geblockt (`verein/vorstand/page.tsx:20` `GYMNASTIK_BLOCKED`)                                                                                     |
| „**Volleyball Ansprechpartner Elisabeth Schillinger**"                                                            | Docx 14.05              | ✅     | Genau ein Kontakt `app/(frontend)/volleyball/page.tsx:42`                                                                                                                  |
| Trainingszeiten „Mittwoch … **#Pfarrsaal# falsch — Richtig Waldmeisterschule**"                                   | Ralf, Chat1 14.05 09:49 | ⚠️     | „Pfarrsaal" nirgends mehr (gut). Aber kein sichtbarer Mittwoch-Slot; Detailzeiten in CMS-Rich-Text `team.description` → nicht statisch prüfbar                             |

---

## 5. Verein / Vorstand / Sponsoren / Social-Media-Team

| Wunsch (Zitat)                                                                                                                                                                                                                        | Quelle                  | Status | Beleg / Notiz                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| „Datenschutz Vertretung: **1. Vorstand Ralf Kirmeyer, 2. Vorstand Birgit Höfer**"                                                                                                                                                     | Docx 14.05              | ✅     | `verein/vorstand/page.tsx:8`, DSE `_content.ts:21-22`                                                                                                              |
| „**6. Vorstand: Telefon Nr entfernen**"                                                                                                                                                                                               | Docx 14.05              | ✅     | `stripPhone()` `verein/vorstand/page.tsx:90` (Telefon immer null)                                                                                                  |
| „**3. KONTAKT 0172 2392919 Telefon nr falsch entfernen**"                                                                                                                                                                             | Docx 14.05              | ✅     | Nummer nirgends im Code; Kontakt-Telefon aus CMS (Seed leer). Impressum nutzt korrekte 0172 9808109                                                                |
| „2 Sponsoren — **Premium Partner:** a+b Pertler, Ballauf & Schopp Logistic, BTU Hartmeier, Seethaler Friseure, Württembergische (Stichaner & Borowski). **Weitere Partner:** BrandSchutz Benedict Hagenbusch, SWM Stadtwerke München" | Docx 14.05              | ⚠️❓   | Fallback `lib/sponsors-fallback.ts:9-50` hat alle + **extra „Get Flashed Media GmbH"** (nicht in Wunschliste). Echtes Rendering aus CMS-Collection → live ungewiss |
| „**Team social Media:** Tobias Tins, Tobias Treffer, Dominik Besel, Andi Weiß, Marko Rakita, Tamay Piker"                                                                                                                             | Ralf, Chat1 03.06 17:38 | ✅     | Alle 6, Sektion „Social Media" `app/(frontend)/verein/page.tsx:60`                                                                                                 |
| „4. Unsere Sportarten NEU: **Übungsleiter mit Trainerlizenzen C und [B]**"                                                                                                                                                            | Docx 14.05              | ✅     | `app/(frontend)/sport/page.tsx:161` „Trainerlizenzen der C-Lizenz und höher"                                                                                       |

---

## 6. Mitgliedschaft / Mitglied werden

| Wunsch (Zitat)                                                                                                                                                     | Quelle                  | Status   | Beleg / Notiz                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| „**Anträge Mitglieder**" + 4 vereinsplaner.com-Links: `082ec8ef`, `7fba1dc8`, `33962f83`, `f7f432f8`                                                               | Ralf, Chat1 12.05 16:48 | ⚠️       | Nur **3 von 4** verlinkt `app/(frontend)/mitgliedschaft/page.tsx:13` (Jugend, Erwachsene, Familie). Fehlt `7fba1dc8-500b-4c76-89c4-40d2acaecd0b` — klären welches Formular       |
| „**Mitgliedschaft ähnlich wie svaubing.de**" + PDF „Mitglied werden Seite": 3 Schritte (Probetraining → Antrag → Bestätigung) + Sportbaum + „Kündige … zum 31.12." | Ralf 12.05 22:20 + PDF  | ✅       | 3-Schritte + Sportbaum + Kündigungshinweis `app/(frontend)/mitgliedschaft/page.tsx:178-252`                                                                                      |
| „die **‚alten' Formulare** zum Download … **sollten nicht mehr angeboten werden**, richtig?"                                                                       | Tom, Chat1 28.05        | ❌ offen | Abschnitt „Formulare & Anträge / PDF · Direkt-Download" noch da `mitgliedschaft/page.tsx:271-323`, inkl. alter WIX-PDFs (Passantrag, Einverständnis, …). Widerspricht dem Wunsch |

---

## 7. Shop

| Wunsch (Zitat)                                                                   | Quelle                  | Status   | Beleg / Notiz                                                                                 |
| -------------------------------------------------------------------------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------- |
| „Shop: **Starterpaket:** 1. Tshirt 2. kurz Hose 3. Rücksack 4. Trainingsanzug"   | Ralf, Chat1 12.05 16:58 | ✅       | Starterpaket mit genau 4 Artikeln, echter 11teamsports-Shop `app/(frontend)/shop/page.tsx:14` |
| „**Farbe blau**, wie auf der Tom Seite, also nicht zwingend SV Nord Logo Farben" | Ralf, Chat1 12.05 17:02 | ❌ offen | Nutzt Navy/Gold (Club-Palette) statt blau. Akzentfarbe-Wunsch nicht umgesetzt                 |

---

## 8. Sonstiges / Infra / Inhalte

| Wunsch (Zitat)                                                                                  | Quelle                        | Status    | Beleg / Notiz                                                                                                                     |
| ----------------------------------------------------------------------------------------------- | ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| „**Top Button**, wenn ich am Ende der Seite bin."                                               | Ralf, Chat1 12.05 16:53       | ✅        | `components/ScrollToTopButton.tsx`, global gemountet (ab 200px Scroll)                                                            |
| „**Chronik Heft importieren**" (HiDrive-Link)                                                   | Ralf, Chat2 12.05 16:29       | ✅        | Volle Chronik (Zeittafel, Vorstandschaften, Ehrentafel) `app/(frontend)/verein/chronik/`; Heft-Archiv als HiDrive-Link            |
| **U8-Fotos:** „Trainerteam U8 … U8 Löwen … U8 Tiger"                                            | Tom, Chat1 18.05 13:23        | ✅        | `public/sport/u8/{loewen,tiger,trainerteam}.jpg`, `components/fussball/U8Showcase.tsx`                                            |
| Suche vs. KI: „**Such Button aufnehmen?**" → „**Wenn Ki Assistent dann kein such Button**"      | Ralf 12.05 18:08, Felix 18:22 | ✅        | KI-Assistent `components/AiAssistant.tsx` statt Suche. Felix' Entscheidung                                                        |
| **Legal-Dokumente** gesendet: Satzung, Datenschutz, Impressum (Stand 2026_05)                   | Ralf, Chat2 12.05             | ✅        | Impressum + Datenschutz vollständig, keine `[ergänzen]`-Reste. Satzung als `/downloads/satzung-2026-05.pdf`                       |
| **Spenden-QR-Broadcast:** „Wir haben ab sofort einen QR-Code für Spenden … Teilt den QR-Code …" | Ralf, Chat2 12.05 15:39       | ❓ unklar | War Multiplikator-Aufruf, evtl. KEIN Website-Wunsch. Falls Spenden-Button/QR auf Seite gewünscht → fehlt. **Bei Ralf nachfragen** |

> **Kein Rollout-Thema (Notiz):** Ralf bot separaten bezahlten Webpflege-Auftrag eines künftigen Sponsors an (Chat2 07.06). Sohn Alexander meldet sich. Business, nicht Teil des Go-live.

---

## 9. Member-Feedback 18.06 (Chat2, Foto 00000041)

Ralf leitet Feedback eines Vereinsmitglieds weiter, Bitte um Prüfung/Umsetzung:

| Wunsch (Zitat)                                                                                                                                                                            | Status   | Beleg / Notiz                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| „1. **Tablet: Nicht genug Platz für Menüpunkte.** Evtl. kann man das **Burger Menü etwas früher anzeigen (ab ca. 1000 px)**"                                                              | ❌ offen | Burger bricht bei `md`=768px um (`components/site/SiteNav.tsx:20`, `components/site/MobileMenu.tsx:30`), soll `lg`≈1024px. 7 Nav-Items + CTA = exakt das Overflow-Szenario |
| „2. **Tablet: Die News Kacheln sind ein wenig gequetscht**"                                                                                                                               | ⚠️       | Grid `md:grid-cols-[2fr_1fr_1fr]` `components/home/NewsGrid.tsx:49` — bei ~768px die zwei Seitenkacheln eng                                                                |
| „3. … in der **Tabelle alle Teams** anzeigen und zumindest **Sieg, Unentschieden, Niederlagen** — notfalls **Tordifferenz ausblenden**. Außerdem **Tabellenelement zu groß auf desktop**" | ❌ offen | Tabellen-Layout `components/home/MatchdayBlock.tsx:315-411` nicht angepasst. Verknüpft mit Docx-Wunsch „Tabelle weg von Home → Fußball"                                    |
| „4. … die **Seite etwas langsam** lädt … **Performance optimieren** … **kleinere Bilder** verwenden."                                                                                     | ⚠️       | Kein `next/image` auf Home; `public/jugend-bg.jpg` 1.6MB, Logo 336KB, U8-Galerie 170–436KB. Lazy-load mildert, aber unoptimiert                                            |

---

## 10. Quellen, die ich NICHT einsehen kann (WICHTIG)

HiDrive-Änderungsdokumente, je neuer desto maßgeblicher. Diese enthalten Ralfs **letzte verbindliche Restliste** und sind nicht im Export enthalten:

- „Stand 2026_05_19" (Chat 19.05) — `my.hidrive.com/lnk/UrfYz1QGh`
- „Stand 2026_05_27" (27.05) — `my.hidrive.com/lnk/P2CUBBRIw`
- „Stand 2026_06_01" (01.06) — `my.hidrive.com/lnk/BCK1zKPXJ`
- **„hier die letzten Änderungen, dass bitte scharf schalten" (02.06) + 13.06 „Was noch fehlt"** — `my.hidrive.com/lnk/SPlCBi6iX`
- Chronik-Heft-Quelle — `my.hidrive.com/share/j-39fs2i9w`

**Aktion:** Inhalte von Ralf besorgen (Download/Export, besonders `SPlCBi6iX`) und gegen diese Liste gegenchecken, bevor „scharf geschaltet" wird.

---

## 11. Priorisierte TODO-Liste für den nächsten Agent

**P0 — Blocker:**

1. Hosting-Frage mit Ralf klären → DNS `svnord-lerchenau.de` auf Vercel (nicht Strato), MX/Mail nicht brechen. Danach `TODO.md` (env + Hardcoded-Fallbacks).
2. `SPlCBi6iX`-Doku besorgen + abgleichen (letzte verbindliche Liste).
3. Prod-Reseed / CMS-Pflege, danach Live-Seite verifizieren.

**P1 — klare offene Wünsche (Code, klein):** 4. Alte PDF-Antragsformulare entfernen (`mitgliedschaft/page.tsx:271-323`). — Tom 28.05 5. Tablet-Breakpoint `md`→`lg` (`SiteNav.tsx`, `MobileMenu.tsx`, CTA in `HeaderShell.tsx`). — Feedback 18.06 6. 4. Online-Formular ergänzen (`7fba1dc8-…`) oder klären. — Ralf 12.05 7. Bezirksliga-Tabelle von Home auf `/fussball` verschieben + Tabelle: alle Teams + S/U/N, Desktop kompakter. — Docx + Feedback 18.06 8. Startseiten-H1 / voller Vereinsname „SV NORD MÜNCHEN-LERCHENAU e. V." prüfen. — Docx 14.05

**P2 — Entscheidungen / Daten nötig (mit Ralf/Felix klären):** 9. Hero-Bilderlauf umsetzen? (Bild-Set nötig) — Ralf 12.05 10. Echter IG-Feed statt Clone, oder Clone akzeptiert? Fake-Zahlen (509 etc.) anpassen. — Ralf 12.05 11. Shop-Akzentfarbe blau. — Ralf 12.05 12. Jugend-Jahrgänge + Team-Trainer im CMS pflegen. — Ralf 12.05 13. D2-2014-Mannschaftsfoto einbauen (liegt in `chat1/00003079-…jpg`). — Tom 14.06 14. Spenden-QR auf Seite gewünscht? — Ralf 12.05

**P3 — Polish:** 15. Bild-Optimierung Home (`next/image`, `jugend-bg.jpg` verkleinern). — Feedback 18.06 16. Eyebrow-Nummerierung Home neu sequenzieren (01,02,04,03,06 → fortlaufend). 17. Volleyball Mittwoch-Trainingszeit (Waldmeisterschule) im CMS prüfen. 18. Sponsor „Get Flashed Media" prüfen (nicht in Docx-Liste).

---

## 12. Schon erledigt (Kurzliste zur Beruhigung)

Stats 630+/25+/26 · eSport-Schreibweise · U13/U12-Spielklasse (Seed) · Anstoßzeiten (kein End-Bug) · Schiri 12→4 · Hero-Fotos Gymnastik/Volleyball/Ski · Elisabeth Schillinger / Simone Roth raus · Ski ans Ende + nur Hafner/Tins · Vorstand ohne Telefon + Birgit Höfer · Mitglied-werden 3-Schritte + Sportbaum · Social-Media-Team · Scroll-to-top · KI-Assistent statt Suche · Chronik · U8-Fotos · Kontakt-Telefon raus · Impressum + Datenschutz vollständig · Trainerlizenzen C/B · Kapitel 04/05/07 von Home entfernt · Aktuelles nach Wochenplan.
