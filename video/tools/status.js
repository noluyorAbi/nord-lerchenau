#!/usr/bin/env node
// /demo-video - pipeline status, the first thing every session runs.
//
// Reports per scene which stage is done, missing or stale, so a re-invocation
// resumes instead of redoing paid work (TTS costs money, renders cost minutes).
// Staleness is mtime-based: a derived file older than any of its inputs is
// stale, same rule make uses. Read-only.

const fs = require("fs");
const {
  L,
  path,
  paths,
  loadStoryboard,
  loadNarration,
  sceneHash,
  narrationKey,
  assetPath,
  TTS_MODEL,
  voiceFor,
  readCosts,
  readClaudeLedger,
} = require("./lib");

const HELP = `demo-video status - where the pipeline stands (read-only)

USAGE  node video/tools/status.js [--json]

Validates video/storyboard.json, then reports per scene:
  capture   the referenced footage/ansi/image exists
  narrate   narration.json entry present and its hash matches the current text
  assemble / render / finish   file presence + mtime staleness

Exit 1 on storyboard validation errors, else 0.`;

const mtime = (f) => {
  try {
    return fs.statSync(f).mtimeMs;
  } catch (_) {
    return null;
  }
};

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return 0;
  }
  const json = args.includes("--json");
  const c = L.colors(json || !process.stdout.isTTY);

  const p = paths();
  if (!L.exists(p.video)) {
    console.log(
      `no video/ workspace in ${p.root}. Run /launch stage v2 first, then /demo-video stage 1 (plan).`,
    );
    return 0;
  }
  const { sb, errors } = loadStoryboard(p);
  if (!sb) {
    console.error(errors.join("\n"));
    return 1;
  }
  const narration = loadNarration(p);

  const scenes = sb.scenes.map((s) => {
    const asset =
      s.kind === "browser"
        ? s.footage
        : s.kind === "cli"
          ? s.ansi
          : s.kind === "still"
            ? s.image
            : null;
    const captured = !asset || L.exists(assetPath(p, asset));
    const n = narration.scenes[s.id];
    let narr = "silent";
    if (s.narration) {
      const v = voiceFor(sb, s);
      narr = !n
        ? "missing"
        : n.hash !==
            sceneHash(TTS_MODEL, v.voice, v.instructions, narrationKey(s))
          ? "stale (text, voice or delivery changed)"
          : !L.exists(path.join(p.video, "public", n.audio))
            ? "missing wav"
            : "ok";
    }
    return {
      id: s.id,
      kind: s.kind,
      capture: captured ? "ok" : `missing ${asset}`,
      narrate: narr,
    };
  });

  const inputs = [mtime(p.storyboard), mtime(p.narration)].filter(Boolean);
  const contentM = mtime(p.content);
  const renderState = (file) => {
    const m = mtime(path.join(p.out, file));
    return !m ? "missing" : contentM && contentM > m ? "stale" : "ok";
  };
  const renders = {
    vertical: renderState("vertical.mp4"),
    wide: renderState("wide.mp4"),
    "wide-long": renderState("wide-long.mp4"),
  };
  const newestRender = Math.max(
    ...["vertical.mp4", "wide.mp4", "wide-long.mp4"].map(
      (f) => mtime(path.join(p.out, f)) || 0,
    ),
  );
  const rootTs = L.readText(path.join(p.video, "src", "Root.tsx")) || "";
  const stage = {
    assemble: !contentM
      ? "missing"
      : inputs.some((m) => m > contentM)
        ? "stale"
        : "ok",
    renders,
    finish: L.exists(path.join(p.assets, "social-9x16.mp4"))
      ? newestRender &&
        mtime(path.join(p.assets, "social-9x16.mp4")) < newestRender
        ? "stale"
        : "ok"
      : "missing",
    unregistered: ["Vertical", "Wide", "WideLong"].filter(
      (id) => !new RegExp(`id="${id}"`).test(rootTs),
    ),
  };

  // Transparency: API-side spend from video/costs.jsonl (this skill's own
  // append-only run log), Claude-side from the user's cost-ledger hook.
  const costEntries = readCosts(p);
  const tts = costEntries.filter((e) => e.stage === "narrate");
  const costs = {
    apiRuns: costEntries.length,
    ttsScenesRendered: tts.length,
    ttsUsdEst: +tts.reduce((n, e) => n + (e.ttsUsdEst || 0), 0).toFixed(4),
    ttsAudioSeconds: +tts
      .reduce((n, e) => n + (e.audioSeconds || 0), 0)
      .toFixed(1),
    whisper: "local mlx_whisper, $0",
    claudeLedger: readClaudeLedger(p),
  };

  if (json) {
    console.log(
      JSON.stringify({ root: p.root, errors, scenes, stage, costs }, null, 2),
    );
    return errors.length ? 1 : 0;
  }

  // ~ instead of the absolute home path: the output gets captured into demo
  // videos and screenshots, and an absolute path identifies the machine.
  const home = require("os").homedir();
  const shownRoot = p.root.startsWith(home)
    ? "~" + p.root.slice(home.length)
    : p.root;
  console.log(`${c.bold}demo-video status${c.r} ${c.dim}${shownRoot}${c.r}`);
  for (const e of errors) console.log(`  ${c.red}INVALID${c.r} ${e}`);
  for (const s of scenes) {
    const cap =
      s.capture === "ok"
        ? `${c.green}captured${c.r}`
        : `${c.yellow}${s.capture}${c.r}`;
    const nar =
      s.narrate === "ok"
        ? `${c.green}narrated${c.r}`
        : s.narrate === "silent"
          ? `${c.dim}silent${c.r}`
          : `${c.yellow}narrate: ${s.narrate}${c.r}`;
    console.log(`  ${s.id.padEnd(16)} ${s.kind.padEnd(8)} ${cap}  ${nar}`);
  }
  const rr = Object.entries(stage.renders)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  console.log(
    `  ${c.dim}assemble: ${stage.assemble}  render: ${rr}  finish: ${stage.finish}` +
      `${stage.unregistered.length ? `  Root.tsx: ${stage.unregistered.join(", ")} NOT registered` : ""}${c.r}`,
  );
  const cl = costs.claudeLedger;
  console.log(
    `  ${c.dim}costs: TTS ~$${costs.ttsUsdEst} (${costs.ttsScenesRendered} scene render(s), ` +
      `${costs.ttsAudioSeconds}s audio, whisper local $0)` +
      `${cl ? `  Claude: $${cl.usd} across ${cl.sessions} session(s) [.claude/costs.csv]` : "  Claude: no ledger for this repo"}${c.r}`,
  );
  return errors.length ? 1 : 0;
}

process.exit(main());
