/**
 * Capture desktop + mobile screenshots of the ready preview deployment and
 * upload them to Vercel Blob (public URLs). Prints a JSON array
 * [{ label, url }] on stdout for the workflow to inject into the callback body
 * as `previewShots`. Runs in GitHub Actions AFTER the branch is pushed and the
 * Vercel preview is READY (see .github/workflows/studio-agent.yml).
 *
 * Env: PREVIEW_URL (required), STUDIO_REQUEST_ID, BLOB_READ_WRITE_TOKEN,
 *      STUDIO_PREVIEW_BYPASS (optional Vercel Protection-Bypass token sent as a
 *      request HEADER so a protected preview can be rendered headlessly).
 *
 * Security: runs after the agent, in a separate CI step the agent never enters.
 * The agent has no Bash/network tools and its env is stripped of these secrets
 * (see scripts/studio/run-agent.ts). The browser renders the preview REMOTELY on
 * Vercel; it never has access to the Action's secrets. The bypass token is sent
 * as an HTTP header (never in the URL), so the agent-authored page JS cannot read
 * it from location.search and exfiltrate it.
 */
import { readFileSync } from "node:fs";

import { put } from "@vercel/blob";
// playwright-core: no browser download on install (kept out of the Vercel build);
// the CI step installs the chromium binary separately.
import { chromium } from "playwright-core";

const previewUrl = process.env.PREVIEW_URL;
if (!previewUrl) {
  console.error("[screenshot] PREVIEW_URL is required");
  process.exit(1);
}

const requestId =
  (process.env.STUDIO_REQUEST_ID ?? "0").replace(/\D/g, "") || "0";
const token = process.env.BLOB_READ_WRITE_TOKEN;
const bypass = process.env.STUDIO_PREVIEW_BYPASS;
// Bypass Vercel Deployment Protection via a request header (NOT a URL query
// param), so the token never lands in location.search where the agent-authored
// preview page could read and exfiltrate it.
const extraHTTPHeaders = bypass
  ? { "x-vercel-protection-bypass": bypass }
  : undefined;

const viewports = [
  { label: "Desktop", width: 1440, height: 900 },
  { label: "Handy", width: 390, height: 844 },
];

const shots: { label: string; url: string }[] = [];

const browser = await chromium.launch();
try {
  for (const v of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      deviceScaleFactor: 2,
      ...(extraHTTPHeaders ? { extraHTTPHeaders } : {}),
    });
    const page = await ctx.newPage();
    try {
      await page.goto(previewUrl, { waitUntil: "load", timeout: 60_000 });
      // Give client components / fonts a moment to settle.
      await page.waitForTimeout(1500);
      const file = `/tmp/studio-${v.label}.png`;
      await page.screenshot({ path: file, fullPage: false });
      const { url } = await put(
        `studio/${requestId}/${v.label.toLowerCase()}-${process.env.GITHUB_RUN_ID ?? "run"}.png`,
        readFileSync(file),
        { access: "public", contentType: "image/png", token },
      );
      shots.push({ label: v.label, url });
    } catch (e) {
      console.error(`[screenshot] ${v.label} failed: ${e}`);
    } finally {
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}

process.stdout.write(JSON.stringify(shots));
