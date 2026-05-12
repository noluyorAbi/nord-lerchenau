import { StatCounter } from "@/components/motion/StatCounter";
import type { HomePage } from "@/payload-types";

type Props = { stats: HomePage["stats"] };

const FALLBACK = [
  { label: "Mitglieder", value: "630+", sub: "aktive Nordler" },
  { label: "lizenzierte Trainer", value: "25+", sub: "ehrenamtlich" },
  { label: "Mannschaften", value: "26", sub: "alle Abteilungen" },
];

export async function StatStrip({ stats }: Props) {
  const items =
    Array.isArray(stats) && stats.length > 0
      ? stats.map((s, i) => ({
          label: String(s.label),
          value: String(s.value),
          sub: FALLBACK[i]?.sub ?? "",
        }))
      : FALLBACK;

  return (
    <section className="bg-nord-navy text-white">
      <div className="mx-auto max-w-[1320px] px-6 py-10 md:px-7 md:py-12">
        <div className="mb-7 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold md:mb-9">
          <span className="size-1.5 rounded-full bg-nord-gold" />
          Unser Verein in Zahlen
        </div>
        <ul className="grid grid-cols-1 gap-0 border-t border-white/10 md:grid-cols-3">
          {items.map((item, idx) => (
            <li
              key={`${item.label}-${idx}`}
              className="border-b border-white/10 px-1 py-7 md:border-b-0 md:border-r md:px-7 md:py-2 md:[&:last-child]:border-r-0"
            >
              <div
                className="font-display font-black leading-none text-nord-gold"
                style={{ fontSize: "clamp(44px, 6.5vw, 96px)" }}
              >
                <StatCounter value={item.value} />
              </div>
              <div className="mt-3 font-display text-sm font-bold uppercase tracking-[0.08em] md:text-base">
                {item.label}
              </div>
              <div className="mt-0.5 text-[11px] opacity-60 md:text-xs">
                {item.sub}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
