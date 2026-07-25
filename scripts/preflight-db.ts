/**
 * Refuse to build when the database is unreachable.
 *
 * Every frontend page used to be force-dynamic, so a broken database produced
 * a broken request and healed itself the moment the database came back. Pages
 * are prerendered now, which changes the failure mode: the read throws, the
 * component's try/catch swallows it, and the fallback markup gets baked into
 * the prerender and served for up to a day.
 *
 * That is not hypothetical. On 2026-07-25 the Neon compute quota ran out; the
 * database still accepted TCP connections but rejected every query, which is
 * exactly the shape that would have shipped a silent fallback site.
 *
 * Set SKIP_DB_PREFLIGHT=true to build without a database on purpose.
 */
import { Client } from "pg";

async function main() {
  if (process.env.SKIP_DB_PREFLIGHT === "true") {
    console.log("[preflight] SKIP_DB_PREFLIGHT=true, skipping database check");
    return;
  }

  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) {
    console.error(
      "[preflight] DATABASE_URI is not set.\n" +
        "  Pages are prerendered at build time, so a build without a database\n" +
        "  would bake fallback content into the cache. Set DATABASE_URI, or set\n" +
        "  SKIP_DB_PREFLIGHT=true if a contentless build is genuinely intended.",
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
  });
  try {
    await client.connect();
    // A plain connect is not enough: a Neon compute that has exhausted its
    // quota still completes the handshake and only fails once you query it.
    const { rows } = await client.query("select count(*)::int as n from posts");
    console.log(
      `[preflight] database reachable, posts table has ${rows[0].n} rows`,
    );
  } catch (err) {
    // Connection-level failures (ECONNREFUSED, ENOTFOUND) arrive with an empty
    // message and the detail only in `code`, so fall back to it.
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    const raw = err instanceof Error ? err.message : String(err);
    const message = raw || code || "unknown error";
    console.error(
      `[preflight] database check failed: ${message}\n` +
        "  Refusing to build: prerendering against a broken database would\n" +
        "  publish fallback content that stays cached until the next revalidate.",
    );
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

void main();
