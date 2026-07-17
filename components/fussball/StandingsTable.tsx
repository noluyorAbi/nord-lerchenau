import {
  currentFupaSeasonName,
  FUPA_CLUB_URL,
  isOurClub,
  type FupaStandings,
} from "@/lib/fupa";

type Props = {
  standings: FupaStandings | null;
  /** Liganame aus dem fupa-Team-Datensatz, z.B. "Landesliga Südost". */
  competitionName?: string | null;
  /** Saison-Label aus fupa, z.B. "26/27". Fallback: aktuelle Saison. */
  seasonName?: string | null;
  /** Link zum fupa-Teamprofil der aktuellen Saison. */
  fupaUrl?: string | null;
};

/**
 * Vollständige Liga-Tabelle für die /fussball-Seite. Zeigt ALLE
 * Mannschaften (keine Kürzung), Spalten Platz · Team · Sp · S · U · N · TD · Pkt.
 * Kompakt gehalten (enge Zeilenhöhe, tabular-nums), monochrom mit dezent
 * hervorgehobener SV-Nord-Zeile. Die TD-Spalte erscheint erst ab sm.
 */
export function StandingsTable({
  standings,
  competitionName,
  seasonName,
  fupaUrl,
}: Props) {
  const rows = standings?.standings ?? [];
  const season = seasonName ?? currentFupaSeasonName();
  // Vorsaison: solange noch kein Spiel gespielt ist, liefert fupa einen
  // Default-Spieltag (z.B. 34). Dann nur die Saison zeigen statt "X. Spieltag".
  const anyPlayed = rows.some((r) => (r.matches ?? 0) > 0);
  const roundLabel =
    anyPlayed && standings?.round?.number
      ? `${standings.round.number}. Spieltag · ${season}`
      : `Saison ${season}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-nord-ink text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em]">
        <span>{competitionName ?? "Liga-Tabelle"}</span>
        <span className="text-nord-gold">{roundLabel}</span>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-white/50">
          Tabelle nicht verfügbar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[420px]">
            <div className="grid grid-cols-[32px_1fr_28px_28px_28px_28px_44px] items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 sm:grid-cols-[36px_1fr_28px_28px_28px_28px_36px_44px]">
              <span>#</span>
              <span>Team</span>
              <span className="text-right">Sp</span>
              <span className="text-right">S</span>
              <span className="text-right">U</span>
              <span className="text-right">N</span>
              <span className="hidden text-right sm:inline">TD</span>
              <span className="text-right">Pkt</span>
            </div>

            {rows.map((r) => {
              const us = isOurClub(r.team);
              // N (Niederlagen): fupa liefert `defeats`; fehlt der Wert,
              // leiten wir es aus Sp − S − U ab.
              const losses =
                typeof r.defeats === "number" && r.defeats >= 0
                  ? r.defeats
                  : Math.max(0, r.matches - r.wins - r.draws);
              const td =
                r.goalDifference > 0
                  ? `+${r.goalDifference}`
                  : r.goalDifference < 0
                    ? `−${Math.abs(r.goalDifference)}`
                    : "0";
              return (
                <div
                  key={r.team.slug}
                  className={`grid grid-cols-[32px_1fr_28px_28px_28px_28px_44px] items-center gap-2 border-b border-white/[0.06] px-3 py-1.5 text-[13px] tabular-nums sm:grid-cols-[36px_1fr_28px_28px_28px_28px_36px_44px] ${
                    us
                      ? "bg-[linear-gradient(90deg,rgba(200,169,106,0.18),transparent_70%)]"
                      : ""
                  }`}
                >
                  <span>
                    <span
                      className={`inline-flex size-5 items-center justify-center rounded text-[11px] font-bold sm:size-6 ${
                        us
                          ? "bg-nord-gold text-nord-navy"
                          : "bg-white/[0.08] text-white"
                      }`}
                    >
                      {r.rank}
                    </span>
                  </span>
                  <span
                    className={`min-w-0 truncate font-display text-sm ${us ? "font-black" : "font-bold"}`}
                  >
                    {r.team.name.middle}
                    {us ? (
                      <span className="ml-2 text-[10px] tracking-[0.18em] text-nord-gold">
                        WIR
                      </span>
                    ) : null}
                  </span>
                  <span className="text-right opacity-70">{r.matches}</span>
                  <span className="text-right opacity-70">{r.wins}</span>
                  <span className="text-right opacity-70">{r.draws}</span>
                  <span className="text-right opacity-70">{losses}</span>
                  <span className="hidden text-right opacity-70 sm:inline">
                    {td}
                  </span>
                  <span className="text-right font-display font-black text-nord-gold">
                    {r.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rows.length > 0 ? (
        <a
          href={fupaUrl ?? FUPA_CLUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="border-t border-white/10 px-5 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 transition hover:text-nord-gold"
        >
          Komplette Tabelle auf fupa ↗
        </a>
      ) : null}
    </div>
  );
}
