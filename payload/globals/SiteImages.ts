import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

/**
 * Einzelbilder, die zu keiner Mannschaft und zu keinem Beitrag gehören und
 * deshalb sonst fest im Code stünden. Jedes Feld ist optional: ohne Eintrag
 * zeigt die Seite weiterhin das mitgelieferte Bild, damit ein leeres Feld nie
 * ein Loch auf der Seite erzeugt.
 *
 * Bewusst nicht hier: das Vereinslogo, der Spenden-QR-Code und die App-Icons.
 * Der Medien-Upload rechnet jedes Bild nach WebP um und skaliert es; bei einem
 * QR-Code kostet das die Lesbarkeit, und Logo und App-Icons brauchen exakte
 * Dateiformate und Größen.
 */
export const SiteImages: GlobalConfig = {
  slug: "site-images",
  label: "Weitere Bilder",
  admin: {
    group: "4. Seiten",
    description:
      "Einzelne Bilder auf Unterseiten: die drei Fotos der U8 und das Sommerfest-Plakat.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("site-images")] },
  fields: [
    {
      name: "u8",
      type: "group",
      label: "U8 (Seite Junioren)",
      admin: { description: "Die drei Fotos im U8-Bereich." },
      fields: [
        {
          name: "trainerteam",
          type: "upload",
          relationTo: "media",
          label: "Trainerteam",
        },
        {
          name: "loewen",
          type: "upload",
          relationTo: "media",
          label: "Löwen",
        },
        {
          name: "tiger",
          type: "upload",
          relationTo: "media",
          label: "Tiger",
        },
      ],
    },
    {
      name: "sommerfestPlakat",
      type: "upload",
      relationTo: "media",
      label: "Sommerfest-Plakat (Startseite)",
    },
  ],
};
