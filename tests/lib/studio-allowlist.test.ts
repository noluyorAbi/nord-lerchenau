import { describe, expect, it } from "vitest";

import {
  checkChangedPaths,
  flagSensitiveContent,
  isPathAllowed,
} from "@/lib/studio/allowlist";

describe("studio allowlist — allowed paths", () => {
  it.each([
    "app/(frontend)/page.tsx",
    "app/(frontend)/turnier/page.tsx",
    "components/home/Hero.tsx",
    "components/NewSection.tsx",
    "public/img/foto.jpg",
    "app/globals.css",
  ])("allows %s", (p) => {
    expect(isPathAllowed(p)).toBe(true);
  });
});

describe("studio allowlist — denied paths (the security boundary)", () => {
  it.each([
    "payload/collections/Users.ts",
    "payload/access/isAdmin.ts",
    "payload.config.ts",
    "payload-types.ts",
    "lib/payload.ts",
    "lib/studio/allowlist.ts",
    "scripts/seed.ts",
    "app/(payload)/admin/importMap.js",
    "app/(frontend)/api/contact/route.ts",
    "app/(frontend)/api/agent/callback/route.ts",
    ".env",
    ".env.local",
    "config/.env.production",
    "package.json",
    "bun.lock",
    "next.config.ts",
    ".github/workflows/studio-agent.yml",
    "middleware.ts",
    "../outside-repo.ts",
    "app/(frontend)/../../etc/passwd",
  ])("denies %s", (p) => {
    expect(isPathAllowed(p)).toBe(false);
  });

  it("normalises ./ and leading slashes", () => {
    expect(isPathAllowed("./components/x.tsx")).toBe(true);
    expect(isPathAllowed("/components/x.tsx")).toBe(true);
  });
});

describe("checkChangedPaths", () => {
  it("passes a clean frontend diff", () => {
    const r = checkChangedPaths([
      "app/(frontend)/page.tsx",
      "components/home/Hero.tsx",
    ]);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it("fails and reports any out-of-scope path", () => {
    const r = checkChangedPaths([
      "components/Ok.tsx",
      "payload/collections/Users.ts",
      ".env.local",
    ]);
    expect(r.ok).toBe(false);
    expect(r.violations).toContain("payload/collections/Users.ts");
    expect(r.violations).toContain(".env.local");
    expect(r.violations).not.toContain("components/Ok.tsx");
  });
});

describe("flagSensitiveContent", () => {
  it("flags frontend code that reaches the data layer / secrets", () => {
    expect(
      flagSensitiveContent(`import { getPayloadClient } from "@/lib/payload";`)
        .length,
    ).toBeGreaterThan(0);
    expect(
      flagSensitiveContent(`const k = process.env.PAYLOAD_SECRET;`).length,
    ).toBeGreaterThan(0);
  });

  it("does not flag plain presentational code", () => {
    expect(
      flagSensitiveContent(`export function Hero() { return <div>Hi</div>; }`),
    ).toEqual([]);
  });
});
