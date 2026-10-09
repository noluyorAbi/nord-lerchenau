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

export type LogoBox = { width: number; height: number };

/**
 * Anzeigegröße eines Logos nach Fläche statt nach Kantenlänge.
 *
 * Mit "so groß wie die Kachel erlaubt" wurde ein quadratisches Logo
 * (Seethaler) riesig und ein sehr breites (Württembergische) ein dünner
 * Streifen. Gleiche Fläche lässt alle Logos optisch gleich schwer wirken.
 * Feste Pixelmaße statt `max-h-full`, weil Safari Prozenthöhen in einer
 * Kachel mit `aspect-ratio` ignoriert und das Seethaler-Logo auf dem iPad
 * aus der Kachel ragte.
 */
export function logoBox(
  width: number | null | undefined,
  height: number | null | undefined,
  area: number,
  maxHeight: number,
): LogoBox | null {
  if (!width || !height || width <= 0 || height <= 0) return null;
  const ratio = width / height;
  let w = Math.sqrt(area * ratio);
  let h = w / ratio;
  if (h > maxHeight) {
    h = maxHeight;
    w = h * ratio;
  }
  return { width: Math.round(w), height: Math.round(h) };
}
