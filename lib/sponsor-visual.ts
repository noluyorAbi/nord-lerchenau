// Pro Sponsor-Logo die passende Kachel-Fläche. Die meisten gelieferten
// Logos sind dunkel gezeichnet (schwarz/grau/navy auf transparent) und
// brauchen eine helle Fläche; rein weiße Logos brauchen die dunkle.
// Einzeln geprüft am 2026-07-12 (alle 9 Logos gesichtet).

export type SponsorTone = "light" | "dark";

/** Sponsoren, deren Logo (weitgehend) weiß gezeichnet ist. */
const DARK_TONE_SPONSORS = new Set(["a+b pertler", "get flashed media gmbh"]);

export function sponsorTone(name: string): SponsorTone {
  return DARK_TONE_SPONSORS.has(name.trim().toLowerCase()) ? "dark" : "light";
}
