const ITEMS = [
  { k: "NORD", score: "—", opp: "PALZ", status: "Heute 14:30", note: "Bezirksliga" },
  { k: "NORD II", score: "—", opp: "INH", status: "Heute 12:30", note: "Kreisklasse" },
  { k: "NORD III", score: "—", opp: "ITA", status: "Heute 10:45", note: "B-Klasse" },
  { k: "U15", score: "2:1", opp: "TSV", status: "FT", note: "Freitag" },
  { k: "U17", score: "3:0", opp: "FCE", status: "FT", note: "Freitag" },
];

export function MatchdayTicker() {
  const tripled = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div
      className="group relative bg-nord-navy text-white border-b border-white/10"
      aria-label="Matchday Ticker"
    >
      <div className="flex items-center h-11 overflow-hidden">
        <div
          className="shrink-0 flex items-center gap-2 h-full px-4 bg-nord-red text-white font-display font-extrabold text-[13px] tracking-[0.14em] uppercase"
        >
          <span
            className="inline-block size-[7px] rounded-full bg-white"
            style={{ animation: "live-pulse 1.8s infinite" }}
          />
          Heimspieltag
        </div>
        <div className="flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
          <div
            className="flex w-max gap-12 font-display font-semibold text-[15px] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{
              animation: "marquee-scroll 40s linear infinite",
            }}
          >
            {tripled.map((m, i) => (
              <div key={i} className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-nord-gold font-extrabold tracking-[0.08em] uppercase">
                  {m.note}
                </span>
                <span className="opacity-50">·</span>
                <span className="font-bold">{m.k}</span>
                <span className="font-mono bg-white/10 rounded px-2 py-0.5 text-xs">
                  {m.score}
                </span>
                <span className="font-bold">{m.opp}</span>
                <span className="opacity-60 text-xs">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
