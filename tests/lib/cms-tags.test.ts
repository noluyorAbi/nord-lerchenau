import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CACHED_COLLECTIONS,
  CACHED_GLOBALS,
  collectionTag,
  FULL_REVALIDATE_GLOBALS,
  globalTag,
  TIME_WINDOWED_REVALIDATE_SECONDS,
  UNCACHED_COLLECTIONS,
} from "@/lib/cms";

/**
 * The CMS revalidation hooks and the tag registry in lib/cms.ts are two halves
 * of one contract, wired together only by matching strings. When they drifted
 * apart the failure was silent: the faq-page global fired a hook that no
 * registry entry matched, so /faq served stale content indefinitely with
 * nothing in the logs. These tests read the payload directory directly so that
 * adding a collection or global without registering it fails the build.
 */

const ROOT = path.resolve(__dirname, "..", "..");

function resourcesFrom(dir: string, hookName: string): string[] {
  const full = path.join(ROOT, "payload", dir);
  const found: string[] = [];
  for (const file of readdirSync(full)) {
    if (!file.endsWith(".ts")) continue;
    const source = readFileSync(path.join(full, file), "utf8");
    for (const match of source.matchAll(
      new RegExp(`${hookName}\\(\\s*["'\`]([^"'\`]+)["'\`]\\s*\\)`, "g"),
    )) {
      found.push(match[1]);
    }
  }
  return found;
}

describe("cache tag registry", () => {
  it("covers every collection that fires a revalidate hook", () => {
    const hooked = resourcesFrom("collections", "revalidateOnChange");

    expect(hooked.length).toBeGreaterThan(0);
    for (const resource of hooked) {
      expect(
        CACHED_COLLECTIONS.has(resource) || UNCACHED_COLLECTIONS.has(resource),
        `collection "${resource}" fires a revalidate hook but is in neither CACHED_COLLECTIONS nor UNCACHED_COLLECTIONS`,
      ).toBe(true);
    }
  });

  it("covers every global that fires a revalidate hook", () => {
    const hooked = resourcesFrom("globals", "revalidateGlobalOnChange");

    expect(hooked.length).toBeGreaterThan(0);
    for (const resource of hooked) {
      expect(
        CACHED_GLOBALS.has(resource),
        `global "${resource}" fires a revalidate hook but is missing from CACHED_GLOBALS`,
      ).toBe(true);
    }
  });

  it("registers no collection as both cached and uncached", () => {
    const overlap = [...CACHED_COLLECTIONS].filter((c) =>
      UNCACHED_COLLECTIONS.has(c),
    );
    expect(overlap).toEqual([]);
  });

  it("only escalates globals that actually exist", () => {
    for (const resource of FULL_REVALIDATE_GLOBALS) {
      expect(
        CACHED_GLOBALS.has(resource),
        `"${resource}" triggers a full layout revalidate but is not a known global`,
      ).toBe(true);
    }
  });

  it("keeps the route revalidate literals equal to the shared constant", () => {
    // Next only accepts a literal in `export const revalidate`, so these three
    // routes cannot import TIME_WINDOWED_REVALIDATE_SECONDS. Without this test
    // the duplication drifts silently and a page stops refreshing its
    // time-windowed data as often as the data itself expires.
    const routes = [
      "app/(frontend)/page.tsx",
      "app/(frontend)/termine/page.tsx",
      "app/(frontend)/fussball/[team]/page.tsx",
    ];

    for (const route of routes) {
      const source = readFileSync(path.join(ROOT, route), "utf8");
      const match = source.match(/export const revalidate = (\d+);/);
      expect(match, `${route} must export a literal revalidate`).not.toBeNull();
      expect(
        Number(match![1]),
        `${route} revalidate must equal TIME_WINDOWED_REVALIDATE_SECONDS`,
      ).toBe(TIME_WINDOWED_REVALIDATE_SECONDS);
    }
  });

  it("namespaces tags so a collection and a global can never collide", () => {
    expect(collectionTag("posts")).toBe("collection:posts");
    expect(globalTag("posts")).toBe("global:posts");
    expect(collectionTag("posts")).not.toBe(globalTag("posts"));
  });
});
