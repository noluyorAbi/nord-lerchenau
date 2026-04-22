import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const SRC = path.resolve(process.cwd(), ".firecrawl/svnord-lerchenau.json");
const OUT_DIR = path.resolve(process.cwd(), "tmp/wix-images");

type Crawl = {
  data: Array<{
    metadata?: { sourceURL?: string };
    markdown?: string;
  }>;
};

const IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

const hash = (s: string) =>
  createHash("sha1").update(s).digest("hex").slice(0, 16);

async function main() {
  const raw = await fs.readFile(SRC, "utf-8");
  const crawl = JSON.parse(raw) as Crawl;

  await fs.mkdir(OUT_DIR, { recursive: true });

  const seen = new Set<string>();
  const tasks: Promise<void>[] = [];

  for (const page of crawl.data) {
    const md = page.markdown ?? "";
    for (const m of md.matchAll(IMAGE_RE)) {
      const [, alt, url] = m;
      if (!url || seen.has(url)) continue;
      seen.add(url);

      const ext = (() => {
        const u = new URL(url);
        const m2 = /\.(jpe?g|png|gif|webp|svg)$/i.exec(u.pathname);
        return m2 ? m2[1].toLowerCase() : "jpg";
      })();

      const filename = `${hash(url)}.${ext}`;
      const dest = path.join(OUT_DIR, filename);

      tasks.push(
        (async () => {
          try {
            await fs.access(dest);
            // already downloaded
          } catch {
            const res = await fetch(url);
            if (!res.ok) {
              console.warn(`SKIP ${res.status}: ${url}`);
              return;
            }
            const buf = Buffer.from(await res.arrayBuffer());
            await fs.writeFile(dest, buf);
            console.log(`✓ ${filename}  ${alt.slice(0, 40)}`);
          }
        })(),
      );
    }
  }

  await Promise.all(tasks);

  // Write a manifest mapping URL -> filename + alt for the seed script.
  const manifest: Record<string, { filename: string; alt: string }> = {};
  for (const page of crawl.data) {
    const md = page.markdown ?? "";
    for (const m of md.matchAll(IMAGE_RE)) {
      const [, alt, url] = m;
      if (!url) continue;
      const ext = (() => {
        const u = new URL(url);
        const m2 = /\.(jpe?g|png|gif|webp|svg)$/i.exec(u.pathname);
        return m2 ? m2[1].toLowerCase() : "jpg";
      })();
      manifest[url] = { filename: `${hash(url)}.${ext}`, alt: alt || "" };
    }
  }
  await fs.writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(
    `\nDone. ${seen.size} unique images. Manifest: ${path.join(OUT_DIR, "manifest.json")}`,
  );
}

void main();
