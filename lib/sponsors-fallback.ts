export type FallbackSponsor = {
  id: string;
  name: string;
  url: string;
  tier: "premium" | "standard";
  /** Static logo shipped in public/uploads (mirrored from the partner site). */
  logoSrc: string | null;
  /** Which chip background the logo artwork needs to stay readable. */
  logoBg: "light" | "dark";
};

export const FALLBACK_SPONSORS: FallbackSponsor[] = [
  {
    id: "ab-pertler",
    name: "a+b Pertler",
    url: "https://www.pertler-dach.de/",
    tier: "premium",
    logoSrc: "/uploads/sponsor1.avif",
    logoBg: "light",
  },
  {
    id: "ballauf-schopp",
    name: "Ballauf & Schopp Logistic GmbH",
    url: "https://www.ballauf-schopp.de/ueber-uns/team/",
    tier: "premium",
    logoSrc: "/uploads/sponsor-ballauf-schopp.avif",
    logoBg: "light",
  },
  {
    id: "btu-hartmeier",
    name: "BTU HARTMEIER Unternehmensgruppe",
    url: "https://www.btu-hartmeier.de/",
    tier: "premium",
    logoSrc: "/uploads/sponsor-btu-hartmeier.avif",
    logoBg: "light",
  },
  {
    id: "seethaler",
    name: "SEETHALER FRISEURE",
    url: "https://www.seethaler-friseure-muc.com/",
    tier: "premium",
    logoSrc: "/uploads/sponsor-seethaler.avif",
    logoBg: "light",
  },
  {
    id: "wuerttembergische",
    name: "Württembergische – Stichaner & Borowski",
    url: "https://www.wuerttembergische.de/versicherungen/christian.stichaner",
    tier: "premium",
    logoSrc: "/uploads/sponsor-wuerttembergische.avif",
    logoBg: "light",
  },
  {
    id: "wohnen-und-gut-leben",
    name: "Wohnen und gut leben",
    url: "https://www.wohnen-und-gut-leben.de",
    tier: "premium",
    logoSrc: "/uploads/sponsor-wohnen-und-gut-leben.avif",
    logoBg: "light",
  },
  {
    id: "bs-hagenbusch",
    name: "BrandSchutz Benedict Hagenbusch",
    url: "https://www.bs-bh.de/",
    tier: "standard",
    logoSrc: "/uploads/sponsor-bs-hagenbusch.avif",
    logoBg: "light",
  },
  {
    id: "swm",
    name: "SWM Stadtwerke München GmbH",
    url: "https://www.swm.de",
    tier: "standard",
    logoSrc: "/uploads/sponsor-swm.avif",
    logoBg: "light",
  },
  {
    id: "get-flashed-media",
    name: "Get Flashed Media GmbH",
    url: "https://www.getflashedmedia.de/",
    tier: "standard",
    logoSrc: "/uploads/sponsor-get-flashed-media.avif",
    logoBg: "dark",
  },
];

function normalise(name: string): string {
  return name.trim().toLowerCase();
}

const BY_NAME = new Map(FALLBACK_SPONSORS.map((s) => [normalise(s.name), s]));

/**
 * Resolve the static logo (and required chip background) for a sponsor by
 * name. Used as fallback when a CMS sponsor doc has no uploaded logo, and as
 * the source of the light/dark background hint for CMS-provided logos.
 */
export function sponsorLogoFallback(name: string): {
  logoSrc: string | null;
  logoBg: "light" | "dark";
} {
  const match = BY_NAME.get(normalise(name));
  return match
    ? { logoSrc: match.logoSrc, logoBg: match.logoBg }
    : { logoSrc: null, logoBg: "light" };
}
