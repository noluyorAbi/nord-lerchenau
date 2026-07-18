import { describe, expect, test } from "vitest";

import { shouldPreserveExistingDescription } from "@/lib/team-description-guard";

describe("shouldPreserveExistingDescription", () => {
  test("preserves an already-set description", () => {
    expect(
      shouldPreserveExistingDescription({ root: { children: [{}] } }),
    ).toBe(true);
  });

  test("does not preserve when there is no description yet", () => {
    expect(shouldPreserveExistingDescription(null)).toBe(false);
    expect(shouldPreserveExistingDescription(undefined)).toBe(false);
  });
});
