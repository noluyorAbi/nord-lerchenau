import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const FussballPage: GlobalConfig = {
  slug: "fussball-page",
  label: "Fußball (Hauptseite)",
  admin: {
    group: "6. Seiten",
    description:
      "Statische Inhalte der Seite /fussball: Begrüßung, sportliche Leitung und die fünf Säulen-Karten. Tabellen und Torjäger kommen live von FuPa/BFV und werden hier nicht gepflegt.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("fussball-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Seitenkopf (Hero)",
      admin: {
        description: "Großer Titelbereich ganz oben auf der Seite.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Kurzer Überbegriff über dem Titel." },
          defaultValue: "Fußball",
        },
        {
          name: "title",
          type: "text",
          label: "Titel",
          admin: { description: "Hauptüberschrift des Seitenkopfs." },
          defaultValue: "Unsere Mannschaften",
        },
        {
          name: "lede",
          type: "textarea",
          label: "Einleitungstext",
          admin: { description: "Kurzer Fließtext direkt unter dem Titel." },
          defaultValue:
            "Unsere Fußballabteilung existiert seit 1947. In der Saison 2026/27 stellen wir 15 Jugendmannschaften, 5 Herrenmannschaften und eine Ehrenligamannschaft.",
        },
      ],
    },
    {
      name: "intro",
      type: "group",
      label: "Begrüßungsblock",
      admin: {
        description: "Willkommens-Kasten links neben der sportlichen Leitung.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: {
            description: "Goldene Überschriftzeile im Begrüßungskasten.",
          },
          defaultValue: "Herzlich Willkommen bei der Fußball-Abteilung",
        },
        {
          name: "body",
          type: "textarea",
          label: "Begrüßungstext",
          admin: { description: "Fließtext im Begrüßungskasten." },
          defaultValue:
            "Unsere Fußballabteilung existiert seit dem Jahre 1947. Wir stellen in der Saison 2026/2027 fünfzehn Jugendmannschaften, fünf Herrenmannschaften und eine Ehrenligamannschaft. Wir freuen uns über alle Fußballbegeisterten von Jung bis Alt.",
        },
        {
          name: "signature",
          type: "text",
          label: "Grußformel / Signatur",
          admin: { description: "Kursive Zeile unter dem Begrüßungstext." },
          defaultValue: "Eure SV Nord Fußballer.",
        },
      ],
    },
    {
      name: "leitung",
      type: "group",
      label: "Sportliche Leitung",
      admin: {
        description: "Kasten 'Sportliche Leitung' mit den Ansprechpartnern.",
      },
      fields: [
        {
          name: "heading",
          type: "text",
          label: "Überschrift",
          defaultValue: "Sportliche Leitung",
        },
        {
          name: "members",
          type: "array",
          label: "Ansprechpartner",
          labels: { singular: "Person", plural: "Personen" },
          admin: {
            description: "Namen und Funktionen der sportlichen Leitung.",
          },
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
              label: "Name",
            },
            {
              name: "role",
              type: "text",
              required: true,
              label: "Funktion",
            },
          ],
          defaultValue: [
            { name: "Felix Kirmeyer", role: "Sportlicher Leiter" },
            { name: "Felix Kirmeyer", role: "Fußball-Erwachsene" },
            { name: "Ergin Piker", role: "Fußball-Jugend" },
          ],
        },
      ],
    },
    {
      name: "saeulen",
      type: "group",
      label: "Säulen der Abteilung",
      admin: {
        description: "Abschnitt mit den fünf Bereichs-Karten.",
      },
      fields: [
        {
          name: "heading",
          type: "text",
          label: "Überschrift",
          defaultValue: "Säulen der Abteilung",
        },
        {
          name: "meta",
          type: "text",
          label: "Zusatzzeile rechts",
          admin: {
            description: "Kleiner Text rechts neben der Überschrift.",
          },
          defaultValue: "Fünf Bereiche",
        },
        {
          name: "cards",
          type: "array",
          label: "Karten",
          labels: { singular: "Karte", plural: "Karten" },
          admin: { description: "Die einzelnen Bereichs-Karten." },
          fields: [
            {
              name: "eyebrow",
              type: "text",
              required: true,
              label: "Kleine Zeile darüber",
            },
            {
              name: "title",
              type: "text",
              required: true,
              label: "Titel",
            },
            {
              name: "body",
              type: "textarea",
              required: true,
              label: "Beschreibung",
            },
            {
              name: "href",
              type: "text",
              required: true,
              label: "Ziel-Link",
              admin: {
                description:
                  "Wohin die Karte verlinkt, z. B. /fussball/herren.",
              },
            },
            {
              name: "meta",
              type: "text",
              required: true,
              label: "Fußzeile (Meta)",
              admin: {
                description: "Kleiner Text unten links in der Karte.",
              },
            },
            {
              name: "tone",
              type: "select",
              required: true,
              label: "Farbschema",
              defaultValue: "navy",
              admin: { description: "Visuelles Farbschema der Karte." },
              options: [
                { label: "Navy (dunkelblau)", value: "navy" },
                { label: "Paper (hell)", value: "paper" },
                { label: "Sky (hellblau)", value: "sky" },
                { label: "Gold", value: "gold" },
              ],
            },
          ],
          defaultValue: [
            {
              eyebrow: "Erwachsen",
              title: "Fußball — Erwachsene",
              body: "Landesliga, Reserve, Dritte, Ehrenliga und Senioren. Vom ambitionierten Spieltag bis zur Altherrenrunde, alle Erwachsenenmannschaften des SV Nord.",
              href: "/fussball/herren",
              meta: "5 Herrenmannschaften · Ehrenliga",
              tone: "navy",
            },
            {
              eyebrow: "Jugend",
              title: "Fußball — Jugend",
              body: "Großfeld, Kompaktfeld und Kleinfeld. Direkte Ansprechpartner für Eltern und Jugendspieler — von der A-Jugend bis zu den Bambinis.",
              href: "/fussball/junioren",
              meta: "15 Jugendmannschaften",
              tone: "sky",
            },
            {
              eyebrow: "Torwart",
              title: "Fußball — Torwart",
              body: "Spezielles Torwart-Training für alle Altersklassen. Wir suchen Talente und bilden eigene Torhüter:innen aus. Spielerbetreuung ab den Junioren.",
              href: "/fussball",
              meta: "Position · Training",
              tone: "gold",
            },
            {
              eyebrow: "Spielbetrieb",
              title: "Schiedsrichter",
              body: "Aktive Unparteiische im BFV-Spielbetrieb — von der Kreisklasse bis zur Bezirksliga. Sie sorgen für faire Bedingungen auf den Plätzen.",
              href: "/schiedsrichter",
              meta: "BFV · Ehrenamt",
              tone: "sky",
            },
            {
              eyebrow: "Organisation",
              title: "PR, Events, Equipment, Organisation",
              body: "Hinter den Kulissen: Öffentlichkeitsarbeit, Vereinsevents, Material- und Trikotverwaltung, organisatorischer Backbone der Abteilung. Namen folgen.",
              href: "/fussball",
              meta: "Ehrenamt · Backbone",
              tone: "paper",
            },
          ],
        },
      ],
    },
  ],
};
