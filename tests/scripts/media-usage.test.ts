import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  MEDIA_DEPENDENT_COLLECTIONS,
  MEDIA_DEPENDENT_GLOBALS,
} from "@/lib/cms";
import { COLLECTIONS, GLOBALS } from "@/scripts/media-usage";

/**
 * Der Bild-Verwendungsbericht schlägt dem Verein vor, welche Fotos gelöscht
 * werden können. Er zählt dafür jede Quelle ab, die auf `media` zeigen kann.
 * Fehlt eine, landen deren Bilder unter "ohne Fundstelle", also auf der
 * Löschliste, und ein Bild verschwindet von der Seite. Deshalb wird die
 * Quellenliste hier gegen das payload-Verzeichnis geprüft, statt sich auf das
 * Gedächtnis der nächsten Änderung zu verlassen.
 */

const ROOT = path.resolve(__dirname, "..", "..");

function slugsWithUploadField(dir: string): string[] {
  const full = path.join(ROOT, "payload", dir);
  const found: string[] = [];
  for (const file of readdirSync(full)) {
    if (!file.endsWith(".ts")) continue;
    const source = readFileSync(path.join(full, file), "utf8");
    if (!source.includes('relationTo: "media"')) continue;
    const slug = /slug:\s*["'`]([^"'`]+)["'`]/.exec(source)?.[1];
    if (slug) found.push(slug);
  }
  return found;
}

describe("media usage report", () => {
  it("checks every collection that can hold an image", () => {
    const withUploads = slugsWithUploadField("collections").filter(
      (slug) => slug !== "media",
    );

    expect(withUploads.length).toBeGreaterThan(0);
    for (const slug of withUploads) {
      expect(
        (COLLECTIONS as readonly string[]).includes(slug),
        `collection "${slug}" has an upload field but the media usage report never looks at it, so its images would be reported as safe to delete`,
      ).toBe(true);
    }
  });

  it("checks every global that can hold an image", () => {
    const withUploads = slugsWithUploadField("globals");
    const checked = GLOBALS.map(([slug]) => slug as string);

    expect(withUploads.length).toBeGreaterThan(0);
    for (const slug of withUploads) {
      expect(
        checked.includes(slug),
        `global "${slug}" has an upload field but the media usage report never looks at it, so its images would be reported as safe to delete`,
      ).toBe(true);
    }
  });
});

/**
 * Dieselbe Verzeichnisprüfung für die zweite Liste derselben Tatsache. Die
 * Registry in lib/cms.ts entscheidet, welche Caches ein neues Bild verwerfen
 * müssen. Fehlt dort eine Quelle, zeigt die Seite nach dem Austausch weiter das
 * alte Bild, und niemand sieht warum.
 */
describe("media dependent cache registry", () => {
  it("covers every collection that can hold an image", () => {
    for (const slug of slugsWithUploadField("collections").filter(
      (s) => s !== "media",
    )) {
      expect(
        (MEDIA_DEPENDENT_COLLECTIONS as readonly string[]).includes(slug),
        `collection "${slug}" has an upload field but is not in MEDIA_DEPENDENT_COLLECTIONS, so replacing one of its images would not refresh the pages that show it`,
      ).toBe(true);
    }
  });

  it("covers every global that can hold an image", () => {
    for (const slug of slugsWithUploadField("globals")) {
      expect(
        (MEDIA_DEPENDENT_GLOBALS as readonly string[]).includes(slug),
        `global "${slug}" has an upload field but is not in MEDIA_DEPENDENT_GLOBALS, so replacing one of its images would not refresh the pages that show it`,
      ).toBe(true);
    }
  });
});
