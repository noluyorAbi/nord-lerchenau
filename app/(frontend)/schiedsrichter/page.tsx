import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="schiedsrichter"
      eyebrow="Spielbetrieb"
      title="Schiedsrichter"
      fallbackLede="Ohne Schiri kein Spiel — mehrere Nordler pfeifen aktiv im BFV-Spielbetrieb."
      intro="Schiedsrichter:in beim SV Nord ist mehr als Wochenende pfeifen. Ihr seid Botschafter:innen des Vereins, sorgt für faire Spiele und gebt dem Spielbetrieb Struktur. Wir stellen aktive Unparteiische von der Kreisklasse bis zur Bezirksliga."
      pills={[
        "BFV-Lizenz",
        "Ehrenamt",
        "Kreis → Bezirk",
        "Nachwuchs willkommen",
      ]}
      stats={[
        { label: "Schiris", value: "Aktiv" },
        { label: "Verband", value: "BFV" },
        { label: "Spielklassen", value: "Kreis bis Bezirk" },
        { label: "Lizenz", value: "C/B möglich" },
        { label: "Vergütung", value: "Spesen + Spielgeld" },
      ]}
      highlights={[
        {
          eyebrow: "Was uns ausmacht",
          title: "Vorbereitung & Coaching",
          body: "Regelmäßige Regelabende, gegenseitige Spielanalysen und Mentoring durch erfahrene Bezirksliga-Schiris. Ihr fangt nicht alleine an.",
          accent: "navy",
        },
        {
          eyebrow: "Nachwuchs",
          title: "Lizenz mit 14 möglich",
          body: "BFV bietet Anwärter:innen-Kurse für Schiris ab 14. Wir bezahlen den Kurs, stellen Ausrüstung und begleiten euch durchs erste Pflichtspiel.",
          accent: "gold",
        },
      ]}
      cta={{
        title: "Schiedsrichter:in werden — der erste Schritt.",
        body: "Lust auf den Pfiff statt der Tribüne? Schreibt unserem Schiedsrichter-Obmann, er erzählt euch alles über Lizenz, Spielbetrieb und Vergütung.",
        mailSubject: "Schiedsrichter — Interesse",
        primaryLabel: "Schiri-Obmann kontaktieren",
      }}
    />
  );
}
