/**
 * Anliegen des Kontaktformulars und die Antwortoptionen der zusaetzlichen
 * Probetraining-Fragen. Formular, Validierung, Mail und Admin lesen alle
 * dieselbe Quelle, damit die Texte nicht auseinanderlaufen.
 */

export const TOPICS = [
  "Probetraining · Großfeld (Herren)",
  "Probetraining · Großfeld (Damen)",
  "Probetraining · Kleinfeld (Jugend)",
  "Mitgliedschaft",
  "Vereinsheim / Veranstaltung",
  "Sponsoring",
  "Allgemeine Anfrage",
] as const;

export function isProbetrainingTopic(topic: string | undefined | null) {
  return typeof topic === "string" && topic.startsWith("Probetraining");
}

export const PLAYED_BEFORE = [
  { value: "ja", label: "Ja" },
  { value: "nein", label: "Nein, noch nie" },
] as const;

/** Wie lange wurde schon Fussball gespielt: grobe Stufen reichen zum Einordnen. */
export const EXPERIENCE = [
  { value: "unter-1-jahr", label: "Weniger als 1 Jahr" },
  { value: "1-2-jahre", label: "1 bis 2 Jahre" },
  { value: "3-5-jahre", label: "3 bis 5 Jahre" },
  { value: "ueber-5-jahre", label: "Mehr als 5 Jahre" },
] as const;

export const CLUB_CHANGE = [
  { value: "ja", label: "Ja, ich möchte wechseln" },
  { value: "nein", label: "Nein, ich bleibe in meinem Verein" },
  { value: "ohne-verein", label: "Ich spiele zurzeit in keinem Verein" },
] as const;

export type PlayedBefore = (typeof PLAYED_BEFORE)[number]["value"];
export type Experience = (typeof EXPERIENCE)[number]["value"];
export type ClubChange = (typeof CLUB_CHANGE)[number]["value"];

export const PLAYED_BEFORE_VALUES = PLAYED_BEFORE.map((o) => o.value) as [
  PlayedBefore,
  ...PlayedBefore[],
];
export const EXPERIENCE_VALUES = EXPERIENCE.map((o) => o.value) as [
  Experience,
  ...Experience[],
];
export const CLUB_CHANGE_VALUES = CLUB_CHANGE.map((o) => o.value) as [
  ClubChange,
  ...ClubChange[],
];

type Option<V extends string> = { value: V; label: string };

export function labelFor<V extends string>(
  options: readonly Option<V>[],
  value: V | undefined | null,
): string | undefined {
  return options.find((o) => o.value === value)?.label;
}

/** Aelteste und juengste plausible Jahrgaenge (Herren bis Bambini). */
export const BIRTH_YEAR_MIN = 1940;
export const BIRTH_YEAR_MAX_AGE = 3;
