import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="gymnastik"
      eyebrow="Sport"
      title="Gymnastik"
      fallbackLede="Seit 1967 — Montag und Mittwoch in der Waldmeisterschule."
      excludeTrainerNames={["Simone Roth"]}
    />
  );
}
