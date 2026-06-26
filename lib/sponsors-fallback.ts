export type FallbackSponsor = {
  id: string;
  name: string;
  url: string;
  tier: "premium" | "standard";
};

export const FALLBACK_SPONSORS: FallbackSponsor[] = [
  {
    id: "ab-pertler",
    name: "a+b Pertler",
    url: "https://www.pertler-dach.de/",
    tier: "premium",
  },
  {
    id: "ballauf-schopp",
    name: "Ballauf & Schopp Logistic GmbH",
    url: "https://www.ballauf-schopp.de/ueber-uns/team/",
    tier: "premium",
  },
  {
    id: "btu-hartmeier",
    name: "BTU HARTMEIER Unternehmensgruppe",
    url: "https://www.btu-hartmeier.de/",
    tier: "premium",
  },
  {
    id: "seethaler",
    name: "SEETHALER FRISEURE",
    url: "https://www.seethaler-friseure-muc.com/",
    tier: "premium",
  },
  {
    id: "wuerttembergische",
    name: "Württembergische – Stichaner & Borowski",
    url: "https://www.wuerttembergische.de/versicherungen/christian.stichaner",
    tier: "premium",
  },
  {
    id: "wohnen-und-gut-leben",
    name: "Wohnen und gut leben",
    url: "https://www.wohnen-und-gut-leben.de",
    tier: "premium",
  },
  {
    id: "bs-hagenbusch",
    name: "BrandSchutz Benedict Hagenbusch",
    url: "https://www.bs-bh.de/",
    tier: "standard",
  },
  {
    id: "swm",
    name: "SWM Stadtwerke München GmbH",
    url: "https://www.swm.de",
    tier: "standard",
  },
  {
    id: "get-flashed-media",
    name: "Get Flashed Media GmbH",
    url: "https://www.getflashedmedia.de/",
    tier: "standard",
  },
];
