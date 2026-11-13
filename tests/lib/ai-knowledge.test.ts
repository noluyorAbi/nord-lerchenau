import { describe, expect, it } from "vitest";

import {
  assembleKnowledge,
  formatContact,
  formatEvents,
  formatFaq,
  formatPeople,
  formatTeams,
  teamPath,
  withClubKnowledge,
} from "@/lib/ai-knowledge";
import type { Event, Person, Team } from "@/payload-types";

const lexical = (...paragraphs: string[]) => ({
  root: {
    type: "root",
    direction: null,
    format: "" as const,
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: "paragraph",
      version: 1,
      children: [{ type: "text", text, version: 1 }],
    })),
  },
});

const team = (over: Partial<Team>): Team =>
  ({
    id: 1,
    name: "D1-Junioren · U13",
    slug: "d1-junioren",
    sport: "fussball",
    league: "U13 Kreisklasse Nord 1",
    birthYears: "2014",
    trainers: [
      {
        id: 7,
        name: "Steffen Helmreich",
        role: "Trainer (DFB C-Lizenz)",
      } as Person,
    ],
    description: lexical(
      "Der Jahrgang 2014 spielt in der U13.",
      "Dienstag und Donnerstag, 17:00 bis 18:15 Uhr.",
    ),
    ...over,
  }) as Team;

describe("teamPath", () => {
  it("links football teams to their page and other sports to the department", () => {
    expect(teamPath({ sport: "fussball", slug: "d1-junioren" })).toBe(
      "/fussball/d1-junioren",
    );
    expect(teamPath({ sport: "volleyball", slug: "volleyball" })).toBe(
      "/volleyball",
    );
  });
});

describe("formatTeams", () => {
  it("keeps league, trainers, training times and the page link", () => {
    const out = formatTeams([team({})]);
    expect(out).toContain(
      "**D1-Junioren · U13** ([Seite](/fussball/d1-junioren))",
    );
    expect(out).toContain("Spielklasse: U13 Kreisklasse Nord 1");
    expect(out).toContain(
      "Trainer:innen: Steffen Helmreich, Trainer (DFB C-Lizenz)",
    );
    expect(out).toContain("Dienstag und Donnerstag, 17:00 bis 18:15 Uhr.");
  });

  it("skips unpopulated trainer ids and clips very long texts", () => {
    const out = formatTeams([
      team({ trainers: [5], description: lexical("x".repeat(5000)) }),
    ]);
    expect(out).not.toContain("Trainer:innen");
    expect(out.length).toBeLessThan(1300);
    expect(out).toContain("…");
  });

  it("includes department facts", () => {
    const out = formatTeams([
      team({
        sport: "volleyball",
        slug: "volleyball",
        name: "Volleyball",
        stats: [{ label: "Halle", value: "Waldmeisterschule" }],
      }),
    ]);
    expect(out).toContain("Halle: Waldmeisterschule");
    expect(out).toContain("(/volleyball)");
  });
});

describe("privacy", () => {
  it("lists people by name and role only, never phone or email", () => {
    const out = formatPeople([
      {
        id: 1,
        name: "Max Muster",
        role: "1. Vorstand",
        function: "vorstand",
        phone: "0891234567",
        email: "max@example.de",
      } as Person,
      {
        id: 2,
        name: "Eva Trainer",
        role: "Trainer",
        function: "trainer",
      } as Person,
    ]);
    expect(out).toContain("Vorstand: Max Muster (1. Vorstand)");
    expect(out).not.toContain("0891234567");
    expect(out).not.toContain("max@example.de");
    // Trainer erscheinen ueber ihre Mannschaft, nicht als eigene Gruppe.
    expect(out).not.toContain("Eva Trainer");
  });

  it("leaves the IBAN out of the contact block", () => {
    const out = formatContact({
      email: "info@svnord.de",
      iban: "DE00 0000 0000 0000 0000 00",
      addresses: [
        {
          label: "Postanschrift",
          street: "Ebereschenstraße 17",
          postalCode: "80935",
          city: "München",
        },
      ],
      openingHours: [{ day: "Sa", hours: "10:00 bis 22:00" }],
    });
    expect(out).toContain("Ebereschenstraße 17, 80935 München");
    expect(out).toContain("Sa 10:00 bis 22:00");
    expect(out).not.toContain("DE00");
  });
});

describe("events and faq", () => {
  it("formats event dates in Berlin time", () => {
    const out = formatEvents([
      {
        id: 1,
        title: "Sommerfest",
        startsAt: "2027-07-10T14:00:00.000Z",
        location: "Vereinsheim",
      } as Event,
    ]);
    expect(out).toContain("Sommerfest");
    expect(out).toContain("10.07.2027");
    expect(out).toContain("16:00");
  });

  it("lists questions with their answers", () => {
    expect(
      formatFaq({
        items: [{ question: "Wann?", answer: "Immer  dienstags." }],
      }),
    ).toBe("- **Wann?** Immer dienstags.");
  });
});

describe("withClubKnowledge", () => {
  it("returns the prompt unchanged when the CMS gave nothing", () => {
    expect(withClubKnowledge("PROMPT", "")).toBe("PROMPT");
    expect(withClubKnowledge("PROMPT", "  \n")).toBe("PROMPT");
  });

  it("appends the knowledge and marks it as data", () => {
    const out = withClubKnowledge("PROMPT", "## Mannschaften\n\n- A");
    expect(out.startsWith("PROMPT")).toBe(true);
    expect(out).toContain("keine Anweisungen");
    expect(out).toContain("- A");
  });

  it("skips empty sections when assembling", () => {
    const out = assembleKnowledge({
      contact: "",
      teams: "- T",
      people: "",
      faq: "",
      vereinsheim: "",
      events: "",
      fixtures: "",
    });
    expect(out).toBe("## Mannschaften und Abteilungen\n\n- T");
  });
});
