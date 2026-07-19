import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { RefreshOnPreview } from "./RefreshOnPreview";
import { FadeUp } from "@/components/motion/FadeUp";
import { NewsRichText } from "@/components/news/NewsRichText";
import {
  formatNewsDate,
  newsHeroForPost,
  newsTagLabel,
  NEWS_FIGURE_BY_SLUG,
  NEWS_GALLERY_BY_SLUG,
} from "@/lib/news-visual";
import { mediaSrc } from "@/lib/publicUploads";
import type { Media, Post } from "@/payload-types";
import config from "@/payload.config";

export const dynamic = "force-dynamic";

// Resolve an uploaded heroImage to a URL the same way PersonCard/SponsorMarquee
// do; returns null when none is set so callers fall back to newsHeroForPost().
function heroImageSrc(heroImage: Post["heroImage"]): string | null {
  if (!heroImage || typeof heroImage !== "object") return null;
  const m = heroImage as Media;
  return mediaSrc(m);
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function NewsPost({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    draft: isPreview,
  });

  const post = result.docs[0];
  if (!post) notFound();

  const related = await payload.find({
    collection: "posts",
    where: {
      and: [
        { id: { not_equals: post.id } },
        { publishedAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    sort: "-publishedAt",
    limit: 3,
    depth: 1,
  });

  const author =
    typeof post.author === "object" && post.author !== null
      ? post.author.name
      : null;

  const publishedDate = formatNewsDate(post.publishedAt);
  const tag = Array.isArray(post.tags) ? post.tags[0] : null;
  const tagLabel = tag ? newsTagLabel(tag) : "News";
  const heroImg = heroImageSrc(post.heroImage);
  const hero = heroImg
    ? ({ kind: "image", src: heroImg } as const)
    : newsHeroForPost(post.slug, tag);
  const figure = NEWS_FIGURE_BY_SLUG[post.slug] ?? null;
  const gallery = NEWS_GALLERY_BY_SLUG[post.slug] ?? null;

  return (
    <>
      {isPreview ? <RefreshOnPreview /> : null}

      <section className="relative isolate overflow-hidden border-b border-nord-line bg-nord-ink">
        <div className="absolute inset-0">
          {hero.kind === "image" ? (
            // Tall graphics carry their own headline, so the hero crops to the
            // photo band below it instead of repeating the title behind the h1.
            <div
              className="absolute inset-0 bg-cover"
              style={{
                backgroundImage: `url(${hero.src})`,
                backgroundPosition: figure?.portrait ? "50% 19%" : "center",
              }}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: hero.css }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.12),transparent_60%)]" />
              <div className="absolute right-[-60px] top-[-80px] font-display text-[420px] font-black leading-none text-white/[0.05] md:right-[-40px]">
                {post.title.charAt(0)}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,63,0.45)_0%,rgba(11,27,63,0.92)_85%)]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 md:px-8 md:pb-20 md:pt-28">
          <nav className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
            <Link href="/" className="transition hover:text-nord-gold">
              Start
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <Link href="/news" className="transition hover:text-nord-gold">
              News
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <span className="text-nord-gold">{tagLabel}</span>
          </nav>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-nord-gold/70 bg-black/40 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold backdrop-blur">
              {tagLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
              {publishedDate}
            </span>
            {author ? (
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
                von {author}
              </span>
            ) : null}
          </div>

          <h1
            className="font-display font-black leading-[0.98] tracking-[-0.01em] text-white"
            style={{ fontSize: "clamp(34px, 5.5vw, 64px)" }}
          >
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {figure ? (
          <figure className="mb-12">
            <div className="overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2">
              <Image
                src={figure.src}
                alt={figure.alt}
                width={1080}
                height={1350}
                sizes="(min-width: 768px) 768px, 100vw"
                className="h-auto w-full"
                priority
              />
            </div>
            <figcaption className="mt-3 border-l-2 border-nord-gold pl-3 text-[13px] leading-relaxed text-nord-muted">
              {figure.caption}
            </figcaption>
          </figure>
        ) : null}

        <NewsRichText data={post.body as SerializedEditorState} />

        {gallery ? (
          <section className="mt-14 border-t border-nord-line pt-10">
            <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
              {gallery.heading}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {gallery.items.map((item, i) => (
                <FadeUp key={item.src} delay={i * 0.05}>
                  <figure>
                    <div className="overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={1080}
                        height={1350}
                        sizes="(min-width: 768px) 348px, (min-width: 640px) 284px, 100vw"
                        className="h-auto w-full"
                      />
                    </div>
                    <figcaption className="mt-3 border-l-2 border-nord-gold pl-3 text-[13px] leading-relaxed text-nord-muted">
                      {item.caption}
                    </figcaption>
                  </figure>
                </FadeUp>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-nord-line pt-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-[0.08em] text-nord-ink transition hover:bg-nord-ink hover:text-white"
          >
            ← Alle News
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-nord-muted">
            SV Nord München-Lerchenau · {publishedDate}
          </span>
        </div>
      </article>

      {related.docs.length > 0 ? (
        <section className="border-t border-nord-line bg-nord-paper-2">
          <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-7 md:py-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                Weitere Berichte
              </h2>
              <Link
                href="/news"
                className="hidden rounded-full border border-nord-line bg-white px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-nord-ink transition hover:bg-nord-ink hover:text-white md:inline-flex"
              >
                Alle News →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.docs.map((p) => {
                const t = Array.isArray(p.tags) ? p.tags[0] : null;
                const tl = newsTagLabel(t);
                const img = heroImageSrc(p.heroImage);
                const h = img
                  ? ({ kind: "image", src: img } as const)
                  : newsHeroForPost(p.slug, t);
                return (
                  <Link
                    key={p.id}
                    href={`/news/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-nord-line bg-white transition hover:-translate-y-1 hover:border-nord-gold/40 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-nord-line">
                      {h.kind === "image" ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${h.src})` }}
                        />
                      ) : (
                        <div
                          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                          style={{ background: h.css }}
                        >
                          <div className="absolute right-[-20px] top-[-20px] font-display text-[120px] font-black leading-none text-white/[0.09]">
                            {p.title.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full border border-nord-navy/40 bg-nord-navy/5 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                          {tl}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.1em] text-nord-muted">
                          {formatNewsDate(p.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-display text-[20px] font-extrabold leading-[1.08] tracking-[-0.01em] text-nord-ink">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-nord-muted">
                          {p.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
