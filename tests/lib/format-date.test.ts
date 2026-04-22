import { describe, expect, test } from "vitest";

import {
  formatKickoff,
  formatEventDate,
  formatShortDate,
} from "@/lib/format-date";

describe("formatKickoff", () => {
  test("formats a Saturday kickoff as 'Sa, 14:30'", () => {
    const d = new Date("2026-04-18T14:30:00+02:00");
    expect(formatKickoff(d)).toBe("Sa, 14:30");
  });

  test("formats a Sunday kickoff as 'So, 10:45'", () => {
    const d = new Date("2026-04-19T10:45:00+02:00");
    expect(formatKickoff(d)).toBe("So, 10:45");
  });
});

describe("formatEventDate", () => {
  test("formats as '23. Apr 2026'", () => {
    const d = new Date("2026-04-23T16:30:00+02:00");
    expect(formatEventDate(d)).toBe("23. Apr 2026");
  });
});

describe("formatShortDate", () => {
  test("formats as '23.04.'", () => {
    const d = new Date("2026-04-23T16:30:00+02:00");
    expect(formatShortDate(d)).toBe("23.04.");
  });
});
