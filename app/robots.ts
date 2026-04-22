import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

// Explicit allowlist for AI crawlers so they index the public site but stay
// out of the admin panel. Listing them by name also sidesteps the occasional
// overzealous bot-blocking default on platform edge networks.
const AI_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "DuckAssistBot",
  "FacebookBot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "cohere-ai",
  "YouBot",
  "DiffBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/admin", "/api/contact", "/api/revalidate"],
      },
      ...AI_AGENTS.map((agent) => ({
        userAgent: agent,
        allow: ["/", "/llms.txt", "/llms-full.txt", "/api/fupa"],
        disallow: ["/admin"],
      })),
    ],
    host: base,
    sitemap: `${base}/sitemap.xml`,
  };
}
