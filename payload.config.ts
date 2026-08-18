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
// Blob uploads are armed only inside a Vercel deployment. BLOB_READ_WRITE_TOKEN
// is set for Development too, so a `vercel env pull` puts a live production
// token into .env.local; without this guard a local seed or /admin upload would
// write straight into the store the live site reads from. BLOB_ENABLE_LOCAL=true
// is the deliberate opt-in for verifying the upload path against the real store.
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_ENABLED =
  Boolean(BLOB_TOKEN) &&
  (Boolean(process.env.VERCEL) || process.env.BLOB_ENABLE_LOCAL === "true");

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
      // Neon bills compute time, and an idle-but-open connection keeps the
      // compute from suspending. pg defaults to keeping idle clients forever,
      // which on serverless meant the pool held the database awake between
      // requests. Now that pages are prerendered, runtime connections are rare
      // (revalidation and the admin panel only), so release them quickly.
      idleTimeoutMillis: 10_000,
      // Bounded so a burst of parallel page renders during `next build` queues
      // instead of opening a connection per render.
      max: 8,
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
  // Order matters for the admin only: Payload builds the sidebar and the
  // dashboard groups in the order it first meets each group here, collections
  // before globals. Listed by group number so an editor sees 1. Inhalte first
  // and 9. System last (payload/components/tour/help-nav.css finishes the
  // ordering across the collection/global boundary). Nothing in the database
  // depends on this order.
  collections: [
    // 1. Inhalte
    Posts,
    Events,
    // 2. Sport
    People,
    Teams,
    Fixtures,
    // 3. Verein
    Sponsors,
    Submissions,
    // 9. System
    Users,
    Media,
  ],
  globals: [
    // 4. Seiten
    HomePage,
    ChronikPage,
    VereinsheimPage,
    JugendfoerderPage,
    FaqPage,
    LegalPages,
    // 5. Einstellungen
    SiteSettings,
    Navigation,
    ContactInfo,
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // German only. The people using this admin are club volunteers, and every
  // label we write is German already; leaving Payload's own chrome ("Create
  // New", "Save", "Dashboard") in English made the whole thing feel foreign and
  // contradicted the German help texts that talk about "Neu erstellen" and
  // "Speichern". With one supported language there is nothing to pick, so no
  // language selector shows up either.
  i18n: {
    fallbackLanguage: "de",
    supportedLanguages: { de },
  },
  admin: {
    meta: {
      titleSuffix: "· SV Nord Admin",
    },
    // Light only. The default ('all') resolves the theme from the visitor's OS
    // `prefers-color-scheme`, so board members on a dark-mode laptop landed in a
    // dark CMS. Pinning it renders `data-theme="light"` on the server and skips
    // the client-side OS lookup entirely, so there is no flash of the wrong
    // theme. Payload also hides the theme radio in Account settings unless this
    // is 'all', so no dead toggle is left behind.
    theme: "light",
    // No autoLogin: the admin requires a real login. Accounts are provisioned
    // by scripts/seed.ts (ensureAdminUser). Auto-login would expose the whole
    // CMS to anonymous visitors and must never run in production.
    components: {
      beforeDashboard: ["@/payload/components/WelcomeDashboard#default"],
      // Help block at the bottom of the sidebar on every admin page: starts the
      // guided tour, links to the tutorial video. See payload/components/tour.
      afterNavLinks: ["@/payload/components/tour/HelpNav#default"],
    },
  },
  // Media uploads need durable storage on Vercel: a function's filesystem is
  // read-only and per-invocation, so Payload's local-disk adapter cannot write
  // Media.upload.staticDir there. Without an adapter every upload from /admin
  // fails and the resulting doc points at /api/media/file/<name>, which 500s
  // because the file is nowhere on the deployed instance.
  //
  // Inside a Vercel deployment uploads go to Vercel Blob and media.url resolves
  // to the public blob URL, so the club can upload from /admin and the image
  // persists across deploys. Elsewhere (and whenever the token is absent) the
  // plugin disables itself and Payload falls back to local disk, which is what
  // local dev and the seed scripts expect. See BLOB_ENABLED above for why the
  // token alone is not enough.
  //
  // disablePayloadAccessControl: the media collection is already world-readable
  // (Media.access.read = anyone) and the blobs are stored with public access, so
  // routing every image through /api/media/file/<name> would add a function
  // invocation per image without protecting anything. With it on, media.url is
  // the blob CDN URL and browsers fetch images straight from the CDN.
  //
  // No alwaysInsertFields: it only inserts the `prefix` field on the DISABLED
  // path (see plugin-cloud-storage/plugin.js, the enabled branch never passes
  // it through), so switching it on would give the token-less environment a
  // column the token-carrying one lacks. Leaving it off means this plugin adds
  // no column at all: it only re-hooks the existing `url` fields, so no schema
  // migration is needed to deploy it.
  //
  // Swap to @payloadcms/storage-s3 (Cloudflare R2) here if vendor-neutral
  // storage is preferred later; only this block changes.
  plugins: [
    vercelBlobStorage({
      enabled: BLOB_ENABLED,
      // NO clientUploads, deliberately. It would lift Vercel's 4.5 MB function
      // request-body cap (vercel.com/docs/functions/limitations) by having the
      // browser PUT straight into the store, but it is incompatible with the
      // webp conversion this collection does: the browser writes the ORIGINAL
      // under its original name, Payload then renames the document to <name>.webp
      // and only the generated sizes get written server-side, so media.url points
      // at an object that never exists. Measured, not assumed: a 9.99 MB jpeg
      // uploaded that way left zz-big-photo.jpg in the store and answered 404 for
      // the zz-big-photo.webp the row named. Uploads therefore go through the
      // function, and Media.admin.description tells editors about the size cap.
      collections: { media: { disablePayloadAccessControl: true } },
      token: BLOB_TOKEN,
    }),
  ],
});
