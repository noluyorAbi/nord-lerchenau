#!/usr/bin/env node
// /demo-video stage 3 - narration.
//
// Per scene: OpenAI gpt-4o-mini-tts renders the narration text to a WAV, then
// mlx_whisper aligns word timestamps against exactly that WAV, locally and for
// free. Captions and scene cuts both derive from the same file, so they cannot
// drift apart. OpenAI's TTS returns no timestamps; that is the whole reason
// whisper runs at all.
//
// Caching: narration.json stores a hash of (model, voice, text) per scene. An
// unchanged scene with an existing WAV is skipped, because TTS costs money on
// every call. --force re-renders, --scene <id> limits scope.

const fs = require('fs');
const cp = require('child_process');
const os = require('os');
const { L, path, paths, loadStoryboard, loadNarration, sceneHash, TTS_MODEL, VOICES, DEFAULT_VOICE, voiceFor, ttsEstimate, appendCost, narrationKey } = require('./lib');

const MODEL = TTS_MODEL;

const HELP = `demo-video narrate - TTS + word timestamps (stage 3)

USAGE  node video/tools/narrate.js [flags]

FLAGS
  --scene <id>    only this scene
  --voice <name>  override the voice for this run (for quick A/B listening)
  --force         ignore the cache, re-render every selected scene
  --json          machine-readable result
  -h, --help      this text

VOICE
  Default ${DEFAULT_VOICE}. Storyboard meta.voice sets it per project, a scene's
  "voice" field per scene. Known: ${VOICES.join(', ')}.
  Delivery is steered by an instructions prompt: meta.voiceInstructions
  (project) or scene.voiceInstructions (scene) override the default
  friendly-upbeat narrator. Changing voice or instructions re-renders the
  affected scenes automatically (both are part of the cache hash).

Reads video/storyboard.json, writes video/public/audio/<id>.wav and
video/src/narration.json. Needs OPENAI_API_KEY, mlx_whisper, ffprobe.
  --realign         keep the WAVs, redo whisper timestamps and alignment only (no TTS spend)
Cached by hash of (model, voice, instructions, narration text).`;

/**
 * Whisper transcribes what it hears, which is not always what was written:
 * "a maze that carves itself" comes back as "amaze that carbs itself", and that
 * misheard text would ship as the on-screen caption. The timings are excellent
 * and the transcription is not, so keep the timings and restore the script.
 *
 * A scene may also set `caption` when the spoken form and the written form
 * differ: narration says "a f k" so the voice spells it out, the caption says
 * "afk" because that is what a reader needs to see.
 *
 * When the word counts match, that is a one-to-one relabel. When they differ
 * (whisper split a hyphenate, or dropped a filler), the script's words are
 * spread proportionally across whisper's timeline, which keeps the captions
 * honest and still roughly in sync rather than wrong and exactly in sync.
 */
function alignToScript(words, narration) {
  const script = String(narration || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length || !script.length) return words;
  if (words.length === script.length) {
    return words.map((w, i) => ({ ...w, w: script[i] }));
  }
  return alignByMatching(words, script);
}

/**
 * Word counts differ (whisper split "SV-Nord-Website" in three, heard "svnord
 * punkt de" as one token, dropped a filler). Instead of spreading the script
 * evenly, which puts every caption a beat off, align the two sequences on
 * normalised tokens with a small edit-distance DP, keep whisper's timing for
 * every matched word, and interpolate only the unmatched ones between their
 * matched neighbours. Falls back to the even spread when almost nothing
 * matches, which means whisper heard a different text.
 */
function alignByMatching(words, script) {
  const norm = (t) => String(t).toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  const a = script.map(norm);
  const b = words.map((w) => norm(w.w));
  const n = a.length, m = b.length;
  // similarity: exact 1, prefix/containment 0.7, else 0
  const sim = (x, y) => {
    if (!x || !y) return 0;
    if (x === y) return 1;
    if (x.length >= 3 && y.length >= 3 && (x.startsWith(y) || y.startsWith(x) || x.includes(y) || y.includes(x))) return 0.7;
    return 0;
  };
  // DP over (i, j): best score aligning a[0..i) with b[0..j)
  const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const bt = Array.from({ length: n + 1 }, () => new Int8Array(m + 1)); // 1 diag, 2 up (skip script), 3 left (skip whisper)
  const GAP = -0.35;
  for (let i = 1; i <= n; i++) { dp[i][0] = i * GAP; bt[i][0] = 2; }
  for (let j = 1; j <= m; j++) { dp[0][j] = j * GAP; bt[0][j] = 3; }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const s = sim(a[i - 1], b[j - 1]);
      const diag = dp[i - 1][j - 1] + (s > 0 ? s : GAP);
      const up = dp[i - 1][j] + GAP;
      const left = dp[i][j - 1] + GAP;
      if (diag >= up && diag >= left) { dp[i][j] = diag; bt[i][j] = 1; }
      else if (up >= left) { dp[i][j] = up; bt[i][j] = 2; }
      else { dp[i][j] = left; bt[i][j] = 3; }
    }
  }
  const match = new Array(n).fill(-1);
  let i = n, j = m, matched = 0;
  while (i > 0 || j > 0) {
    const move = bt[i][j];
    if (move === 1) { if (sim(a[i - 1], b[j - 1]) > 0) { match[i - 1] = j - 1; matched++; } i--; j--; }
    else if (move === 2) i--;
    else j--;
  }
  if (matched < Math.max(2, Math.floor(n * 0.4))) {
    const start = words[0].s, end = words[words.length - 1].e;
    const span = Math.max(end - start, 0.001);
    return script.map((token, k) => ({
      w: token,
      s: +(start + (span * k) / n).toFixed(3),
      e: +(start + (span * (k + 1)) / n).toFixed(3),
    }));
  }
  // Matched words take whisper's timing; runs of unmatched words are spread
  // evenly between the surrounding matched anchors (or the clip edges).
  const out = new Array(n);
  const first = words[0].s, last = words[words.length - 1].e;
  let k = 0;
  while (k < n) {
    if (match[k] >= 0) { out[k] = { w: script[k], s: words[match[k]].s, e: words[match[k]].e }; k++; continue; }
    let r = k;
    while (r < n && match[r] < 0) r++;
    const from = k > 0 ? out[k - 1].e : first;
    const to = r < n ? words[match[r]].s : last;
    const span = Math.max(to - from, 0.05), cnt = r - k;
    for (let q = 0; q < cnt; q++) {
      out[k + q] = {
        w: script[k + q],
        s: +(from + (span * q) / cnt).toFixed(3),
        e: +(from + (span * (q + 1)) / cnt).toFixed(3),
      };
    }
    k = r;
  }
  return out;
}

function ffprobeDuration(file) {
  const out = cp.execFileSync('ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
    { encoding: 'utf8' }).trim();
  const d = parseFloat(out);
  if (!isFinite(d) || d <= 0) throw new Error(`ffprobe returned no duration for ${file}`);
  return d;
}

async function tts(text, voice, instructions, outFile) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, voice, input: text, instructions, response_format: 'wav' }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
}

function whisperWords(wav) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-video-whisper-'));
  try {
    const model = process.env.DEMO_VIDEO_WHISPER_MODEL;
    const wArgs = [wav, '--word-timestamps', 'True', '--output-format', 'json',
      '--output-dir', tmp, '--verbose', 'False'];
    if (model) wArgs.push('--model', model);
    cp.execFileSync('mlx_whisper', wArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const jsonFile = path.join(tmp, path.basename(wav).replace(/\.wav$/i, '') + '.json');
    const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const words = [];
    for (const seg of parsed.segments || []) {
      for (const w of seg.words || []) {
        const t = String(w.word || '').trim();
        if (t) words.push({ w: t, s: +(+w.start).toFixed(3), e: +(+w.end).toFixed(3) });
      }
    }
    return words;
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { console.log(HELP); return 0; }
  const json = args.includes('--json');
  const force = args.includes('--force');
  // --realign: keep the rendered WAVs (no TTS spend), redo whisper + alignment.
  const realign = args.includes('--realign');
  const only = args.includes('--scene') ? args[args.indexOf('--scene') + 1] : null;

  const p = paths();
  const { sb, errors } = loadStoryboard(p);
  if (!sb || errors.length) { console.error(errors.join('\n')); return 1; }
  if (!process.env.OPENAI_API_KEY) {
    // Not exported in this shell: fall back to the user's zsh config, first by
    // asking an interactive zsh (which sources ~/.zshrc), then by reading the
    // export line directly. The key is only put into this process's env.
    let key = null;
    try {
      key = cp.execFileSync('zsh', ['-ic', 'printf %s "$OPENAI_API_KEY"'],
        { encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
    } catch (_) {}
    if (!key) {
      const rc = L.readText(path.join(os.homedir(), '.zshrc')) || '';
      const m = rc.match(/^\s*(?:export\s+)?OPENAI_API_KEY=["']?([^"'\n#]+)/m);
      if (m) key = m[1].trim();
    }
    if (key) { process.env.OPENAI_API_KEY = key; process.stderr.write('OPENAI_API_KEY loaded from zsh config\n'); }
    else { console.error('OPENAI_API_KEY is not set (checked env, interactive zsh, ~/.zshrc); TTS needs it.'); return 1; }
  }
  for (const bin of ['mlx_whisper', 'ffprobe']) {
    try { cp.execFileSync('/usr/bin/which', [bin], { stdio: 'ignore' }); }
    catch (_) { console.error(`${bin} is not installed (brew install ${bin === 'ffprobe' ? 'ffmpeg' : 'mlx-whisper'})`); return 1; }
  }
  fs.mkdirSync(p.audio, { recursive: true });
  fs.mkdirSync(path.dirname(p.narration), { recursive: true });

  const narration = loadNarration(p);
  let flagVoice = null;
  if (args.includes('--voice')) {
    flagVoice = args[args.indexOf('--voice') + 1];
    if (!flagVoice || !VOICES.includes(flagVoice)) {
      console.error(`--voice needs one of: ${VOICES.join(', ')}${flagVoice ? ` (got "${flagVoice}")` : ''}`);
      return 1;
    }
  }
  const results = [];

  for (const scene of sb.scenes) {
    if (only && scene.id !== only) continue;
    if (!scene.narration) { results.push({ id: scene.id, state: 'silent' }); continue; }
    const resolved = voiceFor(sb, scene);
    const voice = flagVoice || resolved.voice;
    // caption is part of the hash: it does not change the audio, but it does
    // change the stored word list, so a caption-only edit must re-align.
    const hash = sceneHash(MODEL, voice, resolved.instructions, narrationKey(scene));
    const wav = path.join(p.audio, `${scene.id}.wav`);
    const prev = narration.scenes[scene.id];
    const cached = prev && prev.hash === hash && L.exists(wav) && Array.isArray(prev.words) && prev.words.length;
    if (!force && cached && !realign) {
      results.push({ id: scene.id, state: 'cached', voice, duration: prev.duration });
      continue;
    }
    if (realign && cached) {
      process.stderr.write(`realigning ${scene.id} ...\n`);
      const words = alignToScript(whisperWords(wav), scene.caption || scene.narration);
      narration.scenes[scene.id] = { ...prev, words };
      results.push({ id: scene.id, state: 'realigned', voice, duration: prev.duration, words: words.length });
      continue;
    }
    process.stderr.write(`narrating ${scene.id} (${voice}) ...\n`);
    await tts(scene.narration, voice, resolved.instructions, wav);
    const words = alignToScript(whisperWords(wav), scene.caption || scene.narration);
    const duration = ffprobeDuration(wav);
    narration.scenes[scene.id] = { hash, voice, audio: `audio/${scene.id}.wav`, duration: +duration.toFixed(3), words };
    const est = ttsEstimate(scene.narration.length, duration);
    appendCost(p, {
      stage: 'narrate', scene: scene.id, model: MODEL, voice,
      textChars: scene.narration.length, textTokensEst: est.textTokens,
      audioSeconds: +duration.toFixed(2), ttsUsdEst: est.usdEst,
      whisper: 'mlx_whisper local, $0',
    });
    results.push({ id: scene.id, state: 'rendered', voice, duration: +duration.toFixed(3), words: words.length, usdEst: est.usdEst });
  }

  fs.writeFileSync(p.narration, JSON.stringify(narration, null, 2) + '\n');

  const spent = results.reduce((n, r) => n + (r.usdEst || 0), 0);
  if (json) console.log(JSON.stringify({ model: MODEL, ttsUsdEstTotal: +spent.toFixed(4), results }, null, 2));
  else {
    for (const r of results) console.log(
      `${r.id.padEnd(16)} ${r.state}${r.voice ? `  ${r.voice}` : ''}${r.duration ? `  ${r.duration}s` : ''}${r.words ? `  ${r.words} words` : ''}`);
    if (spent) console.log(`TTS this run: ~$${spent.toFixed(4)} (estimate, logged to video/costs.jsonl; whisper local, $0)`);
  }
  return 0;
}

main().then((c) => process.exit(c)).catch((e) => { console.error(e.message); process.exit(1); });
