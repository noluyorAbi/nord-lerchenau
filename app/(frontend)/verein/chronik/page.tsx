import { ChronikNarrative } from "@/components/chronik/ChronikNarrative";
import { ChronikTimeline } from "@/components/chronik/ChronikTimeline";
import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const FOUNDED = 1947;

const STATS = [
  { value: "1947", label: "Gegründet" },
  { value: "38", label: "Gründungs­mitglieder" },
  { value: "5", label: "Abteilungen heute" },
  { value: "15.000", label: "Std. Eigenleistung" },
];

const SECTIONS = [
  { id: "stats", label: "Highlights" },
  { id: "narrative", label: "Erzählung" },
  { id: "timeline", label: "Zeittafel" },
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
          `Von der Gründung am 15. Oktober 1947 bis heute. ${yearsAlive} Jahre SV Nord München-Lerchenau.`
        }
      />

      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <nav
          aria-label="Chronik"
          className="sticky top-2 z-20 mb-10 rounded-2xl border border-nord-line bg-white/85 p-3 shadow-sm backdrop-blur"
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STATS.map((stat, idx) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-nord-line p-5 ${
                  idx === 0 ? "bg-nord-navy text-white" : "bg-white"
                }`}
              >
                <div
                  className={`font-display text-4xl font-black leading-none tracking-tight md:text-5xl ${
                    idx === 0 ? "text-nord-gold" : "text-nord-ink"
                  }`}
                >
                  {stat.value}
                </div>
                <div
                  className={`mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    idx === 0 ? "text-white/70" : "text-nord-muted"
                  }`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-12 xl:grid-cols-2 xl:gap-10">
          <section
            id="timeline"
            className="min-w-0 scroll-mt-28"
            aria-label="Zeittafel"
          >
            <div className="mb-5 border-b border-nord-line pb-2">
              <h2 className="font-display text-3xl font-black tracking-tight text-nord-ink md:text-4xl">
                Zeittafel
              </h2>
              <p className="mt-1 text-sm text-nord-muted">
                Filtere nach Kategorie oder Jahrzehnt. {`>`}50 Stationen seit
                1947.
              </p>
            </div>
            <ChronikTimeline />
          </section>

          <section
            id="narrative"
            className="min-w-0 scroll-mt-28"
            aria-label="Erzählung"
          >
            <div className="mb-5 border-b border-nord-line pb-2">
              <h2 className="font-display text-3xl font-black tracking-tight text-nord-ink md:text-4xl">
                Erzählung
              </h2>
              <p className="mt-1 text-sm text-nord-muted">
                Wie aus 38 Gründern die Gemeinschaft im Münchner Norden wurde.
              </p>
            </div>
            <ChronikNarrative />
          </section>
        </div>
      </div>
    </>
  );
}
