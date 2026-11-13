import { describe, expect, it } from "vitest";

import { teamStaff } from "@/lib/team-staff";
import type { Person } from "@/payload-types";

const person = (id: number, name: string, role: string) =>
  ({ id, name, role, function: "trainer" }) as Person;

describe("teamStaff", () => {
  it("uses the role of the team entry, not the role of the person", () => {
    const felix = person(5, "Felix Kirmeyer", "Sportlicher Leiter");
    const herren = teamStaff({
      staff: [{ person: felix, role: "Sportlicher Leiter (DFB C-Lizenz)" }],
    });
    const u40 = teamStaff({
      staff: [{ person: felix, role: "Ansprechpartner" }],
    });
    expect(herren[0].role).toBe("Sportlicher Leiter (DFB C-Lizenz)");
    expect(u40[0].role).toBe("Ansprechpartner");
  });

  it("keeps the order of the entries", () => {
    const out = teamStaff({
      staff: [
        { person: person(2, "B", "x"), role: "Co-Trainer" },
        { person: person(1, "A", "x"), role: "Trainer" },
      ],
    });
    expect(out.map((m) => m.person.name)).toEqual(["B", "A"]);
  });

  it("falls back to the person role when the entry has none", () => {
    const out = teamStaff({
      staff: [{ person: person(1, "A", "Trainer"), role: "  " }],
    });
    expect(out[0].role).toBe("Trainer");
  });

  it("falls back to the old trainers field while staff is empty", () => {
    const out = teamStaff({
      staff: [],
      trainers: [person(1, "A", "Trainer"), 99],
    });
    expect(out).toEqual([
      { person: expect.objectContaining({ name: "A" }), role: "Trainer" },
    ]);
  });

  it("prefers staff over the old field once it is filled", () => {
    const out = teamStaff({
      staff: [{ person: person(1, "A", "Trainer"), role: "Torwart-Trainer" }],
      trainers: [person(2, "B", "Trainer")],
    });
    expect(out.map((m) => m.person.name)).toEqual(["A"]);
  });

  it("skips unpopulated references", () => {
    expect(teamStaff({ staff: [{ person: 7, role: "Trainer" }] })).toEqual([]);
  });
});
