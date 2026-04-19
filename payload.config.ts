import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
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

import { ChronikPage } from "./payload/globals/ChronikPage";
import { ContactInfo } from "./payload/globals/ContactInfo";
import { HomePage } from "./payload/globals/HomePage";
import { JugendfoerderPage } from "./payload/globals/JugendfoerderPage";
import { LegalPages } from "./payload/globals/LegalPages";
import { Navigation } from "./payload/globals/Navigation";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { VereinsheimPage } from "./payload/globals/VereinsheimPage";

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
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
    ],
  }),
  collections: [Users, Media, People, Teams, Posts, Sponsors, Fixtures, Events, Submissions],
  globals: [
    SiteSettings,
    Navigation,
    HomePage,
    ContactInfo,
    ChronikPage,
    VereinsheimPage,
    JugendfoerderPage,
    LegalPages,
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    meta: {
      titleSuffix: "· SV Nord Admin",
    },
  },
  plugins: process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          enabled: true,
          collections: { media: true },
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      ]
    : [],
});
