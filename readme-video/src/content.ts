/**
 * The only project-specific file in this workspace. Everything the README
 * banner, the demo video and the social card say about the project lives
 * here; the scenes, palette and timing are shared and stay untouched.
 *
 * Contract and writing rules: TEMPLATE.md one directory up.
 *
 * The screenshots in public/screens/ were captured from a local dev server
 * against a freshly seeded database (no production data, no admin views),
 * at 1600x900 with agent-browser.
 */

import type { Content } from "./content-types";

export const content: Content = {
  name: "SV Nord",

  tagline: "The club website, run by the club itself.",

  description:
    "SV Nord München-Lerchenau on Next.js 16 and Payload CMS, with live football data.",

  install: "bun install && bun run dev",

  repoUrl: "github.com/noluyorAbi/nord-lerchenau",

  // Club sky blue: readable on the dark stage, unlike the navy.
  accent: "#6ec7ea",

  highlights: ["Next.js 16", "Payload 3.91", "143 tests"],

  coldOpen: [
    "Fixtures, tables and squads.",
    "Pulled live from BFV and FuPa.",
    "Everything else edits in the admin.",
  ],

  windowTitle: "svnord.de",

  demo: {
    kind: "screens",
    shots: [
      { src: "screens/01-home.png", caption: "Next match and table on the home page" },
      { src: "screens/02-team.png", caption: "28 teams, each with its own page" },
      { src: "screens/03-club.png", caption: "The club, from 1947 to today" },
      { src: "screens/04-dates.png", caption: "Fixtures synced from the federation" },
      {
        src: "screens/05-join.png",
        caption: "Membership applications online",
        holdFrames: 120,
      },
    ],
  },
};
