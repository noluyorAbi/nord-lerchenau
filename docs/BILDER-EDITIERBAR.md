# Bilder editierbar machen

Stand 26.08.2026.

Bis hierher standen die meisten Fotos der Seite fest im Code. Der Verein konnte
sie nicht austauschen, und ein Wunsch wie „anderes Bild oben auf der Startseite"
war jedes Mal eine Codeänderung. Jetzt liegen sie in der Medien-Sammlung und
sind im Admin austauschbar.

## Was der Verein wo ändert

| Bild                                 | Im Admin unter                                  |
| ------------------------------------ | ----------------------------------------------- |
| Bilderlauf oben auf der Startseite   | Startseite → Bilder → Bilderlauf im Kopfbereich |
| Fotowand im Instagram-Bereich        | Startseite → Bilder → Galerie                   |
| Die drei U8-Fotos                    | Weitere Bilder → U8                             |
| Titelbild eines Beitrags             | Beiträge → der Beitrag → Titelbild              |
| Foto einer Abteilung oder Mannschaft | Mannschaften → Foto                             |

Zwei Dinge sind bewusst nicht im CMS gelandet, obwohl sie zunächst dort waren.
Das Sommerfest-Plakat nicht, weil die Sommerfest-Sektion seit dem 31.07.2026
gar nicht mehr ausgegeben wird: ein Feld dafür hätte genau den Fehler
wiederholt, um den es hier geht, nämlich Pflege ohne Wirkung. Und die Galerie
hat keine Kästchen für „breite" oder „hohe" Kachel, weil die Fotowand eine
reine CSS-Spaltenanordnung ist und eine solche Angabe nirgends liest.

Die fünf runden Bildpunkte im Instagram-Nachbau bleiben fest im Code, Bild und
Beschriftung als Paar. Ein Versuch, das Bild aus der Galerie zu übernehmen, hat
Beschriftung und Motiv entkoppelt: der Punkt „U8 Löwen" zeigte dann das erste
Galeriebild, also ein Fanfoto. Wer sie pflegbar machen will, braucht eigene
Felder mit Bild und Kurztext, keine Kopplung über die Reihenfolge.

## Grundregel: ein leeres Feld ist kein Loch

Jedes dieser Felder ist optional. Ist nichts gepflegt, zeigt die Seite weiterhin
das mitgelieferte Bild aus `public/`. Übernommen wird außerdem nur eine Quelle,
der man ansieht, dass sie wirklich ausgeliefert wird: ein absoluter
Speicher-Link oder eine Datei unter `/uploads`. Der Grund sind Altlasten aus dem
ersten Import, an denen eine `/api/media/file/...`-URL steht, hinter der keine
Datei mehr liegt. Diese Entscheidung trifft `usableMediaSrc` in
`lib/publicUploads.ts`, abgesichert in `tests/lib/public-uploads.test.ts`.

## Bewusst nicht im CMS

Vereinslogo, Spenden-QR-Code und die App-Icons bleiben feste Dateien. Der
Medien-Upload rechnet jedes Bild nach WebP um und skaliert es. Bei einem
QR-Code kostet das die Lesbarkeit, das Logo steckt zusätzlich in strukturierten
Daten für Suchmaschinen, und die App-Icons brauchen exakt die Größen und
Formate, die das Manifest nennt.

Die Grafiken im Fließtext des Beitrags über die Neuzugänge (`NEWS_FIGURES` in
`lib/news-visual.ts`) bleiben ebenfalls im Code. Sie gehören zu genau einem
importierten Artikel; wer sie ändern will, ändert den Artikel selbst.

## Ablauf für die Produktion

Reihenfolge einhalten, sonst schreibt der Import in Spalten, die es noch nicht
gibt, oder der neue Code liest Felder, die die Datenbank nicht kennt.

1. **Schema.** `psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-08-26-bilder-editierbar.sql`
   Das Skript ist rein additiv und wiederholbar: es legt drei Tabellen an und
   fasst nichts Bestehendes an. Es ersetzt bewusst den Drizzle-Push, der ein
   Anlegen nicht von einem Umbenennen unterscheiden kann und deshalb
   interaktiv nachfragt.
2. **Bilder importieren.** Mit der Produktionsumgebung, also `DATABASE_URI` der
   Produktion, `BLOB_READ_WRITE_TOKEN` und `BLOB_ENABLE_LOCAL=true`, damit die
   Dateien im Blob-Speicher landen und nicht auf der lokalen Platte:
   `bun run import-static-images -- --dry-run` zum Ansehen, dann ohne Flag.
   Der Aufruf setzt selbst `NODE_ENV=production` und `PAYLOAD_DISABLE_PUSH=true`.
   Das ist kein Beiwerk: ohne das startet Payload den Schemaabgleich und stellt
   die interaktive Rückfrage an der Produktionsdatenbank.
   Der Import lädt eine Datei nur hoch, wenn es sie noch nicht gibt, und füllt
   ein Feld nur, wenn es leer ist. Ein zweiter Lauf ändert nichts.
3. **Deploy.** Erst danach den Code ausrollen.

Zur Kontrolle nach Schritt 1 die drei Tabellen ansehen, `image_id` und
`caption` müssen `not null` sein:

```
psql "$DATABASE_URI" -c "\d home_page_bilder_hero_images" \
                     -c "\d home_page_bilder_galerie" -c "\d site_images"
```

Der Schemaabgleich aus `bun run db:push-schema` taugt dafür nicht: er weigert
sich bei einer Datenbank, die schon Tabellen hat, und meldet dann Erfolg, ohne
etwas geprüft zu haben.

Nach dem Deploy einmal `bun run media-usage` laufen lassen: die neuen Bilder
müssen unter „in Verwendung" stehen. Tun sie das nicht, ist eine Verknüpfung
nicht gesetzt.

## Warum das Schema von Hand kommt

Payload legt für ein Auswahlfeld einen Enum-Typ und für ein Listenfeld eine
eigene Tabelle an. Beim Abgleich kann der Push nicht erkennen, ob so ein Objekt
neu ist oder nur umbenannt wurde, und fragt zurück. Auf der lokalen Datenbank
sind die Vorschläge bereits gefährlich (er bietet an, `change_requests` in
`home_page_bilder_hero_images` umzubenennen), auf der Produktion ist die Frage
nicht verantwortbar. Deshalb steht die Änderung als SQL im Repository, wo man
sie vor dem Ausführen lesen kann.

Aus demselben Grund hat die Galerie zwei Kästchen „breit" und „hoch" statt einer
Auswahlliste: Kästchen sind Wahrheitswerte und brauchen keinen Enum-Typ.
