import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="ski"
      eyebrow="Sport"
      title="Ski"
      fallbackLede="Vom motivierten Neueinsteiger bis zur routinierten Könnerin: Pisten, Touren und das Ski-Camp."
      intro="Seit über zwanzig Jahren fester Bestandteil des SV Nord. Mit ausgebildeten, jungen Skilehrer:innen bringen wir Anfänger:innen sicher auf die Piste und routinierten Skifahrer:innen neue Linien bei. Wer aufs Brett oder die Ski steigen will, ist bei uns richtig."
      pills={[
        "Seit 20+ Jahren",
        "Anfänger:in bis Profi",
        "Skikurse",
        "Ski-Camp",
      ]}
      stats={[
        { label: "Aktiv seit", value: "über 20 J." },
        { label: "Skilehrer:innen", value: "2 aktive" },
        { label: "Form", value: "Kurse + Camp" },
        { label: "Niveau", value: "alle Stufen" },
        { label: "Wann", value: "Winter-Saison" },
      ]}
      highlights={[
        {
          eyebrow: "Schule",
          title: "Skikurse für alle Stufen",
          body: "Vom ersten Pflug bis zum sauberen Carving: kleine Gruppen, persönliches Coaching durch geprüfte Skilehrer:innen. Leihski und Schutzausrüstung können gestellt werden.",
          accent: "sky",
        },
        {
          eyebrow: "Camp",
          title: "Ski-Camp im Winter",
          body: "Mehrtägiges Ski-Camp mit Training, Skitour und Hüttenabend. Der Höhepunkt der Saison, Plätze begrenzt, frühzeitig anmelden.",
          accent: "gold",
        },
      ]}
      cta={{
        title: "Lust auf Schnee? Schreib uns kurz.",
        body: "Mail an info@svnord.de oder direkt übers Kontaktformular, wir melden uns mit Terminen für Kurse und Camp.",
        mailSubject: "Ski: Interesse",
        primaryLabel: "Kontakt aufnehmen",
      }}
      hideTrainers
      staticContacts={[
        {
          name: "Korbinian Hafner",
          role: "1. Vorsitzender / Skilehrer",
          email: "info@svnord.de",
        },
        {
          name: "Tobias Tins",
          role: "2. Vorsitzender / Skilehrer",
          email: "info@svnord.de",
        },
      ]}
    />
  );
}
