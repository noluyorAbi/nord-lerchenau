import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const VereinPage: GlobalConfig = {
  slug: "verein-page",
  label: "Verein (Übersicht)",
  admin: {
    group: "6. Seiten",
    description:
      "Inhalte der Verein-Landingpage /verein (Kennzahlen, Karten, Social-Media-Team, Aufruf).",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("verein-page")] },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Kopfbereich (Hero)",
      admin: {
        description: "Überschrift und Einleitung ganz oben auf der Seite.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          admin: { description: "Kleiner Text über der Hauptüberschrift." },
          defaultValue: "Der Verein",
        },
        {
          name: "title",
          type: "text",
          label: "Hauptüberschrift",
          admin: { description: "Großer Titel des Kopfbereichs." },
          defaultValue: "SV Nord München-Lerchenau e.V.",
        },
        {
          name: "lede",
          type: "textarea",
          label: "Einleitungstext",
          admin: { description: "Kurzer Einleitungssatz unter dem Titel." },
          defaultValue:
            "Traditionsverein im Münchner Norden seit 1947: über 600 Mitglieder, fünf Abteilungen.",
        },
      ],
    },
    {
      name: "stats",
      type: "array",
      label: "Kennzahlen (Kacheln)",
      labels: { singular: "Kennzahl", plural: "Kennzahlen" },
      admin: {
        description:
          "Die Zahlen-Kacheln über den Karten. Reihenfolge = Anzeige-Reihenfolge.",
      },
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          label: "Wert / Zahl",
        },
        {
          name: "label",
          type: "text",
          required: true,
          label: "Beschriftung",
        },
      ],
      defaultValue: [
        { value: "1947", label: "Gegründet" },
        { value: "600+", label: "Mitglieder" },
        { value: "5", label: "Abteilungen" },
        { value: "78", label: "Jahre" },
      ],
    },
    {
      name: "cards",
      type: "array",
      label: "Feature-Karten",
      labels: { singular: "Karte", plural: "Karten" },
      admin: {
        description:
          "Die großen Verlinkungs-Karten. Reihenfolge bestimmt das Layout (erste Karte groß, zweite hochkant).",
      },
      fields: [
        {
          name: "href",
          type: "text",
          required: true,
          label: "Ziel-Link",
          admin: { description: "Interner Pfad, z. B. /verein/chronik." },
        },
        {
          name: "eyebrow",
          type: "text",
          required: true,
          label: "Kleine Zeile (Kategorie)",
        },
        {
          name: "title",
          type: "text",
          required: true,
          label: "Titel",
        },
        {
          name: "desc",
          type: "textarea",
          required: true,
          label: "Beschreibung",
        },
        {
          name: "meta",
          type: "text",
          required: true,
          label: "Zusatzzeile (Meta)",
          admin: {
            description: "Kleiner Hinweis unten links auf der Karte.",
          },
        },
        {
          name: "tone",
          type: "select",
          required: true,
          label: "Farbschema",
          admin: {
            description: "Bestimmt Hintergrund- und Textfarbe der Karte.",
          },
          options: [
            { label: "Navy (dunkelblau)", value: "navy" },
            { label: "Papier (hell)", value: "paper" },
            { label: "Himmel (hellblau)", value: "sky" },
            { label: "Gold", value: "gold" },
          ],
        },
      ],
      defaultValue: [
        {
          href: "/verein/chronik",
          eyebrow: "Geschichte",
          title: "Chronik",
          desc: "Von 38 Gründern und einer Kuhhaut zu heute. 78 Jahre SV Nord in 7 Kapiteln, Zeittafel und Ehrentafel.",
          meta: "1947 → heute",
          tone: "paper",
        },
        {
          href: "/verein/vorstand",
          eyebrow: "Menschen",
          title: "Vorstand",
          desc: "Vorstandschaft, sportliche Leitung und Jugendleitung. Direkt erreichbar mit Telefon und Mail.",
          meta: "Ehrenamtlich · 22 Personen",
          tone: "sky",
        },
        {
          href: "/verein/vereinsheim",
          eyebrow: "Treffpunkt",
          title: "Vereinsheim Eschengarten",
          desc: "Selbst gebaut in 15.000 freiwilligen Arbeitsstunden. Heute der gesellschaftliche Mittelpunkt der Lerchenau.",
          meta: "Eröffnet 19.07.1986",
          tone: "paper",
        },
        {
          href: "/verein/jugendfoerderverein",
          eyebrow: "Förderung",
          title: "Jugendförderverein",
          desc: "Damit jedes Kind kicken kann. Mindest­beitrag 24 € im Jahr, Spendenquittung möglich.",
          meta: "Ab 24 € jährlich",
          tone: "gold",
        },
        {
          href: "/verein/jugendschutz",
          eyebrow: "Schutzkonzept",
          title: "Kinder- & Jugendschutz",
          desc: "Erweitertes Führungszeugnis für alle Trainer, klare Prävention und Ansprechstellen im Verdachtsfall.",
          meta: "Schutz & Prävention",
          tone: "navy",
        },
      ],
    },
    {
      name: "socialMediaLabel",
      type: "text",
      label: "Social-Media: Überschrift",
      admin: {
        description: "Beschriftung über der Liste des Social-Media-Teams.",
      },
      defaultValue: "Social Media",
    },
    {
      name: "socialMediaTeam",
      type: "array",
      label: "Social-Media-Team",
      labels: { singular: "Person", plural: "Personen" },
      admin: {
        description: "Namen der Personen im Social-Media-Team.",
      },
      fields: [{ name: "name", type: "text", required: true, label: "Name" }],
      defaultValue: [
        { name: "Tobias Tins" },
        { name: "Tobias Treffer" },
        { name: "Dominik Besel" },
        { name: "Andi Weiß" },
        { name: "Marko Rakita" },
        { name: "Tamay Piker" },
      ],
    },
    {
      name: "cta",
      type: "group",
      label: "Mitglied-werden-Aufruf (CTA)",
      admin: {
        description: "Der gestrichelte Aufruf-Block ganz unten auf der Seite.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Kleine Zeile darüber",
          defaultValue: "Mitglied werden",
        },
        {
          name: "title",
          type: "text",
          label: "Überschrift",
          defaultValue: "Einmal Nordler, immer Nordler.",
        },
        {
          name: "text",
          type: "textarea",
          label: "Beschreibungstext",
          defaultValue:
            "Mitgliedsantrag, SEPA-Mandat, Spielerpass. Drei Schritte und du bist dabei.",
        },
        {
          name: "buttonLabel",
          type: "text",
          label: "Button: Text",
          defaultValue: "Antrag öffnen →",
        },
        {
          name: "buttonHref",
          type: "text",
          label: "Button: Ziel-Link",
          defaultValue: "/mitgliedschaft",
        },
      ],
    },
  ],
};
