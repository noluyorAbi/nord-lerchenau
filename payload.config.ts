import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { Events } from "./payload/collections/Events";
import { Fixtures } from "./payload/collections/Fixtures";
import { Media } from "./payload/collections/Media";
import { People } from "./payload/collections/People";
import { Posts } from "./payload/collections/Posts";
import { Sponsors } from "./payload/collections/Sponsors";
import { Submissions } from "./payload/collections/Submissions";
import { Teams } from "./payload/collections/Teams";
import { Users } from "./payload/collections/Users";

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
  collections: [Users, Media, People, Teams, Posts, Sponsors, Fixtures, Events, Submissions],
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
