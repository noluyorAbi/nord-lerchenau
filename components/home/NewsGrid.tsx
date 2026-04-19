import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { getPayloadClient } from "@/lib/payload";

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

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function NewsGrid() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    sort: "-publishedAt",
    limit: 3,
    depth: 0,
  });

  if (result.docs.length === 0) return null;

  const [featured, ...side] = result.docs;
  const featuredTag = Array.isArray(featured.tags) ? featured.tags[0] : null;
  const featuredLabel = featuredTag
    ? (TAG_LABELS[featuredTag] ?? featuredTag)
    : "News";

  return (
    <section className="border-b border-nord-line bg-nord-paper-2">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="02" label="Aktuelles" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Geschichten aus Nord.
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden rounded-full border border-nord-line px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper md:inline-flex"
          >
            Alle News →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          {/* Featured */}
          <FadeUp>
            <Link
              href={`/news/${featured.slug}`}
              className="group relative block min-h-[360px] overflow-hidden rounded-2xl bg-black md:min-h-[480px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${FALLBACK_HEROS[0]})`,
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_30%,rgba(0,0,0,0.85)_100%)]" />
              <div className="absolute left-5 top-5">
                <span className="inline-flex items-center rounded-full border border-nord-gold bg-black/50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold backdrop-blur">
                  {featuredLabel}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-7">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-80">
                  {formatDate(featured.publishedAt)}
                </div>
                <h3
                  className="mt-2.5 font-display font-black leading-[0.98] tracking-[-0.01em]"
                  style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}
                >
                  {featured.title}
                </h3>
                {featured.excerpt ? (
                  <p className="mt-2 max-w-[560px] text-sm leading-relaxed opacity-85">
                    {featured.excerpt}
                  </p>
                ) : null}
                <div className="mt-4 font-display text-sm font-extrabold uppercase tracking-[0.06em] text-nord-gold">
                  Bericht lesen →
                </div>
              </div>
            </Link>
          </FadeUp>

          {/* Side cards */}
          {side.map((post, idx) => {
            const tag = Array.isArray(post.tags) ? post.tags[0] : null;
            const tagLabel = tag ? (TAG_LABELS[tag] ?? tag) : "News";
            const fallbackImg = FALLBACK_HEROS[idx + 1] ?? FALLBACK_HEROS[0];
            return (
              <FadeUp key={post.id} delay={(idx + 1) * 0.08}>
                <Link
                  href={`/news/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nord-line bg-nord-paper transition hover:-translate-y-0.5 hover:shadow-md"
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
                    <h3 className="m-0 font-display text-[22px] font-extrabold leading-[1.05]">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="m-0 line-clamp-3 text-[13px] leading-relaxed text-nord-muted">
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
