#!/usr/bin/env node
/**
 * Build a WebVTT captions file from video/src/demovideo.content.ts word
 * timings, so the same word timestamps that drive the burnt-in karaoke also
 * feed a real <track kind="captions">. Cues are the caption chunks (up to 8
 * words, a new cue on a sentence end or a pause), offset by each scene's
 * start frame. Output: video/out/captions.de.vtt.
 *
 * Usage: node video/tools/captions.js  (from the repository root; needs Node
 * 22.6+ for built-in TypeScript type stripping, the repo pins Node 24)
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = process.cwd();
const src = path.join(root, "video", "src", "demovideo.content.ts");
const out = path.join(root, "video", "out", "captions.de.vtt");

const CHUNK_MAX_WORDS = 8;
const CHUNK_GAP_FRAMES = 12; // a >0.4s pause starts a new cue

/**
 * The generated module contains only erasable type syntax (a type-only import
 * and one annotation), so Node loads it directly. No parsing, no eval.
 */
async function loadLongCut() {
  const mod = await import(pathToFileURL(src).href);
  if (!mod.DEMO_VIDEO_LONG) {
    throw new Error("DEMO_VIDEO_LONG not exported by " + src);
  }
  return mod.DEMO_VIDEO_LONG;
}

const pad = (n, w) => String(n).padStart(w, "0");

const fmt = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(r, 3)}`;
};

function cuesFor(long) {
  const fps = long.fps;
  const cues = [];
  for (const scene of long.scenes) {
    const words = scene.words || [];
    if (!words.length) continue;
    const base = scene.startFrame / fps;
    let cur = [];
    const flush = () => {
      if (!cur.length) return;
      const from = base + cur[0].startFrame / fps;
      const to = base + cur[cur.length - 1].endFrame / fps;
      cues.push({
        from,
        to: Math.max(to, from + 0.3),
        text: cur.map((w) => w.w).join(" "),
      });
      cur = [];
    };
    for (const w of words) {
      const prev = cur[cur.length - 1];
      const pause = prev && w.startFrame - prev.endFrame > CHUNK_GAP_FRAMES;
      const sentence = prev && /[.!?]$/.test(prev.w) && cur.length >= 2;
      if (cur.length && (cur.length >= CHUNK_MAX_WORDS || pause || sentence)) {
        flush();
      }
      cur.push(w);
    }
    flush();
  }
  // Cues must not overlap: end each one at the next one's start at the latest.
  for (let i = 0; i < cues.length - 1; i++) {
    if (cues[i].to > cues[i + 1].from) cues[i].to = cues[i + 1].from;
  }
  return cues;
}

async function main() {
  const long = await loadLongCut();
  const cues = cuesFor(long);
  const lines = [
    "WEBVTT",
    "",
    "NOTE Generiert aus video/src/demovideo.content.ts (video/tools/captions.js)",
    "",
  ];
  cues.forEach((c, i) => {
    lines.push(String(i + 1), `${fmt(c.from)} --> ${fmt(c.to)}`, c.text, "");
  });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, lines.join("\n"));
  console.log(
    `wrote ${path.relative(root, out)}: ${cues.length} cues, ${fmt(cues[cues.length - 1].to)} total`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
