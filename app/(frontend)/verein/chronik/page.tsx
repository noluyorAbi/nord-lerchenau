import Link from "next/link";

import { ChronikNarrative } from "@/components/chronik/ChronikNarrative";
import { ChronikTimeline } from "@/components/chronik/ChronikTimeline";
import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const FOUNDED = 1947;

const STATS = [
  {
    value: "1947",
    label: "Gegründet",
    sub: "15. Oktober",
    tone: "navy" as const,
  },
  {
    value: "38",
    label: "Gründer",
    sub: "der ersten Stunde",
    tone: "white" as const,
  },
  {
    value: "5",
    label: "Abteilungen",
    sub: "heute aktiv",
    tone: "white" as const,
  },
  {
    value: "15.000",
    label: "Std. Eigenleistung",
    sub: "fürs Eschengarten-Vereinsheim",
    tone: "gold" as const,
  },
];

const ERAS = [
  { year: "1947", label: "Gründung" },
  { year: "1960er", label: "Aufstieg" },
  { year: "1986", label: "Eschengarten" },
  { year: "2000er", label: "Wachstum" },
  { year: "Heute", label: "Tradition" },
];

const SECTIONS = [
  { id: "stats", label: "Highlights" },
  { id: "eras", label: "Epochen" },
  { id: "narrative", label: "Erzählung" },
  { id: "timeline", label: "Zeittafel" },
  { id: "kontakt", label: "Mitschreiben" },
];

export default async function ChronikPage() {
  const payload = await getPayloadClient();
  const chronik = await payload.findGlobal({ slug: "chronik-page" });

  const yearsAlive = new Date().getFullYear() - FOUNDED;

  return (
    <>
      <PageHero
        eyebrow="Unsere Geschichte"
        title="Vereinschronik"
        lede={
          chronik.intro ??
          `Von der Gründung am 15. Oktober 1947 bis heute. ${yearsAlive} Jahre SV Nord München-Lerchenau in sieben Kapiteln, einer Zeittafel und vielen Geschichten.`
        }
      />

      <div className="relative overflow-hidden border-b border-nord-line bg-nord-navy text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(200,169,106,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(110,199,234,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-6 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-nord-gold">
            <span className="size-1.5 rounded-full bg-nord-gold" />
            {yearsAlive} Jahre Vereinsgeschichte
          </div>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {ERAS.map((era, i) => (
              <li
                key={era.year}
                className="relative flex flex-col items-start gap-1 border-l-2 border-nord-gold/70 pl-4"
              >
                <span className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-nord-gold bg-nord-navy" />
                <span className="font-display text-2xl font-black leading-none tracking-tight md:text-3xl">
                  {era.year}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                  {String(i + 1).padStart(2, "0")} · {era.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <nav
          aria-label="Chronik"
          className="sticky top-2 z-20 mb-10 rounded-2xl border border-nord-line bg-white/90 p-3 shadow-sm backdrop-blur"
        >
          <ul className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-ink transition hover:border-nord-navy hover:bg-nord-navy hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="stats" className="mb-16 scroll-mt-28">
          <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-nord-line pb-2">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
              01 · Highlights
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
              Eckpunkte
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {STATS.map((stat) => {
              const styles =
                stat.tone === "navy"
                  ? {
                      card: "bg-nord-navy text-white",
                      value: "text-nord-gold",
                      label: "text-white/85",
                      sub: "text-white/60",
                    }
                  : stat.tone === "gold"
                    ? {
                        card: "bg-gradient-to-br from-nord-gold via-[#f0c44c] to-[#e6b035] text-nord-navy",
                        value: "text-nord-navy",
                        label: "text-nord-navy/85",
                        sub: "text-nord-navy/65",
                      }
                    : {
                        card: "bg-white text-nord-ink border border-nord-line",
                        value: "text-nord-ink",
                        label: "text-nord-ink/80",
                        sub: "text-nord-muted",
                      };
              return (
                <div
                  key={stat.label}
                  className={`overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg md:p-6 ${styles.card}`}
                >
                  <div
                    className={`font-display font-black leading-none tracking-tight ${styles.value}`}
                    style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={`mt-3 font-display text-sm font-bold uppercase tracking-[0.08em] ${styles.label}`}
                  >
                    {stat.label}
                  </div>
                  <div
                    className={`mt-1 font-mono text-[10px] uppercase tracking-[0.14em] ${styles.sub}`}
                  >
                    {stat.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="eras" className="mb-16 scroll-mt-28">
          <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-nord-line pb-2">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
              02 · Sieben Kapitel
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
              Übersicht
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                k: "1947 – 1950",
                t: "Gründung & Anfang",
                d: "38 Gründer, eine Kuhhaut als Eintrittsbuch, Fußball auf dem Notplatz an der Lerche.",
              },
              {
                k: "1950er – 60er",
                t: "Aufschwung",
                d: "Erste Aufstiege, junge Mannschaften, Aufnahme weiterer Sportarten und Volleyball.",
              },
              {
                k: "1970er",
                t: "Ausbau",
                d: "Wachsendes Vereinsleben, Gymnastik, Ski, erste Damenmannschaften.",
              },
              {
                k: "19.07.1986",
                t: "Eschengarten",
                d: "Eröffnung des selbstgebauten Vereinsheims nach 15 000 freiwilligen Arbeitsstunden.",
              },
              {
                k: "1990er – 2000er",
                t: "Konsolidierung",
                d: "Jugendarbeit als Markenzeichen, BFV-Erfolge, Auf- und Abstiege im Erwachsenenbereich.",
              },
              {
                k: "2010er – heute",
                t: "Moderne Tradition",
                d: "Über 500 Mitglieder, 5 Abteilungen, neue Sportarten wie Esport, digitale Vereinsführung.",
              },
            ].map((era, i) => (
              <article
                key={era.k}
                className="group rounded-2xl border border-nord-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-nord-gold hover:shadow-md md:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-nord-gold">
                    Kap. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                    {era.k}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-black leading-tight tracking-tight text-nord-ink md:text-2xl">
                  {era.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nord-muted md:text-[15px]">
                  {era.d}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-12 xl:grid-cols-[1.05fr_1fr] xl:gap-10">
          <section
            id="narrative"
            className="min-w-0 scroll-mt-28"
            aria-label="Erzählung"
          >
            <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-nord-line pb-2">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                  03 · Erzählung
                </div>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-nord-ink md:text-4xl">
                  Die Geschichte hinter den Zahlen.
                </h2>
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted md:inline">
                Langform
              </span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-nord-muted">
              Wie aus 38 Gründern eine Gemeinschaft im Münchner Norden wurde.
            </p>
            <ChronikNarrative />
          </section>

          <section
            id="timeline"
            className="min-w-0 scroll-mt-28"
            aria-label="Zeittafel"
          >
            <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-nord-line pb-2">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                  04 · Zeittafel
                </div>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-nord-ink md:text-4xl">
                  Stationen seit 1947.
                </h2>
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted md:inline">
                Filterbar
              </span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-nord-muted">
              Filtere nach Kategorie oder Jahrzehnt — über 50 Stationen.
            </p>
            <ChronikTimeline />
          </section>
        </div>

        <section id="kontakt" className="mt-16 scroll-mt-28">
          <div className="overflow-hidden rounded-3xl border border-nord-line bg-gradient-to-br from-nord-paper-2 via-white to-white p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center md:gap-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-nord-gold/40 bg-nord-gold/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-navy">
                  <span className="size-1.5 rounded-full bg-nord-gold" />
                  Chronik mitschreiben
                </div>
                <h3 className="mt-3 font-display text-2xl font-black leading-tight tracking-tight text-nord-ink md:text-3xl">
                  Du hast eine Geschichte, ein Foto, eine Anekdote?
                </h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-nord-muted md:text-base">
                  Die Chronik lebt von Erinnerungen aus erster Hand. Schick uns
                  Bilder vom Aufstieg 1972, Fotos vom Eschengarten-Bau oder die
                  Anekdote aus dem D-Jugend-Turnier — wir nehmen sie auf.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Link
                  href="/kontakt?subject=Chronik"
                  className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
                >
                  Erinnerung teilen →
                </Link>
                <a
                  href="mailto:info@svnord.de?subject=Chronik"
                  className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-nord-ink transition hover:border-nord-navy hover:text-nord-navy"
                >
                  ✉ info@svnord.de
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
