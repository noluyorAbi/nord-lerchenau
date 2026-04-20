import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function ImpressumPage() {
  const payload = await getPayloadClient();
  const legal = await payload.findGlobal({ slug: "legal-pages" });
  const contact = await payload.findGlobal({ slug: "contact-info" });

  const hasBody =
    legal.impressumBody &&
    typeof legal.impressumBody === "object" &&
    "root" in legal.impressumBody;

  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Impressum" />
      <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {hasBody ? (
          <div className="prose prose-neutral max-w-none">
            <RichText data={legal.impressumBody as SerializedEditorState} />
          </div>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-nord-muted">
            <p className="text-base font-semibold text-nord-ink">
              Angaben gemäß § 5 TMG
            </p>
            <p>
              SV Nord München-Lerchenau e.V.
              {Array.isArray(contact.addresses) && contact.addresses[0] ? (
                <>
                  <br />
                  {contact.addresses[0].street}
                  <br />
                  {contact.addresses[0].postalCode} {contact.addresses[0].city}
                </>
              ) : null}
            </p>
            {contact.email || contact.phone ? (
              <p>
                <strong className="text-nord-ink">Kontakt</strong>
                <br />
                {contact.email ? <>E-Mail: {contact.email}<br /></> : null}
                {contact.phone ? <>Telefon: {contact.phone}</> : null}
              </p>
            ) : null}
            <p className="rounded-xl border border-dashed border-nord-line bg-white p-4 text-xs">
              Dieser Impressum-Platzhalter ersetzt keine rechtsverbindlichen
              Pflichtangaben. Pflege den vollständigen Text im Admin unter{" "}
              <em>Globals → Legal Pages → Impressum Body</em>.
            </p>
          </div>
        )}
      </article>
    </>
  );
}
