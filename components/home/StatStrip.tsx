import { StatCounter } from "@/components/motion/StatCounter";
import { FUPA_TEAM_SLUG, getFupaStanding, isOurTeam } from "@/lib/fupa";
import type { HomePage } from "@/payload-types";

type Props = { stats: HomePage["stats"] };

const FALLBACK = [
  { label: "Gegründet", value: "1947", sub: "Vereinsjahr" },
  { label: "Mitglieder", value: "500+", sub: "aktive Nordler" },
  { label: "Mannschaften", value: "13", sub: "Fußball gesamt" },
  { label: "Bezirksliga", value: "1.", sub: "Platz · live von fupa" },
];

function isLeagueLabel(label: string): boolean {
  const l = label.toLowerCase();
  return (
    l.includes("bezirksliga") ||
    l.includes("tabelle") ||
    l.includes("platz") ||
    l === "liga"
  );
}

export async function StatStrip({ stats }: Props) {
  const standing = await getFupaStanding();
  const ourRank = standing?.standings.find((r) =>
    isOurTeam(r.team, FUPA_TEAM_SLUG),
  )?.rank;

  const baseItems =
    Array.isArray(stats) && stats.length > 0
      ? stats.map((s, i) => ({
          label: String(s.label),
          value: String(s.value),
          sub: FALLBACK[i]?.sub ?? "",
        }))
      : FALLBACK;

  const items = baseItems.map((item) => {
    if (ourRank && isLeagueLabel(item.label)) {
      return {
        label: "Bezirksliga",
        value: `${ourRank}.`,
        sub: "Platz · live von fupa",
      };
    }
    return item;
  });

  return (
    <section className="bg-nord-navy text-white">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 md:grid-cols-4">
        {items.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="border-b border-r border-white/10 px-5 py-6 last:border-r-0 md:px-7 md:py-7 md:[&:nth-child(-n+4)]:border-b-0"
          >
            <div
              className="font-display font-black leading-none text-nord-gold"
              style={{ fontSize: "clamp(36px, 6vw, 88px)" }}
            >
              <StatCounter value={item.value} />
            </div>
            <div className="mt-1.5 font-display text-sm font-bold uppercase tracking-[0.08em] md:text-base">
              {item.label}
            </div>
            <div className="mt-0.5 text-[11px] opacity-60 md:text-xs">
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
