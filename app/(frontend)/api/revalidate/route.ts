import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type Payload = {
  secret: string;
  type: "collection" | "global";
  resource: string;
  slug?: string | null;
  sport?: string | null;
};

const COLLECTION_TAGS: Record<string, (slug?: string, sport?: string) => string[]> = {
  posts: (slug) => {
    const tags = ["news-list", "home-news"];
    if (slug) tags.push(`post-${slug}`);
    return tags;
  },
  teams: (slug, sport) => {
    const tags: string[] = [];
    if (slug) tags.push(`team-${slug}`);
    if (sport) tags.push(`sport-${sport}`);
    return tags;
  },
  fixtures: () => ["next-match", "fixtures"],
  events: () => ["events", "home-events"],
  sponsors: () => ["sponsors", "home-sponsors"],
  people: () => ["people", "vorstand"],
  submissions: () => [],
  users: () => [],
  media: () => [],
};

const GLOBAL_TAGS: Record<string, string[]> = {
  "site-settings": [],
  navigation: [],
  "home-page": ["home"],
  "contact-info": ["contact"],
  "chronik-page": ["chronik"],
  "vereinsheim-page": ["vereinsheim"],
  "jugendfoerder-page": ["jugendfoerder"],
  "legal-pages": ["legal"],
};

const FULL_REVALIDATE_GLOBALS = new Set(["site-settings", "navigation"]);

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || body.secret !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tags: string[] = [];

  if (body.type === "collection") {
    const fn = COLLECTION_TAGS[body.resource];
    if (fn) tags.push(...fn(body.slug ?? undefined, body.sport ?? undefined));
  } else if (body.type === "global") {
    const globalTags = GLOBAL_TAGS[body.resource];
    if (globalTags) tags.push(...globalTags);
    if (FULL_REVALIDATE_GLOBALS.has(body.resource)) {
      revalidatePath("/", "layout");
    }
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ ok: true, tags });
}
