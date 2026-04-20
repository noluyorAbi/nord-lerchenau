import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="schiedsrichter"
      eyebrow="Ehrenamt"
      title="Schiedsrichter"
      fallbackLede="Unsere aktiven Schiedsrichter, Ausbildung und Kontakt."
    />
  );
}
