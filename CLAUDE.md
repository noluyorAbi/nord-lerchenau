@AGENTS.md

## Standard pre-handoff checks

Run all three on every change before reporting work as done. Fix every error — never report green if any step fails.

```bash
bunx prettier --write '**/*.{ts,tsx,md,json,css}' --ignore-path .gitignore
bun run lint
bunx tsc --noEmit
```

- **prettier --write** — format first, so lint/tsc see the final source.
- **bun run lint** — runs `eslint` (Next.js + React Hooks rules).
- **bunx tsc --noEmit** — strict TypeScript check (the `lint` script does not type-check on its own).

Optional, when you touched UI:

```bash
bun run build   # catches Next.js route + metadata problems lint can't see
```

Optional, when you touched anything in `lib/` or `tests/`:

```bash
bun run test
```

Do not silence errors with `// @ts-ignore`, `eslint-disable`, or by widening to `any`. Find the real type, narrow with `typeof`/`instanceof` guards, or fix the upstream type.
