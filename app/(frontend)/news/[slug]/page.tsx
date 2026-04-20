import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { RefreshOnPreview } from "./RefreshOnPreview";
import config from "@/payload.config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

const TAG_LABELS: Record<string, string> = {
  spielbericht: "Spielbericht",
  verein: "Verein",
  jugend: "Jugend",
  event: "Event",
  sponsoren: "Sponsoren",
  allgemein: "Allgemein",
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

  const author =
    typeof post.author === "object" && post.author !== null
      ? post.author.name
      : null;

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tag = Array.isArray(post.tags) ? post.tags[0] : null;
  const tagLabel = tag ? TAG_LABELS[tag] ?? tag : null;

  return (
    <>
      {isPreview ? <RefreshOnPreview /> : null}

      <section className="border-b border-nord-line bg-nord-paper">
        <div className="mx-auto max-w-3xl px-6 py-14 md:py-20">
          {tagLabel ? (
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nord-sky">
              {tagLabel}
            </div>
          ) : (
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nord-muted">
              Aktuelles
            </div>
          )}
          <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-nord-ink md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 text-sm text-nord-muted">
            {publishedDate}
            {author ? <span> · von {author}</span> : null}
          </div>
          {post.excerpt ? (
            <p className="mt-6 text-lg leading-relaxed text-nord-muted">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <div className="prose prose-neutral max-w-none">
          <RichText data={post.body as SerializedEditorState} />
        </div>

        <div className="mt-14 border-t border-nord-line pt-8">
          <Link
            href="/news"
            className="text-sm text-nord-muted hover:text-nord-ink"
          >
            ← Alle News
          </Link>
        </div>
      </article>
    </>
  );
}
