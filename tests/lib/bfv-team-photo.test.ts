import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { isBfvRealTeamPhoto, resolveBfvTeamPhoto } from "@/lib/bfv";

// Messwerte vom 2026-08-07 über alle 20 Team-IDs des Vereins.
const CREST_BYTES = 48419;
const PHOTO_BYTES = 196831;
const PHOTO_URL =
  "https://images.media.fussball.de/userfiles/A/X/I/nykN51qHTdqMhEEImdFAQz_t3.jpg";
const PLACEHOLDER_URL =
  "https://www.fussball.de/static/cms/5.00.42.1358/images/components/team/placeholder_team_image_890x500.png";

describe("isBfvRealTeamPhoto", () => {
  test("rejects the fussball.de placeholder png", () => {
    expect(isBfvRealTeamPhoto(PLACEHOLDER_URL, 7950)).toBe(false);
  });

  test("rejects a crest crop by its known file size", () => {
    expect(isBfvRealTeamPhoto(PHOTO_URL, CREST_BYTES)).toBe(false);
  });

  test("accepts a real team photo", () => {
    expect(isBfvRealTeamPhoto(PHOTO_URL, PHOTO_BYTES)).toBe(true);
  });

  test("accepts when the server sends no content-length", () => {
    expect(isBfvRealTeamPhoto(PHOTO_URL, null)).toBe(true);
  });
});

function mockHead(status: number, bytes: number | null, finalUrl: string) {
  const fetchMock = vi.fn(async () => {
    const headers = new Headers();
    if (bytes !== null) headers.set("content-length", String(bytes));
    const res = new Response(null, { status, headers });
    Object.defineProperty(res, "url", { value: finalUrl });
    return res;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("resolveBfvTeamPhoto", () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  test("returns null without a team id and never hits the network", async () => {
    const fetchMock = mockHead(200, PHOTO_BYTES, PHOTO_URL);
    await expect(resolveBfvTeamPhoto(null)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("keeps the url for a real photo", async () => {
    mockHead(200, PHOTO_BYTES, PHOTO_URL);
    await expect(resolveBfvTeamPhoto("REALPHOTOID")).resolves.toBe(
      "https://service.media.fussball.de/api/uimg/cont/-/ID/REALPHOTOID/TYP/50/SZ/3",
    );
  });

  test("drops a crest crop", async () => {
    mockHead(200, CREST_BYTES, PHOTO_URL);
    await expect(resolveBfvTeamPhoto("CRESTID")).resolves.toBeNull();
  });

  test("drops the placeholder image", async () => {
    mockHead(200, 7950, PLACEHOLDER_URL);
    await expect(resolveBfvTeamPhoto("PLACEHOLDERID")).resolves.toBeNull();
  });

  test("fails open on a network error so an outage cannot blank a hero", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    await expect(resolveBfvTeamPhoto("OUTAGEID")).resolves.toBe(
      "https://service.media.fussball.de/api/uimg/cont/-/ID/OUTAGEID/TYP/50/SZ/3",
    );
  });

  test("memoizes per team id", async () => {
    const fetchMock = mockHead(200, PHOTO_BYTES, PHOTO_URL);
    await resolveBfvTeamPhoto("MEMOID");
    await resolveBfvTeamPhoto("MEMOID");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
