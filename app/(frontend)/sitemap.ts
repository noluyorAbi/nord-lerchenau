import type { MetadataRoute } from "next";

import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "/",
  "/verein",
  "/verein/chronik",
  "/verein/vorstand",
  "/verein/vereinsheim",
  "/verein/jugendfoerderverein",
  "/fussball",
  "/volleyball",
  "/gymnastik",
  "/ski",
  "/esport",
  "/schiedsrichter",
  "/news",
  "/termine",
  "/sponsoren",
  "/mitgliedschaft",
  "/kontakt",
  "/impressum",
  "/datenschutz",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  const payload = await getPayloadClient();

  const now = new Date();

  const [posts, teams] = await Promise.all([
    payload.find({
      collection: "posts",
      limit: 1000,
      depth: 0,
      sort: "-publishedAt",
    }),
    payload.find({
      collection: "teams",
      where: { sport: { equals: "fussball" } },
      limit: 100,
      depth: 0,
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: `${base}/news/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const teamEntries: MetadataRoute.Sitemap = teams.docs.map((t) => ({
    url: `${base}/fussball/${t.slug}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...postEntries, ...teamEntries];
}
