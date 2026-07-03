import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Startseite",
  admin: {
    group: "6. Seiten",
    description: "Inhalte der Startseite (Hero, Schnellzugriff, Highlights).",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("home-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Hero-Bereich (ganz oben)",
      admin: {
        description: "Großer Begrüßungsbereich oben auf der Startseite.",
      },
      fields: [
        {
          name: "pretitle",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: {
            description: "Kleiner Text über der Hauptüberschrift.",
          },
          defaultValue: "Heimspieltag · Sa 14:30 · Eschengarten",
        },
        {
          name: "headlineLine1",
          type: "text",
          required: true,
          label: "Überschrift Zeile 1",
          defaultValue: "Einmal Nordler,",
        },
        {
          name: "headlineLine2",
          type: "text",
          required: true,
          label: "Überschrift Zeile 2",
          defaultValue: "immer Nordler.",
        },
        {
          name: "subline",
          type: "textarea",
          label: "Untertitel",
          defaultValue:
            "Seit 1947 zuhause im Münchner Norden. 500+ Mitglieder, vier Sportarten, eine Familie.",
        },
        {
          name: "primaryCtaLabel",
          type: "text",
          label: "Haupt-Button: Text",
          defaultValue: "Spielplan",
        },
        {
          name: "primaryCtaHref",
          type: "text",
          label: "Haupt-Button: Ziel-Link",
          defaultValue: "/fussball",
        },
        {
          name: "secondaryCtaLabel",
          type: "text",
          label: "Zweit-Button: Text",
          defaultValue: "Verein kennenlernen",
        },
        {
          name: "secondaryCtaHref",
          type: "text",
          label: "Zweit-Button: Ziel-Link",
          defaultValue: "/verein",
        },
      ],
    },
    {
      name: "heroSlides",
      type: "array",
      label: "Hero-Bilderlauf (Fotos ganz oben)",
      admin: {
        description:
          "Großformatige Fotos im Bilderlauf oben. Leer lassen = die mitgelieferten Standard-Fotos. Reihenfolge = Anzeige.",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Foto",
        },
      ],
    },
    {
      name: "stats",
      type: "array",
      maxRows: 3,
      label: 'Kennzahlen-Leiste ("Unser Verein in Zahlen")',
      admin: {
        description:
          "Die dunkle Zahlen-Leiste unter dem Hero. Genau 3 Kacheln. Leer lassen = Standardwerte werden angezeigt.",
      },
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          label: "Zahl / Wert",
          admin: { description: "z.B. '630+'" },
        },
        {
          name: "label",
          type: "text",
          required: true,
          label: "Beschriftung",
          admin: { description: "z.B. 'Mitglieder'" },
        },
        {
          name: "sub",
          type: "text",
          label: "Zusatz (kleiner Text)",
          admin: { description: "Optional, z.B. 'aktive Nordler'" },
        },
      ],
      defaultValue: [
        { value: "630+", label: "Mitglieder", sub: "aktive Nordler" },
        { value: "25+", label: "lizenzierte Trainer", sub: "ehrenamtlich" },
        { value: "26", label: "Mannschaften", sub: "alle Abteilungen" },
      ],
    },
    {
      name: "sportsSection",
      type: "group",
      label: "Sportarten-Übersicht (Kachel-Block)",
      admin: {
        description:
          "Die 6 Sportarten-Kacheln auf der Startseite. Farbe/Icon ergeben sich aus dem Typ. Leer lassen = Standard.",
      },
      fields: [
        {
          name: "headlineLine1",
          type: "text",
          label: "Überschrift Zeile 1",
          defaultValue: "Sechs Sportarten.",
        },
        {
          name: "headlineLine2",
          type: "text",
          label: "Überschrift Zeile 2 (gold)",
          defaultValue: "Eine Familie.",
        },
        {
          name: "cards",
          type: "array",
          maxRows: 6,
          label: "Kacheln",
          admin: { description: "Genau 6 Kacheln, Reihenfolge = Anzeige." },
          fields: [
            {
              name: "theme",
              type: "select",
              required: true,
              label: "Typ (Farbe & Icon)",
              options: [
                { label: "Fußball", value: "football" },
                { label: "Volleyball", value: "volleyball" },
                { label: "Gymnastik", value: "gymnastik" },
                { label: "eSport", value: "esport" },
                { label: "Schiedsrichter", value: "schiri" },
                { label: "Ski", value: "ski" },
              ],
            },
            { name: "name", type: "text", required: true, label: "Name" },
            { name: "href", type: "text", required: true, label: "Link-Ziel" },
            { name: "kicker", type: "text", label: "Kicker (kursiv)" },
            { name: "body", type: "textarea", label: "Beschreibung" },
            {
              name: "pills",
              type: "array",
              label: "Schlagwörter",
              fields: [
                { name: "value", type: "text", required: true, label: "Text" },
              ],
            },
            { name: "count", type: "text", label: "Große Zahl" },
            { name: "sub", type: "text", label: "Zusatz unter der Zahl" },
          ],
        },
      ],
    },
    {
      name: "sections",
      type: "group",
      label: "Sektionen ein-/ausblenden",
      admin: {
        description:
          "Welche Blöcke werden auf der Startseite angezeigt? Häkchen entfernen = ausblenden.",
      },
      fields: [
        {
          name: "showNextMatch",
          type: "checkbox",
          defaultValue: true,
          label: "Nächstes Spiel",
        },
        {
          name: "showFupa",
          type: "checkbox",
          defaultValue: true,
          label: "Fupa-Block (Liga · Ergebnisse · Torjäger · News)",
          admin: { hidden: true },
        },
        {
          name: "showNews",
          type: "checkbox",
          defaultValue: true,
          label: "News-Sektion",
        },
        {
          name: "showSports",
          type: "checkbox",
          defaultValue: true,
          label: "Sportarten-Übersicht",
        },
        {
          name: "showEvents",
          type: "checkbox",
          defaultValue: true,
          label: "Termine",
        },
        {
          name: "showSponsors",
          type: "checkbox",
          defaultValue: true,
          label: "Sponsoren-Block",
        },
        {
          name: "showVereinsheim",
          type: "checkbox",
          defaultValue: true,
          label: "Vereinsheim-Block",
          admin: { hidden: true },
        },
        {
          name: "showLocation",
          type: "checkbox",
          defaultValue: true,
          label: "Anfahrt / Karte",
          admin: { hidden: true },
        },
        {
          name: "showMembershipCta",
          type: "checkbox",
          defaultValue: true,
          label: "Mitglied-werden-Aufruf",
        },
        {
          name: "showInstagram",
          type: "checkbox",
          defaultValue: true,
          label: "Instagram-Teaser",
        },
      ],
    },
  ],
};
