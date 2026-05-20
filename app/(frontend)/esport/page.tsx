import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="esport"
      eyebrow="Sport"
      title="eSport"
      fallbackLede="Neu beim SV Nord — eSport als Abteilung."
    />
  );
}
