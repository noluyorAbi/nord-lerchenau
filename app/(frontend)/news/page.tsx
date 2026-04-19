import Link from "next/link";

import { PageHero } from "@/components/PageHero";
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

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NewsIndex({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    sort: "-publishedAt",
    page,
    limit: PAGE_SIZE,
    depth: 0,
  });

  return (
    <>
      <PageHero
        eyebrow="Aktuelles"
        title="News & Berichte"
        lede="Spielberichte, Vereinsmeldungen, Jugendnews und Events — alles auf einem Blick."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        {result.docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Noch keine Beiträge. Erstelle einen im Admin unter{" "}
            <em>Content → Posts</em>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.docs.map((post, idx) => {
              const tag = Array.isArray(post.tags) ? post.tags[0] : null;
              const tagLabel = tag ? TAG_LABELS[tag] ?? tag : null;
              const date = new Date(post.publishedAt).toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              return (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group overflow-hidden rounded-xl border border-nord-line bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`aspect-[16/9] ${GRADIENTS[idx % GRADIENTS.length]}`} />
                  <div className="px-4 py-5">
                    {tagLabel ? (
                      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-nord-sky">
                        {tagLabel}
                      </div>
                    ) : null}
                    <h2 className="mt-1.5 text-lg font-bold tracking-tight text-nord-ink">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-xs text-nord-muted">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-4 text-[11px] text-nord-muted">{date}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {result.totalPages > 1 ? (
          <nav className="mt-10 flex items-center justify-between text-sm">
            {result.hasPrevPage ? (
              <Link
                href={`/news?page=${page - 1}`}
                className="rounded-lg border border-nord-line bg-white px-4 py-2 font-medium text-nord-ink hover:bg-black/5"
              >
                ← Zurück
              </Link>
            ) : (
              <span />
            )}
            <div className="text-nord-muted">
              Seite {page} / {result.totalPages}
            </div>
            {result.hasNextPage ? (
              <Link
                href={`/news?page=${page + 1}`}
                className="rounded-lg border border-nord-line bg-white px-4 py-2 font-medium text-nord-ink hover:bg-black/5"
              >
                Weiter →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </>
  );
}
