import type { LegalSection } from "@/components/legal/LegalSections";

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
          { k: "Telefon", v: "0172 2392919", href: "tel:+491722392919" },
          { k: "E-Mail", v: "info@svnord.de", href: "mailto:info@svnord.de" },
          { k: "Vertretung", v: "1. Vorstand Ralf Kirmeyer" },
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
        text: "Diese Website wird bei **Vercel Inc.** (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Vercel verarbeitet Zugriffsdaten zur Bereitstellung der Website. Datenübermittlung in die USA durch Standardvertragsklauseln und DPF-Zertifizierung abgesichert.",
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
        text: "Inhalte und Mitgliedsdaten werden in einer Postgres-Datenbank bei **Neon Inc.** in der EU-Region Frankfurt am Main gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.",
      },
      {
        kind: "linkRow",
        label: "Neon Privacy Policy",
        href: "https://neon.tech/privacy-policy",
        sub: "neon.tech/privacy-policy",
      },
    ],
  },
  {
    id: "cookies",
    num: "05",
    title: "Cookies",
    icon: "cookie",
    intro: "Nur funktional notwendige Cookies",
    blocks: [
      {
        kind: "callout",
        tone: "key",
        title: "Wir setzen kein Tracking ein",
        text: "**Keine Tracking-, Analyse- oder Marketing-Cookies.** Nur funktional notwendige Cookies, zulässig nach § 25 Abs. 2 Nr. 2 TTDSG ohne Einwilligung.",
      },
      {
        kind: "p",
        text: "Drittanbieter-Cookies werden ausschließlich geladen, wenn Sie eingebettete Inhalte (z. B. BFV-Spielplan, FuPa-Block, Instagram-Feed) **aktiv** durch Klick laden.",
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
        text: "Zum technischen Versand nutzen wir **Resend Inc.** (San Francisco, CA, USA). Datenübermittlung in die USA durch Standardvertragsklauseln abgesichert.",
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
    ],
  },
  {
    id: "dritte",
    num: "08",
    title: "Eingebettete Drittanbieter",
    icon: "globe",
    intro: "BFV · FuPa · MapLibre · Instagram · Social",
    blocks: [
      { kind: "h3", text: "BFV (Bayerischer Fußball-Verband)" },
      {
        kind: "p",
        text: "Spielpläne, Tabellen und Kaderlisten beziehen wir über die öffentliche Widget-API des BFV. Beim Aufruf der entsprechenden Seiten kann Ihre IP-Adresse an den BFV übermittelt werden.",
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
        text: "Spielerprofile und Vereinsdaten beziehen wir über die öffentliche API von **FuPa GmbH** (Bärenkampallee 14, 32657 Lemgo). Beim Aufruf der entsprechenden Seiten kann Ihre IP-Adresse an FuPa übermittelt werden.",
      },
      {
        kind: "linkRow",
        label: "FuPa Datenschutz",
        href: "https://www.fupa.net/datenschutz",
        sub: "fupa.net/datenschutz",
      },
      { kind: "h3", text: "MapLibre / OpenFreeMap" },
      {
        kind: "p",
        text: "Karten werden mit **MapLibre GL JS** und Kacheln von **OpenFreeMap** (Kartendaten © OpenStreetMap-Mitwirkende) dargestellt. Beim Laden wird Ihre IP an den Kacheldienst übermittelt.",
      },
      { kind: "h3", text: "Instagram (Klick-zum-Laden)" },
      {
        kind: "callout",
        tone: "key",
        title: "Nur auf ausdrücklichen Klick",
        text: "Der Instagram-Feed auf der Startseite wird **erst nach Klick** auf „Feed laden“ geladen. Erst dann werden Daten (Cookies, IP-Adresse) an Meta Platforms Ireland Ltd. übertragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO.",
      },
      { kind: "h3", text: "Social-Media-Verlinkungen" },
      {
        kind: "p",
        text: "Im Footer verlinken wir auf unsere Social-Media-Präsenzen. Bei einem Klick werden Sie zur jeweiligen Plattform weitergeleitet. **Wir binden keine Social-Plugins ein**, die bereits beim Laden der Seite Daten übertragen.",
      },
    ],
  },
  {
    id: "rechte",
    num: "09",
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
    num: "10",
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
