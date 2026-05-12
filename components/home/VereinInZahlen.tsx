type Stat = {
  value: string;
  label: string;
  highlight?: boolean;
};

const STATS: Stat[] = [
  { value: "630+", label: "Mitglieder" },
  { value: "25+", label: "lizenzierte Trainer", highlight: true },
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
              className={`relative overflow-hidden rounded-xl bg-white/[0.07] p-8 ring-1 ring-white/10 md:p-10 ${
                s.highlight ? "ring-2 ring-[#4d77e8]/70" : ""
              }`}
            >
              {s.highlight ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#4d77e8]/20 blur-2xl"
                />
              ) : null}
              <div className="relative flex flex-col items-center text-center">
                <span
                  className={`inline-flex items-baseline rounded-md font-display font-black leading-none tracking-tight ${
                    s.highlight
                      ? "bg-[#4d77e8] px-4 py-2 text-white shadow-[0_8px_24px_-8px_rgba(77,119,232,0.6)]"
                      : "text-white"
                  }`}
                  style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
                >
                  {s.value}
                </span>
                <span
                  className={`mt-4 font-display text-sm font-bold uppercase tracking-[0.1em] md:text-base ${
                    s.highlight ? "text-white" : "text-white/85"
                  }`}
                >
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
