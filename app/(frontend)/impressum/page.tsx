import { LegalLayout } from "@/components/LegalLayout";
import { LegalSections } from "@/components/legal/LegalSections";
import { getPayloadClient } from "@/lib/payload";

import { IMPRESSUM_SECTIONS } from "./_content";

export const dynamic = "force-dynamic";

const LAST_UPDATED = "14. Mai 2026";

export default async function ImpressumPage() {
  const payload = await getPayloadClient();
  const contact = await payload.findGlobal({ slug: "contact-info" });

  const primary = Array.isArray(contact.addresses)
    ? contact.addresses[0]
    : null;
  const streetLines = primary
    ? [primary.street, `${primary.postalCode} ${primary.city}`.trim()].filter(
        (s) => s && s.trim().length > 0,
      )
    : [];

  return (
    <LegalLayout
      eyebrow="Rechtliches · § 5 TMG"
      title="Impressum"
      lede="Pflichtangaben gemäß § 5 TMG sowie verantwortliche Person im Sinne von § 18 Abs. 2 MStV für den SV Nord München-Lerchenau e.V."
      lastUpdated={LAST_UPDATED}
      facts={[
        { label: "Vereinsname", value: "SV Nord M.-Lerchenau e.V." },
        { label: "Gegründet", value: "1947" },
        { label: "Sitz", value: primary?.city ?? "München" },
        { label: "Register", value: "VR 6924" },
        { label: "Rechtsform", value: "e.V." },
      ]}
      sideLinks={[
        { href: "/datenschutz", label: "Datenschutzerklärung" },
        { href: "/kontakt", label: "Kontaktformular" },
        { href: "/verein/vorstand", label: "Vorstand" },
      ]}
      contact={{
        name: "SV Nord München-Lerchenau e.V.",
        streetLines,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
      }}
    >
      <LegalSections sections={IMPRESSUM_SECTIONS} />
    </LegalLayout>
  );
}
