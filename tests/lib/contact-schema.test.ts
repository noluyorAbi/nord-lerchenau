import { describe, expect, it } from "vitest";

import { contactSchema, probetrainingDetails } from "@/lib/contact-schema";
import { seasonEndYear } from "@/lib/probetraining-team";

const base = {
  name: "Max Muster",
  email: "max@example.de",
  phone: "0891234567",
  address: "Musterstraße 1, 80995 München",
  subject: "Probetraining · Anfrage",
  message: "Mein Sohn möchte gern mittrainieren.",
};
const training = { ...base, topic: "Probetraining" };
const player = { birthYear: "2014", playerGender: "spieler" };
const latestYear = seasonEndYear() - 4;

function errors(input: unknown) {
  const r = contactSchema.safeParse(input);
  return r.success ? {} : r.error.flatten().fieldErrors;
}

describe("contactSchema", () => {
  it("accepts a normal request without any training details", () => {
    expect(
      contactSchema.safeParse({ ...base, topic: "Sponsoring" }).success,
    ).toBe(true);
  });

  it("ignores empty training fields for other topics", () => {
    expect(
      contactSchema.safeParse({ ...base, topic: "Sponsoring", birthYear: "" })
        .success,
    ).toBe(true);
  });

  it("requires birth year, gender and the played-before answer for a Probetraining", () => {
    const e = errors(training);
    expect(e.birthYear).toBeDefined();
    expect(e.playerGender).toBeDefined();
    expect(e.playedBefore).toBeDefined();
  });

  it("rejects implausible birth years", () => {
    const withYear = (birthYear: string) =>
      errors({ ...training, ...player, birthYear, playedBefore: "nein" })
        .birthYear;

    expect(withYear("1900")).toBeDefined();
    expect(withYear("abc")).toBeDefined();
    expect(withYear(String(latestYear + 1))).toBeDefined();
    expect(withYear(String(latestYear))).toBeUndefined();
    expect(withYear("2014")).toBeUndefined();
  });

  it("accepts a player who never played, without club details", () => {
    const r = contactSchema.safeParse({
      ...training,
      ...player,
      playedBefore: "nein",
    });
    expect(r.success).toBe(true);
  });

  it("asks for experience and club situation when the player played before", () => {
    const e = errors({ ...training, ...player, playedBefore: "ja" });
    expect(e.experience).toBeDefined();
    expect(e.clubChange).toBeDefined();
  });

  it("requires the current club only when the player wants to change", () => {
    const ja = {
      ...training,
      ...player,
      playedBefore: "ja",
      experience: "3-5-jahre",
      clubChange: "ja",
    };
    expect(errors(ja).currentClub).toBeDefined();
    expect(errors({ ...ja, currentClub: "TSV Test" })).toEqual({});
    expect(errors({ ...ja, clubChange: "nein" })).toEqual({});
    expect(errors({ ...ja, clubChange: "ohne-verein" })).toEqual({});
  });
});

describe("probetrainingDetails", () => {
  it("is null for other topics", () => {
    const data = contactSchema.parse({ ...base, topic: "Sponsoring" });
    expect(probetrainingDetails(data)).toBeNull();
  });

  it("drops club details when the player never played", () => {
    const data = contactSchema.parse({
      ...training,
      ...player,
      playedBefore: "nein",
      experience: "3-5-jahre",
      clubChange: "ja",
      currentClub: "TSV Test",
    });
    expect(probetrainingDetails(data)).toEqual({
      birthYear: 2014,
      playerGender: "spieler",
      playedBefore: "nein",
    });
  });

  it("keeps the club only for a wanted change", () => {
    const wants = contactSchema.parse({
      ...training,
      ...player,
      playedBefore: "ja",
      experience: "1-2-jahre",
      clubChange: "ja",
      currentClub: "TSV Test",
    });
    expect(probetrainingDetails(wants)).toEqual({
      birthYear: 2014,
      playerGender: "spieler",
      playedBefore: "ja",
      experience: "1-2-jahre",
      clubChange: "ja",
      currentClub: "TSV Test",
    });

    const stays = contactSchema.parse({
      ...training,
      ...player,
      playedBefore: "ja",
      experience: "1-2-jahre",
      clubChange: "nein",
      currentClub: "TSV Test",
    });
    expect(probetrainingDetails(stays)?.currentClub).toBeUndefined();
  });
});
