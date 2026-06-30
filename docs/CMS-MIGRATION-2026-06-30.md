# CMS-Aktivierung & Inhalts-Migration — Vollbericht

**Datum:** 2026-06-30
**Branch:** `feat/cms-customer-editable`
**Umfang:** 27 Dateien geändert, 12 neu (~3800+ Zeilen netto)
**Status:** Code fertig, lokal end-to-end getestet (tsc/lint/prettier/Tests grün, 28 Seiten smoke-getestet, CMS-Read per Marker-Tests bestätigt). **Prod-Aktivierung steht aus** (Ops-Schritte siehe Abschnitt 9).

Begleitdokumente:

- **`docs/CMS-BETRIEB.md`** — Betriebs-/Aktivierungs-Runbook (die Ops-Schritte im Detail).
- **`docs/STORAGE-DB-PLAN.md`** — Speicher-/DB-Strategie (Historie).
- **`OFFENE-PUNKTE.md`** — Go-Live-Checkliste.

---

## 1. TL;DR

Das Payload-CMS war faktisch **Display-only**: Bild-Uploads waren in Produktion tot, jeder Login war Voll-Admin, mehrere Eingabefelder wurden still verschluckt, und ~2/3 der Seiteninhalte waren im React-Code fest verdrahtet (nicht editierbar). Dieser Stand macht die Seite **vom Verein ohne Entwickler pflegbar**:

- Bild-Upload repariert (Vercel Blob), sichere **Redakteur-Rolle**, DB-Schutzschienen.
- Zwei „lügende" Felder gefixt (`Events.description`, Kennzahlen-Leiste).
- **9 neue Seiten-Globals** + Startseiten-Blöcke + 5 Sportarten-Seiten + Termine in die DB migriert — alles **regressionsfrei** (CMS-Wert mit Hardcode-Fallback, aktuelle Werte vorbefüllt).

Globals: **9 → 18**. Alles getestet.

---

## 2. Ausgangslage (das Problem)

Aus dem Recon-Audit (8 parallele Lese-Agenten über alle Subsysteme):

| Subsystem       | Befund                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bild-Upload** | RED. Kein Storage-Adapter (`plugins: []`); Media schrieb auf lokale Platte. Vercel-Serverless-FS ist flüchtig/readonly → Admin-Uploads scheitern still. |
| **Bild-Render** | RED. `mediaSrc` bevorzugte committete `/public`-Datei und verdrängte sogar einen echten Upload (Namens-Kollision).                                      |
| **Rollen**      | YELLOW. Keine Rollen — jeder Login = Voll-Admin. Jeder Redakteur konnte Konten löschen (Lock-out), PII der Kontaktanfragen löschen, Rollen vergeben.    |
| **DB/Neon**     | RED. Keine Migrations-Dateien; Schema nur via Drizzle-Dev-Push. `.env.local.*` zeigen auf dieselbe Prod-Neon → versehentlicher Prod-Push möglich.       |
| **Collections** | RED. `Events.description` (richText) wurde auf `/termine` nie gerendert (Code prüfte `typeof === "string"`).                                            |
| **Globals**     | YELLOW. `HomePage.stats` existierte, war aber versteckt + unverdrahtet + mit veralteten Werten (500+/13 statt 630+/26).                                 |
| **Hardcoded**   | RED. ~25 Inhaltsblöcke fest im Code (Sportseiten, SportsGrid, Hero-Bilder, /sport-Tabelle, Mitgliedschaft, Verein, Sponsoren-Texte, Fußball, …).        |
| **Propagation** | YELLOW (gut). Alle Seiten `force-dynamic` → CMS-Änderungen erscheinen sofort. Revalidate-System vorhanden (latent).                                     |
| **Build**       | tsc/eslint grün; prettier nur an Nicht-App-Artefakten rot.                                                                                              |

---

## 3. Ziel

> „Mache das CMS komplett funktional … man sollte alles editieren können … die komplette Webseite ohne Developer steuerbar für den Kunden."

Konkret: Uploads müssen funktionieren, mehrere sichere Logins, nichts darf still verschluckt werden, und die Inhalts-Pflege muss ohne Code-Änderung möglich sein — **ohne** die kurz vor dem Launch stehende Live-Seite zu regressieren.

---

## 4. Vorgehen / Methodik

1. **Recon (Workflow, 8 Agenten parallel, read-only):** vollständige Bestandsaufnahme (Editierbarkeits-Matrix, Hardcoded-Backlog, DB-Health, Media-Pipeline, Rollen, Propagation, Build-Baseline).
2. **Fundament selbst umgesetzt + lokal getestet:** Storage, Rollen, DB-Schienen, die zwei Bug-Fixes.
3. **Inhalts-Migration in zwei Worktree-Agenten-Batches (9 Agenten):** je ein Agent migriert eine Seite isoliert in einem eigenen Git-Worktree, verifiziert selbst `tsc`, und liefert die neuen Dateien + die Snippets für die drei geteilten Dateien (`payload.config.ts`, `payload-types.ts`, `scripts/seed.ts`). Integration zentral durch mich (Splice + zentraler `tsc` + Reseed + Marker-Test).
4. **Startseiten-Blöcke + Termine selbst** (teilen sich `HomePage`/Collections → kein Agent).
5. **Verifikation:** nach jedem Schritt `bunx tsc --noEmit`, Reseed gegen lokale Postgres, Dev-Server-Boot, Smoke-Test, und **Marker-Tests** (distinkten Wert in die DB schreiben, Seite curlen, prüfen dass er erscheint → beweist CMS-Read statt Fallback).

---

## 5. Was wurde gemacht — im Detail

### A. Bild-Upload reparieren (Storage)

- **Was:** Vercel-Blob-Adapter wieder aktiviert.
- **Warum:** Ohne durablen Storage kann der Verein keine Bilder hochladen (Serverless-FS flüchtig).
- **Wie:** `payload.config.ts` → `vercelBlobStorage({ enabled: Boolean(BLOB_READ_WRITE_TOKEN), collections: { media: true }, token, alwaysInsertFields: true })`.
  - `enabled` an den Token gekoppelt: lokal (kein Token) fällt Payload auf lokale Platte zurück; Prod (Token) nutzt Blob.
  - `alwaysInsertFields: true` (der Payload-v4-Default) hält Schema **und** Admin-ImportMap **identisch** mit/ohne Token → kein Umgebungs-Drift.
- **Render-Fix:** `lib/publicUploads.ts` → `mediaSrc` mit Schalter `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA`.
  - **Aus (Default):** committete `/public`-Datei gewinnt → regressionsfrei, egal welche (evtl. veraltete) URL ein Prod-Media-Doc gerade trägt.
  - **An (nach Prod-Reseed gegen Live-Blob):** hochgeladene/ersetzte Bilder gewinnen → der Verein kann jedes Bild im Admin tauschen.
  - Schalter **entkoppelt** die riskante Vorrang-Umkehr von der Deploy-Reihenfolge.
- `next.config.ts`: `*.public.blob.vercel-storage.com` zu `images.remotePatterns` (falls `next/image` Blob-URLs nutzt).
- `app/(payload)/admin/importMap.js`: `VercelBlobClientUploadHandler` registriert (Client-Direct-Upload, umgeht Vercel-Limits) — passt zu `alwaysInsertFields`.

### B. Sichere Redakteur-Rolle

- **Was:** Rollenmodell `admin` vs `editor`.
- **Warum:** Vorher konnte jeder Login Konten/PII löschen → der Verein soll Inhalte pflegen, ohne destruktive Rechte.
- **Wie:**
  - `payload/access/isAdmin.ts` (neu): `isAdmin`, `isAdminFieldLevel`, `isAdminOrSelf`.
  - `Users.ts`: Feld `role` (select, `saveToJWT`, feld-level via `isAdminFieldLevel` gesperrt → Editor kann sich nicht selbst befördern). Access: create/delete = `isAdmin`, read/update = `isAdminOrSelf`, admin-Panel = jeder Login.
  - `Submissions.ts`: delete = `isAdmin` (PII-Schutz), read/update = authenticated (Verein beantwortet Anfragen).
  - `scripts/seed.ts` `ensureAdminUser`: hebt bestehendes `admin@svnord.de` automatisch auf `role=admin` — verhindert Lock-out, wenn die neue Spalte bestehende Zeilen mit Default `editor` befüllt.

### C. DB-Schutzschienen

- **Was:** zwei Fail-fast-/Guard-Mechanismen.
- **Warum:** `.env.local` wird bekanntlich auf die Prod-Neon geklobbert; ein versehentlicher Dev-Push/Seed alteriert das Prod-Schema.
- **Wie:**
  - `payload.config.ts`: wirft auf Vercel, wenn `DATABASE_URI` fehlt (statt still auf localhost zu fallen).
  - `scripts/seed.ts` `assertSeedTargetIsAllowed()`: verweigert einen Neon-Connection-String, außer `ALLOW_PROD_SEED=true` ist gesetzt.

### D. „Lügende" Felder gefixt

- **`Events.description`:** war richText, wurde aber als `typeof === "string"` gelesen → immer verworfen. Neu: `lib/lexical.ts` `lexicalToText()` (über `@payloadcms/richtext-lexical/plaintext`) rendert den richText als Text auf `/termine`. Feld-Hinweis „nicht sichtbar" entfernt.
- **Kennzahlen-Leiste (`StatStrip`):** war fest verdrahtet, das CMS-Feld `HomePage.stats` war versteckt + unverdrahtet + veraltet. Neu: `stats` (mit `sub`-Feld) verdrahtet, korrekte Werte (630+/25+/26) als Default + Seed, Hardcode-Fallback bleibt.

### E. Inhalts-Migration (das große Stück)

Muster für jeden Block: **CMS-Feld mit `defaultValue` = aktueller Hardcode-Wert** + Frontend liest `cms.feld ?? HARDCODE_KONSTANTE` (Konstante bleibt im Code) + **Seed** mit dem aktuellen Wert. Ergebnis: Seite rendert identisch, solange ein Feld leer ist → **null Regression**, aber alles editierbar.

| Bereich                                        | Wo editierbar                       | Mechanik                                                                           |
| ---------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| 5 Sportarten-Seiten (Gym/Vb/Ski/eSport/Schiri) | `Teams → Sportarten-Seite (Inhalt)` | neue `Teams.sportPage`-Gruppe; `SportSectionPage` liest `team.sportPage.* ?? prop` |
| Startseite Kachel-Block (6 Sportarten)         | `Startseite → Sportarten-Übersicht` | `HomePage.sportsSection`; `SportsGrid` liest CMS, Theme/Icon bleibt Code           |
| Startseite Hero-Bilderlauf                     | `Startseite → Hero-Bilderlauf`      | `HomePage.heroSlides` (Upload-Array); leer = Standardfotos                         |
| Mitgliedschaft                                 | Global `mitgliedschaft-page`        | Vorteile, Online-Anträge, Beiträge, Ablauf, Sportarten-Baum                        |
| Verein-Landing                                 | Global `verein-page`                | Kennzahlen, Feature-Karten, Social-Team, CTA                                       |
| Sponsoren-Seitentexte                          | Global `sponsoren-page`             | Erzähltext, Angebot, Spende/QR (Sponsor-Logos bleiben in der Collection)           |
| Kinder-/Jugendschutz                           | Global `jugendschutz-page`          | alle Texte, Ansprechpartner, BFV-Link                                              |
| Shop-Texte                                     | Global `shop-page`                  | Intro, Starter-Pack-Slots (11teamsports-Links bleiben extern)                      |
| Sport-Übersicht (`/sport`)                     | Global `sport-overview-page`        | Intro, Karten, Trainer-Lizenz-Tabelle (~28)                                        |
| Fußball-Hauptseite                             | Global `fussball-page`              | Intro, sportliche Leitung, 5 Säulen (Live-Tabellen bleiben FuPa/BFV)               |
| Fußball-Kategorien (Herren/Jun/Junin/Bambini)  | Global `fussball-categories`        | per-Kategorie Texte + Leitungslisten; `CategoryPage` liest nach Slug               |
| Vorstand-Seitentexte                           | Global `vorstand-page`              | Intro/Headings/CTA (Personen-Listen + Filter bleiben Code/Collection)              |
| Termine                                        | Collection `Termine`                | Sommerfest + Betreuer-Essen sind jetzt echte Datensätze (Static-Block entfernt)    |

---

## 6. Architektur-Entscheidungen (mit Begründung)

1. **Vercel Blob statt Cloudflare R2:** Paket schon installiert, Ein-Klick im Vercel-Konsole, gleiche Plattform → geringste Ops-Reibung für den Verein. R2 (`@payloadcms/storage-s3`, kein Egress) als Alternative dokumentiert.
2. **Etablierten Dev-Push-Workflow behalten statt versionierte Migrations:** das Prod-Schema wurde push-gebootstrappt (keine Migrations-Historie); ein Baseline-Migrations-Adoption blind gegen eine Live-DB ohne direkten DB-Zugriff ist zu riskant kurz vor Launch. Stattdessen: **additive** Feldänderungen + Schutzschienen + dokumentierte Reihenfolge. Versionierte Migrations als empfohlenes Hardening dokumentiert.
3. **Regressionssicheres Wiring-Muster (`cms ?? HARDCODE`):** garantiert identisches Rendering, solange CMS leer/ungeseedet ist. Macht die Massen-Migration kurz vor Launch sicher.
4. **`alwaysInsertFields: true`:** hält Schema + ImportMap über Umgebungen konsistent (kein „lokal kein Feld, Prod schon").
5. **`NEXT_PUBLIC_PREFER_UPLOADED_MEDIA`-Schalter:** entkoppelt die Bild-Vorrang-Umkehr von der Deploy-Reihenfolge → kein Regressions-Fenster.
6. **Worktree-Agenten + zentrale Snippet-Integration:** maximale Parallelität ohne Datei-Konflikte; jeder Agent verifiziert `tsc` isoliert, ich integriere additiv und teste zentral.

---

## 7. Test-Nachweis

- `bunx tsc --noEmit` — sauber.
- `bun run lint` — 0 Fehler (1 Warnung in `.remember/tmp`-Scratch, nicht im Quellcode).
- `bunx prettier --check` — sauber.
- `bun run test` — 9/9 grün.
- **28 Seiten** lokal smoke-getestet → alle 200, keine Runtime-Fehler.
- **Marker-Tests** (distinkter DB-Wert → erscheint auf der Seite) bestätigt für: StatStrip, SportsGrid, Sportarten-Seiten, `/mitgliedschaft`, `/fussball/junioren`, `/verein/vorstand`. → beweist echtes CMS-Read, nicht nur Fallback.
- Seed läuft idempotent gegen lokale Postgres; neue Tabellen/Spalten korrekt gepusht.

---

## 8. Geänderte / neue Dateien

**Neu (12):**

```
docs/CMS-BETRIEB.md                          docs/CMS-MIGRATION-2026-06-30.md (dieses)
lib/lexical.ts                               payload/access/isAdmin.ts
payload/globals/MitgliedschaftPage.ts        payload/globals/VereinPage.ts
payload/globals/SponsorenPage.ts             payload/globals/JugendschutzPage.ts
payload/globals/ShopPage.ts                  payload/globals/SportOverviewPage.ts
payload/globals/FussballPage.ts              payload/globals/FussballCategoriesPage.ts
payload/globals/VorstandPage.ts
```

**Geändert (27):** `payload.config.ts`, `payload-types.ts`, `scripts/seed.ts`, `next.config.ts`, `.env.example`, `app/(payload)/admin/importMap.js`, `lib/publicUploads.ts`, `payload/collections/{Users,Submissions,Events,Teams}.ts`, `payload/globals/HomePage.ts`, `components/SportSectionPage.tsx`, `components/fussball/CategoryPage.tsx`, `components/home/{Hero,SportsGrid,StatStrip}.tsx`, `app/(frontend)/{page, termine/page, mitgliedschaft/page, verein/page, verein/vorstand/page, verein/jugendschutz/page, sponsoren/page, shop/page, sport/page, fussball/page}.tsx`, `docs/STORAGE-DB-PLAN.md`.

**Neue DB-Spalten/Tabellen (additiv):** `users.role`, `media.prefix` (+ Blob-`sizes`-URLs), `home_page.stats.sub`, `home_page.sports_section.*`, `home_page.hero_slides`, `teams.sport_page_*`, sowie die Tabellen der 9 neuen Globals (`mitgliedschaft_page*`, `verein_page*`, `sponsoren_page*`, `jugendschutz_page*`, `shop_page*`, `sport_overview_page*`, `fussball_page*`, `fussball_categories*`, `vorstand_page*`).

---

## 9. Was noch gemacht werden muss

### 9a. Pflicht — Prod-Aktivierung (nur Konsole, kann der Code nicht selbst)

> **Reihenfolge ist wichtig: Schema-Push (Prod-Reseed) MUSS vor dem Code-Deploy laufen.** Die neuen Spalten sind additiv/rückwärtskompatibel, also läuft die alte Prod-Seite nach dem Push weiter; dann Code mergen.

1. **Prod-Reseed** (pusht Schema + setzt Admin-Rolle + seedet die Inhalte):
   ```bash
   ALLOW_PROD_SEED=true \
   PAYLOAD_ADMIN_PASSWORD='<aus CREDENTIALS.local.md>' \
   bun --env-file=.env.local.production scripts/seed.ts
   ```
2. **Vercel Blob** verbinden (Storage-Tab) → setzt `BLOB_READ_WRITE_TOKEN`. Danach einmal mit Token reseeden (Bilder → Blob), dann `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA=true` setzen + Redeploy.
3. **Resend** für Kontakt-Mails (`RESEND_API_KEY` + Domain `svnord.de` SPF/DKIM verifizieren).
4. **Redakteur-Konten** im Admin anlegen (Rolle „Redakteur").

Vollständig in `docs/CMS-BETRIEB.md` (inkl. Env-Tabelle, Klick-für-Klick).

### 9b. Bewusst zurückgestellt (begründet — Muster steht in §5/§6 von CMS-BETRIEB.md)

| Item                                                | Warum zurückgestellt                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Impressum / Datenschutz**                         | Rechtlich sensibel. Der Global `legal-pages` existiert + ist im Admin editierbar; das Frontend rendert aber ein **designtes** strukturiertes `_content.ts` (kv-Tabellen, Callouts, Icons). Naives Verdrahten = optischer Downgrade. Sauber: strukturiertes Schema migrieren **und** Text 1:1 abgleichen. |
| **Chronik-Erzähltext**                              | Eigene Erzähl-/Timeline-/Ehrentafel-Komponente, ~0 Änderungsfrequenz (Vereinsgeschichte). Hoher Umbau, geringer Nutzen.                                                                                                                                                                                  |
| **Instagram-Teaser**                                | Halb-extern (echte Inhalte auf Instagram), 900 Zeilen Embed-Logik. Niedriger Nutzen.                                                                                                                                                                                                                     |
| **SEO-Strukturdaten** (`SiteSchema` JSON-LD)        | Technisches JSON-LD; der Verein editiert das praktisch nie. Würde eine große SiteSettings-Erweiterung erfordern.                                                                                                                                                                                         |
| **Footer-Credit / PageHero-Intros / BFV-Formulare** | Boilerplate / Entwickler-Attribution / externe Links — sehr selten geändert.                                                                                                                                                                                                                             |

Empfohlene Reihenfolge fürs Nachziehen: **Legal** (Compliance-relevant, sauber mit strukturiertem Schema) → Rest nach Bedarf.

### 9c. Bekannte technische Punkte

- **`payload generate:types` / `generate:importmap` CLI schlägt fehl** (Node-24 + tsx kann die erweiterungslosen `./payload/collections/*`-Imports nicht auflösen). `next build`/withPayload ist davon **nicht** betroffen. Folge: `payload-types.ts` wird vorerst von Hand gepflegt. **Empfehlung:** CLI-Loader fixen (z. B. tsx-Config/Node-Version) oder Imports auf `.js`-Endungen umstellen, damit Typgen wieder automatisch läuft.
- **Versionierte Migrations** statt Dev-Push als Prod-Hardening einführen (Baseline der bestehenden Push-DB nötig — nur mit direktem Neon-Zugriff sauber machbar).

---

## 10. Risiken / Watch-outs

1. **Seed = autoritativ:** der Seed überschreibt die gesetzten Global-Felder bei jedem Lauf (außer `seedSportPages`, das nur leere Felder füllt). Editiert der Verein ein geseedetes Feld und es wird reseedet, wird es zurückgesetzt. Reseed ist eine bewusste, seltene Aktion (Go-Live + Schemaänderungen).
2. **Deploy-Reihenfolge:** Code, der neue Spalten referenziert, **muss** ein Prod-Schema mit diesen Spalten vorfinden → erst reseeden, dann deployen (§9a).
3. **`NEXT_PUBLIC_PREFER_UPLOADED_MEDIA` erst nach Blob-Reseed** auf `true` — sonst können leere/alte URLs committete Bilder verdrängen.
4. **`.env.local` nie auf Neon** zeigen lassen für Dev/Seed (Schutzschiene greift, aber Vorsicht).

---

## 11. Empfehlung

Diesen Branch reviewen → Prod-Reseed (§9a Schritt 1) → Blob + Resend einrichten → mergen → durchklicken (Sicht-Check in `OFFENE-PUNKTE.md`). Danach Redakteur-Konten anlegen und den Verein die Inhalte selbst pflegen lassen. Legal-Seiten als nächstes sauber nachziehen.
