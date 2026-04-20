import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function JugendfoerderPage() {
  const payload = await getPayloadClient();
  const page = await payload.findGlobal({ slug: "jugendfoerder-page" });

  const hasBody =
    page.body && typeof page.body === "object" && "root" in page.body;

  return (
    <>
      <PageHero
        eyebrow="Jugendförderverein"
        title="Für die nächste Generation."
        lede="Damit jedes Kind am SV Nord kicken kann — unabhängig vom Geldbeutel."
      />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {hasBody ? (
          <div className="prose prose-neutral max-w-none">
            <RichText data={page.body as SerializedEditorState} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Inhalt folgt. Pflege die Seite im Admin unter{" "}
            <em>Globals → Jugendfoerder Page</em>.
          </div>
        )}

        {page.iban || page.contactEmail ? (
          <div className="mt-10 rounded-xl border border-nord-line bg-nord-paper p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
              Jetzt unterstützen
            </div>
            {page.iban ? (
              <div className="mt-3">
                <div className="text-xs text-nord-muted">IBAN</div>
                <div className="mt-0.5 font-mono text-base font-bold text-nord-ink">
                  {page.iban}
                </div>
              </div>
            ) : null}
            {page.contactEmail ? (
              <div className="mt-3">
                <div className="text-xs text-nord-muted">Kontakt</div>
                <a
                  href={`mailto:${page.contactEmail}`}
                  className="mt-0.5 block font-semibold text-nord-navy hover:text-nord-navy-2"
                >
                  {page.contactEmail}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    </>
  );
}
