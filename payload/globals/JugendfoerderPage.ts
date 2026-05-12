import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const JugendfoerderPage: GlobalConfig = {
  slug: "jugendfoerder-page",
  label: "Jugendförderverein",
  admin: {
    group: "4. Seiten",
    description: "Inhalte der Seite /jugendfoerderverein.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("jugendfoerder-page")] },
  fields: [
    {
      name: "intro",
      type: "textarea",
      label: "Einleitung",
      admin: {
        description:
          "Kurztext unter dem Seitentitel. Wenn leer, wird ein Standardtext angezeigt.",
      },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      label: "Haupttext",
      admin: {
        description:
          "Ansprache an Eltern und Freunde des SV Nord — was macht der Jugendförderverein?",
      },
    },
    {
      name: "supportBullets",
      type: "array",
      label: "Was wir unterstützen (Aufzählung)",
      admin: {
        description:
          "Konkrete Aktivitäten, die der Förderverein unterstützt. Erscheint als Liste.",
      },
      fields: [
        { name: "text", type: "text", required: true, label: "Eintrag" },
      ],
    },
    {
      name: "minAnnualFee",
      type: "number",
      defaultValue: 24,
      label: "Mindest-Jahresbeitrag (€)",
    },
    {
      name: "formPdfUrl",
      type: "text",
      defaultValue: "/downloads/jfv-beitrittserklaerung.pdf",
      label: "Beitrittserklärung (PDF-Link)",
      admin: {
        description:
          "Pfad zur PDF-Beitrittserklärung. Standard liegt unter /downloads/.",
      },
    },
    {
      name: "primaryContactEmail",
      type: "email",
      defaultValue: "nordjugend@gmx.de",
      label: "Hauptkontakt-E-Mail",
      admin: { description: "Für Interessent:innen sichtbar." },
    },
    {
      name: "boardMemberName",
      type: "text",
      defaultValue: "Ergin Piker",
      label: "Vorstand: Name",
    },
    {
      name: "boardRole",
      type: "text",
      defaultValue: "1. Vorstand",
      label: "Vorstand: Rolle",
    },
    {
      name: "boardContactEmail",
      type: "email",
      defaultValue: "ergin.piker@svnord.de",
      label: "Vorstand: E-Mail",
    },
    {
      name: "iban",
      type: "text",
      label: "Spenden-IBAN",
      admin: {
        description:
          "Optional. Nur ausfüllen, wenn eine Direktspende-IBAN veröffentlicht werden soll.",
      },
    },
    {
      name: "contactEmail",
      type: "email",
      label: "(veraltet) Kontakt-E-Mail",
      admin: {
        hidden: true,
        description:
          "Veraltet. Bitte 'Hauptkontakt-E-Mail' verwenden. Feld bleibt nur für Datenkompatibilität.",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Titelbild (Reserve)",
      admin: {
        description:
          "Optionales Titelbild. Aktuell nicht eingeblendet — Reserve für spätere Gestaltung.",
      },
    },
  ],
};
