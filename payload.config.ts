import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  editor: lexicalEditor(),
  collections: [],
  globals: [],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    meta: {
      titleSuffix: "· SV Nord Admin",
    },
  },
});
