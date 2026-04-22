import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const JugendfoerderPage: GlobalConfig = {
  slug: "jugendfoerder-page",
  label: "Jugendförderverein",
  admin: { group: "Seiten" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("jugendfoerder-page")] },
  fields: [
    {
      name: "intro",
      type: "textarea",
      admin: {
        description:
          "Kurztext unter dem Seitentitel (Hero-Lede). Optional — wenn leer, fällt die Seite auf einen Standardtext zurück.",
      },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      admin: {
        description:
          "Haupttext. Komplette Ansprache an Eltern und Freunde des SV Nord.",
      },
    },
    {
      name: "supportBullets",
      type: "array",
      label: "Unsere Unterstützung",
      admin: {
        description:
          "Liste der konkreten Aktivitäten, die der Förderverein unterstützt. Erscheint als Aufzählung auf der Seite.",
      },
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "minAnnualFee",
      type: "number",
      defaultValue: 24,
      admin: { description: "Mindest-Jahresbeitrag in Euro." },
    },
    {
      name: "formPdfUrl",
      type: "text",
      defaultValue: "/downloads/jfv-beitrittserklaerung.pdf",
      admin: {
        description:
          "URL zur Beitrittserklärung (PDF). Standard liegt unter /downloads/.",
      },
    },
    {
      name: "primaryContactEmail",
      type: "email",
      defaultValue: "nordjugend@gmx.de",
      admin: { description: "Hauptkontakt für Interessent:innen." },
    },
    {
      name: "boardMemberName",
      type: "text",
      defaultValue: "Ergin Piker",
    },
    {
      name: "boardRole",
      type: "text",
      defaultValue: "1. Vorstand",
    },
    {
      name: "boardContactEmail",
      type: "email",
      defaultValue: "ergin.piker@svnord.de",
    },
    {
      name: "iban",
      type: "text",
      admin: { description: "Optional — nur ausfüllen, wenn eine Direktspende-IBAN veröffentlicht werden soll." },
    },
    {
      name: "contactEmail",
      type: "email",
      admin: {
        hidden: true,
        description:
          "Veraltet. Bitte 'Hauptkontakt-E-Mail' (primaryContactEmail) verwenden. Feld bleibt für Datenkompatibilität bestehen.",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optionales Titelbild. Aktuell auf der Seite nicht eingeblendet — Reserve für spätere Hero-Gestaltung.",
      },
    },
  ],
};
