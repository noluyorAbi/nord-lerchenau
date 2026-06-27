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

### 1. Bild-Upload im CMS reparieren (Vercel Blob verbinden)

Aktuell: lädst du im Admin (`/admin`) ein Bild hoch, landet es im Nichts (404). Grund: kein Blob-Speicher verbunden (`BLOB_READ_WRITE_TOKEN` fehlt). Der Code ist bereit, sobald der Token da ist.

1. Vercel öffnen: https://vercel.com → Projekt **nord-lerchenau**.
2. Tab **Storage** → **Create / Connect Store** → **Blob** auswählen → Store anlegen und mit dem Projekt verbinden.
3. Vercel setzt dann automatisch `BLOB_READ_WRITE_TOKEN` in die Projekt-Env (Production).
4. **Redeploy** anstoßen (Deployments → letztes Deployment → Redeploy), oder einfach einen kleinen Commit pushen.
5. Testen: im `/admin` ein Bild hochladen. Es muss jetzt eine `...blob.vercel-storage.com`-URL bekommen und sichtbar bleiben.

Hinweis: alte, bereits hochgeladene Bilder zeigen weiter über die im Code mitgelieferten Dateien (`/public/uploads`). Nur NEU im Admin hochgeladene Bilder brauchen den Blob-Speicher.

### 2. Kontaktformular-Mails reparieren (Resend)

Aktuell: Nachrichten aus `/kontakt` werden **gespeichert** (im Admin unter "Submissions" sichtbar), aber es kommt **keine E-Mail** an. Grund: `RESEND_API_KEY` ist leer.

1. https://resend.com → Account → **API Keys** → Key erstellen → kopieren.
2. Vercel → Projekt → **Settings → Environment Variables** → hinzufügen (Production):
   - `RESEND_API_KEY` = der neue Key
   - prüfen, dass `RESEND_FROM_EMAIL` = `info@svnord.de` und `RESEND_TO_EMAIL` = `info@svnord.de` auch in Vercel gesetzt sind (liegen lokal schon vor, Vercel-Env ist aber getrennt).
3. Resend → **Domains** → `svnord.de` hinzufügen → die angezeigten DNS-Einträge (SPF, DKIM, DMARC) beim Domain-Anbieter eintragen → auf "verified" warten.
   - Solange `svnord.de` nicht verifiziert ist, kann Resend nur von `onboarding@resend.dev` senden. Zum Testen vorher `RESEND_FROM_EMAIL` auf eine verifizierte Adresse setzen.
4. **Redeploy**. Testen: `/kontakt` absenden → Mail muss bei `info@svnord.de` ankommen.

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
2. 👨‍💻 Du: Vercel Blob verbinden (Punkt 1), Resend einrichten (Punkt 2).
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
