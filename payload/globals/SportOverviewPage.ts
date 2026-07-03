import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const SportOverviewPage: GlobalConfig = {
  slug: "sport-overview-page",
  label: "Sport-Übersicht",
  admin: {
    group: "6. Seiten",
    description: "Inhalte der Seite /sport (Sportarten-Übersicht).",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("sport-overview-page")] },
  fields: [
    {
      type: "collapsible",
      label: "Kopfbereich (Hero)",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "heroEyebrow",
          type: "text",
          defaultValue: "Abteilungen",
          label: "Eyebrow",
          admin: { description: "Kleine Überschrift über dem Seitentitel." },
        },
        {
          name: "heroTitle",
          type: "text",
          defaultValue: "Unsere Sportarten",
          label: "Titel",
          admin: { description: "Hauptüberschrift der Seite." },
        },
        {
          name: "heroLede",
          type: "textarea",
          defaultValue:
            "Sechs Abteilungen unter einem Dach: Fußball, Gymnastik, Volleyball, eSport, Schiedsrichter und Ski.",
          label: "Einleitung",
          admin: { description: "Einleitungstext unter dem Titel." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Hinweis Übungsleiter (Box)",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "qualificationEyebrow",
          type: "text",
          defaultValue: "Qualifizierte Übungsleiter",
          label: "Eyebrow",
          admin: {
            description: "Kleine goldene Überschrift in der Hinweis-Box oben.",
          },
        },
        {
          name: "qualificationTextBefore",
          type: "text",
          defaultValue: "Unsere Trainer und Übungsleiter besitzen",
          label: "Text vor der Hervorhebung",
          admin: {
            description:
              "Erster Teil des Satzes, normal gesetzt. Der hervorgehobene (fette) Teil folgt direkt danach.",
          },
        },
        {
          name: "qualificationTextBold",
          type: "text",
          defaultValue: "Trainerlizenzen der C-Lizenz und höher",
          label: "Hervorgehobener Text (fett)",
          admin: { description: "Dieser Teil wird fett dargestellt." },
        },
        {
          name: "qualificationTextAfter",
          type: "text",
          defaultValue:
            "und bilden sich kontinuierlich weiter, vom Bambini-Training bis zur Landesliga.",
          label: "Text nach der Hervorhebung",
          admin: { description: "Letzter Teil des Satzes, normal gesetzt." },
        },
        {
          name: "qualificationLinkLabel",
          type: "text",
          defaultValue: "Liste ansehen →",
          label: "Link-Text",
          admin: {
            description:
              "Beschriftung des Links, der zur Trainerlizenz-Tabelle springt.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Sport-Karten",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "cards",
          type: "array",
          label: "Sport-Karten",
          labels: { singular: "Karte", plural: "Karten" },
          admin: {
            description:
              "Die Kacheln zu den einzelnen Sportarten. Reihenfolge per Drag & Drop.",
          },
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Titel",
              admin: { description: "Name der Sportart, z. B. „Fußball“." },
            },
            {
              name: "href",
              type: "text",
              required: true,
              label: "Link (Pfad)",
              admin: {
                description:
                  "Interner Pfad der Sportart-Seite, z. B. „/fussball“.",
              },
            },
            {
              name: "desc",
              type: "textarea",
              required: true,
              label: "Beschreibung",
              admin: { description: "Kurzer Beschreibungstext auf der Karte." },
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Trainerlizenzen",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "licensesEyebrow",
          type: "text",
          defaultValue: "Übungsleiter mit Trainerlizenz",
          label: "Eyebrow",
          admin: {
            description: "Kleine goldene Überschrift über der Lizenz-Tabelle.",
          },
        },
        {
          name: "licensesTitle",
          type: "text",
          defaultValue: "Trainerlizenzen C und B",
          label: "Titel",
          admin: { description: "Überschrift des Tabellen-Abschnitts." },
        },
        {
          name: "trainers",
          type: "array",
          label: "Trainerlizenzen (Tabelle)",
          labels: { singular: "Übungsleiter", plural: "Übungsleiter" },
          admin: {
            description:
              "Liste der lizenzierten Übungsleiter. Die Zähler (Gesamt, B, C, Fußball, Ski) werden automatisch berechnet.",
          },
          fields: [
            {
              name: "nachname",
              type: "text",
              required: true,
              label: "Nachname",
            },
            {
              name: "vorname",
              type: "text",
              required: true,
              label: "Vorname",
            },
            {
              name: "sportart",
              type: "select",
              required: true,
              defaultValue: "Fußball",
              label: "Sportart",
              admin: {
                description:
                  "Bestimmt auch die Farbe des Badges in der Tabelle.",
              },
              options: [
                { label: "Fußball", value: "Fußball" },
                { label: "Ski Alpin", value: "Ski Alpin" },
              ],
            },
            {
              name: "lizenz",
              type: "select",
              required: true,
              defaultValue: "C",
              label: "Lizenz",
              admin: { description: "Trainerlizenz-Stufe (B oder C)." },
              options: [
                { label: "B-Lizenz", value: "B" },
                { label: "C-Lizenz", value: "C" },
              ],
            },
          ],
        },
      ],
    },
  ],
};
