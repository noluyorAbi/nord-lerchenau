import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const VorstandPage: GlobalConfig = {
  slug: "vorstand-page",
  label: "Vorstand-Seite",
  admin: {
    group: "6. Seiten",
    description:
      "Statische Texte der Seite /verein/vorstand (Überschriften, Einleitung, Hinweistexte). Die Personen-Listen selbst kommen aus der Sammlung „Personen“ und werden hier nicht gepflegt.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("vorstand-page")] },
  fields: [
    {
      type: "collapsible",
      label: "Kopfbereich (Hero)",
      admin: {
        description: "Der große Titelblock ganz oben auf der Seite.",
      },
      fields: [
        {
          name: "heroEyebrow",
          type: "text",
          label: "Hero – Kleine Überzeile",
          defaultValue: "Vorstand",
          admin: {
            description: "Kurze Zeile über dem großen Titel, z. B. „Vorstand“.",
          },
        },
        {
          name: "heroTitle",
          type: "text",
          label: "Hero – Titel",
          defaultValue: "Das Team hinter dem Verein",
          admin: { description: "Große Hauptüberschrift der Seite." },
        },
        {
          name: "heroLede",
          type: "textarea",
          label: "Hero – Einleitung",
          defaultValue:
            "Ehrenamtliche Vorstandschaft, sportliche Leitung und Jugendleitung. Erreichbar für alle Fragen rund um den SV Nord.",
          admin: { description: "Einleitender Fließtext unter dem Titel." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Kennzahlen (Kacheln)",
      admin: {
        description:
          "Beschriftungen der vier Zahlen-Kacheln. Die Zahlen selbst werden automatisch aus den Personen-Daten berechnet.",
      },
      fields: [
        {
          name: "statVorstandLabel",
          type: "text",
          label: "Kachel 1 – Beschriftung",
          defaultValue: "Vorstand",
          admin: { description: "Label der Kachel mit der Vorstands-Anzahl." },
        },
        {
          name: "statAbteilungenLabel",
          type: "text",
          label: "Kachel 2 – Beschriftung",
          defaultValue: "Abteilungen",
          admin: {
            description: "Label der Kachel mit der Anzahl der Abteilungen.",
          },
        },
        {
          name: "statJugendleitungLabel",
          type: "text",
          label: "Kachel 3 – Beschriftung",
          defaultValue: "Jugendleitung",
          admin: {
            description: "Label der Kachel mit der Jugendleitungs-Anzahl.",
          },
        },
        {
          name: "statAnsprechpartnerLabel",
          type: "text",
          label: "Kachel 4 – Beschriftung",
          defaultValue: "Ansprechpartner",
          admin: {
            description:
              "Label der Kachel mit der Gesamtzahl der Ansprechpartner.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Abschnitt „Vorstandschaft“",
      admin: {
        description: "Überschriften über den vier Vorstands-Karten.",
      },
      fields: [
        {
          name: "vorstandEyebrow",
          type: "text",
          label: "Kleine Überzeile",
          defaultValue: "Vorstandschaft",
          admin: {
            description: "Kurze Zeile über der Abschnitts-Überschrift.",
          },
        },
        {
          name: "vorstandTitle",
          type: "text",
          label: "Überschrift",
          defaultValue: "Die Vier an der Spitze",
          admin: { description: "Hauptüberschrift des Vorstands-Abschnitts." },
        },
        {
          name: "vorstandSub",
          type: "text",
          label: "Unterzeile",
          defaultValue: "Gewählte Vorstandschaft nach Vereinssatzung.",
          admin: { description: "Erläuternder Text unter der Überschrift." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Hinweis-Box „Kinder- & Jugendschutz“",
      admin: {
        description:
          "Die verlinkte Hinweis-Box unter dem Vorstand (führt zu /verein/jugendschutz).",
      },
      fields: [
        {
          name: "jugendschutzEyebrow",
          type: "text",
          label: "Kleine Überzeile",
          defaultValue: "Schutzkonzept",
          admin: { description: "Kurze Zeile oben in der Hinweis-Box." },
        },
        {
          name: "jugendschutzTitle",
          type: "text",
          label: "Titel",
          defaultValue: "Kinder- & Jugendschutz",
          admin: { description: "Titel der Hinweis-Box." },
        },
        {
          name: "jugendschutzText",
          type: "textarea",
          label: "Beschreibung",
          defaultValue:
            "Erweitertes Führungszeugnis, Prävention und Ansprechstellen im Verdachtsfall.",
          admin: { description: "Beschreibungstext der Hinweis-Box." },
        },
        {
          name: "jugendschutzCta",
          type: "text",
          label: "Link-Text",
          defaultValue: "Mehr →",
          admin: { description: "Beschriftung des Links rechts in der Box." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Abschnitt „Sportliche Leitung“",
      admin: {
        description:
          "Überschriften über den nach Abteilungen gruppierten Karten.",
      },
      fields: [
        {
          name: "sportleitungEyebrow",
          type: "text",
          label: "Kleine Überzeile",
          defaultValue: "Sportliche Leitung",
          admin: {
            description: "Kurze Zeile über der Abschnitts-Überschrift.",
          },
        },
        {
          name: "sportleitungTitle",
          type: "text",
          label: "Überschrift",
          defaultValue: "Abteilungsleitung",
          admin: { description: "Hauptüberschrift des Abschnitts." },
        },
        {
          name: "sportleitungSub",
          type: "text",
          label: "Unterzeile",
          defaultValue: "Pro Abteilung gruppiert.",
          admin: { description: "Erläuternder Text unter der Überschrift." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Abschnitt „Jugendleitung“",
      admin: {
        description: "Überschriften über den Jugendleitungs-Karten.",
      },
      fields: [
        {
          name: "jugendleitungEyebrow",
          type: "text",
          label: "Kleine Überzeile",
          defaultValue: "Jugendleitung",
          admin: {
            description: "Kurze Zeile über der Abschnitts-Überschrift.",
          },
        },
        {
          name: "jugendleitungTitle",
          type: "text",
          label: "Überschrift",
          defaultValue: "Großfeld und Kleinfeld",
          admin: { description: "Hauptüberschrift des Abschnitts." },
        },
        {
          name: "jugendleitungSub",
          type: "text",
          label: "Unterzeile",
          defaultValue: "Direkte Ansprechpartner für Eltern und Jugendspieler.",
          admin: { description: "Erläuternder Text unter der Überschrift." },
        },
      ],
    },
  ],
};
