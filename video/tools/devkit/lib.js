// devkit/lib.js - shared helpers for the dev-workflow skills
// (/preflight, /prime, /since, /ship). Read-only utilities: repo discovery,
// git, package manager detection, color, formatting.
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch (_) {
    return false;
  }
}
function readText(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (_) {
    return null;
  }
}
function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (_) {
    return null;
  }
}

// Run a command, never throw. Returns { ok, out, code }.
function sh(cmd, opts) {
  try {
    return {
      ok: true,
      out: cp
        .execSync(cmd, {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          maxBuffer: 32 << 20,
          ...opts,
        })
        .replace(/\s+$/, ""),
      code: 0,
    };
  } catch (e) {
    return {
      ok: false,
      out: ((e.stdout || "") + (e.stderr || "")).replace(/\s+$/, ""),
      code: e.status == null ? 1 : e.status,
    };
  }
}
function git(args, root) {
  return sh("git " + args, { cwd: root });
}

// Shell-free variant: pass args as an array (no shell, no injection). Use this
// whenever an argument is dynamic (a ref, date, path, user input).
function run(file, args, opts) {
  try {
    return {
      ok: true,
      out: cp
        .execFileSync(file, args, {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          maxBuffer: 32 << 20,
          ...opts,
        })
        .replace(/\s+$/, ""),
      code: 0,
    };
  } catch (e) {
    return {
      ok: false,
      out: ((e.stdout || "") + (e.stderr || "")).replace(/\s+$/, ""),
      code: e.status == null ? 1 : e.status,
    };
  }
}
function gitA(args, root) {
  return run("git", args, { cwd: root });
}

function repoRoot(start) {
  let dir = path.resolve(start || process.cwd());
  for (let i = 0; i < 64; i++) {
    if (exists(path.join(dir, ".git"))) return dir;
    const p = path.dirname(dir);
    if (p === dir) break;
    dir = p;
  }
  return null;
}

function colors(noColor) {
  if (noColor) return new Proxy({}, { get: () => "" });
  const E = "\x1b[";
  return {
    r: E + "0m",
    dim: E + "2m",
    bold: E + "1m",
    gold: E + "38;5;220m",
    gray: E + "38;5;245m",
    faint: E + "38;5;240m",
    green: E + "32m",
    yellow: E + "33m",
    red: E + "31m",
    cyan: E + "36m",
    blue: E + "38;5;39m",
  };
}
const stripAnsi = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, "");
function padA(s, w) {
  const len = stripAnsi(s).length;
  return len >= w ? s : s + " ".repeat(w - len);
}
function padL(s, w) {
  const len = stripAnsi(s).length;
  return len >= w ? s : " ".repeat(w - len) + s;
}

function pkg(root) {
  return readJSON(path.join(root, "package.json"));
}
function pkgManager(root) {
  if (
    exists(path.join(root, "bun.lockb")) ||
    exists(path.join(root, "bun.lock"))
  )
    return "bun";
  if (exists(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (exists(path.join(root, "yarn.lock"))) return "yarn";
  if (exists(path.join(root, "package-lock.json"))) return "npm";
  return null;
}

function ago(iso) {
  if (!iso) return "?";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "?";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 90) return s + "s";
  const m = Math.floor(s / 60);
  if (m < 90) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 36) return h + "h";
  const d = Math.floor(h / 24);
  if (d < 21) return d + "d";
  const w = Math.floor(d / 7);
  if (w < 9) return w + "w";
  const mo = Math.floor(d / 30);
  if (mo < 18) return mo + "mo";
  return Math.floor(d / 365) + "y";
}

// project name = basename of repo root
function projName(root) {
  return path.basename(root || "");
}

module.exports = {
  exists,
  readText,
  readJSON,
  sh,
  git,
  run,
  gitA,
  repoRoot,
  colors,
  stripAnsi,
  padA,
  padL,
  pkg,
  pkgManager,
  ago,
  projName,
  fs,
  path,
};
