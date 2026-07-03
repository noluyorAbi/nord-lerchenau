import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { de } from "@payloadcms/translations/languages/de";
import { buildConfig } from "payload";
import sharp from "sharp";

import { ChangeRequests } from "./payload/collections/ChangeRequests";
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
import { MitgliedschaftPage } from "./payload/globals/MitgliedschaftPage";
import { VereinPage } from "./payload/globals/VereinPage";
import { SponsorenPage } from "./payload/globals/SponsorenPage";
import { JugendschutzPage } from "./payload/globals/JugendschutzPage";
import { ShopPage } from "./payload/globals/ShopPage";
import { SportOverviewPage } from "./payload/globals/SportOverviewPage";
import { FussballPage } from "./payload/globals/FussballPage";
import { FussballCategoriesPage } from "./payload/globals/FussballCategoriesPage";
import { VorstandPage } from "./payload/globals/VorstandPage";

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

// Fail fast on Vercel if the DB connection string is missing, rather than
// silently letting pg fall back to localhost (which produces confusing
// ECONNREFUSED 500s on every CMS-backed page).
const DATABASE_URI = process.env.DATABASE_URI;
if (!DATABASE_URI && process.env.VERCEL) {
  throw new Error(
    "DATABASE_URI is required in production (Vercel). Refusing to start without a database connection string.",
  );
}

// Warn (do not fail — reads still work) when running on Vercel without a Blob
// store: image uploads from /admin will 500 because the serverless filesystem
// is read-only. Connect Vercel Blob so BLOB_READ_WRITE_TOKEN is set. See
// docs/CMS-BETRIEB.md section 3a.
if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL) {
  console.warn(
    "[SV-Nord] BLOB_READ_WRITE_TOKEN is unset on Vercel — CMS image uploads " +
      "will fail (read-only filesystem). Connect a Vercel Blob store to enable uploads.",
  );
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  secret: PAYLOAD_SECRET || "dev-insecure-secret-change-in-prod",
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URI || "",
    },
  }),
  sharp,
  // Whole admin UI in German (Speichern, Neu erstellen, Wert auswählen, …). The
  // field labels are already German; this translates Payload's built-in chrome so
  // a non-technical Vereins-Mitglied never sees English fragments. German-only:
  // no language switcher, no accidental English.
  i18n: {
    supportedLanguages: { de },
    fallbackLanguage: "de",
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
    ],
  }),
  // Registration order = admin nav order (Payload renders groups by first
  // appearance, collections before globals). Ordered so the numbered "Bereiche"
  // ascend for the non-technical editor: 1 Inhalte, 2 Sport, 3 Verein,
  // 4 Bilder & Konten, 5 KI-Studio (collections), then 6 Seiten, 7 Einstellungen
  // (globals). Changing this order changes the sidebar order — keep it in sync
  // with the numeric group labels.
  collections: [
    Posts,
    Events,
    People,
    Teams,
    Fixtures,
    Sponsors,
    Submissions,
    Media,
    Users,
    ChangeRequests,
  ],
  globals: [
    HomePage,
    ChronikPage,
    VereinsheimPage,
    JugendfoerderPage,
    LegalPages,
    FaqPage,
    MitgliedschaftPage,
    VereinPage,
    SponsorenPage,
    JugendschutzPage,
    ShopPage,
    SportOverviewPage,
    FussballPage,
    FussballCategoriesPage,
    VorstandPage,
    SiteSettings,
    Navigation,
    ContactInfo,
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
      // AI-Studio chat tab: a custom admin view at /admin/studio where the club
      // submits website change wishes and approves previews. Writes go through
      // the change-requests collection access control.
      views: {
        studio: {
          Component: "@/payload/components/StudioChat#default",
          path: "/studio",
          meta: { title: "KI-Studio" },
        },
      },
    },
  },
  // Media uploads: when BLOB_READ_WRITE_TOKEN is set (Vercel production), uploads
  // are stored durably in Vercel Blob and media.url points at the public blob URL,
  // so the club can upload images from /admin and have them persist + render. When
  // the token is absent (local dev), the plugin disables itself and Payload falls
  // back to local disk (Media.upload.staticDir = public/uploads). alwaysInsertFields
  // keeps the collection schema + admin importMap identical across environments
  // regardless of whether the token is present, avoiding env-specific schema drift.
  // The frontend still resolves committed /public/uploads assets via lib/publicUploads
  // as a safe fallback (see mediaSrc). Swap to @payloadcms/storage-s3 (Cloudflare R2)
  // here if vendor-neutral storage is preferred later.
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      alwaysInsertFields: true,
    }),
  ],
});
