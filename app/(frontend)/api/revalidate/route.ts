import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  CACHED_COLLECTIONS,
  CACHED_GLOBALS,
  collectionTag,
  FULL_REVALIDATE_GLOBALS,
  globalTag,
  MEDIA_DEPENDENT_COLLECTIONS,
  MEDIA_DEPENDENT_GLOBALS,
  UNCACHED_COLLECTIONS,
} from "@/lib/cms";

type Payload = {
  secret: string;
  type: "collection" | "global";
  resource: string;
  slug?: string | null;
  sport?: string | null;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || body.secret !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const tags: string[] = [];

  if (body.type === "collection") {
    if (body.resource === "media") {
      // An upload is never queried on its own, so every read that can carry one
      // has to go, plus the layout for the header and footer logos.
      for (const c of MEDIA_DEPENDENT_COLLECTIONS) tags.push(collectionTag(c));
      for (const g of MEDIA_DEPENDENT_GLOBALS) tags.push(globalTag(g));
      revalidatePath("/", "layout");
    } else if (CACHED_COLLECTIONS.has(body.resource)) {
      tags.push(collectionTag(body.resource));
    } else if (!UNCACHED_COLLECTIONS.has(body.resource)) {
      return NextResponse.json(
        { ok: false, error: `Unknown collection: ${body.resource}` },
        { status: 400 },
      );
    }
  } else if (body.type === "global") {
    if (!CACHED_GLOBALS.has(body.resource)) {
      return NextResponse.json(
        { ok: false, error: `Unknown global: ${body.resource}` },
        { status: 400 },
      );
    }
    tags.push(globalTag(body.resource));
    if (FULL_REVALIDATE_GLOBALS.has(body.resource)) {
      revalidatePath("/", "layout");
    }
  } else {
    return NextResponse.json(
      { ok: false, error: "Unknown type" },
      { status: 400 },
    );
  }

  // "max" gives stale-while-revalidate: visitors keep getting the cached page
  // while the fresh one renders in the background, so an editor's save never
  // makes someone wait on a cold render.
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ ok: true, tags });
}
