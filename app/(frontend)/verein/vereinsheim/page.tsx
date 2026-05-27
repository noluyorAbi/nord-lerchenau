import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const ESCHENGARTEN_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Eschengarten+Ebereschenstra%C3%9Fe+17+M%C3%BCnchen";

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
        lede={page.intro ?? "Seit 1986 unser Zuhause im Eschenviertel."}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="mb-8 rounded-2xl border border-nord-line bg-nord-paper-2 p-5 md:p-6">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
            SV Nord München-Lerchenau e.V.
          </div>
          <p className="mt-2 text-sm leading-relaxed text-nord-ink md:text-base">
            Heimat im Münchner Norden seit 1947.
          </p>
          <a
            href={ESCHENGARTEN_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
          >
            Eschengarten · Saisonale Speisekarte · Ebereschenstraße 17 ↗
          </a>
        </div>
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
