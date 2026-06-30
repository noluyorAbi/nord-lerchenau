import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const SponsorenPage: GlobalConfig = {
  slug: "sponsoren-page",
  label: "Sponsoren-Seite",
  admin: {
    group: "4. Seiten",
    description:
      "Texte der Seite /sponsoren. Die Sponsoren-Logos selbst werden unter „Verein → Sponsors“ gepflegt — hier geht es nur um die redaktionellen Texte rundherum.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("sponsoren-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Seitenkopf (Hero)",
      admin: {
        description: "Der große Kopfbereich ganz oben auf der Seite.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Kleiner Text über der Hauptüberschrift." },
          defaultValue: "Partner",
        },
        {
          name: "title",
          type: "text",
          label: "Überschrift",
          admin: { description: "Die große Hauptüberschrift im Kopfbereich." },
          defaultValue: "Unsere Sponsoren",
        },
        {
          name: "lede",
          type: "textarea",
          label: "Einleitungssatz",
          admin: { description: "Kurzer Satz unter der Überschrift." },
          defaultValue:
            "Ohne die Unterstützung unserer Sponsoren wäre vieles nicht möglich. Vielen Dank!",
        },
      ],
    },
    {
      name: "story",
      type: "group",
      label: "Erzähltext „Liebe Sponsoren“",
      admin: {
        description:
          "Der Vorstellungstext des Vereins im linken Teil des oberen Kastens.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Beschriftung über dem Erzähltext." },
          defaultValue: "Liebe Sponsoren",
        },
        {
          name: "paragraph1",
          type: "textarea",
          label: "Absatz 1",
          admin: { description: "Erster Absatz des Erzähltexts." },
          defaultValue:
            "Der SV Nord München-Lerchenau e.V. ist ein traditioneller Sportverein im Münchner Norden, der im Jahr 1947 gegründet wurde. Derzeit haben wir über 600 Mitglieder in Fußball, Volleyball, Gymnastik, Ski und eSport.",
        },
        {
          name: "paragraph2",
          type: "textarea",
          label: "Absatz 2",
          admin: { description: "Zweiter Absatz des Erzähltexts." },
          defaultValue:
            "Im Fußballbereich stellen wir zwei Herren- und elf Jugendmannschaften. Im Durchschnitt begrüßen wir 100–150 Zuschauer bei unseren Heimspielen der ersten Herrenmannschaft, die aktuell in der Landesliga spielt.",
        },
        {
          name: "paragraph3",
          type: "textarea",
          label: "Absatz 3 (gedämpft dargestellt)",
          admin: {
            description:
              "Dritter Absatz des Erzähltexts. Wird etwas heller/gedämpfter angezeigt.",
          },
          defaultValue:
            "Der SV Nord wird in der Lerchenau als sympathischer, familiärer und sehr sozialer Verein wahrgenommen — wir bieten Sponsoren damit eine große Reichweite und mit Werbung auf den Trikots einen gesteigerten Bekanntheitsgrad.",
        },
      ],
    },
    {
      name: "offer",
      type: "group",
      label: "Kasten „Das bieten wir Ihnen“",
      admin: {
        description:
          "Die hervorgehobene Vorteilsliste im rechten Teil des oberen Kastens.",
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Überschrift des Kastens",
          admin: { description: "Beschriftung über der Vorteilsliste." },
          defaultValue: "Das bieten wir Ihnen",
        },
        {
          name: "items",
          type: "array",
          label: "Vorteile (Aufzählung)",
          labels: { singular: "Vorteil", plural: "Vorteile" },
          admin: {
            description:
              "Jeder Eintrag erscheint als eigener Punkt in der Liste.",
          },
          fields: [
            {
              name: "text",
              type: "text",
              required: true,
              label: "Eintrag",
              admin: { description: "Text dieses Aufzählungspunkts." },
            },
          ],
          defaultValue: [
            { text: "Höherer Bekanntheitsgrad für Ihr Unternehmen" },
            { text: "Ausdruck sozialen Engagements (z.B. Mannschaftsfotos)" },
            {
              text: "Zusätzliche Werbung auf Social Media (Instagram, Facebook)",
            },
            { text: "Aushang auf unseren Spielankündigungsplakaten" },
          ],
        },
      ],
    },
    {
      name: "sponsorHeadings",
      type: "group",
      label: "Überschriften der Sponsoren-Listen",
      admin: {
        description:
          "Die Zwischenüberschriften über den beiden Logo-Rastern. Die Logos selbst werden unter „Verein → Sponsors“ gepflegt.",
      },
      fields: [
        {
          name: "premium",
          type: "text",
          label: "Überschrift Premium-Partner",
          admin: {
            description: "Über dem großen Raster mit den Premium-Logos.",
          },
          defaultValue: "Premium Partner",
        },
        {
          name: "standard",
          type: "text",
          label: "Überschrift weitere Partner",
          admin: {
            description: "Über dem kleinen Raster mit den übrigen Logos.",
          },
          defaultValue: "Weitere Partner",
        },
      ],
    },
    {
      name: "becomeSponsor",
      type: "group",
      label: "Aufruf „Sponsor werden?“",
      admin: {
        description: "Der dunkle Aufruf-Kasten unter den Sponsoren-Logos.",
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Überschrift",
          admin: { description: "Überschrift des Aufruf-Kastens." },
          defaultValue: "Sponsor werden?",
        },
        {
          name: "text",
          type: "textarea",
          label: "Text",
          admin: { description: "Beschreibungstext unter der Überschrift." },
          defaultValue:
            "Ihre Unterstützung fließt direkt in Ausrüstung, Trikots und Veranstaltungen. Melden Sie sich gerne bei uns — wir freuen uns auf das Gespräch.",
        },
        {
          name: "ctaLabel",
          type: "text",
          label: "Button: Text",
          admin: { description: "Beschriftung des Buttons." },
          defaultValue: "Kontakt aufnehmen →",
        },
        {
          name: "ctaHref",
          type: "text",
          label: "Button: Ziel-Link",
          admin: { description: "Wohin der Button führt (z.B. /kontakt)." },
          defaultValue: "/kontakt",
        },
      ],
    },
    {
      name: "donation",
      type: "group",
      label: "Spenden & QR-Code",
      admin: {
        description: "Der Spenden-Block mit QR-Code im unteren Seitenbereich.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Beschriftung über der Spenden-Überschrift." },
          defaultValue: "Spende",
        },
        {
          name: "title",
          type: "text",
          label: "Überschrift",
          admin: { description: "Hauptüberschrift des Spenden-Blocks." },
          defaultValue:
            "Kurzer Pass, großer Impact: Spenden sammeln leicht gemacht!",
        },
        {
          name: "paragraph1",
          type: "textarea",
          label: "Absatz 1",
          admin: { description: "Erster Absatz im Spenden-Block." },
          defaultValue:
            "Damit wir bei unseren Projekten und Anschaffungen — neue Trikots, Trainingslager und mehr — den nächsten Schritt machen können, brauchen wir eure Unterstützung als „Multiplikatoren“.",
        },
        {
          name: "paragraph2",
          type: "textarea",
          label: "Absatz 2",
          admin: { description: "Zweiter Absatz im Spenden-Block." },
          defaultValue:
            "Wir haben ab sofort einen QR-Code für Spenden, den ihr ganz einfach an Eltern, Freunde oder Gönner weiterschicken könnt.",
        },
        {
          name: "benefitsTitle",
          type: "text",
          label: "Überschrift Vorteils-Kasten",
          admin: {
            description: "Beschriftung über der „Gamechanger“-Liste.",
          },
          defaultValue: "Warum das ein Gamechanger ist",
        },
        {
          name: "benefits",
          type: "array",
          label: "Vorteile des QR-Codes",
          labels: { singular: "Vorteil", plural: "Vorteile" },
          admin: {
            description:
              "Jeder Punkt hat einen fett gedruckten Anfang und einen Beschreibungstext.",
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              label: "Fett gedruckter Anfang",
              admin: {
                description: "Wird fett dargestellt, z.B. „Kein Stress:“.",
              },
            },
            {
              name: "text",
              type: "text",
              required: true,
              label: "Beschreibungstext",
              admin: { description: "Folgt dem fett gedruckten Anfang." },
            },
          ],
          defaultValue: [
            {
              label: "Kein Stress:",
              text: "Der Spender scannt den Code einfach mit seiner Banking-App.",
            },
            {
              label: "Kein Tippen:",
              text: "IBAN und Verwendungszweck sind schon teilweise fertig hinterlegt.",
            },
            {
              label: "Schneller Abschluss:",
              text: "Es dauert keine 30 Sekunden – die Hürde zu helfen war noch nie so niedrig.",
            },
          ],
        },
        {
          name: "closingLabel",
          type: "text",
          label: "Schlussabsatz: fett gedruckter Anfang",
          admin: {
            description: "Wird fett dargestellt, z.B. „Eure Mithilfe:“.",
          },
          defaultValue: "Eure Mithilfe:",
        },
        {
          name: "closingText",
          type: "textarea",
          label: "Schlussabsatz: Text",
          admin: {
            description:
              "Folgt dem fett gedruckten Anfang des Schlussabsatzes.",
          },
          defaultValue:
            "Teilt den QR-Code in euren Team-Gruppen oder zeigt ihn bei den nächsten Elternabenden und Spieltagen. Jede kleine Summe bringt uns weiter — gemeinsam bewegen wir mehr. Danke für euren Einsatz!",
        },
        {
          name: "signatureLine1",
          type: "text",
          label: "Grußzeile 1 (kursiv)",
          admin: { description: "Erste kursive Grußzeile." },
          defaultValue: "Für Fragen stehe ich euch gerne zur Verfügung.",
        },
        {
          name: "signatureLine2",
          type: "text",
          label: "Grußzeile 2 (kursiv)",
          admin: { description: "Zweite kursive Grußzeile, z.B. der Name." },
          defaultValue: "Viele Grüße, Ralf",
        },
        {
          name: "poweredBy",
          type: "text",
          label: "Hinweiszeile ganz unten",
          admin: { description: "Kleiner Hinweis unter dem Spenden-Text." },
          defaultValue: "Powered by Zahlen-mit-Code.com",
        },
        {
          name: "qrImage",
          type: "text",
          label: "QR-Code: Bildpfad",
          admin: {
            description:
              "Pfad zum QR-Code-Bild im Ordner /public (Standard: /spenden-qr.png).",
          },
          defaultValue: "/spenden-qr.png",
        },
        {
          name: "qrAlt",
          type: "text",
          label: "QR-Code: Bildbeschreibung (Alt-Text)",
          admin: {
            description: "Alternativtext des QR-Bildes für Screenreader.",
          },
          defaultValue: "QR-Code für Spende an SV Nord München-Lerchenau",
        },
        {
          name: "qrCaption",
          type: "text",
          label: "QR-Code: Bildunterschrift",
          admin: { description: "Kleiner Text unter dem QR-Bild." },
          defaultValue: "Jetzt scannen & spenden",
        },
      ],
    },
    {
      name: "jugend",
      type: "group",
      label: "Aufruf „Jugendförderverein“",
      admin: {
        description:
          "Der dunkle Aufruf-Kasten zum Jugendförderverein ganz unten.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Beschriftung über der Überschrift." },
          defaultValue: "Jugendförderverein",
        },
        {
          name: "title",
          type: "text",
          label: "Überschrift",
          admin: { description: "Überschrift des Aufruf-Kastens." },
          defaultValue: "Unsere Jugend braucht Sie",
        },
        {
          name: "text",
          type: "textarea",
          label: "Text",
          admin: { description: "Beschreibungstext unter der Überschrift." },
          defaultValue:
            "Mit dem Jugendförderverein unterstützen Sie gezielt die Nachwuchsarbeit des SV Nord München-Lerchenau. Jeder Beitrag kommt direkt unseren jungen Spielerinnen und Spielern zugute.",
        },
        {
          name: "ctaLabel",
          type: "text",
          label: "Button: Text",
          admin: { description: "Beschriftung des Buttons." },
          defaultValue: "Zum Jugendförderverein →",
        },
        {
          name: "ctaHref",
          type: "text",
          label: "Button: Ziel-Link",
          admin: {
            description:
              "Wohin der Button führt (z.B. /verein/jugendfoerderverein).",
          },
          defaultValue: "/verein/jugendfoerderverein",
        },
      ],
    },
  ],
};
