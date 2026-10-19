# Datenschutzerklärung: fehlende technische Angaben

Stand: 24.07.2026
Bezug: "Datenschutzerklärung SV Nord München-Lerchenau e. V. Entwurf Stand 2026_05_10.pdf"
Offene Platzhalter im Entwurf: Hosting-Anbieter, Consent-Tool, weitere Dienste

Alle Angaben unten sind am 24.07.2026 gegen den tatsächlichen Stand der Website
(Code, Vercel-Projektkonfiguration, Live-Seite www.svnord.de) und gegen die
aktuellen Anbieter-Impressen geprüft.

---

## 1. Hosting-Anbieter und Sitz

**Kurzantwort:** Vercel Inc., Covina, Kalifornien, USA. Datenbank bei Neon (Databricks) in der EU-Region Frankfurt am Main.

Ersatztext für Abschnitt 4 des Entwurfs:

> ### 4. Hosting und Datenbank
>
> Unsere Website wird bei einem externen Hosting-Dienstleister betrieben:
> **Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA**.
> Die im Rahmen der Nutzung dieser Website erfassten personenbezogenen Daten
> (insbesondere Server-Logfiles) werden auf den Servern des Hosting-Anbieters
> verarbeitet. Die serverseitige Verarbeitung erfolgt derzeit in der
> Vercel-Region Washington, D.C. (USA).
>
> Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO
> (Data Processing Addendum). Die Übermittlung in die USA ist durch
> EU-Standardvertragsklauseln sowie durch die Zertifizierung von Vercel nach dem
> EU-U.S. Data Privacy Framework abgesichert.
> Datenschutzerklärung des Anbieters: https://vercel.com/legal/privacy-policy
>
> Die Inhalte der Website (Texte, Bilder, Termine, News) sowie über das
> Kontaktformular eingehende Anfragen werden in einer PostgreSQL-Datenbank von
> **Neon, LLC, einem Unternehmen der Databricks, Inc., 160 Spear Street,
> Suite 1300, San Francisco, CA 94105, USA** gespeichert. Der
> Datenbankstandort liegt in der **EU-Region Frankfurt am Main**. Auch mit
> diesem Anbieter besteht ein Vertrag zur Auftragsverarbeitung gemäß
> Art. 28 DSGVO; die Zertifizierung nach dem EU-U.S. Data Privacy Framework
> liegt vor.
>
> Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
> sicheren und effizienten Bereitstellung der Website).

**Hinweis für den Verein:** Die Serverregion für die Verarbeitung ist derzeit
Washington, D.C. (Vercel-Region `iad1`). Sie lässt sich mit einer einzigen
Projekteinstellung auf Frankfurt (`fra1`) umstellen. Dann findet auch die
serverseitige Verarbeitung in der EU statt und der USA-Bezug beschränkt sich auf
den Anbieter selbst. Empfehlung: umstellen, bevor die Erklärung veröffentlicht
wird. Der Text oben ist dann entsprechend auf "Frankfurt am Main" zu ändern.

---

## 2. Name des Consent-Tools

**Kurzantwort:** Es ist keines im Einsatz und es wird auch keines benötigt.

Die Website setzt keine Tracking-, Analyse- oder Marketing-Cookies, bindet keine
Werbenetzwerke ein und lädt keine Social-Media-Plugins. Damit gibt es keine
einwilligungspflichtige Speicherung im Sinne von § 25 Abs. 1 TDDDG, für die ein
Cookie-Banner erforderlich wäre. Ein Consent-Banner ohne einwilligungspflichtige
Verarbeitung wäre reine Fassade und schafft eher Angriffsfläche als Sicherheit.

Ersatztext für Abschnitt 5 des Entwurfs:

> ### 5. Cookies und externe Inhalte
>
> Unsere Website verwendet **keine** Tracking-, Analyse- oder Marketing-Cookies
> und bindet keine Werbenetzwerke oder Social-Media-Plugins ein. Gesetzt werden
> ausschließlich technisch notwendige Daten, die für den Betrieb der Website
> erforderlich sind, insbesondere ein Sitzungs-Cookie im passwortgeschützten
> Redaktionsbereich für angemeldete Redakteurinnen und Redakteure. Diese
> Speicherung ist nach § 25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung zulässig;
> Rechtsgrundlage für die weitere Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO
> (berechtigtes Interesse an einer funktionsfähigen Website).
>
> Ein **Consent-Management-Tool (Cookie-Banner) wird nicht eingesetzt**, da wir
> keine einwilligungsbedürftigen Cookies verwenden.
>
> Bestimmte Seiten binden externe Inhalte ein, bei deren Anzeige technisch
> bedingt Ihre IP-Adresse an den jeweiligen Anbieter übermittelt wird. Dies
> betrifft ausschließlich Kartenkacheln unseres Kartendienstes sowie
> Vereinswappen des Fußballportals FuPa. Diese Inhalte setzen keine Cookies.
> Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
> Darstellung von Spielinformationen und Anfahrtskarten). Einzelheiten zu den
> beteiligten Anbietern finden Sie unter Ziffer 7.

Anmerkung zur Rechtsgrundlage: Der Entwurf nennt "§ 25 TTDSG". Das Gesetz heißt
seit dem 14.05.2024 **TDDDG** (Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz).
Bitte im gesamten Dokument ersetzen.

---

## 3. Weitere eingesetzte Dienste

Der Entwurf fragt zusätzlich nach "evtl. weiteren Diensten (z. B. WordPress,
Fonts, Newsletter, BFV/FuPa etc.)". Vollständige, geprüfte Liste:

| Dienst                     | Anbieter und Sitz                                                                                                 | Zweck                                        | Wann fließen Besucherdaten?                                                                    | Rechtsgrundlage        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| Hosting                    | Vercel Inc., Covina, CA, USA                                                                                      | Betrieb der Website                          | bei jedem Seitenaufruf (Server-Logfiles)                                                       | Art. 6 Abs. 1 lit. f   |
| Datenbank                  | Neon, LLC (Databricks, Inc.), Region Frankfurt am Main                                                            | Inhalte, Kontaktanfragen                     | bei Formularabsendung, sonst serverseitig                                                      | Art. 6 Abs. 1 lit. f/b |
| E-Mail-Versand             | Plus Five Five, Inc. (Resend), 2261 Market Street #5039, San Francisco, CA 94114                                  | Weiterleitung von Kontaktanfragen per E-Mail | nur bei Absenden des Kontaktformulars                                                          | Art. 6 Abs. 1 lit. a/b |
| Kartenkacheln              | Hyperknot Software Kft. (OpenFreeMap), Ungarn; Kartendaten © OpenStreetMap                                        | Anfahrtskarten                               | beim Aufruf von Seiten mit Karte (IP-Adresse)                                                  | Art. 6 Abs. 1 lit. f   |
| Vereinswappen und Bilder   | FuPa GmbH, Peigertinger Str. 9, 94538 Fürstenstein                                                                | Wappen in Spielplan und Tabellen             | beim Aufruf der betreffenden Seiten (IP-Adresse)                                               | Art. 6 Abs. 1 lit. f   |
| Spieldaten FuPa            | FuPa GmbH, Fürstenstein                                                                                           | Spielpläne, Kader, Tabellen                  | nie direkt, Abruf erfolgt über unseren Server                                                  | Art. 6 Abs. 1 lit. f   |
| Spieldaten BFV             | Bayerischer Fußball-Verband e. V., München                                                                        | Spielpläne, Tabellen, Formulare              | nie direkt, Abruf erfolgt über unseren Server                                                  | Art. 6 Abs. 1 lit. f   |
| KI-Assistent auf der Seite | OpenAI Ireland Ltd., 1st Floor, The Liffey Trust Centre, 117-126 Sheriff Street Upper, Dublin 1, D01 YC43, Irland | Beantwortung von Besucherfragen              | nur bei aktiver Nutzung des Chats: übermittelt wird der eingegebene Text, nicht die IP-Adresse | Art. 6 Abs. 1 lit. a/f |
| Mitgliedsanträge           | Lmnop group GmbH (Vereinsplaner), Peter-Behrens-Platz 9, 4020 Linz, Österreich                                    | Online-Anmeldeformulare                      | erst nach Klick auf den Anmeldelink, dann auf der Seite des Anbieters                          | Art. 6 Abs. 1 lit. b   |
| Schriftarten               | keine externe Einbindung                                                                                          | Typografie                                   | nie, Schriften werden von unserem eigenen Server ausgeliefert                                  | entfällt               |

Ausdrücklich **nicht** im Einsatz:

- kein WordPress. Die Website läuft auf Next.js mit dem selbst betriebenen
  Redaktionssystem Payload CMS.
- keine Google Fonts, keine Adobe Fonts. Alle Schriften werden lokal
  ausgeliefert, es besteht keine Verbindung zu Google beim Seitenaufruf.
- kein Google Maps. Die Karten laufen über OpenStreetMap-Daten (siehe oben).
- kein Google Analytics, kein Matomo, kein Meta-Pixel, kein Vercel Analytics,
  kein Tracking irgendeiner Art.
- kein Newsletter, kein Mailchimp, kein Brevo.
- keine eingebetteten YouTube-Videos.
- kein eingebetteter Instagram-Feed. Auf Instagram, Facebook und LinkedIn wird
  ausschließlich verlinkt, es werden keine Plugins geladen.

---

## 4. Korrekturbedarf an den Abschnitten 7 und 12 des Entwurfs

Der Entwurf beschreibt in Abschnitt 7 YouTube und Google Maps und in
Abschnitt 12 externe Links zu Google Maps. Beides trifft auf die Website nicht
zu und sollte gestrichen oder ersetzt werden, sonst enthält die Erklärung
Angaben über Verarbeitungen, die gar nicht stattfinden.

Vorschlag für Abschnitt 7:

- a) Instagram: Text kann bleiben, ergänzt um den Hinweis, dass auf der Website
  **kein** Instagram-Inhalt eingebettet ist, sondern nur verlinkt wird.
- b) YouTube: streichen.
- c) Google Maps: ersetzen durch OpenFreeMap und MapLibre GL JS, Anbieter
  Hyperknot Software Kft., Ungarn. Der Anbieter speichert nach eigener Angabe im
  Normalbetrieb keine IP-Adressen und setzt keine Cookies; nur im Fall eines
  Sicherheitsvorfalls wird die IP-Protokollierung für maximal 30 Tage aktiviert.
  Datenschutzerklärung: https://openfreemap.org/privacy/
- neu d) FuPa und BFV, wie in der Tabelle oben.
- neu e) KI-Assistent, siehe Ziffer 5.

Hinweis zu Abschnitt 12 (externe Links): Google Maps wird nur als
Ziel-Link für die Routenplanung verwendet, also erst nach einem aktiven Klick
der Besucherin oder des Besuchers. Das ist korrekt als externer Link
beschrieben, Google Maps ist aber nicht eingebettet.

---

## 5. Fehlender Abschnitt: KI-Assistent

Auf der Website ist ein Chat-Assistent aktiv, der Fragen zum Verein
beantwortet. Die Eingaben werden serverseitig an OpenAI weitergeleitet. Dieser
Dienst fehlt im Entwurf vollständig und muss aufgenommen werden. Textvorschlag:

> ### KI-gestützter Website-Assistent
>
> Auf unserer Website bieten wir einen KI-gestützten Assistenten an, mit dem Sie
> Fragen zum Verein stellen können. Wenn Sie den Assistenten aktiv nutzen und
> eine Frage absenden, wird der von Ihnen eingegebene Text zur Erzeugung einer
> Antwort an **OpenAI Ireland Ltd., 1st Floor, The Liffey Trust Centre,
> 117-126 Sheriff Street Upper, Dublin 1, D01 YC43, Irland** übermittelt. Die
> Übermittlung erfolgt über unseren Server; Ihre IP-Adresse wird dabei nicht an
> OpenAI weitergegeben. Wir speichern die Chatverläufe nicht.
>
> Bitte geben Sie im Chat keine personenbezogenen Daten und keine vertraulichen
> Informationen ein. Für die Kontaktaufnahme nutzen Sie bitte das
> Kontaktformular oder die im Impressum genannten Kontaktdaten.
>
> Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch aktive Nutzung)
> sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem einfachen
> Informationsangebot).
> Datenschutzhinweise des Anbieters: https://openai.com/policies/privacy-policy

---

## 6. Korrekturen an der bereits veröffentlichten Datenschutzseite

Die Seite www.svnord.de/datenschutz ist bereits online und enthält folgende
Fehler, unabhängig vom PDF-Entwurf:

1. **Anschrift von Vercel veraltet.** Dort steht "340 S Lemon Ave #4133, Walnut,
   CA 91789". Richtig ist "440 N Barranca Avenue #4133, Covina, CA 91723".
2. **Anschrift von FuPa falsch.** Dort steht "Bärenkampallee 14, 32657 Lemgo".
   Laut FuPa-Impressum richtig ist "FuPa GmbH, Peigertinger Str. 9,
   94538 Fürstenstein".
3. **Toter Link.** Der Verweis auf fupa.net/datenschutz läuft ins Leere. Richtig
   ist https://www.fupa.net/about/privacy-policy
4. **Veralteter Link.** neon.tech/privacy-policy leitet inzwischen auf die
   Datenschutzerklärung von Databricks um; auch der Anbietername sollte auf
   "Neon, LLC, ein Unternehmen der Databricks, Inc." aktualisiert werden.
5. **Falsche Aussage zur Zwei-Klick-Lösung.** Im Abschnitt Cookies steht, dass
   BFV-Spielplan, FuPa-Block und Instagram-Feed erst nach aktivem Klick geladen
   werden. Tatsächlich werden die FuPa-Vereinswappen und die Kartenkacheln
   bereits beim Seitenaufruf geladen. Die Aussage muss an die Realität angepasst
   werden, siehe Ersatztext unter Ziffer 2.
6. **Instagram-Feed beschrieben, der nicht existiert.** Der Abschnitt
   "Klick-zum-Laden" beschreibt eine Schaltfläche "Feed laden". Eine solche gibt
   es nicht, die Startseite zeigt eigene, lokal gespeicherte Fotos. Der Abschnitt
   sollte durch den Hinweis ersetzt werden, dass Instagram nur verlinkt wird.
7. **KI-Assistent fehlt**, siehe Ziffer 5.
8. **Mitgliedsanträge über Vereinsplaner fehlen**, siehe Tabelle unter Ziffer 3.
9. **Anbieter des E-Mail-Versands unvollständig.** "Resend Inc." ist nicht die
   Firmierung. Richtig ist "Plus Five Five, Inc. (Marke Resend), 2261 Market
   Street #5039, San Francisco, CA 94114, USA".

**Status:** Alle neun Punkte sind am 24.07.2026 auf der Seite /datenschutz
umgesetzt. Zusätzlich wurden die Kennzahlen im Seitenkopf korrigiert
("Hosting: Vercel (USA)", "DB: Neon · Frankfurt") und das Stand-Datum auf den 24. Juli 2026 gesetzt. Die Abschnitte sind neu durchnummeriert, weil der
KI-Assistent als eigener Abschnitt 09 dazugekommen ist.

---

## 7. Organisatorisch offen, unabhängig vom Text

1. **Auftragsverarbeitungsverträge.** Für Vercel, Neon/Databricks, Resend und
   OpenAI sind die AV-Verträge der Anbieter zu akzeptieren beziehungsweise
   abzuschließen und beim Verein abzulegen. Der Entwurf behauptet in
   Abschnitt 4, dass ein AV-Vertrag "abgeschlossen wurde". Das sollte vor
   Veröffentlichung auch dokumentiert vorliegen.
2. **E-Mail-Absenderdomain.** Der Versand der Kontaktformular-Mails läuft derzeit
   übergangsweise über ein Resend-Konto und eine verifizierte Domain des
   Dienstleisters, nicht über svnord.de. Das sollte auf ein Vereinskonto mit
   verifizierter Domain svnord.de umgestellt werden. Bis dahin verarbeitet der
   Dienstleister Kontaktanfragen mit, wofür formal eine
   Auftragsverarbeitungsvereinbarung zwischen Verein und Dienstleister nötig ist.
3. **Serverregion.** Umstellung von Washington, D.C. auf Frankfurt am Main,
   siehe Ziffer 1.
