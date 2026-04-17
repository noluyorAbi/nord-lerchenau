import { getPayloadClient } from "@/lib/payload";
import { formatKickoff } from "@/lib/format-date";

export async function NextMatch() {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "fixtures",
    where: { kickoff: { greater_than: new Date().toISOString() } },
    sort: "kickoff",
    limit: 1,
    depth: 1,
  });

  const fixture = result.docs[0];
  if (!fixture) return null;

  const team =
    typeof fixture.team === "object" && fixture.team !== null
      ? fixture.team.name
      : "SV Nord";
  const kickoff = new Date(fixture.kickoff);

  return (
    <section className="border-b border-nord-line bg-nord-navy text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 py-7 md:grid-cols-[1fr_auto] md:px-10">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            {fixture.competition ?? "Nächstes Spiel"}
          </div>
          <div className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
            {team}
            <span className="mx-2 font-normal text-nord-gold">vs.</span>
            {fixture.opponent}
          </div>
        </div>
        <div className="flex items-center gap-5 text-right text-xs text-white/70">
          <div>
            <div className="text-white/60">Anstoß</div>
            <div className="mt-0.5 text-xl font-bold text-nord-gold">
              {formatKickoff(kickoff)}
            </div>
          </div>
          {fixture.venue ? (
            <div>
              <div className="text-white/60">Ort</div>
              <div className="mt-0.5 text-sm font-semibold text-white">
                {fixture.venue}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
