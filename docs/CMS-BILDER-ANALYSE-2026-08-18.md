# CMS-Bilder: Ursachenanalyse und Behebung

Stand: 2026-08-18. Branch: `fix/cms-image-uploads-blob`.

## 1. Symptom

Bilder, die der Verein im Admin (`/admin`) hochlädt, erscheinen nicht auf der
Seite. Bereits vorhandene Bilder (Portraits, Sponsorenlogos, Mannschaftsfotos)
werden dagegen korrekt angezeigt, was den Fehler verdeckt hat.

## 2. Befund

Vier Messungen gegen die Produktion, alle am 2026-08-18:

| Prüfung                                                | Ergebnis                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `GET /uploads/Ralf_Kirmeyer.jpg` (mitgelieferte Datei) | 200                                                                     |
| `GET /uploads/Bini_Hafner-1.webp` (nicht mitgeliefert) | 404                                                                     |
| `GET /api/media/file/g-junioren.webp` (Payload-Route)  | 500                                                                     |
| `media`-Zeilen in der Produktionsdatenbank             | 180, davon 180 mit `url = /api/media/file/<name>`, 0 mit einer Blob-URL |

Dazu der Repository-Zustand: `payload.config.ts` auf `main` hatte
`plugins: []`, also **keinen** Storage-Adapter. `.gitignore` liefert per
Positivliste genau **30** Dateien aus `public/uploads` mit, lokal liegen dort
1327 Dateien (59 MB). `BLOB_READ_WRITE_TOKEN` ist seit 78 Tagen in der
Vercel-Env gesetzt (Production, Preview, Development).

## 3. Ursache

Beim Umbau auf statische Bilder (Commit `76bf13d`, 30.06.2026, Option A aus
`docs/STORAGE-DB-PLAN.md`) wurde das `vercelBlobStorage`-Plugin aus
`payload.config.ts` entfernt. Payload lief in Produktion damit auf dem
lokalen Datei-Adapter mit `staticDir = public/uploads`.

Eine Vercel-Funktion hat ein schreibgeschütztes, pro Aufruf verworfenes
Dateisystem. Der Upload aus dem Admin kann dort nichts ablegen, und der
erzeugte Datensatz zeigt auf `/api/media/file/<name>`, wo keine Datei liegt:
daher die 500.

Der Blob-Speicher wurde noch am selben Tag wieder eingebaut, aber im Commit
`100cae4` auf `feat/cms-customer-editable`. Dieser Branch ist nie nach `main`
gelangt. `OFFENE-PUNKTE.md` behauptete deshalb das Gegenteil der Realität
("der Code ist bereit, sobald der Token da ist"): der Token war da, der Code
fehlte. Diese Zeile ist jetzt korrigiert.

**Warum es trotzdem so lange lief:** `lib/publicUploads.mediaSrc` löst jedes
Medium zuerst gegen die mitgelieferten Dateien in `public/uploads` auf und
normalisiert dabei Endung und Payload-Suffix (`Bini_Hafner-28.webp` findet
`Bini_Hafner.jpg`). Die 180 Bestandsdatensätze treffen alle einen dieser 30
mitgelieferten Namen. Nur ein **neu** hochgeladenes Bild hat keinen solchen
Zwilling, fällt auf die kaputte `url` zurück und bleibt leer.

## 4. Behebung im Code

### 4.1 Storage-Adapter wieder aktiv (`payload.config.ts`)

```ts
const BLOB_ENABLED =
  Boolean(BLOB_TOKEN) &&
  (Boolean(process.env.VERCEL) || process.env.BLOB_ENABLE_LOCAL === "true");

vercelBlobStorage({
  enabled: BLOB_ENABLED,
  collections: { media: { disablePayloadAccessControl: true } },
  token: BLOB_TOKEN,
});
```

Drei bewusste Entscheidungen:

- **`disablePayloadAccessControl: true`.** Ohne diese Option liefert Payload
  jedes Bild über `/api/media/file/<name>` aus, also über einen Funktionsaufruf
  pro Bild. Die Media-Collection ist ohnehin `read: anyone` und die Blobs liegen
  mit `access: 'public'` im Store, es wäre also Kosten ohne Schutzwirkung. Mit
  der Option zeigt `media.url` direkt auf das Blob-CDN.
- **kein `alwaysInsertFields`.** Die Option fügt das Feld `prefix` ausschließlich
  auf dem _deaktivierten_ Pfad ein (siehe `plugin-cloud-storage/plugin.js`, der
  aktivierte Zweig reicht sie nicht weiter). Eingeschaltet bekäme also
  ausgerechnet die Umgebung ohne Token eine Spalte, die die Umgebung mit Token
  nicht hat. Weggelassen ändert das Plugin **keine einzige Spalte**: es hängt
  nur Hooks an die bereits vorhandenen `url`-Felder. Damit ist für den Deploy
  keine Schema-Migration nötig.

- **Token allein aktiviert nichts.** `BLOB_READ_WRITE_TOKEN` liegt in Vercel auch
  im Scope _Development_, ein `vercel env pull` schreibt also ein gültiges
  Produktions-Token in die lokale `.env.local`. Vor diesem Patch war das
  folgenlos (`plugins: []`); danach hätte ein lokaler Seed oder ein Upload im
  lokalen `/admin` direkt in den Store geschrieben, aus dem die Live-Seite liest.
  Deshalb zählt zusätzlich `process.env.VERCEL`. Für einen bewussten Test gegen
  den echten Store gibt es `BLOB_ENABLE_LOCAL=true` für genau diesen Lauf.

Verifiziert durch Vergleich der aufgelösten Media-Felder mit und ohne Token:
identische Feldliste, nur die Anzahl der `url`-afterRead-Hooks unterscheidet
sich (2 gegen 1). Die Aktivierungslogik ist in allen vier Kombinationen geprüft:

| Umgebung                         | Blob aktiv |
| -------------------------------- | ---------- |
| Token, lokal, kein Opt-in        | nein       |
| Token + `BLOB_ENABLE_LOCAL=true` | ja         |
| Token + `VERCEL=1`               | ja         |
| kein Token, `VERCEL=1`           | nein       |

### 4.2 Ausgetauschte Bilder können durchschlagen (`lib/publicUploads.ts`)

`mediaSrc` kennt jetzt `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA`:

- **aus (Standard, heute):** die mitgelieferte Datei gewinnt. Regressionssicher,
  weil die 180 Bestandsdatensätze noch auf Bytes zeigen, die im Store fehlen.
  Neue Uploads mit neuem Namen funktionieren trotzdem, weil sie keinen
  mitgelieferten Zwilling haben.
- **an (nach der Migration):** eine absolute Upload-URL gewinnt. Erst dann wirkt
  das Ersetzen eines Bildes, dessen Name mit einer mitgelieferten Datei
  kollidiert.

Beide Modi sind in `tests/lib/public-uploads.test.ts` festgeschrieben (10 Tests),
inklusive der bewussten Einschränkung im Aus-Modus.

### 4.3 Admin-Import-Map (`app/(payload)/admin/importMap.js`)

`initClientUploads` des Storage-Plugins registriert seinen Client-Handler
**unabhängig** davon, ob `clientUploads` genutzt wird: der Eintrag in
`config.admin.dependencies` und der Provider im Admin werden immer gesetzt, nur
die Server-Route hängt an `enabled`. Ohne den passenden Eintrag in der
Import-Map fehlt dem Admin also eine Komponente. Genau dafür gab es im Juni
schon einmal Commit `7ed573a`.

`payload generate:importmap` scheitert in diesem Projekt (`ERR_MODULE_NOT_FOUND`
auf die `@/`-Aliase). Der Eintrag wurde deshalb von Hand ergänzt und
anschließend gegengeprüft: der Payload-Dev-Server schreibt die Datei selbst neu,
und das Ergebnis ist nach Prettier zeichengleich mit der Handarbeit.

### 4.4 Nebenbei (`next.config.ts`)

Der Blob-Host in `images.remotePatterns`, aber **auf den Store dieses Projekts
gepinnt**, nicht als Wildcard. Heute rendert jeder Aufrufer von `mediaSrc` über
ein einfaches `<img>` oder einen CSS-Hintergrund, ein späterer Wechsel auf
`next/image` würde ohne den Eintrag zur Laufzeit scheitern. Eine Wildcard wäre
allerdings ein offener Proxy gewesen: `/_next/image` optimiert jede URL, die auf
ein Muster passt, also hätte sich jeder mit einem kostenlosen Blob-Store eigene
Bilder unter `svnord.de` ausliefern lassen und die Optimizer-Kosten dem Verein
in Rechnung gestellt.

## 5. Nachweis

End-to-End über die Payload Local API gegen den echten Blob-Store, lokale
Datenbank, Testdatensatz danach gelöscht:

```
CREATED id: 384
url            : https://<store>.public.blob.vercel-storage.com/zz-upload-probe-probe3.webp
sizes.thumbnail: .../zz-upload-probe-probe3-320x213.png
sizes.card     : .../zz-upload-probe-probe3-768x512.png
sizes.feature  : .../zz-upload-probe-probe3-1280x853.png
sizes.hero     : .../zz-upload-probe-probe3-1920x1280.png
FETCH url  -> 200 image/webp
FETCH card -> 200
DELETED id: 384
FETCH url after delete -> 404   (auch alle Größen: 404)
```

Upload, alle vier generierten Größen, Auslieferung und das Aufräumen beim
Löschen funktionieren. Der Store ist unverändert zurückgeblieben.

Zusätzlich der Weg, den der Verein tatsächlich benutzt: Login im lokalen
`/admin`, Bild über "Select a file" hochladen, speichern. Der Datensatz bekam
`https://<store>.public.blob.vercel-storage.com/zz-admin-ui-probe.webp`, die
Vorschau im Admin lud das Bild (1400 px Naturbreite). Danach gelöscht, der Blob
antwortet mit 404.

## 6. Was der Code allein noch nicht löst

Nach dem Deploy funktionieren **neue** Uploads. Die 180 Bestandsdatensätze
zeigen weiter auf Bytes, die nicht im Store liegen; sichtbar bleibt das nur
deshalb nicht, weil `mediaSrc` auf die mitgelieferte Datei ausweicht. Im Admin
selbst bleiben deren Vorschaubilder kaputt, und ein Austausch dieser Bilder
wirkt nicht.

`scripts/migrate-media-to-blob.ts` schließt die Lücke. Es nutzt aus, dass die
Bild-URLs beim Lesen aus der Spalte `filename` erzeugt werden und nicht
gespeichert sind: sobald die Datei unter dem Namen im Store liegt, den die Zeile
ohnehin trägt, stimmt die Zeile. Das Skript schreibt deshalb **keine**
Datenbankzeile, die Rücknahme ist schlicht das Löschen der hochgeladenen Blobs.

Trockenlauf gegen die Produktion:

```
media rows        : 180
distinct files    : 456
no local source   : 0
DRY RUN. would upload=374 already-present=82
```

Die 82 vorhandenen Dateien stammen aus der kurzen Blob-Phase im Juni. Die
Quellen kommen aus dem lokalen `public/uploads` (1327 Dateien); 9 Größenvarianten
existieren dort nicht mehr und werden aus dem Original mit `sharp` in genau der
Größe erzeugt, die der Datensatz benennt. Das Skript ist idempotent: was schon
im Store liegt, wird übersprungen.

Kehrseite dieser Idempotenz: die 82 Dateien aus der Juni-Phase werden nicht
überschrieben. Sollte eine davon inhaltlich veraltet sein, den betreffenden Blob
im Vercel-Dashboard löschen und `--apply` erneut laufen lassen.

Das Skript teilt sich die Namens-Normalisierung per Import mit
`lib/publicUploads`, statt sie zu kopieren, `put` läuft mit
`allowOverwrite: false` (jeder Name wurde unmittelbar vorher als fehlend
geprüft, ein Überschreiben hieße also, der Store hat sich unter uns geändert),
und `head` behandelt nur einen echten `BlobNotFoundError` als "fehlt". Ein
abgelaufenes Token bricht damit hörbar ab, statt einen zuversichtlichen, aber
falschen Upload-Plan zu drucken. Gegengeprüft mit einem ungültigen Token:
`Vercel Blob: Access denied`, Abbruch.

## 7. Rollout (durchgeführt am 18.08.2026)

1. **Bestandsbilder in den Store**, vor dem Deploy, weil das Skript nur Bytes
   schreibt und das laufende Deployment nicht berührt: 374 Dateien hochgeladen,
   0 Fehler, erneuter Trockenlauf meldet 456 von 456 vorhanden.
2. **Code deployed** (PR #10, Merge `8dd7905`). Danach: 52 Seiten gecrawlt, 295
   verschiedene Bilder geprüft, 0 kaputt. Im Produktions-Admin luden die
   Vorschaubilder wieder, vorher waren es acht graue Platzhalter-SVGs.
3. **Upload im Produktions-Admin getestet**: der Datensatz bekam eine Blob-URL,
   die Vorschau lud in voller Breite. Testdatensatz und Test-Blob danach
   entfernt, im Store liegt kein `zz-`-Objekt mehr.
4. **`NEXT_PUBLIC_PREFER_UPLOADED_MEDIA=true`** gesetzt und frisch deployed.

### Der Stolperstein bei Schritt 4: der Daten-Cache

Der erste Versuch von Schritt 4 hat neun Bilder zerschossen: acht
Sponsorenlogos und das G-Junioren-Foto, auf `/news`, `/kontakt`, den
News-Artikeln und den Mannschaftsseiten. Ursache: CMS-Abfragen laufen über
`unstable_cache` (`lib/cms.ts`), und der Vercel-Daten-Cache überlebt ein
Deployment. Zur Laufzeit gerenderte Seiten bekamen deshalb noch Media-Objekte
aus der Zeit **vor** dem Blob-Adapter, mit der alten
`/api/media/file/<name>`-URL, die es nicht mehr gibt. Statisch vorgerenderte
Seiten waren nicht betroffen, weil sie beim Build frisch gelesen haben.

Sofort zurückgenommen (Flag entfernt, neu deployt, Kontrolle: wieder 0 kaputt),
dann korrekt wiederholt:

1. Flag in der Vercel-Env setzen, Wert genau `true`.
2. **Frisch** deployen. Ein Redeploy eines bestehenden Deployments genügt
   nicht: es übernimmt dessen Umgebung, das neue Flag käme gar nicht an.
3. Jeden Cache-Tag leeren, per POST auf `/api/revalidate` mit
   `REVALIDATE_SECRET`, für alle Collections (posts, teams, fixtures, events,
   sponsors, people) und alle Globals (site-settings, navigation, home-page,
   contact-info, chronik-page, vereinsheim-page, jugendfoerder-page,
   legal-pages, faq-page).

**Schritt 3 ist nicht optional.** Ohne ihn zeigen genau die Seiten auf tote
URLs, die nicht beim Build entstehen.

### Endkontrolle

52 Seiten, 295 verschiedene Bilder, **0 kaputt**. 22 davon kommen jetzt vom
Blob-CDN, die übrigen 33 sind statische Dateien, die nie im CMS lagen. Ein im
Admin ausgetauschtes Bild schlägt damit auch dann durch, wenn eine gleichnamige
Datei im Code mitgeliefert wird.

## 7a. Review

Das Push-Gate hat den Patch mit acht Lenses geprüft. Keine blockierende
Feststellung. Umgesetzt wurden die Hinweise zu: Wildcard-Bildhost (jetzt
gepinnt), Token-Aktivierung ohne Vercel-Kontext (jetzt `BLOB_ENABLED`),
kopierte Normalisierung (jetzt geteilt), verschluckte `head`-Fehler und
`allowOverwrite` (beides enger gefasst), toter Term in der Fallback-Kette, und
die fehlende Dokumentation von `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA` in
`.env.example`. Der Hinweis zur 4,5-MB-Grenze führte zu Abschnitt 6a und zum
Hinweistext im Admin, der Hinweis zum sharp-Ausgabeformat zu `toFormat()` im
Migrationsskript (die bereits hochgeladenen Dateien sind davon nicht betroffen,
alle neun regenerierten Varianten sind jpg aus jpg, Bytes und `Content-Type`
stimmen überein, nachgemessen).

## 8. Bewusst nicht angefasst

- Die 1327 lokalen Dateien in `public/uploads` und die Mehrfach-Datensätze in
  der Datenbank (`Bini_Hafner-1` bis `-28` sind dieselbe Person). Aufräumen ist
  sinnvoll, aber ein eigener Vorgang mit eigenem Risiko.
- Die Positivliste in `.gitignore`. Sie bleibt als Rückfallebene nützlich,
  solange `NEXT_PUBLIC_PREFER_UPLOADED_MEDIA` aus ist.
- `docs/STORAGE-DB-PLAN.md` beschreibt weiter den Stand vom 30.06.2026. Die
  Empfehlung "Blob kann raus" von damals galt für "nur der Entwickler pflegt
  Bilder"; seit das CMS für den Verein bedienbar ist, gilt sie nicht mehr.
