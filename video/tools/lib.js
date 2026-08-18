#!/usr/bin/env node
// /demo-video - shared plumbing for the four engines.
// Everything here is path resolution and file IO; no stage logic.

const path = require('path');
const crypto = require('crypto');
const L = require('./devkit/lib');

/** Repo root (git) or cwd, plus every path the pipeline touches. */
function paths(cwd) {
  const root = L.repoRoot(cwd || process.cwd()) || process.cwd();
  const video = path.join(root, 'video');
  return {
    root,
    video,
    storyboard: path.join(video, 'storyboard.json'),
    narration: path.join(video, 'src', 'narration.json'),
    content: path.join(video, 'src', 'demovideo.content.ts'),
    footage: path.join(video, 'public', 'footage'),
    audio: path.join(video, 'public', 'audio'),
    out: path.join(video, 'out'),
    assets: path.join(root, 'assets'),
  };
}

const KINDS = ['title', 'browser', 'cli', 'still'];

/* ------------------------------------------------------------------- voice */

const TTS_MODEL = 'gpt-4o-mini-tts';
// Known gpt-4o-mini-tts voices, to catch storyboard typos early. Rough feel:
// nova bright+friendly, coral warm, ash expressive, sage calm, onyx deep/flat,
// alloy neutral, echo precise, shimmer light, ballad/fable/verse narrative.
const VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse'];
const DEFAULT_VOICE = 'nova';
// The default delivery: lively but not hyped. Overridable per storyboard
// (meta.voiceInstructions) and per scene (scene.voiceInstructions).
const DEFAULT_INSTRUCTIONS =
  'Friendly, upbeat product-demo narrator. Warm and conversational, natural emphasis, ' +
  'a lively but relaxed pace. Sound genuinely interested in what you are showing; ' +
  'never salesy, never monotone.';

/** Resolve voice + instructions for a scene: scene > meta > default. */
function voiceFor(sb, scene) {
  const meta = (sb && sb.meta) || {};
  return {
    voice: (scene && scene.voice) || meta.voice || DEFAULT_VOICE,
    instructions: (scene && scene.voiceInstructions) || meta.voiceInstructions || DEFAULT_INSTRUCTIONS,
  };
}

/** Parse + validate storyboard.json. Returns {sb, errors:[]}; sb null on hard failure. */
function loadStoryboard(p) {
  const errors = [];
  const text = L.readText(p.storyboard);
  if (text === null) return { sb: null, errors: [`${p.storyboard} does not exist. Stage 1 (plan) writes it.`] };
  let sb;
  try { sb = JSON.parse(text); } catch (e) { return { sb: null, errors: [`storyboard.json is not valid JSON: ${e.message}`] }; }
  if (!sb.meta || typeof sb.meta !== 'object') errors.push('meta object missing');
  if (!Array.isArray(sb.scenes) || !sb.scenes.length) errors.push('scenes array missing or empty');
  const seen = new Set();
  for (const s of sb.scenes || []) {
    const tag = s.id || '<no id>';
    if (!s.id || !/^[\w-]+$/.test(s.id)) errors.push(`scene ${tag}: id must be filename-safe ([A-Za-z0-9_-])`);
    if (seen.has(s.id)) errors.push(`scene ${tag}: duplicate id`);
    seen.add(s.id);
    if (!KINDS.includes(s.kind)) errors.push(`scene ${tag}: kind must be one of ${KINDS.join(', ')}`);
    if (!s.narration && s.kind !== 'title') errors.push(`scene ${tag}: narration missing (only title scenes may stay silent)`);
    if (s.kind === 'browser' && !s.footage) errors.push(`scene ${tag}: browser scene needs footage (e.g. "footage/${tag}.webm")`);
    if (s.kind === 'cli' && !s.ansi) errors.push(`scene ${tag}: cli scene needs ansi (e.g. "footage/${tag}.ansi")`);
    if (s.kind === 'still' && !s.image) errors.push(`scene ${tag}: still scene needs image (e.g. "footage/${tag}.png")`);
    if (s.variants !== undefined) {
      if (!Array.isArray(s.variants) || !s.variants.length || s.variants.some((v) => !['short', 'long'].includes(v)))
        errors.push(`scene ${tag}: variants must be a non-empty array of "short" / "long" (omit for both)`);
    }
    if (s.voice && !VOICES.includes(s.voice)) errors.push(`scene ${tag}: unknown voice "${s.voice}" (known: ${VOICES.join(', ')})`);
  }
  if (sb.meta && sb.meta.voice && !VOICES.includes(sb.meta.voice))
    errors.push(`meta.voice "${sb.meta.voice}" unknown (known: ${VOICES.join(', ')})`);
  return { sb, errors };
}

function loadNarration(p) {
  const text = L.readText(p.narration);
  if (text === null) return { version: 1, scenes: {} };
  try { return JSON.parse(text); } catch (_) { return { version: 1, scenes: {} }; }
}

/**
 * What a scene's audio and caption depend on. `caption` does not change the
 * audio, but it does change the stored word list, so a caption-only edit must
 * still invalidate the cache. narrate.js and status.js both call this, which is
 * what keeps status from reporting "stale" straight after a fresh render.
 */
const narrationKey = (scene) => `${scene.narration}\u0000${scene.caption || ''}`;

const sceneHash = (model, voice, instructions, text) =>
  crypto.createHash('sha256').update(`${model}\n${voice}\n${instructions}\n${text}`).digest('hex').slice(0, 16);

/** Absolute path of a scene asset given its storyboard-relative value ("footage/x.webm"). */
const assetPath = (p, rel) => path.join(p.video, 'public', rel);

/* -------------------------------------------------------------------- costs */
//
// Transparency ledger: every engine run appends one line to video/costs.jsonl
// (append-only, committed on purpose). The only paid API in this pipeline is
// OpenAI TTS; whisper runs locally on mlx and is free. The Claude-side spend
// is NOT tracked here, it lives in the user's own cost-ledger hook at
// <repo>/.claude/costs.csv; status.js reads both and shows them side by side.

// gpt-4o-mini-tts list prices: $0.60 / 1M text input tokens (~4 chars/token),
// $12 / 1M audio output tokens, which OpenAI itself estimates at about
// $0.015 per minute of audio. Estimates, not invoices; marked as such.
const TTS_USD_PER_1M_TEXT_TOKENS = 0.6;
const TTS_USD_PER_AUDIO_MINUTE = 0.015;

function ttsEstimate(textChars, audioSeconds) {
  const textTokens = Math.ceil(textChars / 4);
  const usd = (textTokens / 1e6) * TTS_USD_PER_1M_TEXT_TOKENS + (audioSeconds / 60) * TTS_USD_PER_AUDIO_MINUTE;
  return { textTokens, usdEst: +usd.toFixed(5) };
}

function appendCost(p, entry) {
  const fs = require('fs');
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  try { fs.appendFileSync(path.join(p.video, 'costs.jsonl'), line + '\n'); } catch (_) { /* logging must never break the run */ }
}

function readCosts(p) {
  const text = L.readText(path.join(p.video, 'costs.jsonl'));
  if (!text) return [];
  const out = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch (_) {}
  }
  return out;
}

/** Claude-side totals from the user's cost-ledger hook, when it exists. */
function readClaudeLedger(p) {
  const text = L.readText(path.join(p.root, '.claude', 'costs.csv'));
  if (!text) return null;
  const rows = text.trim().split('\n').slice(1).map((l) => l.split(','));
  if (!rows.length) return null;
  const num = (r, i) => +r[i] || 0;
  return {
    sessions: new Set(rows.map((r) => r[0])).size,
    inputTokens: rows.reduce((n, r) => n + num(r, 5), 0),
    cacheTokens: rows.reduce((n, r) => n + num(r, 6) + num(r, 7), 0),
    outputTokens: rows.reduce((n, r) => n + num(r, 8), 0),
    usd: +rows.reduce((n, r) => n + num(r, 12), 0).toFixed(2),
  };
}

module.exports = {
  L, path, paths, loadStoryboard, loadNarration, sceneHash, narrationKey, assetPath, KINDS,
  TTS_MODEL, VOICES, DEFAULT_VOICE, DEFAULT_INSTRUCTIONS, voiceFor,
  ttsEstimate, appendCost, readCosts, readClaudeLedger,
};
