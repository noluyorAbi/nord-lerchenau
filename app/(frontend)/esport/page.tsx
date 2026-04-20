import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="esport"
      eyebrow="Sport"
      title="Esport"
      fallbackLede="Neu beim SV Nord — Esport als Abteilung."
    />
  );
}
