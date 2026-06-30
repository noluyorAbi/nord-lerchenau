import type { CollectionConfig } from "payload";

import { isAdmin, isAdminFieldLevel, isAdminOrSelf } from "../access/isAdmin";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Konto", plural: "Konten" },
  admin: {
    useAsTitle: "email",
    description:
      "Login-Konten für das Admin-Panel. 'Vollzugriff' darf alles inkl. Konten verwalten. 'Redakteur' pflegt nur Inhalte und kann keine Konten anlegen oder löschen.",
    group: "9. System",
  },
  access: {
    // Any logged-in user may open the admin panel. (The `admin` slot must return
    // a plain boolean, so it can't take the broader `Access`-typed helpers.)
    admin: ({ req: { user } }) => Boolean(user),
    // Only admins may create or delete accounts — prevents an editor from
    // taking over another account or locking everyone out.
    create: isAdmin,
    delete: isAdmin,
    // Admins manage everyone; editors are scoped to their own row (so they can
    // change their own password but never see or touch other accounts).
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
      label: "Anzeigename",
      admin: { description: "Wird oben rechts im Admin-Menü gezeigt." },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      // Persist the role in the auth JWT so access functions can read it
      // without an extra DB lookup on every request.
      saveToJWT: true,
      label: "Rolle",
      options: [
        { label: "Vollzugriff (Admin)", value: "admin" },
        { label: "Redakteur (nur Inhalte)", value: "editor" },
      ],
      admin: {
        description:
          "Vollzugriff darf alles. Redakteur pflegt Inhalte, kann aber keine Konten verwalten. Nur Admins können die Rolle ändern.",
      },
      // Field-level lock: only an admin may set or change a role. This is the
      // critical guard that stops an editor from promoting themselves.
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
  ],
};
