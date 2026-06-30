# AI-Studio — Lovable-artiges Selfservice-Tool für den Kunden (Design)

**Datum:** 2026-06-30 · **Status:** Design (noch nicht gebaut). Aus einem 8-Agenten-Design-Workflow synthetisiert; die Agenten konvergierten unabhängig auf nahezu dieselbe Architektur.

---

## 0. TL;DR / Empfehlung

Der Verein beschreibt im passwortgeschützten Bereich per Chat **strukturelle** Wünsche („neue Galerie-Sektion", „Hero dunkler", „neue Seite fürs Turnier"). Ein KI-Tool (Opus 4.8, mehrere Agenten) setzt sie als **Code** um, prüft sich selbst, erzeugt eine **Staging-Vorschau**, und **du** gibst frei, bevor es live geht.

**Wichtig (Reframe):** Die gerade fertige CMS-Migration deckt **Inhalte** schon ab (Texte/Bilder/Termine/Sponsoren/alle großen Seiten) — dafür braucht es keine KI. Dieses Tool ist nur für **strukturelle/Design-Änderungen**, die echten Code brauchen. Das ist die Power-Tier obendrauf.

**Empfohlener Start: Phase 0** (Request-Inbox + Chat-Tab + Mail an dich, **ohne** Auto-Codegen). 2-4 Tage, null KI-Risiko, validiert ob der Verein das überhaupt nutzt, und die strukturierten Anfragen sind exakt der Input-Vertrag für die spätere Automatik. Auto-Codegen (Phase 1+) erst danach, wenn das Volumen es rechtfertigt.

---

## 1. Architektur (Konsens aller Agenten)

| Baustein           | Wahl                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Rückgrat**       | Payload-Collection `change-requests` (Queue + Status-State-Machine + Audit-Log) + Custom-Admin-Chat-View in `/admin`       |
| **Gehirn**         | **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk` = headless Claude Code) — nicht selbst gebaut                       |
| **Multi-Agent**    | Planner (read-only) → Implementer (kleine Diffs, Allowlist) → Reviewer (echte Gates) → Fix-Loop (max ~3)                   |
| **Ausführung**     | **GitHub Actions** (MVP, günstig, PR-nativ) oder **Vercel Sandbox** (Skalierung). **Nie** in einem Route-Handler (Timeout) |
| **Staging**        | Branch-Push → Vercel-Auto-Preview-Deploy → Preview-URL                                                                     |
| **Freigabe**       | **Du** mergst Branch → main → Prod. Client-„Passt" ist nur UI-Status, Merge ist server-seitig admin-only                   |
| **Trigger/Router** | Billiges Modell klassifiziert „Inhalt (→ CMS, kein Codegen) vs Struktur"; nur Struktur läuft in die teure Pipeline         |

**Flow:** Client-Chat → `change-request` angelegt → Triage (Inhalt? → „nutze das CMS") → Agent in Sandbox/Actions: clone → branch → Plan → Implement → Gates (prettier/lint/tsc/build) → Push → Vercel-Preview → Status + Preview-URL zurück in den Datensatz → Client sieht Vorschau + „Passt / Passt nicht" → **du** mergst (oder Client-Feedback → Iteration).

---

## 2. Security-Invarianten (nicht verhandelbar)

Das gibt einem **nicht-technischen** Nutzer eine KI, die Code schreibt + Deployments auslöst. Die Leitplanken:

1. **Harte Pfad-Allowlist.** Agent darf NUR `app/(frontend)`, `components/`, `app/globals.css`, `public/`. **Hart verboten:** `payload/`, `payload.config.ts`, `lib/payload.ts`, `scripts/`, `payload-types.ts`, `.env*`, `package.json`-Deps, Migrations. Durchgesetzt **doppelt**: SDK-PreToolUse-Hook **und** server-seitiger Diff-Check vor dem Merge (nicht der KI-Selbstdisziplin trauen). Schützt die gerade fertige CMS-Datenschicht.
2. **Preview-DB-Isolation (Top-Risiko!).** Vercel-Previews erben standardmäßig die **Prod-Env** → die KI-Vorschau würde die **Prod-Neon-DB lesen/schreiben** und echte Mails senden. Pflicht: **Neon-Branch pro Preview** + Preview-eigene Env (synthetische Daten). Ohne das nichts starten.
3. **Hartes Dev-Freigabe-Gate.** Nur du mergst zu Prod (server-enforced, admin-only). Verein bekommt Rolle `editor`, du bleibst einziger `admin`/Merger.
4. **Keine Secrets in der Sandbox** außer kurzlebigem **GitHub-App-Token** (~1h, nur dieses Repo, kein PAT) + `ANTHROPIC_API_KEY` (nur Server-Env, nie zum Browser).
5. **Kosten-Caps:** Token-/USD-Cap pro Request, Retry-Cap (~3), Tages-Request-Limit, **harter Monats-USD-Deckel** auf dem Anthropic-Key als physischer Backstop.
6. **Prompt-Injection:** CMS-Inhalte, die der Agent als Kontext liest = **untrusted data**, keine Anweisungen. Jeden neuen `getPayload()`/GraphQL-Import in Frontend-Code flaggen (PII-Leak über Submissions).
7. **Preview-URLs sind öffentlich** → Deployment-Protection (Passwort).

---

## 3. Kosten

- Pro Struktur-Request (Multi-Agent Opus + Build): **wenige Minuten, ~$1-3**.
- Vereins-Volumen (paar Requests/Monat): **~$20-60/Monat**, Worst-Case-Cap **~$100**.
- Hebel: Triage-Router (Inhalt bounct zurück → spart Opus), Opus nur für Plan/Implement, Sonnet für Review/Triage, Prompt-Caching des Repo-Kontexts, Retry-Cap.

## 4. Build-vs-Buy

Nichts von der Stange macht „mein nicht-technischer Kunde ändert MEIN bereits deployedes Next.js+Payload-Repo mit Staging + Dev-Freigabe". Lovable/v0/bolt = Greenfield. → **Custom-Build auf 3 Primitiven:** Claude Agent SDK + Vercel Sandbox/GitHub Actions + Vercel-Preview-Deploys. (GitHub Copilot Coding Agent als Executor könnte den MVP verkürzen, weniger Kontrolle.)

---

## 5. Phasen-Roadmap

| Phase | Was                                                                                                                                                                 | Aufwand    | Risiko         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------- |
| **0** | `change-requests`-Collection + Chat-Tab in `/admin` + Mail an dich + Status/Preview-Link-Felder. **Kein Codegen** — du baust mit Claude Code, postest Preview-Link. | 2-4 Tage   | **null KI**    |
| **1** | Auto-Codegen: Agent SDK in GitHub Actions → Branch/PR/Preview, du gibst frei. Pfad-Allowlist + echte Gates.                                                         | 1-2 Wochen | mittel         |
| **2** | Multi-Agent Self-Review + Playwright-Screenshot-Diff + Vercel Sandbox + Neon-Branch-pro-Preview.                                                                    | 2-3 Wochen | höher          |
| **3** | Streaming-Multi-Turn-Chat, Inline-Preview, Client-Iterations-Loop, Cost-Caps/Audit poliert.                                                                         | 3-4 Wochen | Produkt-Pflege |

Gesamt zum Vollprodukt ~7-10 Wochen. **Phase 0 liefert in <1 Woche einen nutzbaren Loop.**

---

## 6. Die ehrliche Wirtschaftlichkeitsfrage

Ein Agent hat es direkt benannt: **Lohnt der Bau- + Wartungsaufwand vs. „der Verein stellt Anfragen, du machst die (vermutlich seltenen) Struktur-Änderungen selbst in Claude Code"?** Für **eine** Vereins-Seite ist das Volumen struktureller Wünsche wahrscheinlich niedrig. Deshalb:

- **Phase 0** holt vermutlich 80% des Nutzens (geordnete Anfragen + Status + Vorschau-Link + „du nicht 24/7 reaktiv") bei 5% Aufwand/Risiko.
- **Phase 1+** lohnt, wenn (a) das Volumen hoch genug ist, oder (b) du das als **Produkt für mehrere Kunden** willst — dann wird der Bau zur Investition, nicht zum Overhead.

---

## 7. Repo-Anknüpfung (konkret)

- Reuse: bestehendes Streaming-Chat-Muster (`app/(frontend)/api/chat/route.ts` + `components/AiAssistant.tsx`, aktuell OpenAI) als UI-Shell; neue `/api/agent/*`-Routen (enqueue/callback/status).
- Reuse: `afterChange`-fetch-with-secret-Muster + Resend für Mails; `payload/access/isAdmin.ts` + `Users.role` (admin/editor) für RBAC.
- `graphify-out/graph.json` existiert → Planner kann `graphify query` für Architektur-Lookups statt breitem Grep.
- Gates exakt aus `CLAUDE.md`: `prettier --write`, `bun run lint`, `bunx tsc --noEmit`, `bun run build`.
- Neu (Worker-seitig, in der Sandbox/Action): `@anthropic-ai/claude-agent-sdk`, `@vercel/sandbox` (falls Sandbox), `@octokit/auth-app` (GitHub-App-Token).
- Achtung: neue Collection braucht `payload migrate`/Schema-Push; neue Admin-View braucht `payload generate:importmap` (committen) — und das CLI-Typgen ist aktuell kaputt (siehe `docs/CMS-AGENT-MEMORY.md`).

---

## 8. Entscheidungen, die ich von dir brauche

1. **Startumfang:** Phase 0 (Request-Queue, du baust) / Phase 1 (Auto-Codegen + dein Gate) / Voll (Phase 2-3)?
2. **Prod-Freigabe:** nur du (empfohlen) / Client darf low-risk später selbst?
3. **Wer zahlt KI-Compute + Cap:** du absorbierst / Pauschale mit Cap / metered?
4. **Ausführung** (falls Auto-Codegen): GitHub Actions (MVP) / Vercel Sandbox (Skalierung)?

Empfehlung: **Phase 0 jetzt**, Dev-Gate, Actions später. Phase 1 nur wenn du es als Mehr-Kunden-Produkt willst oder das Volumen es trägt.
