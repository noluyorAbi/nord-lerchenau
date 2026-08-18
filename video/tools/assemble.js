#!/usr/bin/env node
// /demo-video stage 4 - assemble.
//
// Deterministic compile: storyboard.json + narration.json + captured assets
// become video/src/demovideo.content.ts. Scene duration comes from the real
// audio length (never estimated), word timestamps become frame numbers, and
// CLI captures are embedded raw so the composition feeds them through the
// workspace's own fromAnsi().
//
// Also installs the two composition files this skill owns (Vertical.tsx,
// demovideo-types.ts) into video/src/ when missing, and adds the
// render:vertical script to video/package.json. It never touches Root.tsx:
// launch owns that file, the one-line registration is documented in SKILL.md.

const fs = require('fs');
const { L, path, paths, loadStoryboard, loadNarration, assetPath, appendCost } = require('./lib');

const HELP = `demo-video assemble - compile storyboard to demovideo.content.ts (stage 4)

USAGE  node video/tools/assemble.js [flags]

FLAGS
  --update-templates  overwrite Vertical.tsx / demovideo-types.ts with the
                      skill's current versions (default: install only if missing)
  --json              machine-readable result
  -h, --help          this text

Fails when a captured asset a scene references does not exist, or when a
narrated scene has no narration.json entry (run narrate.js first).`;

const MIN_SCENE_S = 2;
const TITLE_SILENT_S = 3;

// One storyboard, two timelines: every scene defaults to both variants, a
// scene tagged {"variants":["long"]} only appears in the long cut. Short
// drives Vertical (9:16) and Wide (16:9 short), long drives WideLong.
function compile(sb, narration, p, errors, variant) {
  const fps = (sb.meta && sb.meta.fps) || 30;
  const hold = (sb.meta && sb.meta.holdSeconds) != null ? sb.meta.holdSeconds : 0.6;
  const scenes = [];
  let cursor = 0;

  for (const s of sb.scenes) {
    if (s.variants && !s.variants.includes(variant)) continue;
    const n = narration.scenes[s.id];
    if (s.narration && !n) { errors.push(`scene ${s.id}: narrated but not in narration.json (run narrate.js)`); continue; }
    const audioDur = n ? n.duration : 0;
    const durS = Math.max(MIN_SCENE_S, s.narration ? audioDur + hold : TITLE_SILENT_S);
    const durationFrames = Math.round(durS * fps);

    const scene = {
      id: s.id, kind: s.kind, startFrame: cursor, durationFrames,
      audio: n ? n.audio : null,
      words: n ? n.words.map((w) => ({ w: w.w, startFrame: Math.round(w.s * fps), endFrame: Math.round(w.e * fps) })) : [],
    };
    if (s.kind === 'title') { scene.headline = s.headline || (sb.meta && sb.meta.title) || ''; scene.sub = s.sub || ''; }
    if (s.kind === 'browser') {
      if (!L.exists(assetPath(p, s.footage))) errors.push(`scene ${s.id}: footage missing: video/public/${s.footage} (stage 2)`);
      scene.footage = s.footage;
    }
    if (s.kind === 'still') {
      if (!L.exists(assetPath(p, s.image))) errors.push(`scene ${s.id}: image missing: video/public/${s.image} (stage 2)`);
      scene.image = s.image;
    }
    if (s.kind === 'cli') {
      const raw = L.readText(assetPath(p, s.ansi));
      if (raw === null) { errors.push(`scene ${s.id}: ansi capture missing: video/public/${s.ansi} (stage 2)`); }
      else {
        // `script` captures CRLF. fromAnsi() treats a bare \r as "line redrawn
        // in place" and would blank every line, so normalise the line endings
        // but leave genuine mid-line \r redraws (progress bars) untouched.
        // It also echoes the ^D that ends the session followed by backspaces;
        // apply backspace erasure so that artefact never reaches the screen.
        let ansi = raw.replace(/\r+\n/g, '\n');
        for (let prev = ''; prev !== ansi;) { prev = ansi; ansi = ansi.replace(/[^\n\x08]\x08/g, ''); }
        scene.ansiRaw = ansi.replace(/\x08/g, '').slice(0, 200000);
        scene.cmd = s.cmd || '';
      }
    }
    scenes.push(scene);
    cursor += durationFrames;
  }
  return { fps, width: 1080, height: 1920, title: (sb.meta && sb.meta.title) || '', scenes, totalFrames: cursor };
}

function renderScenes(content) {
  const scenes = content.scenes.map((s) => {
    const base = `  {
    id: ${JSON.stringify(s.id)}, kind: ${JSON.stringify(s.kind)},
    startFrame: ${s.startFrame}, durationFrames: ${s.durationFrames},
    audio: ${JSON.stringify(s.audio)},
    words: ${JSON.stringify(s.words)},`;
    const extra = [];
    if (s.kind === 'title') { extra.push(`    headline: ${JSON.stringify(s.headline)}, sub: ${JSON.stringify(s.sub)},`); }
    if (s.kind === 'browser') extra.push(`    footage: ${JSON.stringify(s.footage)},`);
    if (s.kind === 'still') extra.push(`    image: ${JSON.stringify(s.image)},`);
    if (s.kind === 'cli') extra.push(`    cmd: ${JSON.stringify(s.cmd)},\n    term: fromAnsi(${JSON.stringify(s.ansiRaw)}),`);
    return base + '\n' + extra.join('\n') + '\n  }';
  });
  return `{
  fps: ${content.fps}, width: ${content.width}, height: ${content.height},
  title: ${JSON.stringify(content.title)},
  totalFrames: ${content.totalFrames},
  scenes: [
${scenes.join(',\n')}
  ],
}`;
}

function renderTs(short, long) {
  // Only a cli scene uses fromAnsi. Emitting the import unconditionally fails
  // typecheck under noUnusedLocals in a storyboard that has no cli scene.
  const usesAnsi = [...short.scenes, ...long.scenes].some((s) => s.kind === 'cli');
  const ansiImport = usesAnsi ? 'import { fromAnsi } from "./ansi";\n' : '';
  return `// GENERATED by /demo-video assemble.js - DO NOT EDIT.
// Source of truth: video/storyboard.json (+ narration.json). Re-run assemble.
${ansiImport}import type { DemoVideoContent } from "./demovideo-types";

/** Short cut: drives Vertical (9:16, 1:1 crop) and Wide (16:9 short). */
export const DEMO_VIDEO: DemoVideoContent = ${renderScenes(short)};

/** Long cut: every scene incl. {"variants":["long"]} ones, drives WideLong. */
export const DEMO_VIDEO_LONG: DemoVideoContent = ${renderScenes(long)};
`;
}

function installTemplates(p, forceUpdate, notes) {
  const tplDir = path.join(__dirname, 'templates');
  for (const f of ['Vertical.tsx', 'Wide.tsx', 'demovideo-types.ts']) {
    const dst = path.join(p.video, 'src', f);
    if (L.exists(dst) && !forceUpdate) continue;
    fs.copyFileSync(path.join(tplDir, f), dst);
    notes.push(`${L.exists(dst) && forceUpdate ? 'updated' : 'installed'} video/src/${f}`);
  }
  const pkgFile = path.join(p.video, 'package.json');
  const pkgText = L.readText(pkgFile);
  if (pkgText) {
    const pkg = JSON.parse(pkgText);
    pkg.scripts = pkg.scripts || {};
    const SCRIPTS = {
      'render:vertical': 'remotion render src/index.ts Vertical out/vertical.mp4 --codec=h264 --crf=20 --log=error --timeout=120000',
      'render:wide': 'remotion render src/index.ts Wide out/wide.mp4 --codec=h264 --crf=20 --log=error --timeout=120000',
      'render:wide-long': 'remotion render src/index.ts WideLong out/wide-long.mp4 --codec=h264 --crf=20 --log=error --timeout=120000',
    };
    let added = [];
    for (const [name, cmd] of Object.entries(SCRIPTS)) {
      if (!pkg.scripts[name]) { pkg.scripts[name] = cmd; added.push(name); }
    }
    if (added.length) {
      fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
      notes.push(`added ${added.join(', ')} script(s) to video/package.json`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { console.log(HELP); return 0; }
  const json = args.includes('--json');

  const p = paths();
  if (!L.exists(p.video)) { console.error('video/ workspace missing. Run /launch stage v2 first (see SKILL.md).'); return 1; }
  const { sb, errors } = loadStoryboard(p);
  if (!sb) { console.error(errors.join('\n')); return 1; }
  const narration = loadNarration(p);

  const short = compile(sb, narration, p, errors, 'short');
  const long = compile(sb, narration, p, [], 'long');
  if (errors.length) {
    console.error(errors.map((e) => 'BLOCKED  ' + e).join('\n'));
    return 1;
  }

  const notes = [];
  installTemplates(p, args.includes('--update-templates'), notes);
  fs.writeFileSync(p.content, renderTs(short, long));
  const secs = (c) => (c.totalFrames / c.fps).toFixed(1);
  notes.push(`wrote video/src/demovideo.content.ts (short: ${short.scenes.length} scenes ${secs(short)}s, ` +
    `long: ${long.scenes.length} scenes ${secs(long)}s @ ${short.fps}fps)`);

  const rootTs = L.readText(path.join(p.video, 'src', 'Root.tsx')) || '';
  const missing = ['Vertical', 'Wide', 'WideLong'].filter((id) => !new RegExp(`id="${id}"`).test(rootTs));
  if (missing.length) {
    notes.push(`MANUAL STEP: ${missing.join(', ')} not registered in video/src/Root.tsx yet (snippet in SKILL.md, stage 4)`);
  }

  appendCost(p, { stage: 'assemble', apiUsd: 0, shortFrames: short.totalFrames, longFrames: long.totalFrames });

  if (json) console.log(JSON.stringify({ ok: true, short: short.totalFrames, long: long.totalFrames, fps: short.fps, notes }, null, 2));
  else console.log(notes.join('\n'));
  return 0;
}

process.exit(main());
