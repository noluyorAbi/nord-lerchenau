/**
 * Trainer:innen und Betreuer einer Mannschaft samt ihrer Rolle in genau dieser
 * Mannschaft.
 *
 * Die Rolle gehoert zur Zuordnung und nicht zur Person: Felix Kirmeyer ist
 * Sportlicher Leiter der 1. Herren und Ansprechpartner der Ü40, Ergin Piker
 * Jugendleiter und Trainerin der C-Juniorinnen. Deshalb liegen die Eintraege in
 * `team.staff` (Person + Rolle). Das alte Feld `team.trainers` bleibt als
 * Rueckfall lesbar, solange nicht jede Mannschaft umgezogen ist; dann gilt die
 * Rolle des Personeneintrags.
 */

import type { Person, Team } from "@/payload-types";

export type StaffMember = { person: Person; role: string };

const isPerson = (value: unknown): value is Person =>
  typeof value === "object" && value !== null && "name" in value;

export function teamStaff(
  team: Pick<Team, "staff" | "trainers">,
): StaffMember[] {
  const fromStaff = (team.staff ?? []).flatMap((entry) =>
    isPerson(entry.person)
      ? [
          {
            person: entry.person,
            role: entry.role?.trim() || entry.person.role,
          },
        ]
      : [],
  );
  if (fromStaff.length > 0) return fromStaff;

  return (team.trainers ?? []).flatMap((p) =>
    isPerson(p) ? [{ person: p, role: p.role }] : [],
  );
}
