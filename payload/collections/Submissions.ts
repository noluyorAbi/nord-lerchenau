import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";
import {
  CLUB_CHANGE,
  EXPERIENCE,
  PLAYED_BEFORE,
  PLAYER_GENDER,
} from "../../lib/contact-topics";

const isProbetraining = (data: { birthYear?: number | null }) =>
  data.birthYear != null;

export const Submissions: CollectionConfig = {
  slug: "submissions",
  labels: {
    singular: "Kontaktanfrage",
    plural: "Kontaktanfragen (Posteingang)",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "subject", "birthYear", "createdAt", "handled"],
    description:
      "Nachrichten aus dem Kontaktformular. Häkchen 'Erledigt' setzen, wenn beantwortet.",
    group: "3. Verein",
  },
  access: {
    // Public CANNOT read submissions. Only admins.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    // Public CAN create — but only via the /api/contact route, not directly.
    // The route handler uses Payload's local API, which bypasses access checks.
    create: () => false,
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Absender:in" },
    { name: "email", type: "email", required: true, label: "E-Mail" },
    { name: "phone", type: "text", required: true, label: "Telefon" },
    { name: "address", type: "textarea", required: true, label: "Adresse" },
    { name: "subject", type: "text", required: true, label: "Betreff" },
    { name: "message", type: "textarea", required: true, label: "Nachricht" },
    // Zusatzangaben aus dem Probetraining-Formular. Fuer andere Anliegen leer
    // und im Admin ausgeblendet. Nur das Geburtsjahr, nie das volle Datum.
    {
      name: "birthYear",
      type: "number",
      label: "Jahrgang",
      admin: {
        condition: isProbetraining,
        description: "Geburtsjahr des Spielers, zum Zuordnen zum Trainer.",
      },
    },
    {
      name: "playerGender",
      type: "select",
      label: "Spielerin / Spieler",
      options: PLAYER_GENDER.map((o) => ({ ...o })),
      admin: { condition: isProbetraining },
    },
    {
      name: "suggestedTeam",
      type: "text",
      label: "Vorgeschlagene Mannschaft",
      admin: {
        condition: isProbetraining,
        readOnly: true,
        description:
          "Aus Geburtsjahr und Datum der Anfrage berechnet (Spieljahr ab 1. Juli), nur ein Vorschlag.",
      },
    },
    {
      name: "playedBefore",
      type: "select",
      label: "Schon Fußball gespielt?",
      options: PLAYED_BEFORE.map((o) => ({ ...o })),
      admin: { condition: isProbetraining },
    },
    {
      name: "experience",
      type: "select",
      label: "Spielerfahrung",
      options: EXPERIENCE.map((o) => ({ ...o })),
      admin: { condition: isProbetraining },
    },
    {
      name: "clubChange",
      type: "select",
      label: "Vereinswechsel?",
      options: CLUB_CHANGE.map((o) => ({ ...o })),
      admin: { condition: isProbetraining },
    },
    {
      name: "currentClub",
      type: "text",
      label: "Aktueller Verein",
      admin: { condition: isProbetraining },
    },
    {
      name: "handled",
      type: "checkbox",
      defaultValue: false,
      label: "Erledigt",
      admin: {
        description: "Häkchen setzen, wenn die Anfrage beantwortet ist.",
      },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Interne Notizen",
      admin: {
        description: "Nur für Vereins-Admins sichtbar — nicht öffentlich.",
      },
    },
  ],
  timestamps: true,
};
