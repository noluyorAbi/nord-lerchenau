import type { CollectionBeforeChangeHook } from "payload";
import { describe, expect, it } from "vitest";

import { fillSlugFrom } from "@/payload/hooks/fillSlug";

type HookArgs = Parameters<CollectionBeforeChangeHook>[0];

const run = (data: Record<string, unknown>, originalDoc?: { slug?: string }) =>
  fillSlugFrom("title")({ data, originalDoc } as unknown as HookArgs);

describe("fillSlugFrom", () => {
  it("derives a slug on create when none was given", () => {
    expect(run({ title: "Großer Sieg" })).toMatchObject({
      slug: "grosser-sieg",
    });
  });

  it("keeps the live URL when an update sends only the title", () => {
    const data = run({ title: "Neuer Titel" }, { slug: "alter-titel" });
    expect(data.slug).toBeUndefined();
  });

  it("never overwrites an explicit slug", () => {
    expect(run({ title: "Titel", slug: "eigener-slug" })).toMatchObject({
      slug: "eigener-slug",
    });
  });
});
