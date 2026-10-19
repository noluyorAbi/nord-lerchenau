# Documentation index

Developer documentation is in English. Documents written for or with the club
(`client/`, most of `decisions/` and `archive/`) are in German.

## Start here

- [../README.md](../README.md): what the project is, stack, quick start, scripts
- [ARCHITECTURE.md](ARCHITECTURE.md): system overview, rendering and caching, CMS model, storage switch, known tech debt
- [RUNBOOK.md](RUNBOOK.md): environments, environment variables, deploy procedure, local traps, scripts, incidents
- [../CONTRIBUTING.md](../CONTRIBUTING.md): setup, branch and commit workflow, changes that need extra care

## Operations

- [../video/README.md](../video/README.md): how to re-record and publish the admin tutorial video (German), plus the Remotion template notes
- [../video/tools/README.md](../video/tools/README.md): the vendored narrate, assemble and finish pipeline used by the tutorial video
- [../video/TEMPLATE.md](../video/TEMPLATE.md): contract of the Remotion launch-asset template the `video/` folder was created from

## Decisions

Dated technical write-ups. Each explains a problem, what was built and why.

- [decisions/CMS-BILDER-ANALYSE-2026-08-18.md](decisions/CMS-BILDER-ANALYSE-2026-08-18.md): root cause of broken admin image uploads (Blob plugin removed), the fix, and the server-upload and WebP decisions
- [decisions/ADMIN-ONBOARDING-2026-08-18.md](decisions/ADMIN-ONBOARDING-2026-08-18.md): German admin UI, guided tour, tutorial video and glossary for non-technical editors
- [decisions/BILDER-EDITIERBAR-2026-08-26.md](decisions/BILDER-EDITIERBAR-2026-08-26.md): moving hardcoded site photos into the media collection so the club can replace them

## Client

Documents exchanged with the club, in German.

- [client/KUNDEN-FEEDBACK-2026-07-12.md](client/KUNDEN-FEEDBACK-2026-07-12.md): response to the club's change document of 2 June 2026, item by item
- [client/DATENSCHUTZ-ANGABEN-2026-07-24.md](client/DATENSCHUTZ-ANGABEN-2026-07-24.md): technical facts (hosting, services, cookies) for the club's privacy policy
- [client/KUNDEN-FEEDBACK-2026-08-21.md](client/KUNDEN-FEEDBACK-2026-08-21.md): response to the club's feedback of 21 August 2026 (duplicate content sources between admin and code)
- [client/CMS-TEXTE-2026-08-27.md](client/CMS-TEXTE-2026-08-27.md): legal texts and dead admin switches, what was moved into the CMS and how it was rolled out

## Audits

Point-in-time measurements, kept verbatim.

- [audits/lighthouse-2026-08-18.md](audits/lighthouse-2026-08-18.md): Lighthouse run against the live home page
- [audits/lighthouse-2026-08-19.md](audits/lighthouse-2026-08-19.md): Lighthouse rerun after the contrast and image fixes

## Archive

Historical, no longer maintained. Superseded by `RUNBOOK.md` and `ARCHITECTURE.md`; kept for context only.

- [archive/initial-spec-2026-04/specs/2026-04-16-svnord-website-design.md](archive/initial-spec-2026-04/specs/2026-04-16-svnord-website-design.md): original design spec for the rebuild
- [archive/initial-spec-2026-04/plans/2026-04-16-svnord-p1-foundation.md](archive/initial-spec-2026-04/plans/2026-04-16-svnord-p1-foundation.md): phase 1 implementation plan (Payload schema and seed)
- [archive/DEPLOYMENT-initial-2026-06.md](archive/DEPLOYMENT-initial-2026-06.md): first deployment guide (Vercel, Neon, Blob, Resend)
- [archive/TODO-deployment-2026-06.md](archive/TODO-deployment-2026-06.md): checklist that went with the first deployment
- [archive/TODO-dns-2026-06.md](archive/TODO-dns-2026-06.md): DNS go-live steps for `svnord-lerchenau.de`
- [archive/ROLLOUT-CHECKLIST-2026-06-26.md](archive/ROLLOUT-CHECKLIST-2026-06-26.md): pre-go-live checklist built from client messages and a code audit
- [archive/STORAGE-DB-PLAN.md](archive/STORAGE-DB-PLAN.md): storage and database state and plan as of 30 June 2026
- [archive/branch-client-wishes-juni2026.md](archive/branch-client-wishes-juni2026.md): notes for the June 2026 client-wishes branch
- [archive/SOMMERFEST-CLEANUP.md](archive/SOMMERFEST-CLEANUP.md): removal steps for the time-limited summer party section (done)
- [archive/OFFENE-PUNKTE-2026-08-19.md](archive/OFFENE-PUNKTE-2026-08-19.md): open items list as of 19 August 2026
