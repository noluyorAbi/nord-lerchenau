type Stat = {
  value: string;
  label: string;
};

const STATS: Stat[] = [
  { value: "630+", label: "Mitglieder" },
  { value: "25+", label: "lizenzierte Trainer" },
  { value: "26", label: "Mannschaften" },
];

export function VereinInZahlen() {
  return (
    <section className="bg-nord-navy text-white">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-7 md:py-20">
        <h2
          className="font-display font-black leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
        >
          Unser Verein in Zahlen
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {STATS.map((s) => (
            <li
              key={s.label}
              className="group relative overflow-hidden rounded-xl bg-white/[0.06] p-8 ring-1 ring-white/10 transition duration-300 ease-out hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-2 hover:ring-nord-gold/60 hover:shadow-[0_20px_40px_-20px_rgba(212,160,23,0.45)] md:p-10"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-nord-gold/0 blur-2xl transition duration-500 group-hover:bg-nord-gold/20"
              />
              <div className="relative flex flex-col items-center text-center">
                <span
                  className="inline-flex items-baseline font-display font-black leading-none tracking-tight text-white transition-colors duration-300 group-hover:text-nord-gold"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
                >
                  {s.value}
                </span>
                <span className="mt-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-white/85 md:text-base">
                  {s.label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
