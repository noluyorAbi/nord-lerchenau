import { afterEach, describe, expect, it, vi } from "vitest";

// lib/publicUploads reads public/uploads once at module scope and caches it, and
// it reads NEXT_PUBLIC_PREFER_UPLOADED_MEDIA at import time. Both are therefore
// set up per test through a fresh module registry rather than in a shared setup.
const FILES = [
  "Ralf_Kirmeyer.jpg",
  "Bini_Hafner-1.webp",
  "sponsor-swm.webp",
  "g-junioren.jpg",
];

async function loadModule(prefer: boolean) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_PREFER_UPLOADED_MEDIA", prefer ? "true" : "false");
  vi.doMock("node:fs", () => ({
    default: { readdirSync: () => FILES },
    readdirSync: () => FILES,
  }));
  return import("@/lib/publicUploads");
}

const BLOB = "https://store.public.blob.vercel-storage.com/Neues_Bild.webp";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock("node:fs");
});

describe("publicUploadSrc", () => {
  it("resolves against the mocked listing, not the real directory", async () => {
    const { publicUploadSrc } = await loadModule(false);
    // Guards the mock itself: FILES is the only source of truth here, so a name
    // that exists only in FILES resolves and one that exists only on disk does
    // not. Without this the suite could pass while reading public/uploads.
    expect(publicUploadSrc("g-junioren.webp")).toBe("/uploads/g-junioren.jpg");
    expect(publicUploadSrc("sponsor1.avif")).toBeNull();
  });

  it("matches a committed asset regardless of extension drift", async () => {
    const { publicUploadSrc } = await loadModule(false);
    // Payload stores the processed .webp, the committed twin is the .jpg.
    expect(publicUploadSrc("Ralf_Kirmeyer.webp")).toBe(
      "/uploads/Ralf_Kirmeyer.jpg",
    );
  });

  it("strips the Payload -N re-upload suffix", async () => {
    const { publicUploadSrc } = await loadModule(false);
    expect(publicUploadSrc("Ralf_Kirmeyer-28.webp")).toBe(
      "/uploads/Ralf_Kirmeyer.jpg",
    );
  });

  it("returns null for a name with no committed twin", async () => {
    const { publicUploadSrc } = await loadModule(false);
    expect(publicUploadSrc("Neues_Bild.webp")).toBeNull();
    expect(publicUploadSrc(null)).toBeNull();
  });
});

describe("mediaSrc with NEXT_PUBLIC_PREFER_UPLOADED_MEDIA off", () => {
  it("serves a newly uploaded image from its blob URL", async () => {
    const { mediaSrc } = await loadModule(false);
    // The whole point of the fix: a name the club invents has no committed twin,
    // so the absolute storage URL is what renders.
    expect(mediaSrc({ filename: "Neues_Bild.webp", url: BLOB })).toBe(BLOB);
  });

  it("keeps serving the committed asset for a legacy document", async () => {
    const { mediaSrc } = await loadModule(false);
    // Legacy rows still carry a Payload route URL whose bytes are not in the
    // store yet, so the committed file has to win until the media migration ran.
    expect(
      mediaSrc({
        filename: "Ralf_Kirmeyer-28.webp",
        url: "/api/media/file/Ralf_Kirmeyer-28.webp",
      }),
    ).toBe("/uploads/Ralf_Kirmeyer.jpg");
  });

  it("lets a committed asset shadow a replacement upload", async () => {
    const { mediaSrc } = await loadModule(false);
    // Documents the known limitation of this mode: re-uploading an image whose
    // name collides with a committed asset has no visible effect until the flag
    // is flipped. Encoded as a test so flipping it is a deliberate change.
    expect(
      mediaSrc({
        filename: "Ralf_Kirmeyer.webp",
        url: "https://store.public.blob.vercel-storage.com/Ralf_Kirmeyer.webp",
      }),
    ).toBe("/uploads/Ralf_Kirmeyer.jpg");
  });

  it("returns null for an unpopulated relation", async () => {
    const { mediaSrc } = await loadModule(false);
    expect(mediaSrc(null)).toBeNull();
    expect(mediaSrc(42)).toBeNull();
  });
});

describe("mediaSrc with NEXT_PUBLIC_PREFER_UPLOADED_MEDIA on", () => {
  it("lets a replacement upload win over the committed asset", async () => {
    const { mediaSrc } = await loadModule(true);
    const replaced =
      "https://store.public.blob.vercel-storage.com/Ralf_Kirmeyer.webp";
    expect(mediaSrc({ filename: "Ralf_Kirmeyer.webp", url: replaced })).toBe(
      replaced,
    );
  });

  it("still falls back to the committed asset for a relative URL", async () => {
    const { mediaSrc } = await loadModule(true);
    // A relative URL is not a real uploaded asset, so it must never beat the
    // committed file even in this mode.
    expect(
      mediaSrc({
        filename: "Ralf_Kirmeyer.webp",
        url: "/api/media/file/Ralf_Kirmeyer.webp",
      }),
    ).toBe("/uploads/Ralf_Kirmeyer.jpg");
  });
});
