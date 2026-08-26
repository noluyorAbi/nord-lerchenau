# Kundenfeedback 21.08.2026

Quelle: `Fragen zu Änderungsvorschläge zur WEB Seite Stand 2026_08_21.docx`
(Ralf Kirmeyer) sowie die WhatsApp-Nachrichten vom 25.08.2026.
Bearbeitet am 26.08.2026.

Der rote Faden fast aller Punkte ist derselbe: an mehreren Stellen gab es zwei
Quellen für denselben Inhalt, eine im Admin und eine fest im Code, und die im
Code hat gewonnen. Der Verein hat gepflegt und auf der Seite ist nichts
passiert. Das ist behoben.

## Erledigt (Code, geht mit dem nächsten Deploy live)

| #   | Punkt aus dem Dokument                                                          | Was war                                                                                                                                                                                                                 | Was jetzt gilt                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "Telefon vom Felix auf Web Seite anzeigen"                                      | Die sportliche Leitung auf `/fussball/herren` war eine reine Namensliste im Code, ohne Kontakt.                                                                                                                         | Namen werden gegen die Personen-Collection aufgelöst und bekommen Telefon- und E-Mail-Button wie auf `/verein/vorstand`. Gepflegt wird unter **Personen**. Felix' Nummer und Adresse stehen dort bereits, es erscheint also ohne weiteres Zutun. Gilt auch für `/fussball/junioren`.                                                                             |
| 2   | "Leider kann ich die Bilder von Volleyball und Gymnastik nicht anpassen"        | Die Abteilungsseiten haben immer das mitgelieferte Standardbild angezeigt und jeden CMS-Upload ignoriert. Kein Bedienfehler.                                                                                            | Das Foto aus **Mannschaften → Foto** gewinnt, das Standardbild ist nur noch Notfall-Fallback.                                                                                                                                                                                                                                                                    |
| 3   | "Web Seite und Admin Seiten weichen ab" (`teams/24`)                            | Der im Admin gepflegte Abteilungstext wurde auf `/gymnastik` und `/volleyball` gar nicht ausgegeben, sobald die Seite Textkacheln hatte. Deshalb fehlte auch die Änderung vom 21.08. ("Ab 15.09.2026 am Dienstag ..."). | Der Text aus dem Admin ist jetzt der Haupttext der Seite. Die fest verdrahteten Textkacheln auf Gymnastik und Volleyball sind entfernt, damit es nur noch eine Quelle gibt. Trainingszeiten stehen ab sofort ausschließlich im Admin-Text.                                                                                                                       |
| 4   | "Wo sehe ich, welches Foto auf welcher Seite ist?" / "Welche kann ich löschen?" | Keine Antwort im Admin möglich.                                                                                                                                                                                         | Neuer Bericht `bun run media-usage`. Er listet jedes Bild mit seinen Fundstellen und getrennt davon die Bilder ohne jede Fundstelle. Stand 26.08.2026: 182 Bilder, davon 29 in Verwendung und 153 ohne Fundstelle. Die 153 sind Kopien aus wiederholten Datenimporten (`Bini_Hafner-1` bis `-27` und so weiter) und können weg.                                  |
| 5   | "Hauptmenü: Warum erscheint hier Fußball?"                                      | Im Admin stand ein Feld "Hauptmenü", das nichts mehr bewirkt hat.                                                                                                                                                       | Bereits am 22.08.2026 erledigt (Commit `f111667`): Das Hauptmenü kommt aus dem Code, damit Handy und Browser identisch sind, und das wirkungslose Feld ist im Admin ausgeblendet. Dass Fußball oben eigenständig steht und zusätzlich unter "Sport" in der Fußzeile auftaucht, ist Absicht: Fußball ist die größte Abteilung und soll einen Klick entfernt sein. |

## Braucht eine Entscheidung des Vereins

| #   | Punkt                                   | Rückfrage                                                                                                                                                                                                                                                                  |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | Mannschaftsfoto Gymnastik               | Am Team Gymnastik hängt die Datei `Volleyball 2026_07.webp`, die Datei `Gymnastik 2026_07.webp` liegt daneben und wird nirgends verwendet. Sieht nach einem Vertauscher beim Hochladen aus. Bitte unter **Mannschaften → Gymnastik → Foto** das richtige Bild auswählen.   |
| 7   | Trainingszeiten Gymnastik ab 15.09.2026 | Im Admin steht "Ab 15.09.2026 am Dienstag von 19.00 bis 20.00Uhr und Montag". Offen bleibt, ob der Mittwoch entfällt und ob die Regel "Montag nur Frauen" bestehen bleibt. Der Satz erscheint ab dem Deploy genau so auf der Seite, deshalb bitte im Admin ausformulieren. |
| 8   | Alt-Texte                               | Rückfrage aus dem Dokument war nicht eindeutig. Es gilt: **Alt-Text ist Pflicht** (kurze Bildbeschreibung, für Screenreader und Google). Bildunterschrift und Bildquelle sind ausgeblendet und müssen nicht gefüllt werden.                                                |
| 9   | "Sport 018288000" im Handy-Menü         | Aus dem Screenshot nicht nachvollziehbar, auf der Seite findet sich keine solche Nummer. Bitte einmal beschreiben, wo genau das auftaucht.                                                                                                                                 |

## Was sich dadurch noch mit ändert

Punkt 3 wirkt auf alle fünf Abteilungsseiten, nicht nur auf die beiden
gemeldeten. Auch `/ski`, `/esport` und `/schiedsrichter` zeigen ab dem Deploy
den Text aus dem Admin statt der bisherigen Kurzfassung aus dem Code. Inhaltlich
sagen beide Fassungen dasselbe, der Ton ist etwas anders. Die Textkacheln
bleiben auf diesen drei Seiten vorerst stehen; bei eSport erzählt die Kachel
"Saison 25/26" dasselbe wie ein Absatz darüber, das ist beim nächsten Durchgang
aufzuräumen.

Sternchen im Admin-Text erscheinen ab sofort sichtbar auf der Seite, betroffen
sind Gymnastik (`*Eure SV Nord Gymnastik Mannschaft*`) und Ski
(`*Eure SV Nord Ski-Crew.*`). Für Fettdruck bitte den Text markieren und im
Editor **B** verwenden, dann verschwinden die Sternchen.
