@AGENTS.md

## Design Skills (mandatory)

Before any UI/frontend/design work, ALWAYS consider invoking these skills:

- `emilkowal-animations`: Emil Kowalski animation principles (motion, interactions)
- `design-with-taste`: opinionated taste-driven UI design
- `design-principles`: impeccable design fundamentals
- `design-motion-principles`: motion + visual design principles

Rules:

1. Any task touching UI, components, animations, transitions, layouts, or visual design → invoke relevant skill(s) FIRST.
2. Even 10% chance a design skill applies → invoke it.
3. These skills are the reference standard. Default system design opinions yield to them.

## Standard pre-handoff checks

Run on every change before reporting work as done. Fix every error; never report green if any step fails.

```bash
bun run format   # Prettier, writes; run first so the checks see the final source
bun run check    # format check, lint, typecheck, unit tests
```

- **bun run check** runs the same gates as CI except the production build: Prettier check, `eslint` (Next.js and React Hooks rules), `tsc --noEmit` (strict) and Vitest.
- **bun run format** fixes formatting only; lint and type errors must be fixed by hand.

Optional, when you touched UI:

```bash
bun run build   # catches Next.js route + metadata problems lint can't see
```

Optional, when you touched anything in `lib/` or `tests/`:

```bash
bun run test
```

Do not silence errors with `// @ts-ignore`, `eslint-disable`, or by widening to `any`. Find the real type, narrow with `typeof`/`instanceof` guards, or fix the upstream type.
