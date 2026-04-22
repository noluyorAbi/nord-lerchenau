import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const TAG_LABELS: Record<string, string> = {
  spielbericht: "Spielbericht",
  verein: "Verein",
  jugend: "Jugend",
  event: "Event",
  sponsoren: "Sponsoren",
  allgemein: "Allgemein",
};

const FALLBACK_HEROS = [
  "https://static.wixstatic.com/media/c475b1_0044f4621b4b4f15abf848cb4ca04d91~mv2.jpeg/v1/fill/w_800,h_600,fp_0.50_0.50,q_90,enc_avif,quality_auto/c475b1_0044f4621b4b4f15abf848cb4ca04d91~mv2.webp",
  "https://static.wixstatic.com/media/c475b1_ca34576225d1483da1bacc3857628dc6~mv2.jpeg/v1/fill/w_800,h_600,fp_0.50_0.50,q_90,enc_avif,quality_auto/c475b1_ca34576225d1483da1bacc3857628dc6~mv2.webp",
  "https://static.wixstatic.com/media/c475b1_b1a4d2cf2d32458baa8dd16ded02d949~mv2.jpeg/v1/fill/w_800,h_600,q_90,enc_avif,quality_auto/fussballstarakademie.jpeg",
];

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
        lede="Spielberichte, Vereinsmeldungen, Jugendnews und Events — alle Geschichten aus Nord auf einen Blick."
      />

      <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-7 md:py-20">
        {result.docs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Noch keine Beiträge. Erstelle einen im Admin unter{" "}
            <em>Content → Posts</em>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.docs.map((post, idx) => {
              const tag = Array.isArray(post.tags) ? post.tags[0] : null;
              const tagLabel = tag ? (TAG_LABELS[tag] ?? tag) : "News";
              const fallbackImg =
                FALLBACK_HEROS[idx % FALLBACK_HEROS.length] ??
                FALLBACK_HEROS[0];
              return (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-nord-line bg-nord-paper transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="aspect-[4/3] border-b border-nord-line bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${fallbackImg})` }}
                  />
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full border border-nord-navy px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                        {tagLabel}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.1em] text-nord-muted">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h2 className="m-0 font-display text-[22px] font-extrabold leading-[1.05] tracking-[-0.01em]">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="m-0 line-clamp-3 text-[13px] leading-relaxed text-nord-muted">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-auto pt-2 font-display text-[12px] font-extrabold uppercase tracking-[0.08em] text-nord-navy transition group-hover:text-nord-gold">
                      Bericht lesen →
                    </div>
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
                className="rounded-full border border-nord-line bg-nord-paper px-4 py-2 font-display font-medium uppercase tracking-[0.04em] text-nord-ink hover:bg-nord-ink hover:text-nord-paper"
              >
                ← Zurück
              </Link>
            ) : (
              <span />
            )}
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-nord-muted">
              Seite {page} / {result.totalPages}
            </div>
            {result.hasNextPage ? (
              <Link
                href={`/news?page=${page + 1}`}
                className="rounded-full border border-nord-line bg-nord-paper px-4 py-2 font-display font-medium uppercase tracking-[0.04em] text-nord-ink hover:bg-nord-ink hover:text-nord-paper"
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
