import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const JugendschutzPage: GlobalConfig = {
  slug: "jugendschutz-page",
  label: "Kinder- & Jugendschutz",
  admin: {
    group: "4. Seiten",
    description:
      "Inhalte der Seite /verein/jugendschutz (Schutzkonzept, Texte, Ansprechpartner, BFV-Link).",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("jugendschutz-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Kopfbereich (ganz oben)",
      admin: {
        description: "Großer Titelbereich oben auf der Seite.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Kleiner Text über der Hauptüberschrift." },
          defaultValue: "Verein · Schutzkonzept",
        },
        {
          name: "title",
          type: "text",
          label: "Überschrift",
          admin: { description: "Hauptüberschrift der Seite." },
          defaultValue: "Kinder- & Jugendschutz",
        },
        {
          name: "lede",
          type: "textarea",
          label: "Einleitungstext",
          admin: {
            description: "Kurzer Einleitungssatz unter der Überschrift.",
          },
          defaultValue:
            "Schutzkonzept des SV Nord München-Lerchenau e.V. für den respektvollen und sicheren Umgang mit den uns anvertrauten Kindern und Jugendlichen.",
        },
      ],
    },
    {
      name: "meta",
      type: "group",
      label: "Status-Leiste",
      admin: {
        description: "Die kleinen Marker-Felder direkt unter dem Kopfbereich.",
      },
      fields: [
        {
          name: "lastUpdated",
          type: "text",
          label: "Stand (Datum)",
          admin: {
            description: 'Wird als "Stand · …" angezeigt.',
          },
          defaultValue: "2. Juni 2026",
        },
        {
          name: "badgeSchutzkonzept",
          type: "text",
          label: "Marker 1 (gold)",
          admin: { description: "Hervorgehobener Marker (goldener Rahmen)." },
          defaultValue: "Schutzkonzept",
        },
        {
          name: "badgeFuehrungszeugnis",
          type: "text",
          label: "Marker 2",
          admin: { description: "Zweiter Marker rechts daneben." },
          defaultValue: "Erweitertes Führungszeugnis",
        },
      ],
    },
    {
      name: "section1",
      type: "group",
      label: "Abschnitt 01 · Erweitertes Führungszeugnis",
      admin: {
        description:
          "Erster Abschnitt mit dem BFV-Link am Ende des zweiten Absatzes.",
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titel",
          admin: { description: "Überschrift des Abschnitts." },
          defaultValue: "Erweitertes Führungszeugnis",
        },
        {
          name: "intro",
          type: "text",
          label: "Unterzeile",
          admin: { description: "Kleine Zeile neben der Abschnittsnummer." },
          defaultValue: "Grundlage des Kinder- und Jugendschutzes",
        },
        {
          name: "lead",
          type: "textarea",
          label: "Einleitungsabsatz (hervorgehoben)",
          admin: { description: "Erster, etwas größerer Absatz." },
          defaultValue:
            "Die Verpflichtung zur Vorlage eines erweiterten Führungszeugnisses ist eine der wichtigsten Maßnahmen zum Kinder- und Jugendschutz im Verein. Sie sorgt dafür, dass Personen, die wegen bestimmter Straftaten (insbesondere Sexualdelikten) verurteilt wurden, nicht im Kinder- und Jugendbereich eingesetzt werden.",
        },
        {
          name: "body",
          type: "textarea",
          label: "Folgeabsatz",
          admin: {
            description:
              'An diesen Absatz wird automatisch der Hinweis "Siehe auch [BFV-Link]" angehängt.',
          },
          defaultValue:
            "Alle unsere Trainer und Übungsleiter haben dem Verein ein erweitertes Führungszeugnis vorgelegt.",
        },
        {
          name: "bfvLinkLabel",
          type: "text",
          label: "BFV-Link: Beschriftung",
          admin: { description: "Sichtbarer Text des verlinkten Wortes." },
          defaultValue: "Bayerischer Fußball-Verband",
        },
        {
          name: "bfvLinkHref",
          type: "text",
          label: "BFV-Link: Adresse (URL)",
          admin: { description: "Ziel-Adresse des BFV-Links." },
          defaultValue: "https://www.bfv.de",
        },
      ],
    },
    {
      name: "section2",
      type: "group",
      label: "Abschnitt 02 · Schutz vor sexuellem Missbrauch",
      admin: { description: "Zweiter Abschnitt mit einem einzelnen Absatz." },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titel",
          admin: { description: "Überschrift des Abschnitts." },
          defaultValue: "Schutz vor sexuellem Missbrauch",
        },
        {
          name: "intro",
          type: "text",
          label: "Unterzeile",
          admin: { description: "Kleine Zeile neben der Abschnittsnummer." },
          defaultValue: "Unser gemeinsamer Auftrag",
        },
        {
          name: "body",
          type: "textarea",
          label: "Absatz",
          admin: { description: "Fließtext des Abschnitts." },
          defaultValue:
            "Schutz vor sexuellem Missbrauch bedeutet, respektvoll und achtsam mit den uns anvertrauten Kindern und Jugendlichen umzugehen. Wir haben eine Mitverantwortung, dass Kinder und Jugendliche bei uns sicher sind. Wir wollen sie vor sexuellem Missbrauch in allen unseren Angebotsbereichen schützen und sind dabei alle gefordert, wachsam zu sein und auch präventiv zu arbeiten, um die Möglichkeiten für Täter und Täterinnen zu minimieren.",
        },
      ],
    },
    {
      name: "section3",
      type: "group",
      label: "Abschnitt 03 · Hintergrund und Zahlen",
      admin: {
        description: "Dritter Abschnitt mit Aufzählung zwischen zwei Absätzen.",
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titel",
          admin: { description: "Überschrift des Abschnitts." },
          defaultValue: "Hintergrund und Zahlen",
        },
        {
          name: "intro",
          type: "text",
          label: "Unterzeile",
          admin: { description: "Kleine Zeile neben der Abschnittsnummer." },
          defaultValue: "Daten der Bayerischen Sportjugend",
        },
        {
          name: "body1",
          type: "textarea",
          label: "Absatz vor der Aufzählung",
          admin: { description: "Einleitender Satz über der Liste." },
          defaultValue:
            "Die Zahlen der Bayerischen Sportjugend zur sexuellen Gewalt in Deutschland sind erschreckend:",
        },
        {
          name: "items",
          type: "array",
          label: "Aufzählung (Zahlen / Fakten)",
          labels: { singular: "Listenpunkt", plural: "Listenpunkte" },
          admin: { description: "Liste der Stichpunkte mit den Daten." },
          fields: [
            {
              name: "text",
              type: "textarea",
              required: true,
              label: "Listenpunkt",
            },
          ],
          defaultValue: [
            {
              text: "Jedes vierte bis fünfte Mädchen und jeder achte bis zehnte Junge unter 18 ist betroffen.",
            },
            {
              text: "Männer und Frauen können Täter bzw. Täterin sein (85 bis 90 % männlich).",
            },
            {
              text: "Die Täterinnen und Täter kommen aus allen Altersgruppen (etwa ein Drittel ist unter 21 Jahre alt).",
            },
            {
              text: "Die Täterinnen und Täter kommen meist aus dem sozialen Umfeld des Opfers (Familie ca. 20 bis 30 %, Bekannte ca. 50 %, Fremde ca. 10 bis 15 %).",
            },
          ],
        },
        {
          name: "body2",
          type: "textarea",
          label: "Absatz nach der Aufzählung",
          admin: { description: "Abschließender Fließtext des Abschnitts." },
          defaultValue:
            "Sexuelle Gewalt ist eine Grenzverletzung und meint jede sexuelle Handlung, die an einer anderen Person gegen deren Willen vorgenommen wird. Gerade im Sport gibt es eine Sondersituation durch das große Vertrauensverhältnis und das bestehende Macht- und Abhängigkeitsverhältnis zwischen Trainerinnen/Trainern und Spielerinnen/Spielern. Die besonderen Situationen in der Umkleide, beim Duschen und die Trainingslager mit Übernachtungen verlangen gezielte Schutzvereinbarungen für die Sicherheit der Kinder und Jugendlichen, aber auch um den Trainerinnen/Trainern und Betreuerinnen/Betreuern Sicherheit zu geben, in welchen Situationen besondere Rücksicht zu nehmen ist.",
        },
      ],
    },
    {
      name: "section4",
      type: "group",
      label: "Abschnitt 04 · Prävention und Verdachtsfall",
      admin: {
        description: "Vierter Abschnitt mit Aufzählung und Hinweis-Kasten.",
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titel",
          admin: { description: "Überschrift des Abschnitts." },
          defaultValue: "Prävention und Verdachtsfall",
        },
        {
          name: "intro",
          type: "text",
          label: "Unterzeile",
          admin: { description: "Kleine Zeile neben der Abschnittsnummer." },
          defaultValue: "Was tun im Verdachtsfall?",
        },
        {
          name: "body",
          type: "textarea",
          label: "Absatz vor der Aufzählung",
          admin: { description: "Einleitender Satz über der Liste." },
          defaultValue:
            "Prävention vor sexuellem Missbrauch, was tun im Verdachtsfall?",
        },
        {
          name: "items",
          type: "array",
          label: "Aufzählung (Handlungsschritte)",
          labels: { singular: "Listenpunkt", plural: "Listenpunkte" },
          admin: { description: "Liste der Schritte im Verdachtsfall." },
          fields: [
            {
              name: "text",
              type: "textarea",
              required: true,
              label: "Listenpunkt",
            },
          ],
          defaultValue: [
            {
              text: "Wird ein Verdacht durch ein Kind oder einen Jugendlichen geäußert, ist diesem zunächst Glauben zu schenken und sorgfältig zuzuhören.",
            },
            {
              text: "Auch Schilderungen von Eltern oder anderen Beteiligten über Verstöße gegen Schutzvereinbarungen sind ernst zu nehmen.",
            },
            {
              text: "Bei leichten und erstmaligen Verstößen ist die betreffende Person seitens der Vereinsverantwortlichen auf die Einhaltung hinzuweisen.",
            },
            {
              text: "Bei mehrfachen oder wiederholten Verstößen noch ohne Hinweise auf sexuelle Übergriffe ist umgehend eine Fachberatungsstelle zu Rate zu ziehen.",
            },
            {
              text: "Bei dringenden und schwerwiegenden Verdachtsfällen dürfen die Hinweise nicht ignoriert werden; das weitere Vorgehen ist an Fachleute abzugeben.",
            },
          ],
        },
        {
          name: "calloutTitle",
          type: "text",
          label: "Hinweis-Kasten: Titel",
          admin: { description: "Überschrift des hervorgehobenen Kastens." },
          defaultValue: "Dringender Rat",
        },
        {
          name: "calloutText",
          type: "textarea",
          label: "Hinweis-Kasten: Text",
          admin: { description: "Text im hervorgehobenen Kasten." },
          defaultValue:
            "Wir raten dringend, sofort fachliche Unterstützung zu suchen und sich an eine Beratungsstelle oder das zuständige Jugendamt zu wenden.",
        },
      ],
    },
    {
      name: "section5",
      type: "group",
      label: "Abschnitt 05 · Beratung und Hilfe",
      admin: { description: "Fünfter Abschnitt mit zwei Verweis-Kacheln." },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titel",
          admin: { description: "Überschrift des Abschnitts." },
          defaultValue: "Beratung und Hilfe",
        },
        {
          name: "intro",
          type: "text",
          label: "Unterzeile",
          admin: { description: "Kleine Zeile neben der Abschnittsnummer." },
          defaultValue: "Anlaufstellen und weitere Hinweise",
        },
        {
          name: "link1Label",
          type: "text",
          label: "Kachel 1: Beschriftung",
          admin: { description: "Sichtbarer Titel der ersten Kachel." },
          defaultValue: "www.praetect.de",
        },
        {
          name: "link1Href",
          type: "text",
          label: "Kachel 1: Adresse (URL)",
          admin: { description: "Ziel-Adresse der ersten Kachel." },
          defaultValue: "https://www.praetect.de",
        },
        {
          name: "link1Sub",
          type: "text",
          label: "Kachel 1: Unterzeile",
          admin: { description: "Kleiner Text unter der Beschriftung." },
          defaultValue: "Beratungsstellen und weitere Hinweise",
        },
        {
          name: "link2Label",
          type: "text",
          label: "Kachel 2: Beschriftung",
          admin: { description: "Sichtbarer Titel der zweiten Kachel." },
          defaultValue: "Kontaktdaten der örtlichen Jugendämter",
        },
        {
          name: "link2Href",
          type: "text",
          label: "Kachel 2: Adresse (URL)",
          admin: { description: "Ziel-Adresse der zweiten Kachel." },
          defaultValue:
            "http://www.stmas.bayern.de/familie/beratung/jugendamt/index.htm",
        },
        {
          name: "link2Sub",
          type: "text",
          label: "Kachel 2: Unterzeile",
          admin: { description: "Kleiner Text unter der Beschriftung." },
          defaultValue:
            "Bayerisches Staatsministerium für Familie, Arbeit und Soziales",
        },
      ],
    },
    {
      name: "asideVerdacht",
      type: "group",
      label: "Seitenleiste · Im Verdachtsfall (dunkler Kasten)",
      admin: {
        description: "Der dunkle Hinweis-Kasten in der rechten Seitenleiste.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Überzeile",
          admin: { description: "Kleine goldene Zeile oben im Kasten." },
          defaultValue: "Im Verdachtsfall",
        },
        {
          name: "text",
          type: "textarea",
          label: "Text",
          admin: { description: "Beschreibungstext im Kasten." },
          defaultValue:
            "Wir raten dringend, sofort fachliche Unterstützung zu suchen und sich an eine Beratungsstelle oder das zuständige Jugendamt zu wenden.",
        },
        {
          name: "link1Label",
          type: "text",
          label: "Link 1: Beschriftung",
          admin: { description: "Sichtbarer Text des ersten Links." },
          defaultValue: "www.praetect.de",
        },
        {
          name: "link1Href",
          type: "text",
          label: "Link 1: Adresse (URL)",
          admin: { description: "Ziel-Adresse des ersten Links." },
          defaultValue: "https://www.praetect.de",
        },
        {
          name: "link2Label",
          type: "text",
          label: "Link 2: Beschriftung",
          admin: { description: "Sichtbarer Text des zweiten Links." },
          defaultValue: "Örtliche Jugendämter (StMAS Bayern)",
        },
        {
          name: "link2Href",
          type: "text",
          label: "Link 2: Adresse (URL)",
          admin: { description: "Ziel-Adresse des zweiten Links." },
          defaultValue:
            "http://www.stmas.bayern.de/familie/beratung/jugendamt/index.htm",
        },
      ],
    },
    {
      name: "asideUseful",
      type: "group",
      label: "Seitenleiste · Auch nützlich (heller Kasten)",
      admin: {
        description:
          "Der gestrichelte Kasten mit weiterführenden internen Links.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Überzeile",
          admin: { description: "Kleine goldene Zeile oben im Kasten." },
          defaultValue: "Auch nützlich",
        },
        {
          name: "links",
          type: "array",
          label: "Links",
          labels: { singular: "Link", plural: "Links" },
          admin: { description: "Liste der weiterführenden Verweise." },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              label: "Beschriftung",
            },
            {
              name: "href",
              type: "text",
              required: true,
              label: "Ziel-Link",
            },
          ],
          defaultValue: [
            { label: "Vorstand", href: "/verein/vorstand" },
            { label: "Kontakt", href: "/kontakt" },
            { label: "Impressum", href: "/impressum" },
          ],
        },
      ],
    },
  ],
};
