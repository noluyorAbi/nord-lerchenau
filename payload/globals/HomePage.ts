import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("home-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "pretitle", type: "text", defaultValue: "Heimspieltag · Sa 14:30 · Eschengarten" },
        { name: "headlineLine1", type: "text", required: true, defaultValue: "Einmal Nordler," },
        { name: "headlineLine2", type: "text", required: true, defaultValue: "immer Nordler." },
        { name: "subline", type: "textarea", defaultValue: "Seit 1947 zuhause im Münchner Norden. 500+ Mitglieder, vier Sportarten, eine Familie." },
        { name: "primaryCtaLabel", type: "text", defaultValue: "Spielplan" },
        { name: "primaryCtaHref", type: "text", defaultValue: "/fussball" },
        { name: "secondaryCtaLabel", type: "text", defaultValue: "Verein kennenlernen" },
        { name: "secondaryCtaHref", type: "text", defaultValue: "/verein" },
      ],
    },
    {
      name: "stats",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
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
      admin: { description: "Welche Sektionen werden auf der Startseite angezeigt?" },
      fields: [
        { name: "showNextMatch", type: "checkbox", defaultValue: true },
        { name: "showFupa", type: "checkbox", defaultValue: true, label: "Fupa-Block (Liga · Ergebnisse · Torjäger · News)" },
        { name: "showNews", type: "checkbox", defaultValue: true },
        { name: "showSports", type: "checkbox", defaultValue: true },
        { name: "showEvents", type: "checkbox", defaultValue: true },
        { name: "showSponsors", type: "checkbox", defaultValue: true },
        { name: "showVereinsheim", type: "checkbox", defaultValue: true },
        { name: "showMembershipCta", type: "checkbox", defaultValue: true },
      ],
    },
  ],
};
