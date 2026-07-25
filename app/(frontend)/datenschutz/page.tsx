import { LegalLayout } from "@/components/LegalLayout";
import { LegalSections } from "@/components/legal/LegalSections";
import { cachedQuery, globalTag } from "@/lib/cms";
import { getPayloadClient } from "@/lib/payload";

import { DATENSCHUTZ_SECTIONS } from "./_content";

const LAST_UPDATED = "24. Juli 2026";

export default async function DatenschutzPage() {
  const contact = await cachedQuery(
    ["global", "contact-info"],
    [globalTag("contact-info")],
    async () => {
      const payload = await getPayloadClient();
      return payload.findGlobal({ slug: "contact-info" });
    },
  );

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
      eyebrow="Rechtliches · DSGVO"
      title="Datenschutzerklärung"
      lede="Welche personenbezogenen Daten wir verarbeiten, warum, wie lange — und welche Rechte du als betroffene Person hast."
      lastUpdated={LAST_UPDATED}
      facts={[
        { label: "Rechtsgrundlage", value: "Art. 6 Abs. 1 DSGVO" },
        { label: "Hosting", value: "Vercel (USA)" },
        { label: "DB", value: "Neon · Frankfurt" },
        { label: "Newsletter", value: "Nein" },
        { label: "Tracking", value: "Kein Tracking" },
      ]}
      sideLinks={[
        { href: "/impressum", label: "Impressum" },
        { href: "/kontakt", label: "Kontaktformular" },
        {
          href: "mailto:info@svnord.de?subject=Datenschutz%20%E2%80%94%20Auskunft",
          label: "Datenauskunft anfragen",
        },
      ]}
      contact={{
        name: "SV Nord München-Lerchenau e.V.",
        streetLines,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
      }}
    >
      <LegalSections sections={DATENSCHUTZ_SECTIONS} />
    </LegalLayout>
  );
}
