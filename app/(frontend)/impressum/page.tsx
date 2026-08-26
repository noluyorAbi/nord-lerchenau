import { LegalLayout } from "@/components/LegalLayout";
import { LegalSections } from "@/components/legal/LegalSections";
import { cachedQuery, globalTag } from "@/lib/cms";
import { clubAddress, primaryAddressOf } from "@/lib/club-address";
import { getPayloadClient } from "@/lib/payload";

import { impressumSections } from "./_content";

const LAST_UPDATED = "14. Mai 2026";

export default async function ImpressumPage() {
  const contact = await cachedQuery(
    ["global", "contact-info"],
    [globalTag("contact-info")],
    async () => {
      const payload = await getPayloadClient();
      return payload.findGlobal({ slug: "contact-info" });
    },
  );

  const address = clubAddress(primaryAddressOf(contact));

  return (
    <LegalLayout
      eyebrow="Rechtliches · § 5 TMG"
      title="Impressum"
      lede="Pflichtangaben gemäß § 5 TMG sowie verantwortliche Person im Sinne von § 18 Abs. 2 MStV für den SV Nord München-Lerchenau e.V."
      lastUpdated={LAST_UPDATED}
      facts={[
        { label: "Vereinsname", value: "SV Nord M.-Lerchenau e.V." },
        { label: "Gegründet", value: "1947" },
        { label: "Sitz", value: address.city },
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
        streetLines: address.lines,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
      }}
    >
      <LegalSections sections={impressumSections(address)} />
    </LegalLayout>
  );
}
