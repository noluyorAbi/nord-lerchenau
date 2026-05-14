/**
 * Rewrites the legal-pages global (Impressum + Datenschutz) with a proper
 * Lexical document — H2/H3 headings, bullet lists, inline bold + links —
 * so the rendered page is not a wall of text.
 *
 * Run: bun run scripts/update-legal-pages.ts
 */
import { getPayload } from "payload";

import config from "@/payload.config";

type LexNode = Record<string, unknown>;

function textRun(text: string, format = 0): LexNode {
  return {
    type: "text",
    text,
    format,
    version: 1,
    detail: 0,
    mode: "normal",
    style: "",
  };
}

function parseInline(text: string): LexNode[] {
  const out: LexNode[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push(textRun(buf));
      buf = "";
    }
  };
  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 1) {
        flush();
        out.push(textRun(text.slice(i + 2, end), 1));
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "[") {
      const close = text.indexOf("]", i);
      if (close > i && text[close + 1] === "(") {
        const paren = text.indexOf(")", close);
        if (paren > close) {
          flush();
          const label = text.slice(i + 1, close);
          const url = text.slice(close + 2, paren);
          out.push({
            type: "link",
            version: 1,
            indent: 0,
            format: "",
            direction: "ltr",
            fields: {
              url,
              newTab: /^https?:\/\//.test(url),
              linkType: "custom",
            },
            children: parseInline(label),
          });
          i = paren + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return out;
}

function paragraph(text: string): LexNode {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: parseInline(text),
  };
}

function heading(tag: "h2" | "h3" | "h4", text: string): LexNode {
  return {
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: parseInline(text),
  };
}

function bulletList(items: string[]): LexNode {
  return {
    type: "list",
    listType: "bullet",
    tag: "ul",
    start: 1,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: items.map((item, idx) => ({
      type: "listitem",
      value: idx + 1,
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: parseInline(item),
        },
      ],
    })),
  };
}

function mdRich(input: string): { root: LexNode } {
  const lines = input.split("\n");
  const blocks: LexNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("#### ")) {
      blocks.push(heading("h4", line.slice(5).trim()));
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(heading("h3", line.slice(4).trim()));
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(heading("h2", line.slice(3).trim()));
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push(bulletList(items));
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !lines[i].startsWith("#### ") &&
      !lines[i].startsWith("- ")
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(paragraph(para.join(" ")));
  }
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: blocks,
    },
  };
}

const IMPRESSUM = `## Angaben gemäß § 5 TMG

**SV Nord München-Lerchenau e.V.**
Ebereschenstraße 17, 80935 München

## Vertreten durch

- **Name:** Ralf Kirmeyer
- **Kontakt:** Ebereschenstraße 17, 80935 München
- **Telefon:** 0172 9808109
- **E-Mail:** [ralf.kirmeyer@svnord.de](mailto:ralf.kirmeyer@svnord.de)

## Registereintrag

Eintragung im Vereinsregister.

- **Registergericht:** München
- **Registernummer:** VR 6924

## Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV

**Ralf Kirmeyer**
Ebereschenstraße 17, 80935 München

## Haftung für Inhalte

Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.

Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.

Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.

## Haftung für Links

Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.

Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.

Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.

## Urheberrecht

Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.

Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.

Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.`;

const DATENSCHUTZ = `## 1. Verantwortlicher

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist:

**SV Nord München-Lerchenau e.V.**
Ebereschenstraße 17, 80935 München, Deutschland

- **Telefon:** 0172 2392919
- **E-Mail:** [info@svnord.de](mailto:info@svnord.de)

Vertreten durch den 1. Vorstand Ralf Kirmeyer. Eingetragen im Vereinsregister beim Amtsgericht München unter VR 6924.

## 2. Allgemeine Hinweise zur Datenverarbeitung

### Umfang der Verarbeitung personenbezogener Daten

Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten unserer Nutzer erfolgt regelmäßig nur nach Einwilligung des Nutzers.

Eine Ausnahme gilt in solchen Fällen, in denen eine vorherige Einholung einer Einwilligung aus tatsächlichen Gründen nicht möglich ist und die Verarbeitung der Daten durch gesetzliche Vorschriften gestattet ist.

### Rechtsgrundlagen der Datenverarbeitung

- **Art. 6 Abs. 1 lit. a DSGVO** — Einwilligung der betroffenen Person
- **Art. 6 Abs. 1 lit. b DSGVO** — Erfüllung eines Vertrages oder vorvertraglicher Maßnahmen
- **Art. 6 Abs. 1 lit. c DSGVO** — Erfüllung einer rechtlichen Verpflichtung
- **Art. 6 Abs. 1 lit. f DSGVO** — Wahrung eines berechtigten Interesses (soweit Interessen, Grundrechte und Grundfreiheiten der Betroffenen nicht überwiegen)

### Datenlöschung und Speicherdauer

Personenbezogene Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt. Eine längere Speicherung erfolgt nur, wenn dies durch europäische oder nationale Vorschriften vorgesehen ist (z. B. Aufbewahrungspflichten) oder eine Erforderlichkeit zur Vertragserfüllung besteht.

## 3. Bereitstellung der Website und Erstellung von Logfiles

Bei jedem Aufruf unserer Internetseite erfasst unser System automatisiert Daten und Informationen vom Computersystem des aufrufenden Rechners.

Folgende Daten werden hierbei erhoben:

- IP-Adresse des Nutzers (gekürzt)
- Datum und Uhrzeit des Zugriffs
- Zeitzonendifferenz zur Greenwich Mean Time (GMT)
- Inhalt der Anforderung (konkrete Seite)
- Zugriffsstatus / HTTP-Statuscode
- Jeweils übertragene Datenmenge
- Website, von der die Anforderung kommt (Referrer)
- Browser, Betriebssystem, Sprache und Version der Browsersoftware

Rechtsgrundlage für die vorübergehende Speicherung ist Art. 6 Abs. 1 lit. f DSGVO. Logfiles werden spätestens nach **14 Tagen** gelöscht.

## 4. Hosting und Content Delivery Network

### Vercel

Diese Website wird bei **Vercel Inc.**, 340 S Lemon Ave #4133, Walnut, CA 91789, USA, gehostet. Vercel verarbeitet Zugriffsdaten (siehe Abschnitt 3) zur Bereitstellung der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Vercel verarbeitet Daten ggf. in den USA; die Datenübermittlung ist durch Standardvertragsklauseln und die DPF-Zertifizierung von Vercel abgesichert.

Weitere Informationen: [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy)

### Neon (Datenbank)

Inhalte unserer Website sowie Daten aus dem Mitgliedsbereich werden in einer Postgres-Datenbank bei **Neon Inc.**, 2261 Market Street #4668, San Francisco, CA 94114, USA, gespeichert. Neon verarbeitet Daten in der EU (Frankfurt am Main). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

Weitere Informationen: [neon.tech/privacy-policy](https://neon.tech/privacy-policy)

## 5. Cookies

Unsere Website verwendet ausschließlich **funktional notwendige Cookies**. Diese Cookies sind erforderlich, um bestimmte Funktionen bereitzustellen (z. B. Navigation, Seitenspeicher). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; die Verwendung notwendiger Cookies ist nach § 25 Abs. 2 Nr. 2 TTDSG ohne Einwilligung zulässig.

Wir setzen **keine Tracking- oder Analyse-Cookies** und **keine Marketing-Cookies** ein. Drittanbieter-Cookies werden nur dann geladen, wenn Sie eingebettete Inhalte (z. B. BFV-Spielplan, FuPa-Block, Instagram-Feed) aktiv aufrufen.

## 6. Kontaktformular und E-Mail-Kontakt

Auf unserer Website befindet sich ein Kontaktformular für die elektronische Kontaktaufnahme. Folgende Daten werden bei Nutzung übermittelt und gespeichert:

- Name
- E-Mail-Adresse
- Telefonnummer (optional)
- Nachricht

Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Daten werden ausschließlich für die Bearbeitung Ihrer Anfrage verwendet und gelöscht, sobald die Konversation beendet ist.

### Resend (E-Mail-Versand)

Zum technischen Versand von Kontaktformular-Benachrichtigungen nutzen wir **Resend**, betrieben von Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA. Resend verarbeitet dabei Absender-, Empfänger- und Inhaltsdaten der E-Mail. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Datenübermittlung in die USA ist durch Standardvertragsklauseln abgesichert.

Weitere Informationen: [resend.com/legal/privacy-policy](https://resend.com/legal/privacy-policy)

## 7. Mitgliederverwaltung

Zur Mitgliederverwaltung erheben und verarbeiten wir folgende personenbezogene Daten:

- Name, Vorname, Geburtsdatum
- Anschrift, Telefonnummer, E-Mail-Adresse
- Bankverbindung (IBAN) für Beitragseinzug
- Abteilungs- und Mannschaftszugehörigkeit
- Bei minderjährigen Mitgliedern: Kontaktdaten der Erziehungsberechtigten

Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Mitgliedschaftsvertrag) sowie Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Aufbewahrungspflichten).

Mitgliedsdaten werden gelöscht, sobald die Mitgliedschaft endet und gesetzliche Aufbewahrungspflichten (v. a. § 147 AO, § 257 HGB, max. 10 Jahre) erfüllt sind.

## 8. Eingebettete Inhalte Dritter

Auf einzelnen Seiten binden wir Daten folgender Drittanbieter ein:

### BFV (Bayerischer Fußball-Verband)

Spielpläne, Tabellen und Kaderlisten beziehen wir über die öffentliche Widget-API des BFV (widget-prod.bfv.de). Beim Aufruf der entsprechenden Seiten kann Ihre IP-Adresse an den BFV übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

Datenschutzerklärung des BFV: [bfv.de/datenschutz](https://www.bfv.de/datenschutz)

### FuPa

Spielerprofile und Vereinsdaten beziehen wir über die öffentliche API von **FuPa GmbH**, Bärenkampallee 14, 32657 Lemgo. Beim Aufruf der entsprechenden Seiten kann Ihre IP-Adresse an FuPa übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

Datenschutzerklärung von FuPa: [fupa.net/datenschutz](https://www.fupa.net/datenschutz)

### Kartenanbieter (MapLibre / OpenFreeMap)

Zur Darstellung der Karte im Vereinsheim- und Kontakt-Bereich nutzen wir **MapLibre GL JS** mit Kacheldaten von **OpenFreeMap** (Kartendaten © OpenStreetMap-Mitwirkende). Beim Laden der Karte wird Ihre IP-Adresse an den Kacheldienst übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

### Instagram (auf Klick)

Auf der Startseite kann ein Instagram-Feed eingebettet werden. Der Feed wird **erst nach ausdrücklichem Klick** auf "Feed laden" geladen. Beim Laden werden Daten (Cookies, IP-Adresse) an Meta Platforms Ireland Ltd. übertragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).

### Social-Media-Verlinkungen

Im Footer verlinken wir auf unsere Social-Media-Präsenzen. Bei einem Klick werden Sie zur jeweiligen Plattform weitergeleitet und es gelten deren Datenschutzbestimmungen. **Wir binden keine Social-Plugins ein**, die bereits beim Laden der Seite Daten übertragen.

## 9. Rechte der betroffenen Person

Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener i. S. d. DSGVO und es stehen Ihnen folgende Rechte gegenüber dem Verantwortlichen zu:

- **Recht auf Auskunft** (Art. 15 DSGVO)
- **Recht auf Berichtigung** (Art. 16 DSGVO)
- **Recht auf Löschung** (Art. 17 DSGVO)
- **Recht auf Einschränkung der Verarbeitung** (Art. 18 DSGVO)
- **Recht auf Datenübertragbarkeit** (Art. 20 DSGVO)
- **Widerspruchsrecht** gegen Verarbeitungen nach Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)
- **Widerrufsrecht** bei Einwilligungen (Art. 7 Abs. 3 DSGVO)

Zur Ausübung dieser Rechte genügt eine formlose Mitteilung an [info@svnord.de](mailto:info@svnord.de).

### Beschwerderecht bei der Aufsichtsbehörde

Sie haben das Recht, sich jederzeit bei einer Aufsichtsbehörde zu beschweren, insbesondere im Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts.

Zuständige Aufsichtsbehörde für Bayern:

**Bayerisches Landesamt für Datenschutzaufsicht**
Promenade 18, 91522 Ansbach

- **Telefon:** 0981 180093-0
- **Web:** [lda.bayern.de](https://www.lda.bayern.de)

## 10. SSL-/TLS-Verschlüsselung

Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und am Schloss-Symbol in Ihrer Browserzeile.`;

async function main() {
  const payload = await getPayload({ config });

  await payload.updateGlobal({
    slug: "legal-pages",
    data: {
      impressumBody: mdRich(IMPRESSUM),
      datenschutzBody: mdRich(DATENSCHUTZ),
    } as never,
  });

  console.log("✓ Updated legal-pages (Impressum + Datenschutz)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
