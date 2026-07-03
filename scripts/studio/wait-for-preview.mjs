/**
 * Wait for the Vercel preview of the just-pushed studio branch to be READY,
 * then print its URL on stdout. Used by .github/workflows/studio-agent.yml
 * before capturing screenshots.
 *
 * Two modes:
 *  - With VERCEL_TOKEN + VERCEL_PROJECT_ID: poll the Vercel Deployments API keyed
 *    on the pushed commit SHA. This is exact — it never returns a stale alias,
 *    which matters because the studio-<id> branch is force-pushed and reused
 *    across feedback iterations.
 *  - Without a token: fall back to polling the STUDIO_PREVIEW_URL_TEMPLATE alias
 *    for HTTP 200 after a short settle delay (best-effort; may catch a stale
 *    deploy on iteration >= 2).
 *
 * Usage: node scripts/studio/wait-for-preview.mjs <commitSha>
 * Exits 0 and prints the URL on success; exits 1 (no output) on timeout/error.
 * The workflow step is continue-on-error, so a failure just means "no shots".
 */

const sha = process.argv[2];
const TIMEOUT_MS = 5 * 60_000;
const deadline = Date.now() + TIMEOUT_MS;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const {
  VERCEL_TOKEN,
  VERCEL_PROJECT_ID,
  VERCEL_TEAM_ID,
  STUDIO_PREVIEW_URL_TEMPLATE,
  BRANCH,
} = process.env;

function fail(msg) {
  if (msg) console.error(`[wait-for-preview] ${msg}`);
  process.exit(1);
}

async function viaVercelApi() {
  const base =
    `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(VERCEL_PROJECT_ID)}` +
    (VERCEL_TEAM_ID ? `&teamId=${encodeURIComponent(VERCEL_TEAM_ID)}` : "") +
    `&limit=25`;
  for (;;) {
    if (Date.now() > deadline) fail("preview timeout (api)");
    try {
      const res = await fetch(base, {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      });
      if (res.ok) {
        const { deployments = [] } = await res.json();
        const d = deployments.find((x) => x?.meta?.githubCommitSha === sha);
        if (d?.readyState === "READY") {
          process.stdout.write(`https://${d.url}`);
          return;
        }
        if (d?.readyState === "ERROR" || d?.readyState === "CANCELED") {
          fail(`deploy ${d.readyState}`);
        }
      }
    } catch (e) {
      console.error(`[wait-for-preview] api error: ${e}`);
    }
    await sleep(5000);
  }
}

async function viaAliasPoll() {
  if (!STUDIO_PREVIEW_URL_TEMPLATE || !BRANCH) {
    fail("no VERCEL_TOKEN and no STUDIO_PREVIEW_URL_TEMPLATE/BRANCH — cannot resolve preview");
  }
  const url = STUDIO_PREVIEW_URL_TEMPLATE.split("{branch}").join(BRANCH);
  // Let the force-push supersede any prior deploy before we start checking.
  await sleep(25_000);
  for (;;) {
    if (Date.now() > deadline) fail("preview timeout (alias)");
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      if (res.status === 200) {
        process.stdout.write(url);
        return;
      }
    } catch {
      /* not up yet */
    }
    await sleep(5000);
  }
}

if (!sha) fail("missing commit SHA argument");
if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
  await viaVercelApi();
} else {
  await viaAliasPoll();
}
