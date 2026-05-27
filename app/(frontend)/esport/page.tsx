import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SportSectionPage
      sport="esport"
      eyebrow="Sport"
      title="eSport"
      fallbackLede="Virtuell für Nord am Ball — zwei Mannschaften, ein Controller, FC26 auf der Konsole."
      intro="Seit über zwei Jahren messen wir uns auch virtuell mit anderen Vereinen. Im Debütjahr direkt zur Meisterschaft, seither in der höchsten BFV-eLeague. SV-Nord-Blau im Trikot, FC26 auf dem Bildschirm."
      pills={["BFV-eLeague", "eRegionalliga", "eLandesliga", "FC26"]}
      stats={[
        { label: "Aktiv seit", value: "2 Jahre" },
        { label: "Mannschaften", value: "2" },
        { label: "Spielklassen", value: "eRegional + eLandes" },
        { label: "Konsole", value: "FC26" },
        { label: "Einstieg", value: "ab 16 Jahren" },
      ]}
      highlights={[
        {
          eyebrow: "Saison 25/26",
          title: "1. Mannschaft · Platz 4",
          body: "Qualifikation für die Playoffs der eRegionalliga, dort knapp gegen Gilching ausgeschieden. Stärkstes Aufgebot unter Erich Popp.",
          accent: "gold",
        },
        {
          eyebrow: "Reserve",
          title: "2. Platz · eLandesliga",
          body: "Souveräne Saison, knapp am Aufstieg in die eBayernliga vorbei. Bühne für Spieler:innen mit Ambition.",
          accent: "sky",
        },
      ]}
      cta={{
        title: "Du willst FC26 im Trikot des SV Nord zocken?",
        body: "Wir suchen weiterhin talentierte Spieler:innen ab 16 Jahren — meld dich, dann reden wir über ein Probe-Match.",
        mailSubject: "eSport — Probe-Match",
        primaryLabel: "Probe-Match anfragen",
      }}
      hideTrainers
      staticContacts={[
        {
          name: "Erich Popp",
          role: "Trainer E-Sport",
          email: "info@svnord.de",
        },
        {
          name: "Kevin Schwarz",
          role: "Kapitän · eRegionalliga",
          email: "info@svnord.de",
        },
      ]}
    />
  );
}
