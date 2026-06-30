# AI-Studio — Aktivierungs- & Betriebs-Runbook

**Branch:** `feat/ai-studio` (baut auf `feat/cms-customer-editable`).
**Status:** Code-Pipeline gebaut + lokal getestet (tsc/lint/Tests grün, Allowlist 40/40). **Cloud-Aktivierung steht aus** — die Schritte hier.

Design/Begründung: `docs/AI-STUDIO-DESIGN.md`. Agent-Memory: `docs/CMS-AGENT-MEMORY.md`.

---

## 1. Was gebaut ist (Code)

| Teil                 | Datei                                        | Zweck                                                                  |
| -------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| Rückgrat             | `payload/collections/ChangeRequests.ts`      | Queue + Status-State-Machine + RBAC + Mail-Hooks                       |
| Allowlist (Security) | `lib/studio/allowlist.ts` (+ 40 Tests)       | Agent darf nur Frontend-Code; doppelt durchgesetzt                     |
| Worker (Gehirn)      | `scripts/studio/run-agent.ts`                | Claude Agent SDK: implement → Gates → Fix-Loop → Diff-Recheck → Review |
| Enqueue-Route        | `app/(frontend)/api/agent/enqueue/route.ts`  | ADMIN-only; startet die GitHub Action                                  |
| Callback-Route       | `app/(frontend)/api/agent/callback/route.ts` | Webhook (Shared Secret); Server-Recheck + Status-Update                |
| CI                   | `.github/workflows/studio-agent.yml`         | Worker auf isoliertem Branch, Push nur bei Erfolg, postet Callback     |
| Mail                 | `lib/notify.ts`                              | Dev-Benachrichtigung (Resend)                                          |

**Flow:** Vereins-Mitglied legt unter `/admin` → „0. KI-Studio → Änderungswünsche" einen Wunsch an (Status `neu`, Mail an dich). → Du prüfst, klickst Enqueue (oder per Button/Route) → GitHub Action läuft den Worker → Branch + Vercel-Preview → Callback setzt `vorschau_bereit` + `previewUrl`. → Mitglied bewertet (`passt`/`passt_nicht` + Feedback, Mail an dich). → Bei `passt`: **du** mergst den Branch → Prod. Bei `passt_nicht`: erneut enqueuen (Feedback fließt ein).

---

## 2. Pflicht-Aktivierung (einmalig)

### 2a. GitHub — Dispatch-Token + Branch-Schutz

1. Fine-grained PAT (oder GitHub App) mit Zugriff NUR auf dieses Repo, Rechte:
   `Contents: read/write`, `Actions: read/write` (für `repository_dispatch`).
2. In **Vercel** (Projekt-Env, Production) setzen:
   - `GITHUB_DISPATCH_TOKEN` = der Token
   - `GITHUB_REPO` = `noluyorAbi/<repo>`
3. **Branch-Protection auf `main`**: Require PR, keine direkten Pushes, kein
   Auto-Merge. So kann der Agent NIE selbst nach Prod — nur du mergst. (Das ist
   das harte Prod-Gate.)

### 2b. GitHub Actions — Secrets & Vars

Repo → Settings → Secrets and variables → Actions:

- Secret `ANTHROPIC_API_KEY` — **mit hartem Monats-Spend-Limit** in der Anthropic-Konsole (physischer Backstop, z. B. $100).
- Secret `AGENT_WEBHOOK_SECRET` — zufälliger String; identisch in Vercel-Env.
- Secret `STUDIO_CALLBACK_URL` — `https://<prod-domain>/api/agent/callback`.
- Var `STUDIO_MAX_COST_USD` — Kosten-Cap pro Request (Default 8).

### 2c. Vercel — Preview-Isolation (WICHTIGSTES Sicherheits-Item)

Vercel-Previews erben standardmäßig die **Prod-Env** → ein Agent-Preview würde
sonst an die **Prod-Neon-DB** schreiben und echte Mails senden.

1. **Neon-Branch pro Preview** über die native Vercel↔Neon-Integration aktivieren
   (Preview-Deployments bekommen eine eigene DB-Branch mit Kopie/synthetischen
   Daten). Alternativ eine Preview-scoped `DATABASE_URI` auf eine Staging-DB.
2. **Preview Deployment Protection** (Passwort/SSO) aktivieren — Preview-URLs
   sind sonst öffentlich (unveröffentlichte Inhalte / PII-Leak).
3. Preview-Env: `RESEND_API_KEY` leer lassen (keine echten Mails aus Previews).

### 2d. Vercel-Env (Prod) — restliche Variablen

`AGENT_WEBHOOK_SECRET`, `GITHUB_DISPATCH_TOKEN`, `GITHUB_REPO`, `DEV_NOTIFY_EMAIL`
(wohin Benachrichtigungen gehen). `ANTHROPIC_API_KEY` wird im App-Server NICHT
gebraucht (nur in der Action) — dort weglassen, außer du baust Auto-Triage ein.

---

## 3. Sicherheits-Recap (die Garantien)

- **Agent kann nur Frontend-Code anfassen** (`app/(frontend)`, `components`,
  `public`, `app/globals.css`). `payload/**`, Auth, Env, Schema, `scripts`, CI,
  Deps sind hart gesperrt — durchgesetzt im Agenten (PreToolUse-Hook) UND
  server-seitig per Diff-Recheck im Callback. Beide müssen grün sein.
- **Prod nur per Dev-Merge** (Branch-Protection). Client-„Passt" ist nur ein
  Status, kein Merge.
- **Kein Secret in der Action** außer `ANTHROPIC_API_KEY` + Dispatch-Token.
- **Kosten:** Cap pro Request (`STUDIO_MAX_COST_USD`) + harter Monats-Deckel auf
  dem Anthropic-Key. Worker bricht ab, wenn Budget < Schwelle.
- **Gates vor Vorschau:** prettier/lint/tsc/build müssen grün sein, sonst kein
  Preview (Worker exit ≠ 0 → kein Branch-Push).
- **Daten-Leak-Flag:** jede neue `getPayload`/Secret-Nutzung in Frontend-Code →
  Status `braucht_dev` (manuelle Prüfung).

---

## 4. Test (nach Aktivierung)

1. Als Redakteur in `/admin` einen Wunsch anlegen („Mach den Hero-Bereich auf der
   Startseite dunkler."). → Mail kommt an, Status `neu`.
2. Enqueue (POST `/api/agent/enqueue` mit `{requestId}` als Admin, oder Button).
   → Action startet, Status `in_arbeit`.
3. Action-Log prüfen (GitHub). Bei Erfolg: Branch `studio/<id>-<run>` + Vercel-
   Preview; Callback setzt `vorschau_bereit` + `previewUrl`.
4. Preview öffnen, bewerten. Bei `passt`: PR mergen → Prod.

Lokaler Worker-Smoke-Test (ohne CI, braucht `ANTHROPIC_API_KEY`):
`STUDIO_PROMPT="..." ANTHROPIC_API_KEY=... bun run scripts/studio/run-agent.ts`
(macht echte Datei-Änderungen im Working-Tree — auf einem Wegwerf-Branch laufen lassen).

---

## 5. Noch offen / Ausbaustufen (dokumentiert, nicht kritisch)

- **Auto-Triage:** ein billiger Klassifizierer (Inhalt vs Struktur) im Enqueue,
  der reine Inhalts-Wünsche gar nicht erst in die teure Pipeline lässt, sondern
  Status `inhalt_cms` setzt + dem Client sagt „das geht direkt im CMS". Spart
  Opus-Tokens. (Heute entscheidet der Dev über das `category`-Feld.)
- **Preview-URL-Auflösung:** aktuell setzt der Callback `branch`; die echte
  `previewUrl` am besten über einen Vercel-Deployment-Webhook nachreichen (oder
  per Vercel-API in der Action pollen).
- **Playwright-Screenshot-Diff** der Kernrouten als zusätzliches Gate im Worker.
- **Chat-Bubble-UI:** aktuell ist die native Payload-Collection der „Tab"
  (funktional). Eine Custom-Admin-View mit Chat-Optik ist reine UX-Politur.
- **GitHub App statt PAT** für kürzere, repo-scoped Tokens.

---

## 6. Wirtschaftlichkeit (Erinnerung)

Für eine Vereins-Seite ist das Volumen struktureller Wünsche niedrig → erwartete
Kosten ~$20-60/Monat, gedeckelt ~$100. Der größte Nutzen kommt schon daraus, dass
Wünsche geordnet reinkommen (Inbox + Mail + Preview-Link) statt per WhatsApp um
Mitternacht. Voll lohnt sich der Betrieb v. a. als **Mehr-Kunden-Produkt**.
