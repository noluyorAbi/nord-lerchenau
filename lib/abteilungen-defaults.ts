import type { SportStat } from "@/components/SportSectionPage";

/**
 * Die mitgelieferten Schlagworte und Zahlen der Abteilungsseiten.
 *
 * Sie standen bisher in den fuenf Seitendateien und waren damit nur durch
 * einen Entwickler aenderbar, obwohl genau hier die Angaben stehen, die
 * veralten: Mitgliederzahlen, Trainingszeiten, Altersspannen. Seit dem
 * 27.08.2026 gewinnt der im Admin gepflegte Wert; diese Liste ist der
 * Rueckfall, solange nichts gepflegt ist.
 *
 * Sie liegt hier und nicht mehr in den Seiten, weil das Seed-Skript dieselben
 * Werte in die Datenbank schreiben muss. Zwei Fassungen derselben Zahl waeren
 * genau der Fehler, der die Rechtstexte auseinanderlaufen liess.
 */
export type SportKey =
  | "volleyball"
  | "gymnastik"
  | "ski"
  | "esport"
  | "schiedsrichter";

export type AbteilungDefaults = { pills: string[]; stats: SportStat[] };

export const ABTEILUNGEN_DEFAULTS: Record<SportKey, AbteilungDefaults> = {
  gymnastik: {
    pills: ["Seit 1967", "35 Aktive", "Zweimal pro Woche", "Waldmeisterschule"],
    stats: [
      { label: "Gegründet", value: "1967" },
      { label: "Mitglieder", value: "35" },
      { label: "Training", value: "2× pro Woche" },
      { label: "Halle", value: "Waldmeisterschule" },
      { label: "Offen für", value: "alle Erwachsenen" },
    ],
  },
  volleyball: {
    pills: ["Hobby & Mixed", "Seit 1984", "alle Stärken", "Waldmeisterschule"],
    stats: [
      { label: "Aktiv seit", value: "1984" },
      { label: "Form", value: "Hobby & Mixed" },
      { label: "Training", value: "1× Woche" },
      { label: "Halle", value: "Waldmeisterschule" },
      { label: "Altersspanne", value: "30-75 J." },
    ],
  },
  ski: {
    pills: ["Seit 20+ Jahren", "Anfänger:in bis Profi", "Skikurse", "Ski-Camp"],
    stats: [
      { label: "Aktiv seit", value: "über 20 J." },
      { label: "Skilehrer:innen", value: "2 aktive" },
      { label: "Form", value: "Kurse + Camp" },
      { label: "Niveau", value: "alle Stufen" },
      { label: "Wann", value: "Winter-Saison" },
    ],
  },
  esport: {
    pills: ["BFV-eLeague", "eRegionalliga", "eLandesliga", "FC26"],
    stats: [
      { label: "Aktiv seit", value: "2 Jahre" },
      { label: "Mannschaften", value: "2" },
      { label: "Spielklassen", value: "eRegional + eLandes" },
      { label: "Konsole", value: "FC26" },
      { label: "Einstieg", value: "ab 16 Jahren" },
    ],
  },
  schiedsrichter: {
    pills: ["BFV-Lizenz", "Ehrenamt", "Kreis → Bezirk", "Nachwuchs willkommen"],
    stats: [
      { label: "Aktive Schiris", value: "4" },
      { label: "Verband", value: "BFV" },
      { label: "Spielklassen", value: "Kreis bis Bezirk" },
      { label: "Lizenz", value: "C/B möglich" },
      { label: "Vergütung", value: "Spesen + Spielgeld" },
    ],
  },
};
