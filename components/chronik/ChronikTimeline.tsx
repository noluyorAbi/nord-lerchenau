"use client";

import { useMemo, useState } from "react";

type ChapterId = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII";

type Entry = {
  year: number;
  date?: string;
  title: string;
  body?: string;
  tag?: "milestone" | "build" | "section" | "team" | "leadership" | "loss";
};

const CHAPTERS: Array<{
  id: ChapterId;
  era: string;
  title: string;
  match: (year: number) => boolean;
}> = [
  { id: "I", era: "1947", title: "Vereinsgründung", match: (y) => y === 1947 },
  {
    id: "II",
    era: "1948–1959",
    title: "Aus dem Acker wird ein Sportplatz",
    match: (y) => y >= 1948 && y <= 1959,
  },
  {
    id: "III",
    era: "1960er–1970er",
    title: "Flutlicht in Eigenleistung",
    match: (y) => y >= 1960 && y <= 1977,
  },
  {
    id: "IV",
    era: "1978–1983",
    title: "Vereinsorganisation wird modern",
    match: (y) => y >= 1978 && y <= 1982,
  },
  {
    id: "V",
    era: "1983–1986",
    title: "Eschengarten in Eigenregie",
    match: (y) => y >= 1983 && y <= 1986,
  },
  {
    id: "VI",
    era: "1987–2005",
    title: "Aufstieg und Erweiterung",
    match: (y) => y >= 1987 && y <= 2003,
  },
  {
    id: "VII",
    era: "2004–2015",
    title: "Stadtangebote und Rückschläge",
    match: (y) => y >= 2004 && y <= 2015,
  },
];

function chapterFor(year: number): ChapterId {
  return CHAPTERS.find((c) => c.match(year))?.id ?? "VII";
}

const ENTRIES: Entry[] = [
  {
    year: 1947,
    date: "15.10.",
    title: "Vereinsgründung im Gasthof Schützengarten",
    body: "38 Erwachsene und 22 Jugendliche tragen sich ein. Carl Jennerwein wird 1. Vorstand. Der Verein heißt fortan SV Nord München-Lerchenau.",
    tag: "milestone",
  },
  {
    year: 1948,
    date: "02.05.",
    title: "Erstes Freundschaftsspiel",
    body: "Gegen SC Lochhausen · 2:3 verloren.",
    tag: "team",
  },
  {
    year: 1948,
    date: "01.08.",
    title: "Sportplatzeröffnung Heidelerchenstraße",
    body: "Rückspiel gegen TSV Unterhaching weiht den selbst hergerichteten Acker ein.",
    tag: "build",
  },
  {
    year: 1948,
    date: "05.09.",
    title: "Erstes Punktspiel",
    body: "Gegen Weiß Blau München · 2:3.",
    tag: "team",
  },
  {
    year: 1956,
    title: "Neuaufbau der Fußball-Jugendabteilung",
    tag: "section",
  },
  {
    year: 1959,
    title: "Umzug auf die Bezirkssportanlage Ebereschenstraße",
    body: "26.05.1959 · Einweihung mit Fußballturnier.",
    tag: "milestone",
  },
  {
    year: 1959,
    title: "Gründung der Handballabteilung",
    body: "Damen- und Herrenmannschaft.",
    tag: "section",
  },
  {
    year: 1963,
    date: "01.01.",
    title: "Anschluss der BSG Hurth",
    tag: "milestone",
  },
  { year: 1965, title: "Auflösung der Damen-Handballmannschaft", tag: "loss" },
  {
    year: 1966,
    title: "Eintrag ins Vereinsregister",
    body: "SV Nord München-Lerchenau e.V.",
    tag: "milestone",
  },
  {
    year: 1967,
    title: "Gründung der Gymnastikabteilung",
    body: "Auf Initiative von Frauen aus Handball- und Fußballabteilung. Annemarie Riepl wird Abteilungsleiterin.",
    tag: "section",
  },
  {
    year: 1967,
    title: "Trainingsplatz-Flutlichtanlage in Eigenleistung",
    body: "Stadt sah sich außerstande zu finanzieren · Mitglieder bauten selbst.",
    tag: "build",
  },
  {
    year: 1971,
    title: "Tartan-Kleinhandballfeld",
    body: "Olympia 1972 brachte uns einen neuen Handball-Trainingsplatz.",
    tag: "build",
  },
  { year: 1975, title: "Gründung Damenfußball-Abteilung", tag: "section" },
  {
    year: 1975,
    title: "Flutlichtanlage Handball-Kleinfeld in Eigenleistung",
    tag: "build",
  },
  {
    year: 1979,
    title: "Beitrags-Einzugsverfahren eingeführt",
    tag: "leadership",
  },
  {
    year: 1979,
    title: "Neue Satzung · Gemeinnützigkeit anerkannt",
    tag: "leadership",
  },
  { year: 1979, title: "Vereinszeitung Nr. 1", tag: "leadership" },
  {
    year: 1980,
    title: "Sandplatz mit Flutlichtanlage",
    body: "Endlich ein vierter Platz · Stadt München genehmigte 1979.",
    tag: "build",
  },
  {
    year: 1981,
    title: "Vereinsverwaltung auf EDV",
    body: "Software der Stadtsparkasse München.",
    tag: "leadership",
  },
  {
    year: 1983,
    date: "03.05.",
    title: "Gründung Interessengemeinschaft Sportheimbau",
    body: "SV Nord, FC Eintracht und HuVT Edelweiß-Stamm schließen sich zusammen.",
    tag: "milestone",
  },
  {
    year: 1984,
    title: "Erweiterung BSA nach Norden (Kunstrasen)",
    tag: "build",
  },
  {
    year: 1984,
    date: "02.07.",
    title: "Gründung Vereins-Interessengemeinschaft Lerchenau e.V. (VIG)",
    tag: "milestone",
  },
  {
    year: 1985,
    date: "01.06.",
    title: "Baubeginn Vereinsheim Eschengarten",
    body: "Stadtrat hatte am 25.04.1985 die Bezuschussung von DM 383.000,- bewilligt.",
    tag: "build",
  },
  { year: 1985, title: "Auflösung Damenfußball", tag: "loss" },
  {
    year: 1986,
    date: "19.07.",
    title: "Eröffnung Vereinsheim Eschengarten",
    body: "15.000 freiwillige Arbeitsstunden, drei Vereine. Bis heute der gesellschaftliche Mittelpunkt der Lerchenau.",
    tag: "milestone",
  },
  { year: 1987, title: "Erweiterung des Umkleidegebäudes", tag: "build" },
  {
    year: 1987,
    date: "27.09.",
    title: "Gründung der Skiabteilung",
    body: "Karl Prölß und Christian Schäffer initiieren · bringt rund 100 neue Mitglieder.",
    tag: "section",
  },
  {
    year: 1989,
    title: "Aufstieg in die A-Klasse (Kreisliga)",
    body: "Unter Trainer Morcinek.",
    tag: "team",
  },
  {
    year: 1990,
    title: "Vereinszeitung-Layout auf Computer umgestellt",
    tag: "leadership",
  },
  {
    year: 1991,
    title: "Multisportabteilung gegründet",
    body: "Volleyball, Badminton…",
    tag: "section",
  },
  {
    year: 1992,
    date: "06.05.",
    title: "Gründung SV Nord-Förderer (1. Mannschaft)",
    tag: "leadership",
  },
  {
    year: 1993,
    title: "Erstmaliger Aufstieg in die Bezirksliga",
    body: "Spielertrainer Aumüller.",
    tag: "team",
  },
  { year: 1994, title: "A-Jugend in die Bezirksliga Oberbayern", tag: "team" },
  {
    year: 1996,
    title: "Gymnastik gründet Mädchenturnen (5–9 Jahre)",
    tag: "section",
  },
  {
    year: 1996,
    title: "Sport-Geräteschuppen gemeinsam mit FCE und Harthof",
    tag: "build",
  },
  {
    year: 1998,
    title: "Handball meldet Mädchen-Jugendmannschaft an",
    tag: "team",
  },
  {
    year: 1999,
    title: "Vereins-EDV auf neue PC-Software",
    body: "Kurt Tänzer modernisiert.",
    tag: "leadership",
  },
  {
    year: 2001,
    title: "Mädchen-Jugendmannschaft (Handball) abgemeldet",
    tag: "loss",
  },
  { year: 2002, title: "Mädchenturnen wieder abgemeldet", tag: "loss" },
  { year: 2002, title: "Geräteschuppen auf BSA gebaut", tag: "build" },
  { year: 2004, title: "Kunstrasen-Spielfeld erneuert", tag: "build" },
  { year: 2005, title: "SV Nord online unter svnord.de", tag: "milestone" },
  {
    year: 2009,
    title: "Vereinszeitung eingestellt",
    body: "Nach 30 Jahren Mitgliederinformation.",
    tag: "loss",
  },
  { year: 2011, title: "Hauptplatz komplett erneuert", tag: "build" },
  {
    year: 2012,
    title: "SV Nord-Förderclub aufgelöst",
    body: "Nach 20 Jahren Unterstützung der 1. Mannschaft.",
    tag: "loss",
  },
  {
    year: 2013,
    title: "Skiabteilung spaltet sich vom Hauptverein ab",
    tag: "loss",
  },
  {
    year: 2014,
    title: "Auflösung der Handballabteilung",
    body: "Nach 55 Jahren · seit 1959 Bestandteil des Vereins.",
    tag: "loss",
  },
  {
    year: 2014,
    title: "Platzwartwohnung wegen Unbewohnbarkeit gesperrt",
    tag: "loss",
  },
  {
    year: 2015,
    title: "Mitgliederzahl sinkt auf 600",
    body: "Folge der Auflösung von Handball und Ski.",
    tag: "loss",
  },
];

const FILTERS: Array<{ id: Entry["tag"] | "all"; label: string }> = [
  { id: "all", label: "Alle" },
  { id: "milestone", label: "Meilensteine" },
  { id: "build", label: "Bau & Anlage" },
  { id: "section", label: "Abteilungen" },
  { id: "team", label: "Sportlich" },
  { id: "leadership", label: "Organisation" },
  { id: "loss", label: "Rückschläge" },
];

const TAG_STYLES: Record<
  NonNullable<Entry["tag"]>,
  { dot: string; pill: string; label: string }
> = {
  milestone: {
    dot: "bg-nord-gold",
    pill: "bg-nord-gold/20 text-nord-ink",
    label: "Meilenstein",
  },
  build: {
    dot: "bg-nord-sky",
    pill: "bg-nord-sky/20 text-nord-navy",
    label: "Bau",
  },
  section: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-900",
    label: "Abteilung",
  },
  team: {
    dot: "bg-nord-navy",
    pill: "bg-nord-navy/10 text-nord-navy",
    label: "Sportlich",
  },
  leadership: {
    dot: "bg-purple-500",
    pill: "bg-purple-100 text-purple-900",
    label: "Organisation",
  },
  loss: {
    dot: "bg-rose-500",
    pill: "bg-rose-100 text-rose-900",
    label: "Rückschlag",
  },
};

export function ChronikTimeline() {
  const [filter, setFilter] = useState<Entry["tag"] | "all">("all");
  const [chapter, setChapter] = useState<ChapterId | "all">("all");

  const filtered = useMemo(
    () =>
      ENTRIES.filter((e) => filter === "all" || e.tag === filter).filter(
        (e) => chapter === "all" || chapterFor(e.year) === chapter,
      ),
    [filter, chapter],
  );

  const byChapter = useMemo(() => {
    const map = new Map<ChapterId, Entry[]>();
    for (const e of filtered) {
      const c = chapterFor(e.year);
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(e);
    }
    return CHAPTERS.filter((c) => map.has(c.id)).map((c) => ({
      ...c,
      items: map.get(c.id)!,
    }));
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id ?? "all"}
              type="button"
              onClick={() => setFilter(f.id as Entry["tag"] | "all")}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                active
                  ? "bg-nord-navy text-white"
                  : "border border-nord-line bg-white text-nord-ink hover:border-nord-navy"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setChapter("all")}
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
            chapter === "all"
              ? "bg-nord-ink text-white"
              : "border border-nord-line bg-white text-nord-muted hover:border-nord-ink hover:text-nord-ink"
          }`}
        >
          Alle Kapitel
        </button>
        {CHAPTERS.map((c) => {
          const active = c.id === chapter;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setChapter(c.id)}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                active
                  ? "bg-nord-ink text-white"
                  : "border border-nord-line bg-white text-nord-muted hover:border-nord-ink hover:text-nord-ink"
              }`}
            >
              {c.id} · {c.era}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
          Keine Einträge für diese Auswahl.
        </p>
      ) : (
        <div className="space-y-12">
          {byChapter.map(({ id, era, title, items }) => (
            <section
              key={id}
              id={`zt-${id}`}
              className="scroll-mt-28"
              aria-label={`Kapitel ${id}: ${title}`}
            >
              <div className="mb-4 border-b border-nord-line pb-2">
                <div className="flex items-baseline gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-muted">
                  <span className="rounded-full bg-nord-navy px-2 py-1 text-white">
                    Kapitel {id}
                  </span>
                  <span className="text-nord-gold">{era}</span>
                  <span className="ml-auto">
                    {items.length} {items.length === 1 ? "Eintrag" : "Einträge"}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                  {title}
                </h3>
              </div>

              <ol className="space-y-4 md:space-y-5">
                {items.map((entry, idx) => {
                  const style = entry.tag ? TAG_STYLES[entry.tag] : null;
                  return (
                    <li
                      key={`${entry.year}-${entry.title}-${idx}`}
                      className="grid items-start gap-3 md:grid-cols-[180px_1fr] md:gap-6"
                    >
                      <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-2 md:border-r-2 md:border-nord-line md:pr-6 md:pt-1">
                        <span
                          aria-hidden
                          className={`size-3 shrink-0 rounded-full ring-4 ring-nord-paper md:size-3.5 ${
                            style?.dot ?? "bg-nord-muted"
                          }`}
                        />
                        <div className="font-display text-2xl font-black leading-none tracking-tight text-nord-ink md:text-4xl">
                          {entry.year}
                        </div>
                        {entry.date ? (
                          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                            {entry.date.replace(/\.$/, "")}
                          </div>
                        ) : null}
                        {style ? (
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${style.pill}`}
                          >
                            {style.label}
                          </span>
                        ) : null}
                      </div>

                      <div className="rounded-xl border border-nord-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-nord-navy hover:shadow-md md:p-5">
                        <h4 className="font-display text-base font-bold leading-snug tracking-tight text-nord-ink md:text-lg">
                          {entry.title}
                        </h4>
                        {entry.body ? (
                          <p className="mt-1.5 text-sm leading-relaxed text-nord-muted">
                            {entry.body}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
