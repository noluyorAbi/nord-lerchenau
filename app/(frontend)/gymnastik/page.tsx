import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="gymnastik"
      eyebrow="Sport"
      title="Gymnastik"
      fallbackLede="Seit 1967 in Bewegung — Montag und Mittwoch, Frauen wie Männer, jedes Alter willkommen."
      intro="Über 50 Jahre Gymnastik beim SV Nord. Zweimal pro Woche treffen wir uns in der Waldmeisterschule für Mobilität, Kraft und Ausgleich. Ein 35-köpfiger Stamm, lockerer Ton, fundiertes Training — Einsteiger:innen sind ausdrücklich willkommen."
      pills={["Seit 1967", "35 Aktive", "Mo & Mi 19:00", "Waldmeisterschule"]}
      stats={[
        { label: "Gegründet", value: "1967" },
        { label: "Mitglieder", value: "35" },
        { label: "Training", value: "Mo + Mi · 19–20 Uhr" },
        { label: "Halle", value: "Waldmeisterschule" },
        { label: "Offen für", value: "alle Erwachsenen" },
      ]}
      highlights={[
        {
          eyebrow: "Training",
          title: "Zweimal pro Woche",
          body: "Montag und Mittwoch je 19:00–20:00 Uhr in der Waldmeisterschule. In den Schulferien pausieren wir — sonst läuft die Stunde verlässlich, das ganze Jahr.",
          accent: "navy",
        },
        {
          eyebrow: "Trainerteam",
          title: "Kompetent & verlässlich",
          body: "Unser Stamm von 35 Aktiven lebt von einer verlässlichen, fachlich starken Trainerin. Frauen und Männer trainieren gemeinsam — Spaß und Gemeinschaft inklusive.",
          accent: "sky",
        },
      ]}
      cta={{
        title: "Komm vorbei — die erste Stunde ist gratis.",
        body: "Schreib uns kurz, dann sagen wir dir, wann der nächste Termin ist. Sportschuhe und Lust auf Bewegung reichen.",
        mailSubject: "Gymnastik — Probetraining",
        primaryLabel: "Probetraining anfragen",
      }}
      hideTrainers
      staticContacts={[
        {
          name: "Elisabeth Schillinger",
          role: "1. Abteilungsleiterin",
          phone: "0176 646 61 724",
          email: "info@svnord.de",
        },
        {
          name: "Tenja Hirlinger",
          role: "Vertretung",
          phone: "0171 856 60 64",
        },
      ]}
    />
  );
}
