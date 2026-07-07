# KI-Studio — TODO bis shippable

Stand: 2026-07-07. Code ist fertig + lokal getestet auf `feat/cms-customer-editable`
(ChangeRequests-Collection, Allowlist 40/40, Worker, Enqueue/Callback-Routes, CI,
StudioChat-View). **Cloud ist komplett unkonfiguriert** — nichts aus `AI-STUDIO-OPS.md` §2 gesetzt.

Referenz: Runbook `docs/AI-STUDIO-OPS.md`, Design `docs/AI-STUDIO-DESIGN.md`.

Verifizierter Ist-Zustand (2026-07-07):

- GitHub Actions Secrets: **leer** (`gh secret list`)
- GitHub Actions Variables: **leer** (`gh variable list`)
- Branch-Protection `main`: **nicht geschützt** (HTTP 404)
- Vercel Prod-Env: nur `RESEND_*` + `BLOB_READ_WRITE_TOKEN` da; alle Studio-Vars fehlen
- Folge: `POST /api/agent/enqueue` → **503** ("KI-Umsetzung konnte nicht gestartet werden")

Legende: [ ] offen · **[M]** = muss der Mensch selbst machen (Credentials/Access-Control,
kann der Agent nicht) · [CLI] = per `gh`/`vercel` CLI machbar.

---

## Blocker — ohne diese läuft nichts

- [ ] **[M]** Fine-grained PAT erzeugen: nur dieses Repo, Rechte `Contents: read/write`
      + `Actions: read/write`. (GitHub → Settings → Developer settings → Fine-grained tokens)
- [ ] **[M]** `ANTHROPIC_API_KEY` mit **hartem Monats-Spend-Limit** in der Anthropic-Konsole
      (physischer Backstop, z. B. $100).
- [ ] **[CLI]** GitHub Actions Secret `ANTHROPIC_API_KEY` setzen.
- [ ] **[CLI]** GitHub Actions Secret `AGENT_WEBHOOK_SECRET` (random String) setzen.
- [ ] **[CLI]** GitHub Actions Secret `STUDIO_CALLBACK_URL` = `https://<prod-domain>/api/agent/callback`.
- [ ] **[CLI]** Vercel Prod-Env `GITHUB_DISPATCH_TOKEN` = der PAT. ← Ursache des 503
- [ ] **[CLI]** Vercel Prod-Env `GITHUB_REPO` = `noluyorAbi/nord-lerchenau`.
- [ ] **[CLI]** Vercel Prod-Env `AGENT_WEBHOOK_SECRET` = **identisch** zum GitHub-Secret.
- [ ] **[CLI]** Vercel Prod-Env `DEV_NOTIFY_EMAIL` = Zieladresse für Benachrichtigungen.
- [ ] **[M/CLI]** Branch-Protection auf `main`: Require PR, keine Direct-Pushes, kein Auto-Merge.
      **Hartes Prod-Gate** — ohne das kann die KI theoretisch selbst nach Prod. Kritisch.

## Preview-Link — sonst hängt jeder Wunsch bei `review`

- [ ] **[CLI]** GitHub Actions Variable `STUDIO_PREVIEW_URL_TEMPLATE`
      = `https://nord-lerchenau-git-{branch}-<vercel-scope>.vercel.app`.
      Ohne diese wird der Verein NIE gebeten eine Vorschau freizugeben (Status bleibt `review`).
- [ ] **[CLI]** GitHub Actions Variable `STUDIO_MAX_COST_USD` (Default 8) setzen.

## Preview-Isolation — Pflicht vor echten Vereins-Wünschen (Security)

Vercel-Previews erben sonst die Prod-Env → Agent-Preview würde an die **Prod-Neon-DB**
schreiben und echte Mails senden.

- [ ] **[M]** Neon-DB-Branch pro Preview (native Vercel↔Neon-Integration) ODER Preview-scoped
      `DATABASE_URI` auf Staging-DB.
- [ ] **[M]** Preview Deployment Protection (Passwort/SSO) aktivieren — Preview-URLs sonst öffentlich (PII-Leak).
- [ ] **[CLI]** Preview-Env: `RESEND_API_KEY` **leer** lassen (keine echten Mails aus Previews).

## Screenshots im KI-Studio — optional, empfohlen

Best-effort (`continue-on-error`); fehlt es, läuft alles weiter, nur ohne Screenshots.

- [ ] **[M]** `VERCEL_TOKEN` (Read-Token) als GitHub Actions Secret.
- [ ] **[CLI]** `VERCEL_PROJECT_ID` als GitHub Actions Secret.
- [ ] **[CLI]** `VERCEL_TEAM_ID` — nur falls Projekt unter einem Team.
- [ ] **[CLI]** `BLOB_READ_WRITE_TOKEN` als GitHub Actions Secret (gleicher Store wie Medien).
- [ ] **[CLI]** `STUDIO_PREVIEW_BYPASS` — nur falls Preview Deployment Protection an ist.

---

## Vor Merge nach main

- [ ] `feat/cms-customer-editable` → `main` (Branch trägt CMS + KI-Studio zusammen).
- [ ] Prod-Reseed / Schema-Push **VOR** Code-Deploy (CMS-Regel, siehe `docs/CMS-AGENT-MEMORY.md`).
- [ ] Standard-Gates grün: `bunx prettier --check`, `bun run lint`, `bunx tsc --noEmit`, `bun run build`.

## Abnahme-Test nach Aktivierung (aus OPS §4)

- [ ] Als Redakteur unter `/admin/studio` einen Wunsch anlegen → Mail kommt, Status `neu`.
- [ ] Als Admin "KI-Umsetzung starten" → Action startet, Status `in_arbeit` (kein 503 mehr).
- [ ] GitHub-Action-Log grün → Branch `studio-<id>` + Vercel-Preview + Callback → `vorschau_bereit` + `previewUrl`.
- [ ] Im KI-Studio "Passt ✓ / Passt nicht ✗" testen; bei "Passt nicht" + Feedback → re-enqueue setzt `clientDecision` zurück.
- [ ] Bei "Passt": Mensch mergt Branch → Prod, Status `live`.
- [ ] Negativ-Checks: Allowlist-Verstoß → `braucht_dev`; abgestürzter Worker → `fehlgeschlagen`.

## Nice-to-have (nicht blockierend, aus OPS §5)

- [ ] Auto-Triage (Inhalt vs Struktur) im Enqueue — spart Opus-Tokens bei reinen Inhalts-Wünschen.
- [ ] Vercel-Deployment-Webhook für exakte Preview-URL statt Branch-Alias.
- [ ] Playwright-Screenshot-Diff der Kernrouten als zusätzliches Worker-Gate.
- [ ] Chat-Bubble-UI statt nativer Payload-Collection (reine UX-Politur).
- [ ] GitHub App statt PAT (kürzere, repo-scoped Tokens).

---

## Minimal-Set "läuft überhaupt"

Blocker-Abschnitt **komplett** + `STUDIO_PREVIEW_URL_TEMPLATE`. Preview-Isolation
ist Pflicht bevor echte Vereins-Wünsche laufen (sonst Prod-DB-Leak-Risiko), aber
für einen ersten Wegwerf-Testlauf auf eigenem Preview technisch nicht zwingend.
