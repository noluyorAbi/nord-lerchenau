const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * True when a Postgres connection string points at this machine.
 *
 * Bootstrap scripts (seed) overwrite globals and team fields wholesale. They are
 * safe against the Docker database and destructive against production, and the
 * only reliable difference between the two is the host. An empty or unparsable
 * string counts as local: pg then falls back to localhost:5432 as well.
 */
export function isLocalDatabaseUrl(uri: string | undefined): boolean {
  if (!uri) return true;
  try {
    return LOCAL_HOSTS.has(new URL(uri).hostname);
  } catch {
    return false;
  }
}
