import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Startseite",
  admin: {
    group: "4. Seiten",
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
      name: "stats",
      type: "array",
      maxRows: 4,
      label: "Statistik-Kacheln",
      admin: { description: "Bis zu 4 Zahlen-Kacheln unter dem Hero." },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Beschriftung",
        },
        { name: "value", type: "text", required: true, label: "Wert / Zahl" },
      ],
      defaultValue: [
        { label: "Gegründet", value: "1947" },
        { label: "Mitglieder", value: "500+" },
        { label: "Mannschaften", value: "13" },
        { label: "Bezirksliga", value: "3. Platz" },
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
        },
        {
          name: "showLocation",
          type: "checkbox",
          defaultValue: true,
          label: "Anfahrt / Karte",
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
