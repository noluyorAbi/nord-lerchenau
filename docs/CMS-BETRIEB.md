# CMS aktiv schalten & betreiben — Runbook

Stand: 2026-06-30. Dieses Dokument beschreibt, wie das Payload-CMS von „nur der
Entwickler pflegt" auf „der Verein pflegt selbst" umgestellt wird, was dafür
einmalig in Vercel/Neon/Resend zu tun ist, und in welcher Reihenfolge.

Begleitend: `OFFENE-PUNKTE.md` (Go-Live-Checkliste), `docs/STORAGE-DB-PLAN.md`
(Speicher-Strategie), `payload.config.ts`, `scripts/seed.ts`.

---

## 1. Was sich im Code geändert hat (dieser Stand)

| Bereich           | Vorher                                               | Jetzt                                                                                     |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Bild-Upload       | tot in Prod (kein Speicher, `plugins: []`)           | Vercel-Blob-Adapter, aktiv sobald `BLOB_READ_WRITE_TOKEN` gesetzt ist                     |
| Bild-Auflösung    | committete `/public`-Datei gewann immer              | `mediaSrc` mit Schalter `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA` (Upload gewinnt nach Umstieg) |
| Rollen            | jeder Login = Voll-Admin                             | Rolle `admin` vs `editor` (Redakteur), Konten-Verwaltung nur für Admins                   |
| DB-Sicherheit     | `DATABASE_URI` leer → stilles localhost; Seed → Prod | Fail-fast auf Vercel; Seed verweigert Prod ohne `ALLOW_PROD_SEED=true`                    |
| Termine           | `Events.description` wurde nie angezeigt             | richText wird als Text auf `/termine` gerendert                                           |
| Kennzahlen-Leiste | `StatStrip` fest verdrahtet (630+/25+/26)            | liest `HomePage.stats` (mit denselben Werten als Default/Fallback)                        |

Neue DB-Spalten durch diesen Stand: `users.role`, `media.prefix` (+ `sizes`-URLs
vom Blob-Adapter), `home_page_stats.sub`, die `teams.sport_page_*`-Felder (Intro,
Pills, Stats, Highlights, CTA, Kontakte). **Alle additiv** (rückwärtskompatibel),
werden vom Prod-Reseed (Abschnitt 2) gepusht.

---

## 2. Aktivierungs-Reihenfolge (WICHTIG)

Es gibt **keine Migrations-Dateien**; das Prod-Schema wird per Drizzle-Push über
den Seed-Befehl aktualisiert (etablierter Workflow). Additive Spalten sind
rückwärtskompatibel — die alte laufende Seite ignoriert neue Spalten. Deshalb gilt:

> **Schema-Push (Prod-Reseed) MUSS vor dem Code-Deploy laufen.**

### Schritt-für-Schritt

1. **Branch lokal auschecken** (dieser Stand) und auf Prod-Neon zeigen lassen.
   Auf `.env.local.production` achten (zeigt auf die Prod-Neon-DB).

2. **Prod-Reseed** (pusht die neuen Spalten + setzt Admin-Rolle + Kennzahlen):

   ```bash
   ALLOW_PROD_SEED=true \
   PAYLOAD_ADMIN_PASSWORD='<das echte Admin-Passwort aus CREDENTIALS.local.md>' \
   bun --env-file=.env.local.production scripts/seed.ts
   ```

   - Ohne `ALLOW_PROD_SEED=true` bricht der Seed bewusst ab (Schutz vor
     versehentlichem Prod-Push, falls `.env.local` auf Neon zeigt).
   - Der Seed ist idempotent (löscht nichts). Er hebt das bestehende
     `admin@svnord.de` automatisch wieder auf `role=admin` (sonst Lock-out-Gefahr,
     weil neue Spalten mit Default `editor` befüllt werden).

3. **Alte Prod-Seite prüfen** — sie läuft noch mit altem Code, muss weiter gehen
   (additive Spalten stören nicht).

4. **Code mergen → Vercel deployt.** Jetzt passt Schema zu Code.

5. **Funktion prüfen:** `/admin` Login, Startseite (Kennzahlen), `/termine`.

---

## 3. Vercel/Neon/Resend — einmalige Ops

### 3a. Bild-Upload aktivieren (Vercel Blob)

1. Vercel → Projekt `nord-lerchenau` → Tab **Storage** → **Create/Connect Store**
   → **Blob** → anlegen, mit dem Projekt verbinden. Vercel setzt automatisch
   `BLOB_READ_WRITE_TOKEN` in die Prod-Env.
2. **Redeploy** (oder kleiner Commit). Der Blob-Adapter aktiviert sich, sobald der
   Token da ist (`enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN)`).
3. **Bilder in Blob spiegeln:** einmal mit gesetztem Token reseeden, damit alle
   Seed-Bilder in den neuen Blob-Store wandern und frische URLs bekommen:

   ```bash
   ALLOW_PROD_SEED=true PAYLOAD_ADMIN_PASSWORD='…' \
   BLOB_READ_WRITE_TOKEN='<prod-token>' \
   bun --env-file=.env.local.production scripts/seed.ts
   ```

4. **Upload-Vorrang einschalten:** in der Vercel-Prod-Env
   `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA=true` setzen, dann Redeploy. Ab jetzt
   gewinnen im Admin hochgeladene/ersetzte Bilder über die committeten
   `/public`-Dateien. (Vorher aus lassen — sonst könnten alte/leere URLs
   committete Bilder verdrängen.)

> Alternative ohne Vercel-Bindung: statt Vercel Blob `@payloadcms/storage-s3` auf
> Cloudflare R2 (S3-kompatibel, keine Egress-Kosten). Dann den Adapter in
> `payload.config.ts` tauschen. Für „ein Klick im Vercel-Konsole" ist Blob
> einfacher.

### 3b. Kontaktformular-Mails (Resend)

`RESEND_API_KEY` in Vercel-Prod setzen, Domain `svnord.de` verifizieren (SPF/DKIM),
`RESEND_FROM_EMAIL`/`RESEND_TO_EMAIL` = `info@svnord.de`. Ohne Key werden
Anfragen weiter unter „Kontaktanfragen" gespeichert, aber nicht gemailt.

### 3c. Env-Variablen-Übersicht (Prod)

| Variable                            | Zweck                                          | Wert                          |
| ----------------------------------- | ---------------------------------------------- | ----------------------------- |
| `DATABASE_URI`                      | Neon Postgres (Pooler)                         | gesetzt                       |
| `PAYLOAD_SECRET`                    | JWT-Secret (Fail-fast wenn leer)               | gesetzt                       |
| `NEXT_PUBLIC_SERVER_URL`            | öffentliche URL                                | `https://svnord-lerchenau.de` |
| `BLOB_READ_WRITE_TOKEN`             | aktiviert Bild-Upload                          | von Vercel Blob               |
| `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA` | Upload-Bilder gewinnen                         | `true` (nach Reseed)          |
| `REVALIDATE_SECRET`                 | (Seiten sind force-dynamic, optional)          | beliebig                      |
| `RESEND_API_KEY`                    | Kontakt-Mails                                  | von Resend                    |
| `ALLOW_PROD_SEED`                   | nur temporär beim bewussten Prod-Reseed setzen | sonst ungesetzt               |

---

## 4. Redakteur-Konten für den Verein

Damit der Verein pflegt, ohne Konten löschen/anlegen oder die Seite kaputt machen
zu können:

1. Als Admin in `/admin` → **System → Konten → Neu**.
2. E-Mail + Passwort vergeben, **Rolle = „Redakteur (nur Inhalte)"**.
3. Redakteure können: News, Termine, Sponsoren, Personen/Vorstand, Mannschaften,
   Kontaktinfos, FAQ, Startseiten-Texte/Kennzahlen, Bilder hochladen.
   Redakteure können **nicht**: Konten anlegen/löschen, fremde Konten sehen,
   Kontaktanfragen löschen, Rollen ändern.
4. Jede Person bekommt ein eigenes Konto (Nachvollziehbarkeit, Passwort-Rotation
   pro Person statt einem geteilten Admin-Login).

---

## 5. Was ist jetzt über das CMS editierbar

Voll editierbar (Collections/Globals, Änderungen sofort live dank force-dynamic):

- **News/Beiträge**, **Termine** (inkl. Beschreibung), **Sponsoren**,
  **Personen/Vorstand**, **Mannschaften** (Kader/Trainer), **Kontaktinfos**
  (Adresse/Zeiten/Karte), **FAQ**, **Vereinsheim**, **Jugendförderverein**.
- **Startseite:** Hero-Texte, Hero-Bilderlauf (Foto-Upload), Kennzahlen-Leiste,
  Sportarten-Kachel-Block (6 Kacheln: Texte/Schlagwörter/Zahlen), Sektionen
  ein-/ausblenden.
- **Sportarten-Seiten** (Gymnastik/Volleyball/Ski/eSport/Schiri): Intro,
  Schlagwörter, Infobox, Highlight-Karten, CTA, Ansprechpartner — in `Teams →
Sportarten-Seite (Inhalt)`.
- **Eigene Seiten-Globals (5. Seiten):** Mitgliedschaft (Vorteile/Anträge/
  Beiträge/Ablauf/Sportarten-Baum), Verein-Landing, Sponsoren-Seitentexte,
  Kinder-/Jugendschutz, Shop-Texte, Sport-Übersicht (inkl. Trainer-Lizenz-
  Tabelle), Fußball-Hauptseite (Intro/Leitung/Säulen).
- **Termine:** Sommerfest + Betreuer-Essen sind jetzt echte Termin-Datensätze
  (editierbar wie jeder Termin, kein Hardcode mehr).
- **Bilder:** Upload im Admin (nach Blob-Aktivierung).

---

## 6. Noch fest im Code (Backlog, bewusst gestaffelt)

Diese Inhalte sind weiterhin im Code (niedrige Änderungsfrequenz oder
Regressions-Risiko vor dem Launch). Migrations-Muster siehe unten.

Schon migriert (dieser Stand, alle regressionsfrei mit Code-Fallback): 5
Sportarten-Seiten, Startseiten-Kachelblock + Hero-Bilderlauf, sowie eigene
Globals für Mitgliedschaft, Verein, Sponsoren, Jugendschutz, Shop, Sport-
Übersicht und Fußball-Hauptseite; Termine vollständig über die Termin-Collection.

Bewusst (noch) NICHT migriert, mit Begründung:

- **Impressum / Datenschutz** — der CMS-Global `legal-pages` existiert und ist mit
  dem echten Rechtstext befüllt; das Frontend rendert aber noch eine strukturierte
  Hardcode-Variante (`_content.ts`) mit Inhaltsverzeichnis. Verdrahtung ist
  möglich (Global-richText statt `_content` rendern), aber **rechtlich sensibel**:
  vorher Text 1:1 abgleichen und ggf. den Seed aus `_content` aktualisieren.
- **Chronik-Erzähltext** — eigene Erzähl-/Timeline-/Ehrentafel-Komponente, sehr
  niedrige Änderungsfrequenz (Vereinsgeschichte). Hoher Umbau, geringer Nutzen.
- **Instagram-Teaser** (Galerie/Bio/Handles) — halb-extern (echte Inhalte liegen
  auf Instagram), 900 Zeilen Embed-Logik. Niedriger Nutzen.
- **SEO-Strukturdaten** (`SiteSchema` JSON-LD) + **Footer-Credit** — technisch
  bzw. Entwickler-Attribution, ändert der Verein praktisch nie.
- **PageHero-Intro-Ledes** (pro Route) und **BFV-Formulare-Liste** (externe Links)
  — verstreute, sehr selten geänderte Boilerplate.

### Sicheres Migrations-Muster (regressionsfrei)

Für jeden Block:

1. CMS-Feld in der passenden Global/Collection anlegen, `defaultValue` = **exakt
   der aktuelle Hardcode-Wert**.
2. Frontend liest CMS mit Fallback: `const x = cms.feld ?? HARDCODE_KONSTANTE`.
3. Seed-Eintrag mit dem aktuellen Wert (damit der Prod-Reseed den Wert setzt).
4. `payload-types.ts` von Hand nachziehen (CLI-Typgen unten) + `bunx tsc --noEmit`.
5. Lokal testen, dann mit Schema-Push-vor-Deploy ausrollen (Abschnitt 2).

> Hinweis Typgen/ImportMap: `payload generate:types` schlägt aktuell fehl
> (Node-24/tsx-Auflösung der erweiterungslosen `.ts`-Imports). Bis das behoben
> ist, `payload-types.ts` von Hand pflegen. Der Blob-Adapter braucht keinen
> ImportMap-Eintrag (kein Admin-Client-Component).
