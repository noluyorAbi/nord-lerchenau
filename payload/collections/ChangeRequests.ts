import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
} from "payload";

import { authenticated } from "../access/authenticated";
import { isAdmin, isAdminFieldLevel, isAdminOrOwner } from "../access/isAdmin";
import { notifyDev } from "@/lib/notify";

// Status state machine for the AI-Studio. Phase 0 uses a subset (neu ->
// vorschau_bereit -> freigegeben/aenderung_erwuenscht -> live); the agent
// pipeline (later) drives the in-between states. Dev/system owns `status`;
// the club only ever sets `clientDecision`.
const STATUS_OPTIONS = [
  { label: "Neu (eingereicht)", value: "neu" },
  { label: "Wird eingeordnet", value: "triage" },
  { label: "Inhalt → bitte im CMS ändern", value: "inhalt_cms" },
  { label: "Geplant", value: "geplant" },
  { label: "In Arbeit", value: "in_arbeit" },
  { label: "Wird geprüft", value: "review" },
  { label: "Vorschau bereit", value: "vorschau_bereit" },
  { label: "Änderung erwünscht", value: "aenderung_erwuenscht" },
  { label: "Freigegeben (wartet auf Veröffentlichung)", value: "freigegeben" },
  { label: "Wird live geschaltet", value: "wird_live" },
  { label: "Live", value: "live" },
  { label: "Fehlgeschlagen", value: "fehlgeschlagen" },
  { label: "Braucht Entwickler", value: "braucht_dev" },
  { label: "Abgelehnt", value: "abgelehnt" },
] as const;

// Admin-only field access: the club may READ these (to see status/preview) but
// never write them. Read stays open so editors see progress.
const devFieldAccess = {
  create: isAdminFieldLevel,
  update: isAdminFieldLevel,
};

// Fully internal fields: only admins may read them too (dev notes, KI cost,
// branch/PR plumbing). Editors have no reason to see these.
const devFieldAccessInternal = {
  create: isAdminFieldLevel,
  read: isAdminFieldLevel,
  update: isAdminFieldLevel,
};

const setOwnerAndTitle: CollectionBeforeChangeHook = ({
  data,
  req,
  operation,
}) => {
  if (operation === "create") {
    // Always stamp the real submitter; never trust a client-supplied value.
    if (req.user) data.requestedBy = req.user.id;
    if (!data.title && typeof data.prompt === "string") {
      data.title = data.prompt.trim().slice(0, 70);
    }
    if (!data.status) data.status = "neu";
  }
  return data;
};

const notifyOnChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  operation,
}) => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  const link = `${base}/admin/collections/change-requests/${doc.id}`;

  if (operation === "create") {
    void notifyDev(
      `Neuer Änderungswunsch: ${doc.title ?? doc.id}`,
      `Ein Vereins-Mitglied hat einen Änderungswunsch eingereicht.\n\nWunsch:\n${doc.prompt}\n\nÖffnen: ${link}`,
    );
    return doc;
  }

  const prev = previousDoc as { clientDecision?: string } | undefined;
  if (
    doc.clientDecision &&
    doc.clientDecision !== "offen" &&
    doc.clientDecision !== prev?.clientDecision
  ) {
    const label = doc.clientDecision === "passt" ? "PASST ✓" : "PASST NICHT ✗";
    void notifyDev(
      `Vorschau-Entscheidung (${label}): ${doc.title ?? doc.id}`,
      `Das Vereins-Mitglied hat die Vorschau bewertet: ${label}.\n\n` +
        (doc.clientFeedback ? `Feedback:\n${doc.clientFeedback}\n\n` : "") +
        `Öffnen: ${link}`,
    );
  }
  return doc;
};

export const ChangeRequests: CollectionConfig = {
  slug: "change-requests",
  labels: {
    singular: "Änderungswunsch",
    plural: "Änderungswünsche (KI-Studio)",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "status",
      "clientDecision",
      "category",
      "updatedAt",
    ],
    group: "0. KI-Studio",
    description:
      "Beschreibe einen Wunsch an der Website (z. B. neue Sektion, anderes Layout). Hinweis: Texte, Bilder, Termine und Sponsoren änderst du direkt im CMS — hier nur strukturelle/Design-Wünsche.",
  },
  access: {
    // Editors + admins may submit requests.
    create: authenticated,
    // Editors see only their own requests; admins see all.
    read: isAdminOrOwner("requestedBy"),
    // Editors may update their own row (the client fields are the only ones
    // they can write — the dev fields are field-level locked to admins).
    update: isAdminOrOwner("requestedBy"),
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [setOwnerAndTitle],
    afterChange: [notifyOnChange],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titel",
      admin: {
        readOnly: true,
        description: "Wird automatisch aus dem Wunsch erzeugt.",
      },
    },
    {
      name: "prompt",
      type: "textarea",
      required: true,
      label: "Was möchtest du ändern?",
      admin: {
        description:
          "Beschreibe so genau wie möglich, was sich an der Website ändern soll und wo.",
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "neu",
      label: "Status",
      options: [...STATUS_OPTIONS],
      access: devFieldAccess,
      admin: {
        description: "Bearbeitungsstand (wird vom Studio/Entwickler gesetzt).",
        position: "sidebar",
      },
    },
    {
      name: "clientDecision",
      type: "select",
      defaultValue: "offen",
      label: "Deine Entscheidung zur Vorschau",
      options: [
        { label: "Noch offen", value: "offen" },
        { label: "Passt — so umsetzen", value: "passt" },
        { label: "Passt nicht — bitte ändern", value: "passt_nicht" },
      ],
      admin: {
        description:
          "Sobald eine Vorschau bereit ist: hier bewerten und bei Bedarf unten Feedback geben.",
        position: "sidebar",
      },
    },
    {
      name: "clientFeedback",
      type: "textarea",
      label: "Feedback zur Vorschau",
      admin: {
        description: "Was soll an der Vorschau noch anders sein?",
      },
    },
    {
      name: "previewUrl",
      type: "text",
      label: "Vorschau-Link",
      access: devFieldAccess,
      admin: {
        description:
          "Link zur Staging-Vorschau (vom Studio/Entwickler gesetzt).",
      },
    },
    {
      name: "category",
      type: "select",
      defaultValue: "unbestimmt",
      label: "Art",
      options: [
        { label: "Noch unbestimmt", value: "unbestimmt" },
        { label: "Inhalt (gehört ins CMS)", value: "inhalt" },
        { label: "Struktur / Design (Code)", value: "struktur" },
      ],
      access: devFieldAccess,
      admin: { position: "sidebar" },
    },
    {
      name: "devNotes",
      type: "textarea",
      label: "Interne Notizen (Entwickler)",
      access: devFieldAccessInternal,
    },
    {
      name: "branch",
      type: "text",
      label: "Git-Branch",
      access: devFieldAccessInternal,
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "prUrl",
      type: "text",
      label: "Pull-Request",
      access: devFieldAccessInternal,
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "iteration",
      type: "number",
      defaultValue: 0,
      label: "Iteration",
      access: devFieldAccessInternal,
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "costUsd",
      type: "number",
      label: "KI-Kosten (USD)",
      access: devFieldAccessInternal,
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "requestedBy",
      type: "relationship",
      relationTo: "users",
      label: "Eingereicht von",
      access: { update: isAdminFieldLevel },
      admin: { readOnly: true, position: "sidebar" },
    },
  ],
  timestamps: true,
};
