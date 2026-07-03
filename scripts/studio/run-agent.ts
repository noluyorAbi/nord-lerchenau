/**
 * AI-Studio agent worker. Runs in CI (GitHub Actions) inside a fresh checkout of
 * a per-request branch. It turns a club change request into a small, gated code
 * change, then writes a result JSON the callback route consumes. It NEVER pushes
 * or merges — CI pushes the branch only if this exits 0, and the dev merges.
 *
 * Inputs (env): STUDIO_REQUEST_ID, STUDIO_PROMPT, optional STUDIO_FEEDBACK,
 * STUDIO_MAX_COST_USD, STUDIO_MAX_FIX_ITER, STUDIO_RESULT_PATH, ANTHROPIC_API_KEY.
 *
 * Safety: the implement phase runs a hard PreToolUse allowlist hook; after the
 * agent finishes, the actual git diff is re-checked against the same allowlist
 * (defence in depth) and any data-layer/secret access in changed files is flagged.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import {
  query,
  type HookCallback,
  type Options,
  type PreToolUseHookInput,
} from "@anthropic-ai/claude-agent-sdk";

import {
  checkChangedPaths,
  flagSensitiveContent,
  isPathAllowed,
  scanForLeakedSecrets,
} from "@/lib/studio/allowlist";

// Strip every secret the agent must never see from THIS process's env, before
// the agent (which shares process.env) can run. ANTHROPIC_API_KEY is kept — the
// SDK needs it — but the agent has no Bash tool (see runAgent), so it has no
// channel to read process.env anyway; this is defence in depth. Deleting here
// does not affect later workflow steps (they run in separate shells with their
// own Actions-provided env).
for (const k of [
  "GITHUB_TOKEN",
  "GITHUB_DISPATCH_TOKEN",
  "AGENT_WEBHOOK_SECRET",
  "STUDIO_CALLBACK_URL",
  "BLOB_READ_WRITE_TOKEN",
  "RESEND_API_KEY",
]) {
  delete process.env[k];
}

const MODEL = process.env.STUDIO_MODEL ?? "claude-opus-4-8";
const REVIEW_MODEL = process.env.STUDIO_REVIEW_MODEL ?? "claude-sonnet-4-6";
const MAX_COST = Number(process.env.STUDIO_MAX_COST_USD ?? "8");
const MAX_FIX_ITER = Number(process.env.STUDIO_MAX_FIX_ITER ?? "3");

const REQUEST_ID = process.env.STUDIO_REQUEST_ID ?? "local";
const PROMPT = process.env.STUDIO_PROMPT ?? "";
const FEEDBACK = process.env.STUDIO_FEEDBACK ?? "";

const IMPLEMENT_RULES = `
Du bist der Implementer im AI-Studio dieser SV-Nord-Website (Next.js 16 App Router + Tailwind, Payload CMS getrennt).
HARTE REGELN:
- Ändere NUR: app/(frontend)/**, components/**, app/globals.css, public/**. Nichts anderes.
- Fasse NIEMALS an: payload/**, payload.config.ts, payload-types.ts, lib/payload.ts, scripts/**, app/(payload)/**, app/(frontend)/api/**, .env*, package.json, Migrationen, CI. Ein PreToolUse-Hook blockt das hart.
- Inhalte (Texte/Bilder/Termine/Sponsoren) gehören ins CMS, NICHT in den Code. Wenn der Wunsch reiner Inhalt ist, ändere nichts und erkläre, dass das im CMS geht.
- Kleine, fokussierte Diffs. Nur die gewünschte Stelle. Halte dich an den bestehenden Stil/Komponenten und die Design-Skills/AGENTS.md.
- Keine neuen Abhängigkeiten. Kein \`getPayload\`/DB/Secrets in Frontend-Code.
- Am Ende muss \`bunx tsc --noEmit\` und \`bun run build\` grün sein.
`;

// Hard allowlist hook: deny any Edit/Write/MultiEdit outside the allowed paths.
// The agent is not given a Bash tool at all (see runAgent), so there is no
// arbitrary-command surface to police — a regex denylist on shell commands is
// trivially bypassable and is deliberately NOT relied on here.
const guard: HookCallback = async (input) => {
  const pre = input as PreToolUseHookInput;
  const ti = (pre.tool_input ?? {}) as Record<string, unknown>;
  const fp = (ti.file_path ?? ti.path ?? ti.notebook_path) as
    | string
    | undefined;
  if (typeof fp === "string" && !isPathAllowed(fp)) {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `Pfad gesperrt: ${fp}. Erlaubt nur app/(frontend)/**, components/**, public/**, app/globals.css.`,
      },
    };
  }
  return {};
};

let totalCost = 0;

async function runAgent(
  prompt: string,
  opts: { writes: boolean; model: string; append: string; maxTurns?: number },
): Promise<string> {
  const options: Options = {
    model: opts.model,
    cwd: process.cwd(),
    permissionMode: opts.writes ? "acceptEdits" : "default",
    // No Bash: the implement agent only edits files; the review agent is handed
    // the diff as text. Removing Bash eliminates arbitrary command execution and
    // the only channel by which the agent could read process.env / exfiltrate.
    allowedTools: opts.writes
      ? ["Read", "Grep", "Glob", "Edit", "Write", "MultiEdit"]
      : ["Read", "Grep", "Glob"],
    disallowedTools: ["Bash", "WebFetch", "WebSearch", "Task"],
    maxTurns: opts.maxTurns ?? 60,
    hooks: opts.writes
      ? {
          PreToolUse: [{ matcher: "Write|Edit|MultiEdit", hooks: [guard] }],
        }
      : undefined,
    systemPrompt: {
      type: "preset",
      preset: "claude_code",
      append: opts.append,
    },
  };
  let text = "";
  for await (const m of query({ prompt, options })) {
    if (m.type === "result") {
      totalCost += m.total_cost_usd ?? 0;
      if ("result" in m && typeof m.result === "string") text = m.result;
    }
  }
  return text;
}

function git(cmd: string): string {
  return execSync(`git ${cmd}`, { encoding: "utf8" }).trim();
}

/** All files the agent touched: tracked modifications + newly created (untracked)
 * files. `git diff --name-only HEAD` misses untracked files, so an agent that
 * only *creates* files (or hides a file under an allowed path) would evade both
 * the allowlist recheck and the sensitive-content scan. Include both sets. */
function collectChangedFiles(): string[] {
  const tracked = git("diff --name-only HEAD");
  const untracked = git("ls-files --others --exclude-standard");
  return Array.from(
    new Set(
      [...tracked.split("\n"), ...untracked.split("\n")]
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

/** Strip server secrets before running the gate build. `bun run build` executes
 * agent-written frontend code; nothing that code runs should be able to read the
 * Anthropic key, the GitHub token, or the callback secret out of the process env. */
function gateEnv(): NodeJS.ProcessEnv {
  const e = { ...process.env };
  for (const k of [
    "ANTHROPIC_API_KEY",
    "GITHUB_TOKEN",
    "AGENT_WEBHOOK_SECRET",
    "STUDIO_CALLBACK_URL",
    "GITHUB_DISPATCH_TOKEN",
  ]) {
    delete e[k];
  }
  return e;
}

function runGates(): { ok: boolean; log: string } {
  const opts = { stdio: "pipe" as const, env: gateEnv() };
  try {
    execSync(
      "bunx prettier --write '**/*.{ts,tsx,css}' --ignore-path .gitignore",
      opts,
    );
    execSync("bun run lint", opts);
    execSync("bunx tsc --noEmit", opts);
    execSync("bun run build", opts);
    return { ok: true, log: "alle Gates grün" };
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; message?: string };
    const log = `${err.stdout?.toString() ?? ""}\n${err.stderr?.toString() ?? ""}\n${err.message ?? ""}`;
    return { ok: false, log: log.slice(-4000) };
  }
}

async function main() {
  if (!PROMPT) throw new Error("STUDIO_PROMPT is required");

  // 1) Implement
  await runAgent(
    `Setze diesen Wunsch des Vereins um:\n\n"${PROMPT}"\n${FEEDBACK ? `\nRückmeldung aus der letzten Vorschau (bitte berücksichtigen):\n"${FEEDBACK}"\n` : ""}`,
    { writes: true, model: MODEL, append: IMPLEMENT_RULES },
  );

  // 2) Gate + bounded fix loop
  let gates = runGates();
  let iterations = 0;
  while (!gates.ok && iterations < MAX_FIX_ITER && MAX_COST - totalCost > 0.5) {
    iterations++;
    await runAgent(
      `Die Prüfungen sind rot. Behebe AUSSCHLIESSLICH diese Fehler mit minimalen Änderungen, ohne neue Features:\n\n${gates.log}`,
      { writes: true, model: MODEL, append: IMPLEMENT_RULES },
    );
    gates = runGates();
  }

  // 3) Defence in depth: re-check the real diff against the allowlist.
  // Includes untracked (newly created) files, not just tracked modifications.
  const changedFiles = collectChangedFiles();
  const diffCheck = checkChangedPaths(changedFiles);

  // 4) Flag data-layer/secret access, and hard-block any leaked credential VALUE
  // written into a changed (allowed) file — the only exfil path left once the
  // agent has no Bash and no network tools.
  const sensitiveFlags: string[] = [];
  const leakedSecrets: string[] = [];
  for (const f of changedFiles) {
    if (!isPathAllowed(f)) continue;
    try {
      // Read via fs (never shell-interpolate an agent-created path).
      const content = readFileSync(f, "utf8");
      for (const p of flagSensitiveContent(content))
        sensitiveFlags.push(`${f}: ${p}`);
      for (const label of scanForLeakedSecrets(content))
        leakedSecrets.push(`${f}: ${label}`);
    } catch {
      /* file deleted — ignore */
    }
  }
  // Surface leaked secrets in the same channel the callback already renders.
  for (const l of leakedSecrets) sensitiveFlags.push(`LEAKED SECRET → ${l}`);

  // 5) Adversarial read-only review (cheaper model). The diff is computed here
  // and passed as text — the review agent has no Bash tool. `add -N` makes
  // untracked files appear in the diff without staging their content.
  let review = "";
  if (MAX_COST - totalCost > 0.3) {
    try {
      git("add -A -N");
    } catch {
      /* nothing to intent-add */
    }
    const diff = git("diff HEAD").slice(0, 15000);
    review = await runAgent(
      `Erfüllt der folgende git-Diff den Wunsch "${PROMPT}"? Nenne knapp konkrete Probleme (Funktion, Design-Konsistenz, A11y, Scope). Wenn alles passt, antworte "OK".\n\n\`\`\`diff\n${diff}\n\`\`\``,
      {
        writes: false,
        model: REVIEW_MODEL,
        append: "Du bist ein strenger Reviewer.",
      },
    );
  }

  // A leaked secret is a hard fail — never push a branch that carries one.
  const ok =
    gates.ok &&
    diffCheck.ok &&
    changedFiles.length > 0 &&
    leakedSecrets.length === 0;
  const result = {
    requestId: REQUEST_ID,
    ok,
    gatesOk: gates.ok,
    allowlistOk: diffCheck.ok,
    violations: diffCheck.violations,
    sensitiveFlags,
    leakedSecrets,
    needsHumanReview:
      sensitiveFlags.length > 0 || leakedSecrets.length > 0 || !diffCheck.ok,
    iterations,
    costUsd: Number(totalCost.toFixed(4)),
    changedFiles,
    // List every changed path (tracked + untracked) — `git diff --stat` alone
    // omits newly created files.
    diffStat: changedFiles.length ? changedFiles.join("\n") : "",
    review,
    gatesLog: gates.ok ? "" : gates.log,
  };

  writeFileSync(
    process.env.STUDIO_RESULT_PATH ?? "studio-result.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));

  // Non-zero exit on any failure/violation so CI never pushes a bad branch.
  if (!ok) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  writeFileSync(
    process.env.STUDIO_RESULT_PATH ?? "studio-result.json",
    JSON.stringify({
      requestId: REQUEST_ID,
      ok: false,
      error: String(e instanceof Error ? e.message : e),
      costUsd: Number(totalCost.toFixed(4)),
    }),
  );
  process.exit(1);
});
