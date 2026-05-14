export const TAG_LABELS: Record<string, string> = {
  spielbericht: "Spielbericht",
  verein: "Verein",
  jugend: "Jugend",
  event: "Event",
  sponsoren: "Sponsoren",
  allgemein: "Allgemein",
};

const TAG_GRADIENT: Record<string, { from: string; to: string; ink: string }> =
  {
    spielbericht: { from: "#0b1b3f", to: "#1e3a8a", ink: "#c8a96a" },
    verein: { from: "#2b1d0e", to: "#7c5e21", ink: "#f7e6c4" },
    jugend: { from: "#0b3a4a", to: "#168aad", ink: "#fff5e0" },
    event: { from: "#3a0b2e", to: "#a13670", ink: "#ffeacd" },
    sponsoren: { from: "#2a2a2a", to: "#525252", ink: "#c8a96a" },
    allgemein: { from: "#0b1b3f", to: "#3b4a6b", ink: "#c8a96a" },
  };

const FALLBACK_GRADIENT = TAG_GRADIENT.allgemein;

/**
 * Hard-coded hero image overrides for posts imported from the legacy site
 * where no Media doc exists yet. Add new entries here as articles get
 * imported.
 */
export const NEWS_HERO_BY_SLUG: Record<string, string> = {
  "historischer-aufstieg-in-die-landesliga":
    "/news/historischer-aufstieg-in-die-landesliga.jpg",
  "karger-kommt": "/news/karger-kommt.jpg",
};

export function newsTagLabel(tag: string | null | undefined): string {
  if (!tag) return "News";
  return TAG_LABELS[tag] ?? tag;
}

export function newsGradient(tag: string | null | undefined) {
  if (!tag) return FALLBACK_GRADIENT;
  return TAG_GRADIENT[tag] ?? FALLBACK_GRADIENT;
}

/**
 * Deterministic CSS background string for a post when no real hero image is
 * available. Uses tag colors plus a slug-derived angle so adjacent cards
 * look distinct.
 */
export function newsFallbackBackground(
  tag: string | null | undefined,
  slug: string,
): string {
  const g = newsGradient(tag);
  const angle = [...slug].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return `linear-gradient(${angle}deg, ${g.from} 0%, ${g.to} 100%)`;
}

export function newsHeroForPost(
  slug: string,
  tag: string | null | undefined,
): { kind: "image"; src: string } | { kind: "gradient"; css: string } {
  const override = NEWS_HERO_BY_SLUG[slug];
  if (override) return { kind: "image", src: override };
  return { kind: "gradient", css: newsFallbackBackground(tag, slug) };
}

export function formatNewsDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
