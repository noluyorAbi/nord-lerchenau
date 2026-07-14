import type { CollectionConfig, PayloadRequest } from "payload";

import { authenticated } from "../access/authenticated";

const adminAccess = ({ req }: { req: PayloadRequest }): boolean =>
  Boolean(req.user);

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Admin-Konto", plural: "Admin-Konten" },
  admin: {
    useAsTitle: "username",
    description:
      "Login-Konten für das Admin-Panel. Login per Benutzername (E-Mail funktioniert weiterhin). Hier weitere Admins anlegen oder Passwörter ändern.",
    group: "9. System",
  },
  access: {
    admin: adminAccess,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Anzeigename",
      admin: { description: "Wird oben rechts im Admin-Menü gezeigt." },
    },
  ],
};
