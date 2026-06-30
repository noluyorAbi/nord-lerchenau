# Storage & Datenbank — Ist-Zustand und Plan

Stand: 2026-06-30. Kontext: CMS ist noch nicht in Betrieb, Inhalte und Bilder
pflegt aktuell ausschliesslich der Entwickler (kein Admin-Upload durch den Verein).

## 1. Was gerade laeuft (Ist-Zustand)

| Baustein     | Was es ist                                   | Provider / Paket                       | Kosten heute       |
| ------------ | -------------------------------------------- | -------------------------------------- | ------------------ |
| Datenbank    | Serverless **PostgreSQL**                    | **Neon** (AWS Frankfurt), `@payloadcms/db-postgres` | Free-Tier, 0 EUR   |
| Bild-Storage | **Vercel Blob**                              | `@payloadcms/storage-vercel-blob`      | Free-Tier, 0 EUR   |
| CMS          | **Payload CMS 3** (Admin unter `/admin`)     | im Next.js-Projekt integriert          | inklusive          |
| Hosting      | Vercel (Projekt `nord-lerchenau`)            | Vercel                                 | Free/Hobby         |

- Die Datenbank (Neon) ist die Quelle fuer Mannschaften, Personen, Sponsoren, News.
  Payload schreibt/liest dort. **Ohne DB laeuft die Seite aktuell nicht** (jede Seite
  fragt Payload ab).
- Vercel Blob speichert hochgeladene Bilder. Das Plugin ist **nur aktiv, wenn
  `BLOB_READ_WRITE_TOKEN` gesetzt ist** (payload.config.ts).

## 2. Brauchen wir Vercel Blob? — Nein (bei "alles ueber mich")

Vercel-Funktionen haben ein **fluechtiges, schreibgeschuetztes Dateisystem** zur
Laufzeit. Payload-Uploads auf die lokale Platte funktionieren in Produktion deshalb
nicht (Uploads schlagen fehl, generierte Bildgroessen ueberleben kein Deploy). Genau
dafuer gibt es Blob.

ABER: Blob lohnt nur, wenn jemand **ueber das CMS-Admin Bilder hochlaedt**. Solange
nur der Entwickler Bilder pflegt und diese als statische Dateien im Code liegen,
**ist Blob ueberfluessig**. Bilder aus `/public` liefert Vercel direkt vom CDN aus,
ohne DB, ohne Blob, ohne Token.

→ **Blob kann raus.** Das entfernt einen Go-Live-Blocker und die Token-/Upload-
Probleme.

## 3. Brauchen wir die Datenbank? — Kurzfristig ja, langfristig optional

Auch wenn nur der Entwickler pflegt: die Seiten lesen ihre Daten aus Postgres (via
Payload). Solange Payload drin ist, **braucht es die DB**. Neon kostet nichts und
laeuft stabil, also kein Grund, daran kurzfristig etwas zu aendern.

Die radikalere Option (Payload + DB ganz raus, Daten als Code) ist nur sinnvoll,
wenn der Verein das Admin **nie** nutzen wird (siehe Option C).

## 4. Plan — drei Optionen

### Option A — empfohlen, jetzt: Blob raus, Neon behalten

- Bilder als statische Dateien in `/public`, direkt referenziert (kein Media-Upload).
- People/Sponsoren/News auf statische Pfade mappen statt auf hochgeladene Media-Docs.
- `vercelBlobStorage`-Plugin + `BLOB_READ_WRITE_TOKEN` entfernen.
- DB bleibt Neon (free, laeuft).
- **Aufwand:** ca. halber Tag. **Ergebnis:** ein Go-Live-Blocker weniger, keine
  Blob-Abhaengigkeit, lokale Entwicklung ohne Storage-Stolperfallen.

### Option B — nur falls doch CMS-Uploads kommen: Blob -> Cloudflare R2

- Wenn der Verein spaeter doch selbst Bilder hochladen soll: statt Vercel Blob
  **Cloudflare R2** (S3-kompatibel, `@payloadcms/storage-s3`). Keine Egress-Gebuehren,
  bei dieser Groesse praktisch 0 EUR.
- Nur sinnvoll mit aktivem Admin-Upload. Bei "alles ueber mich": **nicht noetig.**

### Option C — spaeter, radikal: vollstatisch, ohne DB und Blob

- Wenn sicher ist, dass **niemand ausser dem Entwickler** je Inhalte pflegt: Payload
  und Postgres ganz entfernen, Daten als TypeScript-Dateien im Code, Seiten lesen
  direkt daraus.
- **Aufwand:** gross (18 Seiten umbauen, Seed/Collections ersetzen). Spart laufend
  DB + Blob (die aber ohnehin ~0 EUR kosten).
- Lohnt nur als bewusste Strategie "kein CMS, nie". Besser **vor** weiterer
  Feature-Arbeit entscheiden, nicht danach.

## 5. Kosten-Realitaet

- Neon Free: 0 EUR (0.5 GB, autosuspend) — reicht um ein Vielfaches.
- Vercel Blob Free: 0 EUR bei 75 Dateien.
- **Kosten sind nicht das Argument.** Das Argument ist Einfachheit und das Entfernen
  von Go-Live-Blockern.

## 6. Empfehlung

**Jetzt Option A:** Blob raus (passt exakt zu "Bilder lokal"), Neon behalten. Schnell,
entfernt einen Launch-Blocker, DB laeuft weiter.

**Option C (vollstatisch)** nur, wenn ihr euch sicher seid, das CMS nie zu nutzen —
dann aber bewusst und frueh entscheiden, weil es der groesste Umbau ist.

Naechster Schritt nach Freigabe: Option A umsetzen und durchtesten (Build + lokale
Vorschau), dann `BLOB_READ_WRITE_TOKEN` in Vercel entfernen.
