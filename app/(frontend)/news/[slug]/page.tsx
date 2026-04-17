import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import config from "@/payload.config";
import { RefreshOnPreview } from "./RefreshOnPreview";

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

  const author =
    typeof post.author === "object" && post.author !== null
      ? post.author.name
      : null;

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {isPreview ? <RefreshOnPreview /> : null}

      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-nord-navy-2">
          Aktuelles
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-nord-ink md:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 text-sm text-nord-muted">
          {publishedDate}
          {author ? <span> · von {author}</span> : null}
        </div>
        {post.excerpt ? (
          <p className="mt-6 text-lg text-nord-muted">{post.excerpt}</p>
        ) : null}
      </div>

      <div className="prose prose-neutral max-w-none">
        <RichText data={post.body as SerializedEditorState} />
      </div>
    </article>
  );
}
