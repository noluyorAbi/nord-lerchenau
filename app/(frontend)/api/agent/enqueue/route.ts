import { headers as nextHeaders } from "next/headers";
import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

/**
 * Start the agent pipeline for a change-request. ADMIN ONLY (the dev decides
 * what runs — production stays dev-gated). Triggers the GitHub Actions worker
 * via repository_dispatch; the worker pushes a branch and posts back to
 * /api/agent/callback. Requires GITHUB_DISPATCH_TOKEN (repo + workflow scope)
 * and GITHUB_REPO ("owner/repo").
 */
export async function POST(request: Request): Promise<Response> {
  const payload = await getPayloadClient();

  // Authn/authz via the Payload session — only admins may trigger codegen.
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let body: { requestId?: unknown } = {};
  try {
    body = (await request.json()) as { requestId?: unknown };
  } catch {
    /* allow empty body */
  }
  const requestId = body.requestId;
  if (typeof requestId !== "string" && typeof requestId !== "number") {
    return NextResponse.json(
      { ok: false, error: "requestId required" },
      { status: 400 },
    );
  }

  const cr = await payload.findByID({
    collection: "change-requests",
    id: requestId as string | number,
    // Return null instead of throwing on an unknown id, so the 404 branch below
    // is reachable (otherwise the thrown NotFound surfaces as a 500).
    disableErrors: true,
  });
  if (!cr) {
    return NextResponse.json(
      { ok: false, error: "not found" },
      { status: 404 },
    );
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return NextResponse.json(
      { ok: false, error: "GitHub dispatch not configured" },
      { status: 503 },
    );
  }

  const dispatch = await fetch(
    `https://api.github.com/repos/${repo}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "studio-change-request",
        client_payload: {
          requestId: String(requestId),
          prompt: cr.prompt,
          feedback: cr.clientFeedback ?? "",
        },
      }),
    },
  );

  if (!dispatch.ok) {
    const text = await dispatch.text();
    console.error(
      "[/api/agent/enqueue] dispatch failed:",
      dispatch.status,
      text,
    );
    return NextResponse.json(
      { ok: false, error: "dispatch failed" },
      { status: 502 },
    );
  }

  await payload.update({
    collection: "change-requests",
    id: requestId as string | number,
    overrideAccess: true,
    data: { status: "in_arbeit" } as never,
  });

  return NextResponse.json({ ok: true });
}
