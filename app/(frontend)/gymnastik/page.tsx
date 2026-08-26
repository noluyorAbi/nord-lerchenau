import { MapEmbed } from "@/components/MapEmbed";
import { SportSectionPage } from "@/components/SportSectionPage";

export default function Page() {
  return (
    <>
      <SportSectionPage
        sport="gymnastik"
        eyebrow="Sport"
        title="Gymnastik"
        fallbackLede="Seit 1967 in Bewegung. Zweimal pro Woche, Frauen wie Männer, jedes Alter willkommen."
        intro="Über 50 Jahre Gymnastik beim SV Nord. Zweimal pro Woche treffen wir uns in der Waldmeisterschule für Mobilität, Kraft und Ausgleich. Ein 35-köpfiger Stamm, lockerer Ton, fundiertes Training. Einsteiger:innen sind ausdrücklich willkommen."
        // Keine Wochentage in den Pills: die Trainingszeiten stehen seit dem
        // 21.08.2026 im CMS-Text der Abteilung und aendern sich zum 15.09.2026.
        pills={[
          "Seit 1967",
          "35 Aktive",
          "Zweimal pro Woche",
          "Waldmeisterschule",
        ]}
        stats={[
          { label: "Gegründet", value: "1967" },
          { label: "Mitglieder", value: "35" },
          { label: "Training", value: "2× pro Woche" },
          { label: "Halle", value: "Waldmeisterschule" },
          { label: "Offen für", value: "alle Erwachsenen" },
        ]}
        // Keine fest verdrahteten Textkacheln mehr: der Verein pflegt den
        // Abteilungstext im Admin unter Mannschaften, und zwei Quellen fuer
        // denselben Inhalt laufen genau so auseinander, wie es der Verein am
        // 21.08.2026 gemeldet hat.
        cta={{
          title: "Komm vorbei, die erste Stunde ist gratis.",
          body: "Schreib uns kurz, dann sagen wir dir, wann der nächste Termin ist. Sportschuhe und Lust auf Bewegung reichen.",
          mailSubject: "Gymnastik: Probetraining",
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
      <section className="mx-auto max-w-7xl px-6 pb-14 md:px-10 md:pb-20">
        <div className="mb-5 border-b border-nord-line pb-2">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold-ink">
            Anfahrt
          </div>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
            Waldmeisterschule
          </h2>
          <p className="mt-1 text-sm text-nord-muted md:text-base">
            Waldmeisterschule, Waldmeisterstraße 38, 80935 München
          </p>
        </div>
        {/* Cookielose Karte (OpenFreeMap) statt Google-iframe, konsistent mit
            /kontakt und der Zwei-Klick-Aussage in der Datenschutzerklärung. */}
        <div className="aspect-video overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2">
          <MapEmbed
            lat={48.19648}
            lon={11.54988}
            label="Waldmeisterschule · Waldmeisterstraße 38"
          />
        </div>
      </section>
    </>
  );
}
