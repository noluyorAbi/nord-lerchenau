import { describe, expect, it } from "vitest";

import {
  decideConfirm,
  decideRevoke,
  generateToken,
  hashToken,
  isPendingExpired,
  PENDING_TTL_MS,
  photoConsentSchema,
  teamPhotoAllowed,
  tokenSchema,
} from "@/lib/photo-consent";

const valid = {
  team: "12",
  childName: "Max Muster",
  parentName: "Erika Muster",
  email: "Erika@Example.org",
  consent: true,
  website: "",
};

describe("photoConsentSchema", () => {
  it("accepts a complete submission and coerces the team id", () => {
    const parsed = photoConsentSchema.parse(valid);
    expect(parsed.team).toBe(12);
  });

  it("rejects a submission without the consent box ticked", () => {
    const result = photoConsentSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects a missing team", () => {
    const result = photoConsentSchema.safeParse({ ...valid, team: "" });
    expect(result.success).toBe(false);
  });

  it("lets a filled honeypot through so the route can fake success", () => {
    const parsed = photoConsentSchema.parse({ ...valid, website: "x" });
    expect(parsed.website).toBe("x");
  });
});

describe("tokens", () => {
  it("returns a url-safe token whose hash matches", () => {
    const { token, tokenHash } = generateToken();
    expect(tokenSchema.safeParse({ token }).success).toBe(true);
    expect(tokenHash).toBe(hashToken(token));
    expect(tokenHash).not.toContain(token);
  });

  it("never repeats a token", () => {
    expect(generateToken().token).not.toBe(generateToken().token);
  });

  it("rejects a malformed token", () => {
    expect(tokenSchema.safeParse({ token: "../etc" }).success).toBe(false);
  });
});

describe("expiry and decisions", () => {
  const now = new Date("2026-10-26T12:00:00Z");
  const fresh = new Date(now.getTime() - 60_000);
  const old = new Date(now.getTime() - PENDING_TTL_MS - 1);

  it("expires pending entries after the TTL", () => {
    expect(isPendingExpired(fresh, now)).toBe(false);
    expect(isPendingExpired(old, now)).toBe(true);
    expect(isPendingExpired("not a date", now)).toBe(true);
  });

  it("confirms only fresh pending entries", () => {
    expect(decideConfirm("offen", fresh, now)).toEqual({
      ok: true,
      next: "bestaetigt",
    });
    expect(decideConfirm("offen", old, now)).toEqual({
      ok: false,
      reason: "abgelaufen",
    });
    expect(decideConfirm("bestaetigt", fresh, now)).toEqual({
      ok: false,
      reason: "schon-bestaetigt",
    });
    expect(decideConfirm("widerrufen", fresh, now)).toEqual({
      ok: false,
      reason: "widerrufen",
    });
  });

  it("revokes from any state except revoked", () => {
    expect(decideRevoke("offen").ok).toBe(true);
    expect(decideRevoke("bestaetigt").ok).toBe(true);
    expect(decideRevoke("widerrufen").ok).toBe(false);
  });
});

describe("teamPhotoAllowed", () => {
  it("shows photos unless the club hid them", () => {
    expect(teamPhotoAllowed({})).toBe(true);
    expect(teamPhotoAllowed({ hidePhoto: null })).toBe(true);
    expect(teamPhotoAllowed({ hidePhoto: false })).toBe(true);
    expect(teamPhotoAllowed({ hidePhoto: true })).toBe(false);
  });
});
