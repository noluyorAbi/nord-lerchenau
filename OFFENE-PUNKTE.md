# Offene Punkte vor dem finalen Go-Live

**Stand: 2026-06-27** · Website (Preview): https://nord-lerchenau.vercel.app · Zieldomain: `svnord-lerchenau.de`
Saisonstart in ca. 2 Wochen.

Legende: 👨‍💻 = du (Alpie/Dev) machst es · 🧑‍💼 = Ralf/Verein liefert oder entscheidet.

---

## ✅ Schon erledigt und live (Kontext)

- Alle code-umsetzbaren Punkte aus dem Doc **Stand 2026_06_02**.
- Sponsoren: falsche raus (Check24, Autohaus Walter, M-net, Bromberger), korrekte Liste live (noch ohne Logos).
- Neue Seite **Kinder- & Jugendschutz**, Google-Maps Gymnastik/Volleyball, Volleyball-Zeit 19:00 bis 20:00, Vorstand-Umbau, Shop-Reihenfolge, Mitgliedschaft-Vorteile, Termine, Garmisch-Fan-Fotos.
- **CMS-Sicherheit gehärtet**: Open-Admin-Lücke geschlossen, Boot-Fehler weg, Admin-Passwort stark zurückgesetzt (steht in `CREDENTIALS.local.md`).
- **CMS-Admin ehrlich gemacht**: tote Felder versteckt, keine irreführenden "tut nichts"-Felder mehr.
- Produktiv-Datenbank neu eingespielt (Reseed).

---

## 👨‍💻 DU musst machen (Ops, geht nur über Konsole, nicht über Code)

### 1. Bild-Upload im CMS reparieren: ERLEDIGT seit 18.08.2026

Der Verein kann jetzt im `/admin` Bilder hochladen, austauschen und löschen. Sie landen dauerhaft im Vercel-Blob-Speicher und werden direkt vom CDN ausgeliefert.

Korrektur zur früheren Fassung dieses Punktes: der Blob-Store **war** angelegt und `BLOB_READ_WRITE_TOKEN` steht seit dem 01.06.2026 in der Vercel-Env. Gefehlt hat der Code. Beim Umbau auf statische Bilder (Commit `76bf13d`) wurde das `vercelBlobStorage`-Plugin aus `payload.config.ts` entfernt und nie wieder eingehängt, also lief Payload in Produktion auf dem lokalen Datei-Adapter. Vercel-Funktionen haben ein schreibgeschütztes Dateisystem, deshalb schlug jeder Upload fehl und `/api/media/file/<name>` antwortete mit 500.

Was gemacht wurde (PR #10, Merge `8dd7905`):

1. Plugin wieder aktiv, Bilder kommen direkt vom Blob-CDN. Keine Schema-Änderung, kein Reseed nötig.
2. Alle 456 Bestandsdateien in den Store geschoben (`scripts/migrate-media-to-blob.ts`), ohne eine einzige Datenbankzeile zu ändern.
3. `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA=true` gesetzt, damit ein ausgetauschtes Bild auch dann durchschlägt, wenn eine gleichnamige Datei im Code mitgeliefert wird.

Endkontrolle am 18.08.2026: 52 Seiten, 295 verschiedene Bilder, 0 kaputt. Upload im Produktions-Admin getestet und wieder aufgeräumt.

**Bekannte Grenze: höchstens 4 MB pro Bild.** Ein Upload läuft durch eine Vercel-Funktion, deren Request-Body auf 4,5 MB begrenzt ist. Der Hinweis steht im Admin über der Bilder-Sammlung; Handy-Fotos vorher verkleinern.

Wenn das Flag jemals neu gesetzt werden muss: frisch deployen (ein Redeploy übernimmt die alte Umgebung) und danach **jeden Cache-Tag über `/api/revalidate` leeren**, sonst rendern die dynamischen Seiten weiter aus Einträgen von vor dem Umbau. Details und Messwerte: `docs/CMS-BILDER-ANALYSE-2026-08-18.md`.

### 2. Kontaktformular-Mails (Resend) — ✅ INTERIM LIVE seit 2026-07-06

Aktuell: Mails aus `/kontakt` **kommen an** (bei `info@svnord.de`), Absender ist aber interim `kontakt@adatepe.dev` (Entwickler-Domain), weil `svnord.de` noch nicht bei Resend verifiziert ist. Nachrichten werden zusätzlich im Admin unter "Submissions" gespeichert.

Dauerhafte Lösung (offen):

1. Vereins-eigenes Resend-Konto anlegen (statt Entwickler-Konto).
2. Resend → **Domains** → `svnord.de` hinzufügen → DNS-Einträge (SPF, DKIM, DMARC) beim Domain-Anbieter eintragen → auf "verified" warten. **MX-Einträge nicht anfassen.**
3. Vercel → Env (Production): `RESEND_API_KEY` = neuer Vereins-Key, `RESEND_FROM_EMAIL` = `kontakt@svnord.de`.
4. **Redeploy**. Testen: `/kontakt` absenden → Mail kommt mit Vereins-Absender an.

Hinweis: schlägt der Mailversand fehl, sieht der Nutzer trotzdem "gesendet" (best effort); die Nachricht liegt dann nur im Admin. Nach jeder Env-Änderung eine Testnachricht schicken.

### 3. Domain live schalten (DNS auf Vercel)

1. Vercel → Projekt → **Settings → Domains** → `svnord-lerchenau.de` hinzufügen → Vercel zeigt die A-/CNAME-Werte.
2. Beim Domain-Anbieter diese Werte eintragen. **MX-Einträge für `info@svnord.de` NICHT anfassen** (sonst keine Vereins-Mails mehr).
3. `NEXT_PUBLIC_SERVER_URL` steht schon auf `https://svnord-lerchenau.de`, prüfen dass das auch in der Vercel-Env so ist.
4. SSL kommt automatisch. Testen: `https://svnord-lerchenau.de` lädt.

### 4. Inhalte/Logos einpflegen (sobald Ralf liefert, siehe unten) + Reseed

- Sponsor-Logos: Dateien in `tmp/live-sponsors/` mit den Namen aus `scripts/seed.ts`, dann `bun --env-file=.env.local.production scripts/seed.ts`.
- Mannschaftsfotos, Jugend-Jahrgänge, Trainer: im Admin eintragen (kein Reseed nötig, sind Live-Daten).

---

## 🧑‍💼 RALF muss liefern / entscheiden

### Liefern (Dateien/Daten)

- **Sponsor-Logos** für: a+b Pertler, Ballauf & Schopp, BTU Hartmeier, Seethaler, Württembergische, Wohnen und gut leben, BrandSchutz Hagenbusch, SWM, Get Flashed Media. (Seite zeigt sonst Namen ohne Logo.)
- **Echte Mannschaftsfotos** (Junioren + Herren). Der alte HiDrive-Bilder-Link ist abgelaufen, neuen schicken.
- **Jugend-Jahrgänge** (z. B. A1 U19 = 2006, 2007, 2008) und **Trainer pro Jugend-Team**.
- **AH-Mannschaft**-Inhalt (laut Doc liefert Heinz Fessenmayer).
- DNS-/Registrar-Zugang für `svnord-lerchenau.de`, falls nicht über die Strato-Daten machbar.

### Kurz bestätigen (eine Rückmeldung reicht)

| Punkt                           | Aktuell                                           | Frage                      |
| ------------------------------- | ------------------------------------------------- | -------------------------- |
| Spenden-QR                      | Liegt auf der Sponsorenseite                      | Platzierung ok?            |
| Vorstand-Kachel "Abteilungen"   | zeigt 6                                           | genau 5 gewünscht? welche? |
| Vorstand-Kachel "Jugendleitung" | zeigt 2                                           | auf 1 ändern?              |
| BFV-Link (Jugendschutz-Seite)   | `bfv.de`                                          | richtig?                   |
| Trainerin Abbrederis            | aus Vorstand raus, steht noch auf Gymnastik-Seite | auch dort raus?            |
| Volleyball-Trainingszeit        | Freitag 19:00 bis 20:00                           | korrekt?                   |
| Startseiten- + Garmisch-Fotos   | im Bilderlauf/Galerie                             | geschmacklich ok?          |

---

## 🔵 Später (von Ralf zurückgestellt, kein Go-Live-Blocker)

- Unterseite Jugendkonzept (Ergin oder altes Konzept).
- Unterseite Förderverein im Detail + digitaler Antrag.
- Unterseite AH.

---

## 📋 Reihenfolge für den Go-Live

1. 🧑‍💼 Ralf: Logos + Fotos + Jugend-Daten schicken, Domain-Zugang klären.
2. 👨‍💻 Du: Resend einrichten (Punkt 2). Punkt 1 (Bild-Upload) ist erledigt.
3. 👨‍💻 Du: Logos in `tmp/live-sponsors/` + Reseed; Fotos/Daten im Admin eintragen.
4. 🧑‍💼 Ralf: DNS-Werte setzen (Punkt 3).
5. 👨‍💻 Du: Domain in Vercel, SSL prüfen, einmal alles durchklicken (siehe Checkliste unten).
6. Scharf schalten.

### Sicht-Check vor dem Scharfschalten

Startseite · Fußball (Tabelle/Torjäger) · Vorstand + Kinder- & Jugendschutz · Chronik/Vereinsheim/Förderverein · Gymnastik/Volleyball/Ski/eSport (Texte, Zeiten, Karte) · Mitgliedschaft (4 Formulare öffnen) · Shop · Sponsoren · Termine · Kontakt (Testnachricht kommt an) · Impressum/Datenschutz.

---

## 🛠 Technische Notizen (Dev)

- CMS-Daten ändern wirkt erst nach **Reseed**: `bun --env-file=.env.local.production scripts/seed.ts` (idempotent, löscht nichts).
- CMS ist befüllt: ein CMS-Feld erst dann ins Frontend "verdrahten", wenn die Prod-API zeigt, dass es leer ist (sonst Regression).
- Reine Seiten-/Code-Änderungen gehen automatisch mit dem Vercel-Deploy live.
- Vor jedem Merge: `prettier --write`, `bun run lint`, `bunx tsc --noEmit`, `bun run build` (aktuell alle grün).
- Admin-Login: `/admin`, `admin@svnord.de`, Passwort in `CREDENTIALS.local.md`. Frischer DB-Seed braucht jetzt `PAYLOAD_ADMIN_PASSWORD` in der Env.
