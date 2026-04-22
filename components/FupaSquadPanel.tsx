import { FupaSquadClient } from "@/components/fupa/FupaSquadClient";
import {
  fupaTeamUrl,
  getFupaTeamRoster,
  resolveFupaSlug,
  type FupaMeta,
} from "@/lib/fupa";

type Props = {
  fupa: FupaMeta;
  teamName?: string;
};

export async function FupaSquadPanel({ fupa, teamName }: Props) {
  const slug = resolveFupaSlug(fupa);
  if (!slug) return null;

  const roster = await getFupaTeamRoster(slug);
  const profileUrl = fupaTeamUrl(slug);

  if (!roster) return null;

  const players = roster.players.filter((p) => !p.isDeactivated);
  const coaches = roster.coaches.filter((c) => !c.isDeactivated);

  if (players.length === 0 && coaches.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
              Kader · fupa
            </div>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-nord-muted">
              Für diese Mannschaft ist auf fupa noch kein Kader gepflegt.
              Sobald Spieler:innen beim Verein hinterlegt sind, tauchen sie
              hier automatisch auf.
            </p>
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-nord-ink px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-nord-gold hover:text-nord-navy"
          >
            fupa-Profil ↗
          </a>
        </div>
      </section>
    );
  }

  return (
    <FupaSquadClient
      players={players}
      coaches={coaches}
      captainName={
        roster.info.captain
          ? `${roster.info.captain.firstName} ${roster.info.captain.lastName}`
          : null
      }
      viceName={
        roster.info.viceCaptain
          ? `${roster.info.viceCaptain.firstName} ${roster.info.viceCaptain.lastName}`
          : null
      }
      profileUrl={profileUrl}
      teamName={teamName}
    />
  );
}
