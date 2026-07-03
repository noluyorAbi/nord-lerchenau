import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const MitgliedschaftPage: GlobalConfig = {
  slug: "mitgliedschaft-page",
  label: "Mitgliedschaft",
  admin: {
    group: "6. Seiten",
    description: "Inhalte der Seite /mitgliedschaft.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("mitgliedschaft-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Hero-Bereich (ganz oben)",
      admin: {
        description: "Begrüßungsbereich oben auf der Mitgliedschaftsseite.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Kleiner Text über der Hauptüberschrift." },
          defaultValue: "Mitglied werden",
        },
        {
          name: "title",
          type: "text",
          label: "Überschrift",
          admin: { description: "Große Hauptüberschrift im Hero." },
          defaultValue: "Einmal Nordler, immer Nordler.",
        },
        {
          name: "lede",
          type: "textarea",
          label: "Untertitel",
          admin: {
            description: "Kurzer Einleitungstext unter der Überschrift.",
          },
          defaultValue: "Mitglied beim SV Nord zu werden ist unkompliziert.",
        },
      ],
    },
    {
      name: "online",
      type: "group",
      label: "Abschnitt: Online-Aufnahmeantrag",
      admin: {
        description: "Überschrift, Hinweis und die vier Online-Antrag-Kacheln.",
      },
      fields: [
        {
          name: "heading",
          type: "text",
          label: "Überschrift",
          admin: { description: "Überschrift des Abschnitts." },
          defaultValue: "Online-Aufnahmeantrag",
        },
        {
          name: "badge",
          type: "text",
          label: "Kleiner Hinweis rechts",
          admin: {
            description: "Kurzer Hinweis rechts neben der Überschrift.",
          },
          defaultValue: "Direkt im Browser",
        },
        {
          name: "intro",
          type: "textarea",
          label: "Einleitungstext",
          admin: {
            description: "Beschreibung über den Online-Antrag-Kacheln.",
          },
          defaultValue:
            "Antrag inkl. SEPA-Lastschriftmandat online ausfüllen. Wähle die passende Variante. Einmalige Aufnahmegebühr 49 €.",
        },
        {
          name: "forms",
          type: "array",
          label: "Online-Antrag-Kacheln",
          labels: { singular: "Antrag", plural: "Anträge" },
          admin: {
            description:
              "Jede Kachel verlinkt auf ein Online-Antragsformular (vereinsplaner.com).",
          },
          fields: [
            {
              name: "tag",
              type: "text",
              required: true,
              label: "Kategorie-Label",
              admin: { description: "Kleines Label oben auf der Kachel." },
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
              label: "Link zum Formular",
              admin: { description: "Vollständige URL zum Online-Formular." },
            },
          ],
        },
      ],
    },
    {
      name: "steps",
      type: "group",
      label: "Abschnitt: So wirst du Mitglied",
      admin: {
        description: "Überschrift und die drei Ablauf-Schritte.",
      },
      fields: [
        {
          name: "heading",
          type: "text",
          label: "Überschrift",
          defaultValue: "So wirst du Mitglied",
        },
        {
          name: "badge",
          type: "text",
          label: "Kleiner Hinweis rechts",
          defaultValue: "In 3 Schritten",
        },
        {
          name: "step1Title",
          type: "text",
          label: "Schritt 1: Titel",
          defaultValue: "Melde dich vorab zum Training",
        },
        {
          name: "step1Body",
          type: "textarea",
          label: "Schritt 1: Text",
          defaultValue:
            "Wir möchten dich gerne kennenlernen und freuen uns, wenn du dich zu einem ersten Probetraining bei uns anmeldest.",
        },
        {
          name: "step2Title",
          type: "text",
          label: "Schritt 2: Titel",
          defaultValue: "Antrag stellen",
        },
        {
          name: "step2Body",
          type: "textarea",
          label: "Schritt 2: Text",
          defaultValue:
            "Online-Antrag in vier Varianten: Jugend, Erwachsene, Familienbeitrag oder beitragsfrei. Komplett im Browser ausfüllen und absenden.",
        },
        {
          name: "step2LinkLabel",
          type: "text",
          label: "Schritt 2: Link-Text",
          admin: {
            description:
              "Beschriftung des Sprung-Links zu den Online-Anträgen.",
          },
          defaultValue: "Zu den Online-Anträgen",
        },
        {
          name: "step3Title",
          type: "text",
          label: "Schritt 3: Titel",
          defaultValue: "Bestätigung Mitgliedschaft",
        },
        {
          name: "step3Body",
          type: "textarea",
          label: "Schritt 3: Text",
          defaultValue:
            "Sobald dein Mitgliedsantrag von unserer Mitgliederverwaltung geprüft und bearbeitet wurde, erhältst du eine Bestätigung per E-Mail.",
        },
      ],
    },
    {
      name: "sportsTree",
      type: "array",
      label: "Sportarten-Baum (Probetraining)",
      labels: { singular: "Sportart", plural: "Sportarten" },
      admin: {
        description:
          "Auswahlbaum der Sportarten unter Schritt 1. Sportart mit optionalen Unterpunkten und weiteren Ebenen.",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: "Sportart",
        },
        {
          name: "children",
          type: "array",
          label: "Unterpunkte",
          labels: { singular: "Unterpunkt", plural: "Unterpunkte" },
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
              label: "Bezeichnung",
            },
            {
              name: "leaves",
              type: "array",
              label: "Weitere Unterpunkte",
              labels: { singular: "Eintrag", plural: "Einträge" },
              fields: [
                {
                  name: "name",
                  type: "text",
                  required: true,
                  label: "Bezeichnung",
                },
              ],
            },
          ],
        },
      ],
      defaultValue: [
        {
          name: "Fußball",
          children: [
            { name: "Herren" },
            { name: "Senioren" },
            { name: "Juniorinnen" },
            {
              name: "Jugend",
              leaves: [
                { name: "Kleinfeld" },
                { name: "Kompaktfeld" },
                { name: "Großfeld" },
              ],
            },
          ],
        },
        { name: "Gymnastik" },
        { name: "Volleyball" },
        { name: "Ski" },
        { name: "eSport" },
      ],
    },
    {
      name: "benefits",
      type: "group",
      label: "Abschnitt: Was du davon hast",
      admin: { description: "Überschrift und Vorteile-Liste." },
      fields: [
        {
          name: "heading",
          type: "text",
          label: "Überschrift",
          defaultValue: "Was du davon hast",
        },
        {
          name: "items",
          type: "array",
          label: "Vorteile",
          labels: { singular: "Vorteil", plural: "Vorteile" },
          fields: [
            {
              name: "text",
              type: "textarea",
              required: true,
              label: "Vorteil",
            },
          ],
        },
      ],
    },
    {
      name: "documents",
      type: "group",
      label: "Abschnitt: Vereinsdokumente",
      admin: { description: "Überschrift und der Satzung-PDF-Download." },
      fields: [
        {
          name: "heading",
          type: "text",
          label: "Überschrift",
          defaultValue: "Vereinsdokumente",
        },
        {
          name: "badge",
          type: "text",
          label: "Kleiner Hinweis rechts",
          defaultValue: "PDF · Direkt-Download",
        },
        {
          name: "satzungLabel",
          type: "text",
          label: "Satzung: Bezeichnung",
          defaultValue: "Satzung (PDF)",
        },
        {
          name: "satzungHref",
          type: "text",
          label: "Satzung: PDF-Link",
          admin: { description: "Pfad zur Satzung-PDF unter /downloads/." },
          defaultValue: "/downloads/satzung-2026-05.pdf",
        },
        {
          name: "satzungHint",
          type: "text",
          label: "Satzung: Zusatz (Stand/Register)",
          defaultValue: "Stand Mai 2026 · VR 6924",
        },
      ],
    },
    {
      name: "kuendigung",
      type: "group",
      label: "Abschnitt: Mitgliedschaft beenden",
      admin: {
        description: "Kündigungshinweis mit E-Mail- und Postanschrift.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          defaultValue: "Kündigung",
        },
        {
          name: "heading",
          type: "text",
          label: "Überschrift",
          defaultValue: "Mitgliedschaft beenden",
        },
        {
          name: "body",
          type: "textarea",
          label: "Text",
          defaultValue:
            "Bitte kündige deine Mitgliedschaft schriftlich zum 31.12. des Jahres. Du kannst die Kündigung per E-Mail oder Post einreichen.",
        },
        {
          name: "email",
          type: "email",
          label: "E-Mail für Kündigungen",
          defaultValue: "info@svnord.de",
        },
        {
          name: "postName",
          type: "text",
          label: "Postanschrift: Name",
          defaultValue: "SV Nord München-Lerchenau e.V.",
        },
        {
          name: "postStreet",
          type: "text",
          label: "Postanschrift: Straße",
          defaultValue: "Ebereschenstraße 17",
        },
        {
          name: "postCity",
          type: "text",
          label: "Postanschrift: PLZ + Ort",
          defaultValue: "80935 München",
        },
      ],
    },
  ],
};
