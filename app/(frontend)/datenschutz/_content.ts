import type { LegalSection } from "@/components/legal/types";

export const DATENSCHUTZ_SECTIONS: LegalSection[] = [
  {
    id: "verantwortlicher",
    num: "01",
    title: "Verantwortlicher",
    icon: "user",
    intro: "Wer ist für die Datenverarbeitung verantwortlich?",
    blocks: [
      {
        kind: "lead",
        text: "Verantwortlicher im Sinne der DSGVO und anderer nationaler Datenschutzgesetze:",
      },
      {
        kind: "kv",
        rows: [
          { k: "Verein", v: "SV Nord München-Lerchenau e.V." },
          { k: "Adresse", v: "Ebereschenstraße 17, 80935 München" },
          { k: "E-Mail", v: "info@svnord.de", href: "mailto:info@svnord.de" },
          { k: "1. Vorstand", v: "Ralf Kirmeyer" },
          { k: "2. Vorstand", v: "Birgit Höfer" },
          { k: "Vereinsregister", v: "Amtsgericht München · VR 6924" },
        ],
      },
    ],
  },
  {
    id: "allgemein",
    num: "02",
    title: "Allgemeine Hinweise",
    icon: "shield",
    intro: "Grundsätze, Rechtsgrundlagen und Speicherdauer",
    blocks: [
      { kind: "h3", text: "Umfang der Verarbeitung" },
      {
        kind: "p",
        text: "Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung erfolgt regelmäßig nur nach Einwilligung — oder wenn eine gesetzliche Erlaubnis besteht.",
      },
      { kind: "h3", text: "Rechtsgrundlagen" },
      {
        kind: "ul",
        items: [
          "**Art. 6 Abs. 1 lit. a DSGVO** — Einwilligung der betroffenen Person",
          "**Art. 6 Abs. 1 lit. b DSGVO** — Erfüllung eines Vertrages oder vorvertragliche Maßnahmen",
          "**Art. 6 Abs. 1 lit. c DSGVO** — Erfüllung einer rechtlichen Verpflichtung",
          "**Art. 6 Abs. 1 lit. f DSGVO** — berechtigtes Interesse (soweit Ihre Rechte nicht überwiegen)",
        ],
      },
      { kind: "h3", text: "Datenlöschung und Speicherdauer" },
      {
        kind: "p",
        text: "Personenbezogene Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt — es sei denn, eine längere Speicherung ist gesetzlich vorgeschrieben.",
      },
    ],
  },
  {
    id: "logfiles",
    num: "03",
    title: "Server-Logfiles",
    icon: "server",
    intro: "Welche technischen Daten beim Aufruf der Seite anfallen",
    blocks: [
      {
        kind: "lead",
        text: "Bei jedem Aufruf werden automatisiert technische Daten erfasst, die für den Betrieb der Website notwendig sind.",
      },
      {
        kind: "ul",
        items: [
          "IP-Adresse (gekürzt)",
          "Datum und Uhrzeit des Zugriffs",
          "Aufgerufene Seite und HTTP-Statuscode",
          "Übertragene Datenmenge",
          "Referrer-URL",
          "Browser, Betriebssystem und Sprache",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        title: "Speicherdauer",
        text: "Logfiles werden spätestens nach **14 Tagen** gelöscht. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.",
      },
    ],
  },
  {
    id: "hosting",
    num: "04",
    title: "Hosting & Datenbank",
    icon: "globe",
    intro: "Vercel + Neon",
    blocks: [
      { kind: "h3", text: "Vercel (Hosting)" },
      {
        kind: "p",
        text: "Diese Website wird bei einem externen Hosting-Dienstleister betrieben: **Vercel Inc.**, 440 N Barranca Avenue #4133, Covina, CA 91723, USA. Vercel verarbeitet Zugriffsdaten zur Bereitstellung der Website; die serverseitige Verarbeitung erfolgt derzeit in der Vercel-Region Washington, D.C. (USA). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und effizienten Bereitstellung). Die Datenübermittlung in die USA ist durch EU-Standardvertragsklauseln und die Zertifizierung von Vercel nach dem EU-U.S. Data Privacy Framework abgesichert.",
      },
      {
        kind: "p",
        text: "Mit Vercel wurde ein Vertrag zur Auftragsverarbeitung gemäß **Art. 28 DSGVO** (Data Processing Agreement) abgeschlossen. Vercel verarbeitet die Daten der Besucher:innen ausschließlich nach unseren Weisungen.",
      },
      {
        kind: "linkRow",
        label: "Vercel Privacy Policy",
        href: "https://vercel.com/legal/privacy-policy",
        sub: "vercel.com/legal/privacy-policy",
      },
      { kind: "h3", text: "Neon (Datenbank)" },
      {
        kind: "p",
        text: "Inhalte der Website und Kontaktanfragen werden in einer Postgres-Datenbank von **Neon, LLC**, einem Unternehmen der Databricks, Inc. (160 Spear Street, Suite 1300, San Francisco, CA 94105, USA), gespeichert. Der Datenbankstandort ist die **EU-Region Frankfurt am Main**. Auch hier besteht ein Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO; eine Zertifizierung nach dem EU-U.S. Data Privacy Framework liegt vor. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.",
      },
      {
        kind: "linkRow",
        label: "Datenschutzhinweise Neon / Databricks",
        href: "https://www.databricks.com/legal/privacynotice",
        sub: "databricks.com/legal/privacynotice",
      },
    ],
  },
  {
    id: "cookies",
    num: "05",
    title: "Cookies und externe Inhalte",
    icon: "cookie",
    intro: "Kein Tracking, kein Cookie-Banner",
    blocks: [
      {
        kind: "callout",
        tone: "key",
        title: "Wir setzen kein Tracking ein",
        text: "**Keine Tracking-, Analyse- oder Marketing-Cookies, keine Werbenetzwerke, keine Social-Media-Plugins.** Gesetzt wird nur ein technisch notwendiges Sitzungs-Cookie im passwortgeschützten Redaktionsbereich für angemeldete Redakteur:innen. Das ist nach § 25 Abs. 2 Nr. 2 TDDDG (ehemals TTDSG) ohne Einwilligung zulässig; Rechtsgrundlage der weiteren Verarbeitung ist unser berechtigtes Interesse an einer funktionsfähigen Website (Art. 6 Abs. 1 lit. f DSGVO).",
      },
      {
        kind: "p",
        text: "Ein **Consent-Management-Tool (Cookie-Banner) ist nicht im Einsatz** und ist auch nicht erforderlich, weil wir keine einwilligungsbedürftigen Cookies verwenden (§ 25 Abs. 1 TDDDG).",
      },
      {
        kind: "p",
        text: "Einzelne Seiten binden externe Inhalte ein, bei deren Anzeige technisch bedingt Ihre IP-Adresse an den jeweiligen Anbieter übermittelt wird: die Kartenkacheln unserer Anfahrtskarten und die Vereinswappen des Fußballportals FuPa. Diese Inhalte setzen keine Cookies. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Darstellung von Spielinformationen und Anfahrtskarten). Die beteiligten Anbieter finden Sie unter „Eingebettete Drittanbieter“.",
      },
    ],
  },
  {
    id: "kontaktformular",
    num: "06",
    title: "Kontaktformular",
    icon: "mail",
    intro: "Datenfluss bei Anfragen über das Formular",
    blocks: [
      {
        kind: "lead",
        text: "Bei Nutzung des Kontaktformulars werden folgende Daten an uns übermittelt und gespeichert:",
      },
      {
        kind: "ul",
        items: [
          "Name",
          "E-Mail-Adresse",
          "Telefonnummer (optional)",
          "Nachricht",
        ],
      },
      {
        kind: "p",
        text: "Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Daten werden ausschließlich für die Bearbeitung Ihrer Anfrage verwendet und gelöscht, sobald die Konversation beendet ist.",
      },
      { kind: "h3", text: "Resend (E-Mail-Versand)" },
      {
        kind: "p",
        text: "Zum technischen Versand nutzen wir **Resend** (Plus Five Five, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA). Die Datenübermittlung in die USA ist durch EU-Standardvertragsklauseln und die Zertifizierung des Anbieters nach dem EU-U.S. Data Privacy Framework abgesichert.",
      },
      {
        kind: "linkRow",
        label: "Resend Privacy Policy",
        href: "https://resend.com/legal/privacy-policy",
        sub: "resend.com/legal/privacy-policy",
      },
    ],
  },
  {
    id: "mitglieder",
    num: "07",
    title: "Mitgliederverwaltung",
    icon: "doc",
    intro: "Datenkategorien, Zweck, Aufbewahrung",
    blocks: [
      {
        kind: "lead",
        text: "Zur Mitgliederverwaltung verarbeiten wir folgende Datenkategorien:",
      },
      {
        kind: "ul",
        items: [
          "Name, Vorname, Geburtsdatum",
          "Anschrift, Telefon, E-Mail",
          "Bankverbindung (IBAN) für Beitragseinzug",
          "Abteilungs- und Mannschaftszugehörigkeit",
          "Bei Minderjährigen: Kontaktdaten der Erziehungsberechtigten",
        ],
      },
      {
        kind: "p",
        text: "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Mitgliedschaftsvertrag) und Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Aufbewahrung).",
      },
      {
        kind: "callout",
        tone: "info",
        title: "Aufbewahrung",
        text: "Mitgliedsdaten werden gelöscht, sobald die Mitgliedschaft endet und gesetzliche Aufbewahrungspflichten (v. a. § 147 AO, § 257 HGB — max. **10 Jahre**) erfüllt sind.",
      },
      { kind: "h3", text: "Online-Anmeldung (Vereinsplaner)" },
      {
        kind: "p",
        text: "Die Aufnahmeanträge auf der Seite „Mitgliedschaft“ sind **Verlinkungen** auf Formulare unseres Vereinsverwaltungsprogramms **Vereinsplaner** (Lmnop group GmbH, Peter-Behrens-Platz 9, 4020 Linz, Österreich). Erst wenn Sie einen dieser Links anklicken, verlassen Sie unsere Website und Ihre Angaben werden dort erhoben. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Anbahnung der Mitgliedschaft). Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.",
      },
      {
        kind: "linkRow",
        label: "Vereinsplaner Datenschutz",
        href: "https://vereinsplaner.at/privacypolicy",
        sub: "vereinsplaner.at/privacypolicy",
      },
    ],
  },
  {
    id: "dritte",
    num: "08",
    title: "Eingebettete Drittanbieter",
    icon: "globe",
    intro: "BFV · FuPa · Karten · Instagram · Social",
    blocks: [
      { kind: "h3", text: "BFV (Bayerischer Fußball-Verband)" },
      {
        kind: "p",
        text: "Spielpläne, Tabellen und Kaderlisten beziehen wir über die öffentliche Widget-API des **Bayerischen Fußball-Verbands e. V.** (Brienner Straße 50, 80333 München). Der Abruf erfolgt über unseren Server, Ihre IP-Adresse wird dabei **nicht** an den BFV übermittelt. Klicken Sie auf ein verlinktes BFV-Formular oder eine BFV-Seite, gelten die Datenschutzhinweise des BFV.",
      },
      {
        kind: "linkRow",
        label: "BFV Datenschutz",
        href: "https://www.bfv.de/datenschutz",
        sub: "bfv.de/datenschutz",
      },
      { kind: "h3", text: "FuPa" },
      {
        kind: "p",
        text: "Spielpläne, Tabellen und Kaderdaten beziehen wir über die öffentliche API der **FuPa GmbH** (Peigertinger Str. 9, 94538 Fürstenstein). Diese Daten holt unser Server, Ihre IP-Adresse wird dabei nicht übermittelt. Die **Vereinswappen** der Gegner werden dagegen direkt von den FuPa-Bildservern geladen; dabei werden Ihre IP-Adresse, Browserkennung und die aufgerufene Seite an FuPa übertragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Darstellung der Spielinformationen).",
      },
      {
        kind: "linkRow",
        label: "FuPa Datenschutz",
        href: "https://www.fupa.net/about/privacy-policy",
        sub: "fupa.net/about/privacy-policy",
      },
      { kind: "h3", text: "Karten (MapLibre / OpenFreeMap)" },
      {
        kind: "p",
        text: "Anfahrtskarten stellen wir mit der Open-Source-Bibliothek **MapLibre GL JS** dar, die von unserem eigenen Server ausgeliefert wird. Die Kartenkacheln stammen von **OpenFreeMap**, betrieben von der Hyperknot Software Kft. (Ungarn), Kartendaten © OpenStreetMap-Mitwirkende. Beim Laden einer Karte wird Ihre IP-Adresse an diesen Dienst übermittelt. Der Anbieter setzt keine Cookies und speichert nach eigenen Angaben im Normalbetrieb keine IP-Adressen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.",
      },
      {
        kind: "linkRow",
        label: "OpenFreeMap Datenschutz",
        href: "https://openfreemap.org/privacy/",
        sub: "openfreemap.org/privacy",
      },
      { kind: "h3", text: "Instagram" },
      {
        kind: "callout",
        tone: "key",
        title: "Kein eingebetteter Feed",
        text: "Wir binden **keinen** Instagram-Feed und keine Instagram-Plugins ein. Die Fotos auf unserer Startseite liegen auf unserem eigenen Server. Wir **verlinken** lediglich auf unser Instagram-Profil; erst wenn Sie diesen Link anklicken, werden Daten an Meta Platforms Ireland Ltd. übertragen.",
      },
      { kind: "h3", text: "Social-Media-Verlinkungen" },
      {
        kind: "p",
        text: "Im Footer verlinken wir auf unsere Social-Media-Präsenzen. Bei einem Klick werden Sie zur jeweiligen Plattform weitergeleitet. **Wir binden keine Social-Plugins ein**, die bereits beim Laden der Seite Daten übertragen.",
      },
    ],
  },
  {
    id: "ki-assistent",
    num: "09",
    title: "KI-gestützter Website-Assistent",
    icon: "key",
    intro: "Was passiert mit dem, was du in den Chat tippst",
    blocks: [
      {
        kind: "lead",
        text: "Auf unserer Website bieten wir einen KI-gestützten Assistenten an, der Fragen zum Verein beantwortet.",
      },
      {
        kind: "p",
        text: "Wenn Sie den Assistenten **aktiv nutzen** und eine Frage absenden, wird der von Ihnen eingegebene Text zur Erzeugung einer Antwort an **OpenAI Ireland Ltd.** (1st Floor, The Liffey Trust Centre, 117-126 Sheriff Street Upper, Dublin 1, D01 YC43, Irland) übermittelt. Die Übermittlung läuft über unseren Server; Ihre IP-Adresse wird dabei **nicht** an OpenAI weitergegeben. Ohne Ihre Eingabe findet keine Übermittlung statt.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Bitte keine sensiblen Daten eingeben",
        text: "Geben Sie im Chat **keine personenbezogenen oder vertraulichen Informationen** ein. Für Anliegen, die persönliche Daten betreffen, nutzen Sie bitte das [Kontaktformular](/kontakt) oder die im Impressum genannten Kontaktdaten. Wir speichern die Chatverläufe nicht.",
      },
      {
        kind: "p",
        text: "Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch die aktive Nutzung des Chats) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem niedrigschwelligen Informationsangebot).",
      },
      {
        kind: "linkRow",
        label: "OpenAI Privacy Policy",
        href: "https://openai.com/policies/eu-privacy-policy/",
        sub: "openai.com/policies/eu-privacy-policy",
      },
    ],
  },
  {
    id: "rechte",
    num: "10",
    title: "Rechte der betroffenen Person",
    icon: "scale",
    intro: "Ihre DSGVO-Rechte gegenüber dem Verein",
    blocks: [
      {
        kind: "lead",
        text: "Werden Ihre personenbezogenen Daten verarbeitet, stehen Ihnen folgende Rechte zu:",
      },
      {
        kind: "ul",
        items: [
          "**Recht auf Auskunft** (Art. 15 DSGVO)",
          "**Recht auf Berichtigung** (Art. 16 DSGVO)",
          "**Recht auf Löschung** (Art. 17 DSGVO)",
          "**Recht auf Einschränkung der Verarbeitung** (Art. 18 DSGVO)",
          "**Recht auf Datenübertragbarkeit** (Art. 20 DSGVO)",
          "**Widerspruchsrecht** (Art. 21 DSGVO)",
          "**Widerrufsrecht** bei Einwilligungen (Art. 7 Abs. 3 DSGVO)",
        ],
      },
      {
        kind: "callout",
        tone: "info",
        title: "Anfrage stellen",
        text: "Zur Ausübung genügt eine formlose Mitteilung an [info@svnord.de](mailto:info@svnord.de?subject=Datenschutz%20%E2%80%94%20Auskunft).",
      },
      { kind: "h3", text: "Beschwerderecht bei der Aufsichtsbehörde" },
      {
        kind: "p",
        text: "Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren — insbesondere im Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts.",
      },
      {
        kind: "kv",
        rows: [
          { k: "Behörde", v: "Bayerisches Landesamt für Datenschutzaufsicht" },
          { k: "Adresse", v: "Promenade 18, 91522 Ansbach" },
          { k: "Telefon", v: "0981 180093-0" },
          {
            k: "Web",
            v: "lda.bayern.de",
            href: "https://www.lda.bayern.de",
          },
        ],
      },
    ],
  },
  {
    id: "tls",
    num: "11",
    title: "SSL-/TLS-Verschlüsselung",
    icon: "lock",
    intro: "Sichere Übertragung vertraulicher Inhalte",
    blocks: [
      {
        kind: "p",
        text: "Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie am Schloss-Symbol in der Adresszeile sowie am **https://**-Präfix.",
      },
    ],
  },
];
