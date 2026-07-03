import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { checkChangedPaths } from "@/lib/studio/allowlist";

export const dynamic = "force-dynamic";

/** Constant-time secret comparison so the shared secret can't be recovered by
 * timing the 401 response. */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Webhook the AI-Studio CI worker posts its result to. Auth is a shared secret
 * (AGENT_WEBHOOK_SECRET), NOT a user session. We re-check the reported changed
 * files against the allowlist server-side (defence in depth — never trust the
 * worker's own verdict) and move the change-request to the right status.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get("x-studio-secret");
  const expected = process.env.AGENT_WEBHOOK_SECRET;
  if (!expected || !secret || !secretMatches(secret, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid json" },
      { status: 400 },
    );
  }

  const requestId = body?.requestId;
  if (typeof requestId !== "string" && typeof requestId !== "number") {
    return NextResponse.json(
      { ok: false, error: "requestId required" },
      { status: 400 },
    );
  }

  const changedFiles = Array.isArray(body.changedFiles)
    ? (body.changedFiles as unknown[]).filter(
        (f): f is string => typeof f === "string",
      )
    : [];
  // Defence in depth: re-validate the reported diff against the allowlist here,
  // independent of what the worker claimed.
  const recheck = checkChangedPaths(changedFiles);

  const workerOk = body.ok === true;
  // A crashed worker posts {ok:false, error} with no verdict fields. Distinguish
  // that (→ fehlgeschlagen) from a real allowlist violation (→ braucht_dev).
  const hasVerdict =
    typeof body.allowlistOk === "boolean" || Array.isArray(body.changedFiles);
  const allowlistOk = body.allowlistOk === true && recheck.ok;
  const needsHuman =
    body.needsHumanReview === true || (hasVerdict && !allowlistOk);
  const previewUrl =
    typeof body.previewUrl === "string" && body.previewUrl.length > 0
      ? body.previewUrl
      : null;

  let status: string;
  if (!workerOk && !hasVerdict) {
    // Worker died before producing a result — not a policy violation.
    status = "fehlgeschlagen";
  } else if (needsHuman) {
    status = "braucht_dev";
  } else if (!workerOk) {
    status = "fehlgeschlagen";
  } else if (previewUrl) {
    status = "vorschau_bereit";
  } else {
    // Gates passed, but no preview link yet (Vercel deploy still building, or
    // STUDIO_PREVIEW_URL_TEMPLATE unset). Hold at "review" so the club is never
    // asked to approve a preview it cannot open.
    status = "review";
  }

  const notes = [
    typeof body.diffStat === "string" ? body.diffStat : "",
    typeof body.review === "string" && body.review
      ? `Review:\n${body.review}`
      : "",
    typeof body.gatesLog === "string" && body.gatesLog
      ? `Gates:\n${body.gatesLog}`
      : "",
    Array.isArray(body.violations) && body.violations.length
      ? `Allowlist-Verstoß (Worker): ${(body.violations as string[]).join(", ")}`
      : "",
    !recheck.ok
      ? `Allowlist-Verstoß (Server-Recheck): ${recheck.violations.join(", ")}`
      : "",
    Array.isArray(body.sensitiveFlags) && body.sensitiveFlags.length
      ? `Sensible Stellen: ${(body.sensitiveFlags as string[]).join("; ")}`
      : "",
    typeof body.error === "string" ? `Fehler: ${body.error}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const payload = await getPayloadClient();
    await payload.update({
      collection: "change-requests",
      id: requestId as string | number,
      overrideAccess: true,
      data: {
        status,
        // A fresh preview invalidates any prior decision — reopen the approve/
        // reject choice so a second round after "Passt nicht" is actionable.
        ...(status === "vorschau_bereit" ? { clientDecision: "offen" } : {}),
        ...(typeof body.branch === "string" ? { branch: body.branch } : {}),
        ...(typeof body.prUrl === "string" ? { prUrl: body.prUrl } : {}),
        ...(previewUrl ? { previewUrl } : {}),
        ...(typeof body.costUsd === "number" ? { costUsd: body.costUsd } : {}),
        ...(typeof body.iterations === "number"
          ? { iteration: body.iterations }
          : {}),
        devNotes: notes,
      } as never,
    });
  } catch (err) {
    console.error("[/api/agent/callback] update failed:", err);
    return NextResponse.json(
      { ok: false, error: "update failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, status });
}
