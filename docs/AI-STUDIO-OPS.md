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

### 2e. Preview-Link automatisch füllen (GitHub Actions Variable)

Damit der Verein die Vorschau **sehen** kann (nicht blind freigeben muss), setzt
der Worker `previewUrl` aus einer deterministischen Vorlage:

- Repo → Settings → Secrets and variables → Actions → **Variables** → neu:
  `STUDIO_PREVIEW_URL_TEMPLATE` =
  `https://nord-lerchenau-git-{branch}-<dein-vercel-scope>.vercel.app`
  (`{branch}` wird durch den Branchnamen `studio-<id>` ersetzt).
- Der Branch ist bewusst kurz und stabil (`studio-<id>`, nicht mehr mit Run-ID),
  damit die Vercel-Git-Branch-Preview-URL deterministisch ist und über
  Feedback-Runden gleich bleibt.
- Voraussetzung: Vercel baut für Branch-Pushes automatisch Previews (Standard).
- **Ohne** diese Variable bleibt der Wunsch nach dem Build im Status `review`
  („Vorschau wird gebaut") statt `vorschau_bereit` — der Verein wird also NIE
  gebeten, eine Vorschau ohne Link freizugeben. Du kannst die `previewUrl` dann
  von Hand im Änderungswunsch eintragen, um `vorschau_bereit` auszulösen.

---

## 3. Sicherheits-Recap (die Garantien)

- **Agent kann nur Frontend-Code anfassen** (`app/(frontend)`, `components`,
  `public`, `app/globals.css`). `payload/**`, Auth, Env, Schema, `scripts`, CI,
  Deps sind hart gesperrt — durchgesetzt im Agenten (PreToolUse-Hook) UND
  server-seitig per Diff-Recheck im Callback. Beide müssen grün sein. Der
  Diff-Recheck erfasst auch **neu angelegte (untracked) Dateien**, nicht nur
  geänderte — sonst könnte eine neue Datei an der Allowlist vorbei committet
  werden.
- **Build-Gate ohne Secrets:** die Gates (`bun run build` etc.) laufen mit
  bereinigtem Env (ohne `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, Webhook-Secret), da
  sie vom Agenten geschriebenen Frontend-Code ausführen.
- **Callback-Secret:** konstante-Zeit-Vergleich (timing-safe), damit das Secret
  nicht über die 401-Antwortzeit erraten werden kann.
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

1. Als Redakteur in `/admin` einen Wunsch anlegen — am einfachsten über das
   Dashboard-Banner „KI-Studio: Änderungswunsch stellen" oder direkt unter
   `/admin/studio`. → Mail kommt an, Status `neu` („Eingereicht — wird geprüft").
2. Als **Admin** im KI-Studio den Button **„KI-Umsetzung starten"** am Wunsch
   klicken (er ruft `/api/agent/enqueue`). → Action startet, Status `in_arbeit`.
   (Der Button ist nur für Admins sichtbar; Redakteure sehen nur den Status.)
3. Action-Log prüfen (GitHub). Bei Erfolg: Branch `studio-<id>` + Vercel-Preview;
   Callback setzt `previewUrl` (aus `STUDIO_PREVIEW_URL_TEMPLATE`) und Status
   `vorschau_bereit`. Ohne Template bleibt es bei `review`.
4. Der Verein bewertet im KI-Studio („Passt ✓ / Passt nicht ✗"). Der Button-Block
   erscheint nur, wenn eine `previewUrl` vorhanden ist. Bei „Passt nicht" +
   Feedback → erneut enqueuen (Feedback fließt in den Prompt); die neue Vorschau
   öffnet die Bewertung wieder (`clientDecision` wird auf `offen` zurückgesetzt).
5. Bei `passt`: **du** mergst den Branch → Prod.

Statuswerte, die der Verein sieht: `neu` → `in_arbeit` → `review`
(„Vorschau wird gebaut") → `vorschau_bereit` → (nach Merge, manuell) `live`.
Ein abgestürzter Worker landet auf `fehlgeschlagen`, ein Allowlist-Verstoß oder
Daten-Leak-Flag auf `braucht_dev` (nur du).

Lokaler Worker-Smoke-Test (ohne CI, braucht `ANTHROPIC_API_KEY`):
`STUDIO_PROMPT="..." ANTHROPIC_API_KEY=... bun run scripts/studio/run-agent.ts`
(macht echte Datei-Änderungen im Working-Tree — auf einem Wegwerf-Branch laufen lassen).

---

## 5. Noch offen / Ausbaustufen (dokumentiert, nicht kritisch)

- **Auto-Triage:** ein billiger Klassifizierer (Inhalt vs Struktur) im Enqueue,
  der reine Inhalts-Wünsche gar nicht erst in die teure Pipeline lässt, sondern
  Status `inhalt_cms` setzt + dem Client sagt „das geht direkt im CMS". Spart
  Opus-Tokens. (Heute entscheidet der Dev über das `category`-Feld.)
- **Preview-URL-Auflösung:** erledigt über die deterministische Vorlage
  `STUDIO_PREVIEW_URL_TEMPLATE` (Abschnitt 2e). Robuster wäre ein
  Vercel-Deployment-Webhook, der die exakte Deployment-URL nachreicht (statt der
  Git-Branch-Alias-URL) — nur nötig, falls Branch-Alias-Previews mal deaktiviert
  sind.
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
