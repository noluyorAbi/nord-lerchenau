import type { CollectionConfig, PayloadRequest } from "payload";

import { authenticated } from "../access/authenticated";

const adminAccess = ({ req }: { req: PayloadRequest }): boolean =>
  Boolean(req.user);

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "System",
  },
  access: {
    admin: adminAccess,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
