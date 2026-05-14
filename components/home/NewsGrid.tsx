import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import {
  formatNewsDate,
  newsHeroForPost,
  newsTagLabel,
} from "@/lib/news-visual";
import { getPayloadClient } from "@/lib/payload";

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
  const featuredLabel = newsTagLabel(featuredTag);
  const featuredHero = newsHeroForPost(featured.slug, featuredTag);

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
              className="group relative block min-h-[360px] overflow-hidden rounded-2xl bg-nord-ink md:min-h-[520px]"
            >
              {featuredHero.kind === "image" ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${featuredHero.src})` }}
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ background: featuredHero.css }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
                  <div className="absolute right-[-40px] top-[-40px] font-display text-[280px] font-black leading-none text-white/[0.06]">
                    {featured.title.charAt(0)}
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_30%,rgba(0,0,0,0.9)_100%)]" />
              <div className="absolute left-5 top-5 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-nord-gold bg-black/55 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold backdrop-blur">
                  {featuredLabel}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                  Top-Story
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-80">
                  {formatNewsDate(featured.publishedAt)}
                </div>
                <h3
                  className="mt-2.5 font-display font-black leading-[0.98] tracking-[-0.01em]"
                  style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
                >
                  {featured.title}
                </h3>
                {featured.excerpt ? (
                  <p className="mt-3 max-w-[620px] text-sm leading-relaxed opacity-90">
                    {featured.excerpt}
                  </p>
                ) : null}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-nord-gold/60 bg-nord-gold/15 px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.08em] text-nord-gold backdrop-blur transition group-hover:bg-nord-gold group-hover:text-nord-navy">
                  Bericht lesen →
                </div>
              </div>
            </Link>
          </FadeUp>

          {/* Side cards */}
          {side.map((post, idx) => {
            const tag = Array.isArray(post.tags) ? post.tags[0] : null;
            const tagLabel = newsTagLabel(tag);
            const hero = newsHeroForPost(post.slug, tag);
            return (
              <FadeUp key={post.id} delay={(idx + 1) * 0.08}>
                <Link
                  href={`/news/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nord-line bg-white transition hover:-translate-y-1 hover:border-nord-gold/40 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-nord-line">
                    {hero.kind === "image" ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${hero.src})` }}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                        style={{ background: hero.css }}
                      >
                        <div className="absolute right-[-20px] top-[-20px] font-display text-[140px] font-black leading-none text-white/[0.09]">
                          {post.title.charAt(0)}
                        </div>
                        <div className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                          SV Nord · {tagLabel}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full border border-nord-navy/40 bg-nord-navy/5 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                        {tagLabel}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.1em] text-nord-muted">
                        {formatNewsDate(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="m-0 font-display text-[22px] font-extrabold leading-[1.08] tracking-[-0.01em] text-nord-ink">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="m-0 line-clamp-3 text-[13px] leading-relaxed text-nord-muted">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-auto pt-2 font-display text-[11px] font-extrabold uppercase tracking-[0.08em] text-nord-navy transition group-hover:text-nord-gold">
                      Bericht lesen →
                    </div>
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
