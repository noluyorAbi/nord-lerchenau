import type {
  Access,
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  Field,
  FieldAccess,
} from "payload";
import { describe, expect, it, vi } from "vitest";

import { PAPER_CONSENT_TEXT } from "@/lib/photo-consent";
import { PhotoConsents } from "@/payload/collections/PhotoConsents";
import {
  fillManualConsent,
  hidePhotoOnRevoke,
  PHOTO_HANDLED,
  stampStatusChange,
} from "@/payload/hooks/photoConsent";

type AfterArgs = Parameters<CollectionAfterChangeHook>[0];
type BeforeArgs = Parameters<CollectionBeforeChangeHook>[0];
type ValidateArgs = Parameters<CollectionBeforeValidateHook>[0];

function revoke(opts: {
  before: string;
  team?: unknown;
  operation?: "create" | "update";
  context?: Record<string, unknown>;
}) {
  const update = vi.fn();
  const args = {
    doc: { status: "widerrufen", team: opts.team ?? 7 },
    previousDoc: { status: opts.before },
    operation: opts.operation ?? "update",
    context: opts.context ?? {},
    req: { payload: { update } },
  } as unknown as AfterArgs;
  return { update, run: () => hidePhotoOnRevoke(args) };
}

describe("hidePhotoOnRevoke", () => {
  it("hides the team photo when a confirmed consent is revoked", async () => {
    for (const team of [7, { id: 7, name: "A1" }]) {
      const { update, run } = revoke({ before: "bestaetigt", team });
      await run();
      expect(update).toHaveBeenCalledOnce();
      expect(update.mock.calls[0][0]).toMatchObject({
        collection: "teams",
        id: 7,
        data: { hidePhoto: true },
      });
    }
  });

  it("leaves the photo alone for unconfirmed entries, creates and the route", async () => {
    for (const opts of [
      { before: "offen" },
      { before: "widerrufen" },
      { before: "bestaetigt", operation: "create" as const },
      { before: "bestaetigt", context: { [PHOTO_HANDLED]: true } },
    ]) {
      const { update, run } = revoke(opts);
      await run();
      expect(update).not.toHaveBeenCalled();
    }
  });
});

describe("fillManualConsent", () => {
  const run = (data: Record<string, unknown>, operation = "create") =>
    fillManualConsent({ data, operation } as unknown as ValidateArgs) as Record<
      string,
      unknown
    >;

  it("gives a paper entry a token hash and the paper text", () => {
    const data = run({ source: "papier" });
    expect(data.consentText).toBe(PAPER_CONSENT_TEXT);
    expect(data.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keeps explicit values and never touches updates", () => {
    const explicit = run({
      source: "online",
      consentText: "Formulartext",
      tokenHash: "abc",
    });
    expect(explicit).toMatchObject({
      consentText: "Formulartext",
      tokenHash: "abc",
    });
    expect(run({ status: "widerrufen" }, "update")).toEqual({
      status: "widerrufen",
    });
  });
});

describe("stampStatusChange", () => {
  const run = (data: Record<string, unknown>, originalDoc?: object) =>
    stampStatusChange({ data, originalDoc } as unknown as BeforeArgs) as Record<
      string,
      unknown
    >;

  it("stamps a manual revocation and keeps the original confirmation date", () => {
    const data = run(
      { status: "widerrufen" },
      { status: "bestaetigt", confirmedAt: "2026-10-01T00:00:00.000Z" },
    );
    expect(data.revokedAt).toEqual(expect.any(String));
    expect(data.confirmedAt).toBeUndefined();
  });

  it("does not restamp an already confirmed entry", () => {
    const data = run(
      { notes: "x" },
      { status: "bestaetigt", confirmedAt: "2026-10-01T00:00:00.000Z" },
    );
    expect(data).toEqual({ notes: "x" });
  });
});

function field(name: string): Field & Record<string, unknown> {
  const f = PhotoConsents.fields.find(
    (x: Field) => "name" in x && x.name === name,
  );
  if (!f) throw new Error(`photo-consents.${name} missing`);
  return f as Field & Record<string, unknown>;
}

describe("photo-consents rules", () => {
  it("defaults admin entries to paper and confirmed, form entries to online and open", () => {
    for (const [name, admin, anonymous] of [
      ["source", "papier", "online"],
      ["status", "bestaetigt", "offen"],
    ]) {
      const dv = field(name).defaultValue as (a: { user: unknown }) => string;
      expect(dv({ user: { id: 1 } })).toBe(admin);
      expect(dv({ user: null })).toBe(anonymous);
    }
  });

  it("lets only logged-in users create and nobody change the source", async () => {
    const create = PhotoConsents.access?.create as Access;
    expect(await create({ req: { user: null } } as Parameters<Access>[0])).toBe(
      false,
    );
    expect(
      await create({
        req: { user: { id: 1 } },
      } as unknown as Parameters<Access>[0]),
    ).toBe(true);
    const update = (field("source").access as { update: FieldAccess }).update;
    expect(
      await update({
        req: { user: { id: 1 } },
      } as unknown as Parameters<FieldAccess>[0]),
    ).toBe(false);
  });
});
