import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function ChronikPage() {
  const payload = await getPayloadClient();
  const chronik = await payload.findGlobal({ slug: "chronik-page" });

  const hasBody =
    chronik.body &&
    typeof chronik.body === "object" &&
    "root" in chronik.body;

  return (
    <>
      <PageHero
        eyebrow="Unsere Geschichte"
        title="Vereinschronik"
        lede={
          chronik.intro ??
          "Von der Gründung am 15. Oktober 1947 bis heute — die Geschichte des SV Nord München-Lerchenau."
        }
      />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {hasBody ? (
          <div className="prose prose-neutral max-w-none">
            <RichText data={chronik.body as SerializedEditorState} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Die Chronik wird gerade überarbeitet. Schau bald wieder vorbei —
            oder pflege den Inhalt im Admin unter <em>Globals → Chronik Page</em>.
          </div>
        )}
      </article>
    </>
  );
}
