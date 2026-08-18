#!/usr/bin/env node
// /demo-video stage 6 - finish.
//
// The Remotion renders in video/out/ become distribution files in
// <repo>/assets/. Formats come from storyboard meta.formats:
//
//   9x16       out/vertical.mp4   stream copy + faststart (no quality loss)
//   1x1        out/vertical.mp4   center crop 1080x1080, re-encoded
//   16x9       out/wide.mp4       stream copy + faststart (short cut)
//   16x9-long  out/wide-long.mp4  stream copy + faststart (long cut)
//   gif        out/wide.mp4       640px 12fps palette GIF for the README
//
// A format whose render is missing names the exact npm script to run instead
// of failing silently.

const fs = require("fs");
const cp = require("child_process");
const { L, path, paths, loadStoryboard, appendCost } = require("./lib");

const HELP = `demo-video finish - package the renders for distribution (stage 6)

USAGE  node video/tools/finish.js [flags]

FLAGS
  --formats <list>  comma-separated, overrides storyboard meta.formats
                    (supported: 9x16, 1x1, 16x9, 16x9-long, gif)
  --json            machine-readable result
  -h, --help        this text

Inputs video/out/{vertical,wide,wide-long}.mp4, outputs <repo>/assets/.`;

const mb = (f) => +(fs.statSync(f).size / 1048576).toFixed(1);

const FORMATS = {
  "9x16": {
    input: "vertical.mp4",
    output: "social-9x16.mp4",
    render: "render:vertical",
    args: (i, o) => ["-i", i, "-c", "copy", "-movflags", "+faststart", o],
  },
  "1x1": {
    input: "vertical.mp4",
    output: "social-1x1.mp4",
    render: "render:vertical",
    args: (i, o) => [
      "-i",
      i,
      "-vf",
      "crop=1080:1080:0:420",
      "-c:v",
      "libx264",
      "-crf",
      "20",
      "-preset",
      "medium",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-movflags",
      "+faststart",
      o,
    ],
  },
  "16x9": {
    input: "wide.mp4",
    output: "demo-16x9.mp4",
    render: "render:wide",
    args: (i, o) => ["-i", i, "-c", "copy", "-movflags", "+faststart", o],
  },
  "16x9-long": {
    input: "wide-long.mp4",
    output: "demo-16x9-long.mp4",
    render: "render:wide-long",
    args: (i, o) => ["-i", i, "-c", "copy", "-movflags", "+faststart", o],
  },
  gif: {
    input: "wide.mp4",
    output: "preview.gif",
    render: "render:wide",
    // Capped at the opening seconds. A GIF carries every frame uncompressed
    // between frames, so a full minute of video lands around 11 MB, and a
    // README image that heavy is paid for by every visitor to the repository
    // on a page most of them are only skimming. The cap is announced below
    // rather than applied quietly.
    seconds: 15,
    args: (i, o) => [
      "-t",
      String(FORMATS.gif.seconds),
      "-i",
      i,
      // 480px at 10fps with 96 colours. A README preview is read at a few
      // hundred pixels wide and skimmed for two seconds, so the larger
      // settings bought nothing a reader could see and cost several megabytes
      // on high-entropy footage, where a GIF cannot use interframe coding.
      "-vf",
      "fps=10,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer",
      "-loop",
      "0",
      o,
    ],
  },
};

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return 0;
  }
  const json = args.includes("--json");

  const p = paths();
  try {
    cp.execFileSync("/usr/bin/which", ["ffmpeg"], { stdio: "ignore" });
  } catch (_) {
    console.error("ffmpeg is not installed (brew install ffmpeg)");
    return 1;
  }

  const { sb } = loadStoryboard(p);
  const fromFlag = args.includes("--formats")
    ? args[args.indexOf("--formats") + 1].split(",")
    : null;
  const formats = (
    fromFlag ||
    (sb && sb.meta && sb.meta.formats) || ["9x16"]
  ).map((f) => f.trim());
  fs.mkdirSync(p.assets, { recursive: true });

  const outputs = [];
  const problems = [];
  for (const f of formats) {
    const spec = FORMATS[f];
    if (!spec) {
      problems.push(
        `unknown format ${f} (supported: ${Object.keys(FORMATS).join(", ")})`,
      );
      continue;
    }
    const input = path.join(p.out, spec.input);
    if (!L.exists(input)) {
      problems.push(
        `${f}: video/out/${spec.input} missing. Render first: cd video && npm run ${spec.render}`,
      );
      continue;
    }
    const out = path.join(p.assets, spec.output);
    cp.execFileSync("ffmpeg", ["-y", "-v", "error", ...spec.args(input, out)]);
    outputs.push({
      format: f,
      file: out,
      mb: mb(out),
      seconds: spec.seconds || null,
    });
  }

  if (outputs.length)
    appendCost(p, {
      stage: "finish",
      apiUsd: 0,
      outputs: outputs.map((o) => ({
        format: o.format,
        file: path.relative(p.root, o.file),
        mb: o.mb,
      })),
    });

  if (json) {
    console.log(JSON.stringify({ outputs, problems }, null, 2));
  } else {
    for (const o of outputs)
      console.log(
        `${o.format.padEnd(10)} ${path.relative(p.root, o.file)}  ${o.mb} MB` +
          (o.seconds ? `  (first ${o.seconds}s only)` : "") +
          (o.mb > 90 ? "  WARNING: near the GitHub 100 MB limit" : ""),
      );
    for (const e of problems) console.error("SKIPPED  " + e);
  }
  return outputs.length && !problems.length ? 0 : problems.length ? 1 : 1;
}

process.exit(main());
