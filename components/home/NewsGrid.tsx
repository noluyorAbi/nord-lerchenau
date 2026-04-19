import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { getPayloadClient } from "@/lib/payload";

const TAG_LABELS: Record<string, string> = {
  spielbericht: "Spielbericht",
  verein: "Verein",
  jugend: "Jugend",
  event: "Event",
  sponsoren: "Sponsoren",
  allgemein: "Allgemein",
};

const GRADIENTS = [
  "bg-[linear-gradient(135deg,var(--color-nord-navy)_0%,var(--color-nord-navy-2)_60%,var(--color-nord-sky)_120%)]",
  "bg-[linear-gradient(135deg,#1a1a1a_0%,var(--color-nord-navy)_100%)]",
  "bg-[linear-gradient(135deg,var(--color-nord-gold)_0%,#8a6f3a_100%)]",
];

export async function NewsGrid() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    sort: "-publishedAt",
    limit: 3,
    depth: 0,
  });

  if (result.docs.length === 0) return null;

  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-nord-ink md:text-4xl">
            Aktuelles
          </h2>
          <Link href="/news" className="text-sm text-nord-muted hover:text-nord-ink">
            Alle News →
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          {result.docs.map((post, idx) => {
            const tag = Array.isArray(post.tags) ? post.tags[0] : null;
            const tagLabel = tag ? TAG_LABELS[tag] ?? tag : null;
            return (
              <FadeUp key={post.id} delay={idx * 0.08}>
                <Link
                  href={`/news/${post.slug}`}
                  className="group block overflow-hidden rounded-xl border border-nord-line bg-white transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-sky focus-visible:ring-offset-2"
                >
                  <div
                    className={`aspect-[16/9] ${GRADIENTS[idx % GRADIENTS.length]}`}
                  />
                  <div className="p-4 md:p-5">
                    {tagLabel ? (
                      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-nord-sky">
                        {tagLabel}
                      </div>
                    ) : null}
                    <h3 className="mt-1.5 text-base font-semibold tracking-tight text-nord-ink">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-xs text-nord-muted">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
