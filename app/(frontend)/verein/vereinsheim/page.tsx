import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const ESCHENGARTEN_URL = "https://www.eschengarten.com";
const ESCHENGARTEN_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Eschengarten+Ebereschenstra%C3%9Fe+17+M%C3%BCnchen";
const ESCHENGARTEN_TEL = "+49893511899";
const ESCHENGARTEN_TEL_DISPLAY = "+49 (0)89 351 1899";

const TIMELINE = [
  {
    date: "5. Mai 1983",
    title: "Gründung der Interessengemeinschaft",
    body: "Auf Initiative von Horst Lanninger (damaliger 1. Vorstand des SV Nord) gründen drei Lerchenauer Vereine die Interessengemeinschaft Sportheimbau Lerchenau, die heutige VIG-Lerchenau e.V.",
  },
  {
    date: "25. April 1985",
    title: "Der Stadtrat sagt zu",
    body: "Der Münchner Stadtrat bewilligt die Bezuschussung: 30 % Zuschuss plus ein zinsloses Darlehen.",
  },
  {
    date: "21. Juni 1985",
    title: "Baubeginn",
    body: "Der Spatenstich im Eschenviertel, von hier an bauen die Mitglieder selbst mit.",
  },
  {
    date: "19. Juli 1986",
    title: "Feierliche Eröffnung",
    body: "Nach rund 15.000 freiwilligen Arbeitsstunden der Vereinsmitglieder öffnet der Eschengarten seine Türen.",
  },
];

const CLUBS = [
  "SV Nord München-Lerchenau",
  "FC Eintracht München",
  "Trachtenverein Edelweiß-Stamm Lerchenau",
];

const PLAETZE = [
  { value: "2", label: "Kunstrasenplätze", note: "ganzjährig bespielbar" },
  { value: "1", label: "Naturrasenplatz", note: "gepflegt für den Spieltag" },
  { value: "+", label: "Sporthalle", note: "in den Wintermonaten" },
];

export default async function VereinsheimPage() {
  const payload = await getPayloadClient();
  const page = await payload.findGlobal({ slug: "vereinsheim-page" });

  return (
    <>
      <PageHero
        eyebrow="Vereinsheim"
        title="Eschengarten"
        lede={page.intro ?? "Seit 1986 unser Zuhause im Eschenviertel."}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="rounded-2xl border border-nord-line bg-nord-paper-2 p-5 md:p-6">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
            SV Nord München-Lerchenau e.V.
          </div>
          <p className="mt-2 text-sm leading-relaxed text-nord-ink md:text-base">
            Heimat im Münchner Norden seit 1947.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={ESCHENGARTEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
            >
              Eschengarten · Saisonale Speisekarte ↗
            </a>
            <a
              href={ESCHENGARTEN_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-nord-muted underline decoration-nord-line underline-offset-4 transition hover:text-nord-ink"
            >
              Ebereschenstraße 17 · Google Maps ↗
            </a>
          </div>
        </div>

        {/* Geschichte */}
        <section className="mt-14">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
            Geschichte
          </div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.01em] text-nord-ink md:text-4xl">
            Eine Gemeinschaftsleistung dreier Vereine
          </h2>
          <p className="mt-4 text-base leading-relaxed text-nord-ink/85">
            Der Eschengarten wurde nicht gekauft, er wurde gebaut: von den
            Mitgliedern selbst, über drei Jahre, Hand in Hand mit zwei
            Nachbarvereinen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CLUBS.map((club) => (
              <span
                key={club}
                className="rounded-full border border-nord-line bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-nord-ink/75"
              >
                {club}
              </span>
            ))}
          </div>

          <ol className="mt-8 space-y-0">
            {TIMELINE.map((step, i) => (
              <li key={step.date} className="relative flex gap-5">
                <div className="flex flex-col items-center">
                  <span
                    className="mt-1.5 size-2.5 shrink-0 rounded-full bg-nord-gold ring-4 ring-nord-gold/15"
                    aria-hidden
                  />
                  {i < TIMELINE.length - 1 ? (
                    <span className="w-px flex-1 bg-nord-line" aria-hidden />
                  ) : null}
                </div>
                <div className={i < TIMELINE.length - 1 ? "pb-7" : ""}>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-nord-gold-2">
                    {step.date}
                  </div>
                  <div className="mt-0.5 font-display text-lg font-bold tracking-tight text-nord-ink">
                    {step.title}
                  </div>
                  <p className="mt-1 text-[15px] leading-relaxed text-nord-ink/80">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex items-baseline gap-4 rounded-2xl bg-nord-navy p-6 text-white md:p-7">
            <div
              className="font-display font-black leading-none text-nord-gold"
              style={{ fontSize: "clamp(40px, 6vw, 56px)" }}
            >
              15.000
            </div>
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                freiwillige Arbeitsstunden
              </div>
              <p className="mt-1 text-sm text-white/75">
                geleistet von den Mitgliedern, bis zur Eröffnung 1986.
              </p>
            </div>
          </div>
        </section>

        {/* Plätze */}
        <section className="mt-14">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
            Anlage
          </div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.01em] text-nord-ink md:text-4xl">
            Unsere Plätze
          </h2>
          <p className="mt-4 text-base leading-relaxed text-nord-ink/85">
            Moderne Trainings- und Spielbedingungen auf der Bezirkssportanlage,
            das ganze Jahr über.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PLAETZE.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-nord-line bg-white p-5"
              >
                <div className="font-display text-4xl font-black leading-none text-nord-navy">
                  {p.value}
                </div>
                <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-ink">
                  {p.label}
                </div>
                <div className="mt-1 text-xs text-nord-muted">{p.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Gastronomie */}
        <section className="mt-14">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
            Gastronomie
          </div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.01em] text-nord-ink md:text-4xl">
            Gaststätte Eschengarten
          </h2>
          <div className="mt-6 grid gap-5 rounded-2xl border border-nord-line bg-white p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
            <div>
              <p className="text-base leading-relaxed text-nord-ink/85">
                Die Gaststätte wird von einer eigenen Wirtsfamilie betrieben,
                mit saisonaler Speisekarte und Biergarten, an sechs Tagen die
                Woche geöffnet.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <a
                  href={ESCHENGARTEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-nord-gold px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-nord-navy transition hover:-translate-y-px hover:brightness-110"
                >
                  Speisekarte ansehen ↗
                </a>
              </div>
            </div>
            <div className="rounded-xl bg-nord-paper-2 p-5">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-nord-muted">
                Reservierung
              </div>
              <a
                href={`tel:${ESCHENGARTEN_TEL}`}
                className="mt-2 block font-display text-xl font-bold tracking-tight text-nord-ink transition hover:text-nord-navy-2"
              >
                {ESCHENGARTEN_TEL_DISPLAY}
              </a>
              <div className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-nord-muted">
                Adresse
              </div>
              <p className="mt-1 text-sm text-nord-ink/80">
                Ebereschenstraße 17
                <br />
                80935 München
              </p>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
