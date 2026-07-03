/**
 * AI-Studio path allowlist — the security spine of the agent pipeline.
 *
 * The agent that implements a club change request may ONLY touch presentational
 * frontend code. Everything that defines data, auth, schema, secrets, build, or
 * CI is hard-denied. This is enforced in TWO independent places:
 *   1. live, inside the agent, via a PreToolUse hook (block the Edit/Write); and
 *   2. after the fact, server-side, by re-checking the actual git diff before any
 *      branch is allowed to be merged.
 * Never trust the model's own restraint — both gates run.
 *
 * Matching is done on POSIX-normalised, repo-relative paths. Deny wins over allow.
 */

// Directories/files the agent may create or modify.
const ALLOW_PREFIXES = ["app/(frontend)/", "components/", "public/"];
const ALLOW_EXACT = new Set(["app/globals.css", "app/(frontend)/globals.css"]);

// Hard-denied even if nested under an allowed prefix. Protects the data layer
// (the just-finished CMS), auth/RBAC, secrets, schema, deps, build, and CI.
const DENY_PREFIXES = [
  "payload/",
  "scripts/",
  ".github/",
  ".vercel/",
  "node_modules/",
  ".git/",
  "migrations/",
  "lib/payload", // lib/payload.ts (DB client)
  "lib/studio/", // the agent's own guard code
  "app/(payload)/", // the Payload admin route group
  "app/(frontend)/api/", // server routes (auth, contact, agent, revalidate)
];
const DENY_EXACT = new Set([
  "payload.config.ts",
  "payload-types.ts",
  "next.config.ts",
  "package.json",
  "bun.lock",
  "tsconfig.json",
  "eslint.config.mjs",
  "vercel.json",
  "vercel.ts",
  "middleware.ts",
]);
// Any path containing a secret/env file or a lockfile, anywhere.
const DENY_PATTERNS = [/(^|\/)\.env($|\.)/, /(^|\/)\.git($|\/)/];

/** Normalise to a repo-relative POSIX path with no leading "./" or "/". */
export function normaliseRepoPath(p: string): string {
  let s = p.replace(/\\/g, "/").trim();
  s = s.replace(/^\.\//, "").replace(/^\/+/, "");
  // Collapse any ".." attempts — a path that escapes the repo is never allowed.
  return s;
}

/** True only if the path is safe for the agent to create/modify. Deny wins. */
export function isPathAllowed(rawPath: string): boolean {
  const p = normaliseRepoPath(rawPath);
  if (!p || p.includes("..")) return false;
  if (DENY_PATTERNS.some((re) => re.test(p))) return false;
  if (DENY_EXACT.has(p)) return false;
  if (DENY_PREFIXES.some((d) => p === d.replace(/\/$/, "") || p.startsWith(d)))
    return false;
  if (ALLOW_EXACT.has(p)) return true;
  if (ALLOW_PREFIXES.some((a) => p.startsWith(a))) return true;
  return false;
}

export type DiffCheck = {
  ok: boolean;
  violations: string[];
};

/** Check a set of changed file paths (e.g. from `git diff --name-only`). */
export function checkChangedPaths(paths: string[]): DiffCheck {
  const violations = paths
    .map(normaliseRepoPath)
    .filter((p) => p.length > 0)
    .filter((p) => !isPathAllowed(p));
  return { ok: violations.length === 0, violations };
}

/**
 * Frontend code that imports the Payload local API / GraphQL can leak PII
 * (e.g. Submissions) or bypass access control. Flag such additions for
 * mandatory human review even when the file path itself is allowed.
 */
const SENSITIVE_IMPORT_PATTERNS = [
  /from\s+["'][^"']*payload["']/, // "payload", "@/lib/payload", etc.
  /getPayload(Client)?\b/,
  /@payloadcms\//,
  /\/api\/graphql/,
  /process\.env\.(DATABASE_URI|PAYLOAD_SECRET|ANTHROPIC_API_KEY|BLOB_READ_WRITE_TOKEN|RESEND_API_KEY|AGENT_WEBHOOK_SECRET)/,
];

export function flagSensitiveContent(content: string): string[] {
  return SENSITIVE_IMPORT_PATTERNS.filter((re) => re.test(content)).map(
    (re) => re.source,
  );
}

/**
 * Detect an actual leaked credential VALUE in changed content (as opposed to a
 * code reference to `process.env.X`, which flagSensitiveContent handles). This
 * catches a token that was written verbatim into an allowed file (e.g.
 * public/leak.txt) — the exfiltration path that would survive the path allowlist.
 * Match on known provider prefixes; deliberately conservative to avoid false
 * positives on ordinary frontend code.
 */
const LEAKED_SECRET_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "anthropic-key", re: /sk-ant-[A-Za-z0-9_-]{16,}/ },
  { label: "github-token", re: /gh[posu]_[A-Za-z0-9]{20,}/ },
  { label: "github-pat", re: /github_pat_[A-Za-z0-9_]{20,}/ },
  { label: "webhook-secret", re: /whsec_[A-Za-z0-9]{16,}/ },
  { label: "vercel-blob-token", re: /vercel_blob_rw_[A-Za-z0-9_]{16,}/ },
  { label: "resend-key", re: /\bre_[A-Za-z0-9]{20,}/ },
  { label: "aws-access-key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "openai-key", re: /\bsk-[A-Za-z0-9]{40,}/ },
];

export function scanForLeakedSecrets(content: string): string[] {
  return LEAKED_SECRET_PATTERNS.filter((p) => p.re.test(content)).map(
    (p) => p.label,
  );
}
