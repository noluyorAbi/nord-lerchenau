import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="volleyball"
      eyebrow="Sport"
      title="Volleyball"
      fallbackLede="Smash auf Holz — Familien-Volleyball mit Spaß-Faktor, seit 1984."
      intro="Wir sind die Volleyballer:innen des SV Nord — ursprünglich 1984 als Familien-Volleyballer gestartet, seit Jahren eigene Abteilung. Mixed, Hobby, alle Spielstärken. Hauptsache, der Ball geht übers Netz."
      pills={["Hobby & Mixed", "Seit 1984", "alle Stärken", "Waldmeisterhalle"]}
      stats={[
        { label: "Aktiv seit", value: "1984" },
        { label: "Form", value: "Hobby & Mixed" },
        { label: "Training", value: "2× Woche" },
        { label: "Halle", value: "Waldmeisterhalle" },
        { label: "Altersspanne", value: "30 – 75 J." },
      ]}
      highlights={[
        {
          eyebrow: "Generationen",
          title: "30 bis 75 Jahre",
          body: "Bei uns spielen Eltern mit ihren erwachsenen Kindern — Gemeinschaft und Spaß stehen über Leistung. Wer Lust auf Volleyball hat, ist willkommen.",
          accent: "sky",
        },
        {
          eyebrow: "Training",
          title: "Zwei Abende pro Woche",
          body: "Wir treffen uns regelmäßig in der Waldmeisterhalle — feste Trainingszeiten, ohne Punktspielbetrieb, mit Smash-Sessions und Volleys.",
          accent: "navy",
        },
      ]}
      cta={{
        title: "Probetraining? Komm einfach vorbei.",
        body: "Schreib uns kurz, wir nennen dir Halle und Uhrzeit. Schuhe mit heller Sohle reichen — wir leihen dir alles andere.",
        mailSubject: "Volleyball — Probetraining",
        primaryLabel: "Probetraining anfragen",
      }}
      hideTrainers
      staticContacts={[
        {
          name: "Elisabeth Schillinger",
          role: "Ansprechpartnerin Volleyball",
          email: "info@svnord.de",
        },
      ]}
    />
  );
}
