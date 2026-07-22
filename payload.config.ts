import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

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
import { FaqPage } from "./payload/globals/FaqPage";
import { HomePage } from "./payload/globals/HomePage";
import { JugendfoerderPage } from "./payload/globals/JugendfoerderPage";
import { LegalPages } from "./payload/globals/LegalPages";
import { Navigation } from "./payload/globals/Navigation";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { VereinsheimPage } from "./payload/globals/VereinsheimPage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Fail fast on Vercel if the JWT secret is missing: an empty secret produces
// forgeable tokens. Locally (no VERCEL env) fall back to a placeholder so the
// build and typecheck can still run without secrets present.
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
if (!PAYLOAD_SECRET && process.env.VERCEL) {
  throw new Error(
    "PAYLOAD_SECRET is required in production (Vercel). Refusing to start with a forgeable token secret.",
  );
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  secret: PAYLOAD_SECRET || "dev-insecure-secret-change-in-prod",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
    // Drizzle dev push compares the config against the live schema and blocks
    // on an interactive prompt whenever they drift. Scripts (seed, imports)
    // run non-interactively and only touch rows, never the schema, so they set
    // PAYLOAD_DISABLE_PUSH=true and connect as-is.
    push: process.env.PAYLOAD_DISABLE_PUSH !== "true",
  }),
  sharp,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
    ],
  }),
  collections: [
    Users,
    Media,
    People,
    Teams,
    Posts,
    Sponsors,
    Fixtures,
    Events,
    Submissions,
  ],
  globals: [
    SiteSettings,
    Navigation,
    HomePage,
    ContactInfo,
    ChronikPage,
    VereinsheimPage,
    JugendfoerderPage,
    LegalPages,
    FaqPage,
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    meta: {
      titleSuffix: "· SV Nord Admin",
    },
    // No autoLogin: the admin requires a real login. Accounts are provisioned
    // by scripts/seed.ts (ensureAdminUser). Auto-login would expose the whole
    // CMS to anonymous visitors and must never run in production.
    components: {
      beforeDashboard: ["@/payload/components/WelcomeDashboard#default"],
    },
  },
  // Media is stored on local disk (Media.upload.staticDir = public/uploads) and
  // served from there; the frontend resolves images to committed /public assets
  // via lib/publicUploads. No external blob storage. If CMS-managed uploads are
  // reintroduced later, add an external adapter here (e.g. S3 / Cloudflare R2).
  plugins: [],
});
