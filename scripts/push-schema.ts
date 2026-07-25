/**
 * Create the Payload schema in an EMPTY database.
 *
 * CI spins up a bare postgres service and then runs `next build`. That used to
 * work because every frontend page was force-dynamic, so no page was ever
 * prerendered and no query ever ran during the build. Pages are prerendered
 * now, so the build genuinely needs tables to read from.
 *
 * Schema creation goes through Drizzle's dev push, which @payloadcms/db-postgres
 * only runs when NODE_ENV !== "production" (see db-postgres/dist/connect.js).
 * This script therefore forces development mode for the single init call.
 *
 * It REFUSES to touch a database that already has Payload tables. Dev push
 * compares the config against the live schema and can prompt or drop columns
 * when the two have drifted, which must never happen unattended.
 */
import { Client } from "pg";

const connectionString = process.env.DATABASE_URI;

async function isEmpty(): Promise<boolean> {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
  });
  await client.connect();
  try {
    const { rows } = await client.query<{ n: number }>(
      "select count(*)::int as n from information_schema.tables where table_schema = 'public'",
    );
    return rows[0].n === 0;
  } finally {
    await client.end();
  }
}

async function main() {
  if (!connectionString) {
    console.error("[push-schema] DATABASE_URI is not set");
    process.exit(1);
  }

  if (!(await isEmpty())) {
    console.log(
      "[push-schema] database already has tables, leaving it alone.\n" +
        "  This script only bootstraps a fresh database. Use the Payload admin\n" +
        "  or a migration for an existing one.",
    );
    return;
  }

  // The adapter only pushes when NODE_ENV is not production, and it reads that
  // as payload.config is imported, so the caller has to set it. Run this via
  // `bun run db:push-schema`, which does. Bail loudly rather than appear to
  // succeed while creating nothing.
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[push-schema] refusing to run with NODE_ENV=production: the Drizzle\n" +
        "  push is disabled there, so this would silently create no tables.\n" +
        "  Use `bun run db:push-schema`.",
    );
    process.exit(1);
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@/payload.config"),
  ]);

  await getPayload({ config });
  console.log("[push-schema] schema created");
}

void main().then(
  () => process.exit(0),
  (err) => {
    console.error("[push-schema] failed:", err);
    process.exit(1);
  },
);
