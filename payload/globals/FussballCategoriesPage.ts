import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const FussballCategoriesPage: GlobalConfig = {
  slug: "fussball-categories",
  label: "Fußball-Kategorien (Seiten)",
  admin: {
    group: "4. Seiten",
    description:
      "Redaktionelle Texte der Fußball-Kategorieseiten (/fussball/herren, /junioren, /juniorinnen, /bambini). Mannschaftslisten, BFV-/FuPa-Livedaten und der U8-Showcase werden NICHT hier gepflegt, sondern stammen aus den Sammlungen bzw. Livequellen.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("fussball-categories")] },
  fields: [
    {
      name: "weitereKategorienLabel",
      type: "text",
      label: "Überschrift „Weitere Kategorien“",
      defaultValue: "Weitere Kategorien",
      admin: {
        description:
          "Überschrift der Box, die auf die anderen Fußball-Kategorien verlinkt.",
      },
    },
    {
      name: "bfvButtonLabel",
      type: "text",
      label: "Beschriftung BFV-Button",
      defaultValue: "BFV-Vereinsprofil ↗",
      admin: {
        description:
          "Text des Buttons, der auf das BFV-Vereinsprofil verweist.",
      },
    },
    {
      name: "bfvMeldungSuffix",
      type: "text",
      label: "Zusatz hinter der Mannschaftszahl",
      defaultValue: "live beim BFV gemeldet",
      admin: {
        description:
          "Text hinter der Anzahl der gemeldeten Mannschaften, z. B. „3 Mannschaften · live beim BFV gemeldet“.",
      },
    },
    {
      name: "sportlicheLeitungHeading",
      type: "text",
      label: "Überschrift „Sportliche Leitung“",
      defaultValue: "Sportliche Leitung",
      admin: {
        description:
          "Überschrift über den Ansprechpartner:innen-Karten. Wird nur angezeigt, wenn für die Kategorie eine sportliche Leitung gepflegt ist.",
      },
    },
    {
      name: "mannschaftenHeading",
      type: "text",
      label: "Überschrift „Mannschaften“",
      defaultValue: "Mannschaften",
      admin: {
        description: "Überschrift über der Liste der Mannschaften.",
      },
    },
    {
      name: "schiedsrichterLabel",
      type: "text",
      label: "Beschriftung Schiedsrichter-Link",
      defaultValue: "Schiedsrichter →",
      admin: {
        description:
          "Linktext in der Box „Weitere Kategorien“, der auf /schiedsrichter verweist.",
      },
    },
    {
      name: "backLabel",
      type: "text",
      label: "Beschriftung Zurück-Link",
      defaultValue: "← Übersicht Fußball",
      admin: {
        description: "Linktext am Seitenende zurück zur Fußball-Übersicht.",
      },
    },
    {
      name: "categories",
      type: "array",
      label: "Kategorie-Texte",
      labels: { singular: "Kategorie", plural: "Kategorien" },
      admin: {
        description:
          "Pro Fußball-Kategorie die redaktionellen Texte. Die Zuordnung erfolgt über das Feld „Kategorie“ (entspricht der URL).",
      },
      defaultValue: [
        {
          slug: "herren",
          eyebrow: "Fußball · Herren",
          label: "Herren",
          lede: "Erste, zweite, dritte Mannschaft sowie die Ehrenliga. Vom Landesligateam bis zur Altherrenrunde.",
          description:
            "Alle Herrenmannschaften des SV Nord. Spielbetrieb im BFV, gemeldet in Liga und Pokal.",
          leadership: [
            { role: "Sportlicher Leiter", names: [{ name: "Felix Kirmeyer" }] },
            {
              role: "Fußball-Erwachsene",
              names: [{ name: "Felix Kirmeyer" }],
            },
          ],
        },
        {
          slug: "junioren",
          eyebrow: "Fußball · Junioren",
          label: "Junioren",
          lede: "Großfeld- und Kleinfeldmannschaften der männlichen Jugend von A bis F.",
          description:
            "Alle Juniorenmannschaften — strukturiert nach Altersklassen, betreut von ehrenamtlichen Trainer:innen.",
          leadership: [
            { role: "Sportlicher Leiter", names: [{ name: "Felix Kirmeyer" }] },
            { role: "Fußball-Jugend", names: [{ name: "Ergin Piker" }] },
            {
              role: "Großfeld",
              names: [
                { name: "Dominik Besel" },
                { name: "Thomas Tiesler" },
                { name: "Zeljko Jeremic" },
              ],
            },
            {
              role: "Kompaktfeld",
              names: [{ name: "Steffen Helmreich" }, { name: "Tom Wurm" }],
            },
            {
              role: "Kleinfeld",
              names: [{ name: "Thomas Wimmer" }, { name: "Stephan Krusche" }],
            },
            {
              role: "Mädl's",
              names: [{ name: "Ergin Piker" }, { name: "Abraham Mike Yousaf" }],
            },
          ],
        },
        {
          slug: "juniorinnen",
          eyebrow: "Fußball · Juniorinnen",
          label: "Juniorinnen",
          lede: "Mädchen- und Juniorinnenmannschaften des SV Nord.",
          description:
            "Mannschaften der weiblichen Jugend, Spielbetrieb im BFV und in Spielgemeinschaften.",
          leadership: [],
        },
        {
          slug: "bambini",
          eyebrow: "Fußball · Nachwuchs",
          label: "Bambinis & Fußballkindergarten",
          lede: "Die Allerjüngsten — Fußballkindergarten und Bambini-Gruppen.",
          description:
            "Spielerischer Einstieg ins Fußballtraining für die Kleinsten — ohne Leistungsdruck, mit viel Spaß am Ball.",
          leadership: [],
        },
      ],
      fields: [
        {
          name: "slug",
          type: "select",
          required: true,
          label: "Kategorie",
          admin: {
            description:
              "Bestimmt, auf welcher Kategorieseite diese Texte erscheinen (entspricht der URL unter /fussball/…).",
          },
          options: [
            { label: "Herren", value: "herren" },
            { label: "Junioren", value: "junioren" },
            { label: "Juniorinnen", value: "juniorinnen" },
            { label: "Bambinis & Fußballkindergarten", value: "bambini" },
          ],
        },
        {
          name: "eyebrow",
          type: "text",
          label: "Eyebrow (kleine Zeile über dem Titel)",
          admin: {
            description:
              "Kleine Auszeichnungszeile über dem Seitentitel und im Intro-Block.",
          },
        },
        {
          name: "label",
          type: "text",
          label: "Titel der Kategorie",
          admin: {
            description:
              "Großer Seitentitel und Bezeichnung in der Box „Weitere Kategorien“.",
          },
        },
        {
          name: "lede",
          type: "textarea",
          label: "Lede (Untertitel im Seitenkopf)",
          admin: {
            description: "Einleitender Satz direkt unter dem Seitentitel.",
          },
        },
        {
          name: "description",
          type: "textarea",
          label: "Beschreibung (Intro-Block)",
          admin: {
            description: "Beschreibungstext im Intro-Block der Kategorieseite.",
          },
        },
        {
          name: "leadership",
          type: "array",
          label: "Sportliche Leitung / Ansprechpartner:innen",
          labels: { singular: "Bereich", plural: "Bereiche" },
          admin: {
            description:
              "Optional: Ansprechpartner:innen je Bereich. Leer lassen, wenn für diese Kategorie keine sportliche Leitung angezeigt werden soll.",
          },
          fields: [
            {
              name: "role",
              type: "text",
              required: true,
              label: "Rolle / Bereich",
              admin: {
                description:
                  "z. B. „Sportlicher Leiter“, „Großfeld“, „Mädl's“.",
              },
            },
            {
              name: "names",
              type: "array",
              label: "Personen",
              labels: { singular: "Person", plural: "Personen" },
              admin: {
                description: "Eine oder mehrere Personen für diesen Bereich.",
              },
              fields: [
                {
                  name: "name",
                  type: "text",
                  required: true,
                  label: "Name",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
