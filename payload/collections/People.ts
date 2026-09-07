import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const People: CollectionConfig = {
  slug: "people",
  labels: {
    singular: "Person",
    plural: "Personen (Vorstand · Trainer · Spieler)",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "function", "role", "email"],
    description:
      "Vorstand, Trainer:innen, Spieler:innen. Über das Feld 'Funktion' wird die Person der richtigen Sektion auf der Website zugeordnet.",
    group: "2. Sport",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("people")],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Vor- und Nachname",
    },
    {
      name: "role",
      type: "text",
      required: true,
      label: "Rollenbezeichnung",
      admin: {
        description:
          "Wie soll die Rolle auf der Webseite stehen? z.B. '1. Vorstand', 'Sportlicher Leiter', 'Trainer A1'.",
      },
    },
    {
      name: "function",
      type: "select",
      required: true,
      label: "Funktion (Zuordnung)",
      admin: {
        description:
          "Bestimmt, in welcher Sektion die Person auf der Webseite erscheint.",
      },
      options: [
        { label: "Vorstand", value: "vorstand" },
        { label: "Sportleitung", value: "sportleitung" },
        { label: "Jugendleitung", value: "jugendleitung" },
        { label: "Trainer", value: "trainer" },
        { label: "Zeugwart", value: "zeugwart" },
        { label: "Spieler", value: "spieler" },
        { label: "Andere", value: "andere" },
      ],
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Foto",
      admin: { description: "Portraitfoto. Optional, aber empfohlen." },
    },
    {
      name: "phone",
      type: "text",
      label: "Telefon",
      admin: {
        // Der alte Hinweis versprach das Gegenteil dessen, was passiert:
        // auf /verein/vorstand entfernt `stripPhone` jede Nummer, und auf den
        // Fussballseiten zeigt `PHONE_PUBLIC` nur namentlich freigegebene an.
        // Wer hier eine Nummer eintraegt und auf ihr Erscheinen wartet, wartet
        // vergeblich. Das Feld bleibt trotzdem sinnvoll: die Nummer einer
        // bereits freigegebenen Person wird hier gepflegt.
        description:
          "Optional. Ändern wirkt sofort — aber eine Nummer erscheint nicht automatisch: auf der Vorstandsseite werden Telefonnummern grundsätzlich nicht angezeigt, auf den Fußballseiten nur für Personen, die der Verein ausdrücklich freigegeben hat. Für eine neue Freigabe bitte den Entwickler ansprechen.",
      },
    },
    { name: "email", type: "email", label: "E-Mail" },
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      label: "Mannschaft",
      admin: {
        // Der alte Hinweis versprach eine Zuordnung, die es nicht gibt:
        // keine Seite liest dieses Feld. Die Verknuepfung, die wirklich
        // zaehlt, sitzt auf der Gegenseite, im Feld "Trainer:innen" der
        // Mannschaft. Wer sich hier verlaesst, traegt einen Trainer ein,
        // der auf der Webseite nirgends auftaucht.
        description:
          "Nur zur Übersicht im Adminbereich. Damit eine Trainerin oder ein Trainer auf einer Mannschaftsseite erscheint, muss die Person in der Mannschaft selbst unter 'Trainer:innen' eingetragen werden.",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Sortierung",
      admin: {
        // Ehrlich statt allgemein: nur /verein/vorstand sortiert Personen
        // ueber dieses Feld, und dort auch nur die Abschnitte Sportleitung
        // und Jugendleitung. Der Vorstand selbst steht in einer festen
        // Namensliste, und Trainer:innen erscheinen in der Reihenfolge,
        // in der sie in der Mannschaft eingetragen sind.
        description:
          "Gilt nur für die Seite 'Verein → Vorstand', dort für die Abschnitte Sportleitung und Jugendleitung: kleinere Zahl = weiter oben. Für Trainer:innen hat das Feld keine Wirkung. Deren Reihenfolge ergibt sich aus dem Feld 'Trainer:innen' der jeweiligen Mannschaft.",
      },
    },
  ],
};
