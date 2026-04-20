import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="volleyball"
      eyebrow="Sport"
      title="Volleyball"
      fallbackLede="Hobby & Mixed — Volleyball beim SV Nord für alle Spielstärken."
    />
  );
}
