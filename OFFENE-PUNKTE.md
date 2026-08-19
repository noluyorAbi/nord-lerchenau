# Offene Punkte

**Stand: 2026-08-19** · Live: https://www.svnord.de (kanonisch) und
https://www.svnord-lerchenau.de · Kundenfassung dieser Liste: Teil III im
Übergabe-Handbuch (`Uebergabe/`, nicht im Git).

Die Seite ist seit Ende Juni live. Was hier steht, ist der Rest.

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

### 3. Domain: live, bis auf die nackte `svnord-lerchenau.de`

Erledigt: `svnord.de`, `www.svnord.de` und `www.svnord-lerchenau.de` liefern
die Seite mit gültigem Zertifikat. Die Sitemap gibt `www.svnord.de` als
kanonische Adresse aus.

**Offen:** `svnord-lerchenau.de` ohne `www` bringt eine Zertifikatswarnung.
Die Namensverwaltung dieser Domain liegt bei **Wix** (`ns8.wixdns.net`,
`ns9.wixdns.net`), und der A-Eintrag der nackten Domain zeigt weiter auf Wix
(`185.230.63.*`). Zwei Wege:

1. Im Wix-Konto den A-Eintrag auf `76.76.21.21` setzen und die alten Wix-Werte
   löschen, oder
2. die Nameserver auf `ns1.vercel-dns.com` / `ns2.vercel-dns.com` umstellen.

An `svnord-lerchenau.de` hängt **kein MX-Eintrag**, es kann also keine Mail
verlorengehen. Für `svnord.de` gilt das Gegenteil: dort läuft das Postfach über
`smtpin.rzone.de`, MX niemals anfassen.

### 4. Inhalte/Logos einpflegen (sobald Ralf liefert, siehe unten) + Reseed

- Sponsor-Logos: Dateien in `tmp/live-sponsors/` mit den Namen aus `scripts/seed.ts`, dann `bun --env-file=.env.local.production scripts/seed.ts`.
- Mannschaftsfotos, Jugend-Jahrgänge, Trainer: im Admin eintragen (kein Reseed nötig, sind Live-Daten).

---

## 🧑‍💼 RALF muss liefern / entscheiden

### Liefern (Dateien/Daten)

- ~~Sponsor-Logos~~ **erledigt**: alle neun Partner haben ein Logo (geprüft
  über die Live-API am 19.08.2026).
- **Echte Mannschaftsfotos**: 24 der 28 Mannschaften haben keines. Erste,
  Zweite und Dritte holen ihr Foto automatisch vom Verbandsportal, die
  G-Junioren haben eines im CMS. Der alte HiDrive-Link ist abgelaufen.
- **Jugend-Jahrgänge** (z. B. A1 U19 = 2006, 2007, 2008) und **Trainer pro Jugend-Team**.
- **AH-Mannschaft**-Inhalt (laut Doc liefert Heinz Fessenmayer).
- DNS-/Registrar-Zugang für `svnord-lerchenau.de`, falls nicht über die Strato-Daten machbar.

### Neu seit 19.08.2026 (aus der Übergabe-Prüfung)

- **Mitgliederzahl uneinheitlich**: Kopf der Startseite "500+ Mitglieder, vier
  Sportarten", Block darunter "630+", Vereinsseite "600+ Mitglieder, fünf
  Abteilungen", Abteilungsübersicht "Sechs Sportarten". Eine Entscheidung, dann
  überall gleich.
- **Trainer fehlen**: bei 22 von 28 Mannschaften ist das Feld leer.
- **Vereinstermine**: null kommende. Die zwei eingetragenen liegen in der
  Vergangenheit, die Termineseite zeigt deshalb "0 Termine". Der Spielplan mit
  226 Partien kommt vom Verband und ist davon nicht betroffen.
- **Betriebskonten**: Server, Datenbank, Bildspeicher, Mailversand und
  Assistent laufen auf Entwicklerkonten; Domain und Postfach beim Verein.
  Entscheidung, ob das so bleibt.
- **Sicherung**: es gibt keine eigene, geprüfte Sicherung der Datenbank. Was
  der Anbieter an Änderungshistorie vorhält, ist tarifabhängig und nicht
  nachgeprüft.

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
