import { StatCounter } from "@/components/motion/StatCounter";

const STATS = [
  { label: "Mitglieder", value: "630+", sub: "aktive Nordler" },
  { label: "lizenzierte Trainer", value: "25+", sub: "ehrenamtlich" },
  { label: "Mannschaften", value: "26", sub: "alle Abteilungen" },
];

export function StatStrip() {
  return (
    <section className="bg-nord-navy text-white">
      <div className="mx-auto max-w-[1320px] px-6 py-10 md:px-7 md:py-12">
        <div className="mb-7 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold md:mb-9">
          <span className="size-1.5 rounded-full bg-nord-gold" />
          Unser Verein in Zahlen
        </div>
        <ul className="grid grid-cols-3 gap-3 border-t border-white/10 md:gap-0">
          {STATS.map((item) => (
            <li
              key={item.label}
              className="min-w-0 px-2 py-6 md:border-r md:border-white/10 md:px-7 md:py-2 md:[&:last-child]:border-r-0"
            >
              <div
                className="font-display font-black leading-none text-nord-gold"
                style={{ fontSize: "clamp(28px, 5vw, 88px)" }}
              >
                <StatCounter value={item.value} />
              </div>
              <div className="mt-2 font-display text-[11px] font-bold uppercase leading-tight tracking-[0.08em] md:mt-3 md:text-base">
                {item.label}
              </div>
              <div className="mt-0.5 text-[10px] opacity-60 md:text-xs">
                {item.sub}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
