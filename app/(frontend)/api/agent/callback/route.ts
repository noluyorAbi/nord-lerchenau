import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { checkChangedPaths } from "@/lib/studio/allowlist";

export const dynamic = "force-dynamic";

/**
 * Webhook the AI-Studio CI worker posts its result to. Auth is a shared secret
 * (AGENT_WEBHOOK_SECRET), NOT a user session. We re-check the reported changed
 * files against the allowlist server-side (defence in depth — never trust the
 * worker's own verdict) and move the change-request to the right status.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get("x-studio-secret");
  const expected = process.env.AGENT_WEBHOOK_SECRET;
  if (!expected || !secret || secret !== expected) {
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
  const allowlistOk = body.allowlistOk === true && recheck.ok;
  const needsHuman =
    body.needsHumanReview === true || !recheck.ok || !allowlistOk;

  let status: string;
  if (workerOk && allowlistOk && !needsHuman) status = "vorschau_bereit";
  else if (needsHuman) status = "braucht_dev";
  else status = "fehlgeschlagen";

  const notes = [
    typeof body.diffStat === "string" ? body.diffStat : "",
    typeof body.review === "string" && body.review ? `Review:\n${body.review}` : "",
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
        ...(typeof body.branch === "string" ? { branch: body.branch } : {}),
        ...(typeof body.prUrl === "string" ? { prUrl: body.prUrl } : {}),
        ...(typeof body.previewUrl === "string"
          ? { previewUrl: body.previewUrl }
          : {}),
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
