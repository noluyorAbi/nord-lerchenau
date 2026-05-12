import Link from "next/link";

import { SectionEyebrow } from "@/components/SectionEyebrow";
import { getPayloadClient } from "@/lib/payload";
import type { Person, Team } from "@/payload-types";

const JUNIOR_CATEGORIES = new Set(["junioren", "juniorinnen", "bambini"]);

function trainerNames(team: Team): string[] {
  return (team.trainers ?? [])
    .filter((t): t is Person => typeof t === "object" && t !== null)
    .map((t) => t.name)
    .filter((n): n is string => typeof n === "string" && n.length > 0);
}

export async function JugendHighlights() {
  const payload = await getPayloadClient();
  let teams: Team[] = [];
  try {
    const result = await payload.find({
      collection: "teams",
      where: {
        and: [
          { sport: { equals: "fussball" } },
          { category: { in: ["junioren", "juniorinnen", "bambini"] } },
        ],
      },
      sort: ["order", "name"],
      limit: 50,
      depth: 1,
    });
    teams = result.docs.filter(
      (t) => t.category && JUNIOR_CATEGORIES.has(t.category),
    );
  } catch {
    teams = [];
  }

  if (teams.length === 0) return null;

  return (
    <section className="border-b border-nord-line bg-white">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="02" label="Jugend" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(36px, 4.4vw, 64px)" }}
            >
              Unsere Jugend.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-nord-muted md:text-lg">
              Vom Bambini bis zur A-Jugend — über 20 Mannschaften, betreut von
              ehrenamtlichen Trainer:innen mit Herz und Lizenz.
            </p>
          </div>
          <Link
            href="/fussball"
            className="hidden rounded-full border border-nord-line px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-white md:inline-flex"
          >
            Alle Mannschaften →
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const trainers = trainerNames(team);
            return (
              <li key={team.id}>
                <Link
                  href={`/fussball/${team.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-nord-line bg-nord-paper-2 p-5 transition hover:-translate-y-0.5 hover:border-nord-gold hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-nord-navy/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-navy">
                      {team.category === "juniorinnen"
                        ? "Juniorinnen"
                        : team.category === "bambini"
                          ? "Bambini"
                          : "Junioren"}
                    </span>
                    {team.ageGroup ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                        {team.ageGroup}
                      </span>
                    ) : null}
                  </div>
                  <div className="font-display text-lg font-black leading-tight tracking-tight text-nord-ink">
                    {team.name}
                  </div>
                  {team.birthYears ? (
                    <div className="font-mono text-[11px] text-nord-muted">
                      Jahrgänge {team.birthYears}
                    </div>
                  ) : null}
                  {trainers.length > 0 ? (
                    <div className="mt-auto border-t border-nord-line/70 pt-3 text-xs text-nord-ink/80">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-nord-muted">
                        Trainer
                      </span>
                      <div className="mt-1 line-clamp-2 leading-snug">
                        {trainers.join(", ")}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto border-t border-nord-line/70 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                      Trainerteam wird ergänzt
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
