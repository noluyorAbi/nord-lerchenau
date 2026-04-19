import { StatCounter } from "@/components/motion/StatCounter";
import type { HomePage } from "@/payload-types";

type Props = { stats: HomePage["stats"] };

const FALLBACK = [
  { label: "Gegründet", value: "1947", sub: "Vereinsjahr" },
  { label: "Mitglieder", value: "500+", sub: "aktive Nordler" },
  { label: "Mannschaften", value: "13", sub: "Fußball gesamt" },
  { label: "Sportarten", value: "6", sub: "Breiter Aufstellung" },
];

export function StatStrip({ stats }: Props) {
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
      <div className="mx-auto grid max-w-[1320px] border-l border-white/10 md:grid-cols-4">
        {items.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="border-r border-white/10 px-6 py-7 md:px-7"
          >
            <div
              className="font-display font-black leading-none text-nord-gold"
              style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
            >
              <StatCounter value={item.value} />
            </div>
            <div className="mt-1.5 font-display text-base font-bold uppercase tracking-[0.08em]">
              {item.label}
            </div>
            <div className="mt-0.5 text-xs opacity-60">{item.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
