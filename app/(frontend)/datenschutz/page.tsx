import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export default async function DatenschutzPage() {
  const payload = await getPayloadClient();
  const legal = await payload.findGlobal({ slug: "legal-pages" });

  const hasBody =
    legal.datenschutzBody &&
    typeof legal.datenschutzBody === "object" &&
    "root" in legal.datenschutzBody;

  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Datenschutzerklärung" />
      <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {hasBody ? (
          <div className="prose prose-neutral max-w-none">
            <RichText data={legal.datenschutzBody as SerializedEditorState} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-8 text-sm leading-relaxed text-nord-muted">
            Der vollständige Datenschutztext wird im Admin gepflegt unter{" "}
            <em>Globals → Legal Pages → Datenschutz Body</em>. Bitte trage eine
            rechtsverbindliche Erklärung ein, bevor die Seite live geht.
          </div>
        )}
      </article>
    </>
  );
}
