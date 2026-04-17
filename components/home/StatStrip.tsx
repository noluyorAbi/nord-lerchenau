import type { HomePage } from "@/payload-types";

type Props = { stats: HomePage["stats"] };

const FALLBACK = [
  { label: "Gegründet", value: "1947" },
  { label: "Mitglieder", value: "500+" },
  { label: "Mannschaften", value: "13" },
  { label: "Bezirksliga", value: "3. Platz" },
];

export function StatStrip({ stats }: Props) {
  const items =
    Array.isArray(stats) && stats.length > 0
      ? stats.map((s) => ({ label: String(s.label), value: String(s.value) }))
      : FALLBACK;

  return (
    <section className="border-b border-nord-line bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-nord-line md:grid-cols-4 md:divide-x">
        {items.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="px-6 py-6 md:px-8 md:py-7"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
              {item.label}
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-nord-ink md:text-3xl">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
