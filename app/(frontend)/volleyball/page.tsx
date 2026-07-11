import { MapEmbed } from "@/components/MapEmbed";
import { SportSectionPage } from "@/components/SportSectionPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <SportSectionPage
        sport="volleyball"
        eyebrow="Sport"
        title="Volleyball"
        fallbackLede="Smash auf Holz: Familien-Volleyball mit Spaß-Faktor, seit 1984."
        intro="Wir sind die Volleyballer:innen des SV Nord, ursprünglich 1984 als Familien-Volleyballer gestartet, seit Jahren eigene Abteilung. Mixed, Hobby, alle Spielstärken. Hauptsache, der Ball geht übers Netz."
        pills={[
          "Hobby & Mixed",
          "Seit 1984",
          "alle Stärken",
          "Waldmeisterschule",
        ]}
        stats={[
          { label: "Aktiv seit", value: "1984" },
          { label: "Form", value: "Hobby & Mixed" },
          { label: "Training", value: "1× Woche" },
          { label: "Halle", value: "Waldmeisterschule" },
          { label: "Altersspanne", value: "30-75 J." },
        ]}
        highlights={[
          {
            eyebrow: "Generationen",
            title: "30 bis 75 Jahre",
            body: "Bei uns spielen Eltern mit ihren erwachsenen Kindern, Gemeinschaft und Spaß stehen über Leistung. Wer Lust auf Volleyball hat, ist willkommen.",
            accent: "sky",
          },
          {
            eyebrow: "Training",
            title: "Freitag, 19:00 bis 20:00 Uhr",
            body: "Einmal pro Woche in der Waldmeisterschule. In den Schulferien pausieren wir, sonst läuft die Stunde verlässlich, das ganze Jahr.",
            accent: "navy",
          },
        ]}
        cta={{
          title: "Probetraining? Komm einfach vorbei.",
          body: "Schreib uns kurz, wir nennen dir Halle und Uhrzeit. Schuhe mit heller Sohle reichen, wir leihen dir alles andere.",
          mailSubject: "Volleyball: Probetraining",
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
      <section className="mx-auto max-w-7xl px-6 pb-14 md:px-10 md:pb-20">
        <div className="mb-5 border-b border-nord-line pb-2">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
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
