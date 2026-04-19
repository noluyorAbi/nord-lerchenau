import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export default async function VereinsheimPage() {
  const payload = await getPayloadClient();
  const page = await payload.findGlobal({ slug: "vereinsheim-page" });

  const hasBody =
    page.body && typeof page.body === "object" && "root" in page.body;

  return (
    <>
      <PageHero
        eyebrow="Vereinsheim"
        title="Eschengarten"
        lede={page.intro ?? "Seit 1984 unser Zuhause im Eschenviertel."}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {hasBody ? (
          <div className="prose prose-neutral max-w-none">
            <RichText data={page.body as SerializedEditorState} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Inhalt folgt. Pflege die Seite im Admin unter{" "}
            <em>Globals → Vereinsheim Page</em>.
          </div>
        )}
      </article>
    </>
  );
}
