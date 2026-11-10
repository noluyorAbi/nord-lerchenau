import { z } from "zod";

import {
  CLUB_CHANGE_VALUES,
  EXPERIENCE_VALUES,
  PLAYED_BEFORE_VALUES,
  PLAYER_GENDER_VALUES,
  isProbetrainingTopic,
  type ClubChange,
  type Experience,
  type PlayedBefore,
  type PlayerGender,
} from "@/lib/contact-topics";
import { birthYearRange, tooYoungMessage } from "@/lib/probetraining-team";

/** Leere Eingaben aus dem Formular gelten als "nicht angegeben". */
const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const contactSchema = z
  .object({
    name: z.string().min(2, "Bitte Namen angeben").max(100),
    email: z.string().email("Gültige E-Mail bitte"),
    phone: z.string().min(5, "Bitte Telefon angeben").max(40),
    address: z.string().min(5, "Bitte Adresse angeben").max(300),
    topic: z.string().max(100).optional(),
    subject: z.string().min(3, "Bitte Betreff angeben").max(200),
    message: z.string().min(10, "Bitte etwas ausführlicher").max(5000),
    website: z.string().max(0).optional(),

    // Zusatzfragen, nur beim Anliegen "Probetraining" ausgewertet.
    birthYear: z.preprocess(
      blankToUndefined,
      z.coerce
        .number({ error: "Bitte das Geburtsjahr als Zahl angeben" })
        .int("Bitte das Geburtsjahr als Zahl angeben")
        .optional(),
    ),
    playerGender: z.preprocess(
      blankToUndefined,
      z.enum(PLAYER_GENDER_VALUES).optional(),
    ),
    playedBefore: z.preprocess(
      blankToUndefined,
      z.enum(PLAYED_BEFORE_VALUES).optional(),
    ),
    experience: z.preprocess(
      blankToUndefined,
      z.enum(EXPERIENCE_VALUES).optional(),
    ),
    clubChange: z.preprocess(
      blankToUndefined,
      z.enum(CLUB_CHANGE_VALUES).optional(),
    ),
    currentClub: z.preprocess(
      blankToUndefined,
      z.string().trim().max(120, "Bitte kürzer fassen").optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (!isProbetrainingTopic(data.topic)) return;

    const need = (path: keyof typeof data, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    const { min, max } = birthYearRange();
    if (data.birthYear === undefined) {
      need("birthYear", "Bitte das Geburtsjahr angeben");
    } else if (data.birthYear < min || data.birthYear > max) {
      need(
        "birthYear",
        tooYoungMessage(data.birthYear) ??
          `Bitte ein Geburtsjahr zwischen ${min} und ${max} angeben`,
      );
    }

    if (!data.playerGender) need("playerGender", "Bitte auswählen");

    if (!data.playedBefore) {
      need("playedBefore", "Bitte auswählen");
      return;
    }
    if (data.playedBefore !== "ja") return;

    if (!data.experience) need("experience", "Bitte auswählen");
    if (!data.clubChange) {
      need("clubChange", "Bitte auswählen");
      return;
    }
    if (data.clubChange === "ja" && (data.currentClub?.length ?? 0) < 2) {
      need("currentClub", "Bitte den aktuellen Verein angeben");
    }
  });

export type ContactInput = z.infer<typeof contactSchema>;

export type ProbetrainingDetails = {
  birthYear: number;
  playerGender: PlayerGender;
  playedBefore: PlayedBefore;
  experience?: Experience;
  clubChange?: ClubChange;
  currentClub?: string;
};

/**
 * Die Zusatzangaben, die zur Antwort gehoeren, sonst null. Wer "Nein, noch
 * nie" waehlt, behaelt keine Vereinsangaben, auch wenn das Formular vorher
 * welche enthielt.
 */
export function probetrainingDetails(
  data: ContactInput,
): ProbetrainingDetails | null {
  if (!isProbetrainingTopic(data.topic)) return null;
  if (
    data.birthYear === undefined ||
    !data.playerGender ||
    !data.playedBefore
  ) {
    return null;
  }

  const details: ProbetrainingDetails = {
    birthYear: data.birthYear,
    playerGender: data.playerGender,
    playedBefore: data.playedBefore,
  };
  if (data.playedBefore !== "ja") return details;

  details.experience = data.experience;
  details.clubChange = data.clubChange;
  if (data.clubChange === "ja" && data.currentClub) {
    details.currentClub = data.currentClub;
  }
  return details;
}
