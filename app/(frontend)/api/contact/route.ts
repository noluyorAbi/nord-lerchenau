import { NextResponse } from "next/server";
import { Resend } from "resend";

import { contactSchema, probetrainingDetails } from "@/lib/contact-schema";
import {
  CLUB_CHANGE,
  EXPERIENCE,
  PLAYED_BEFORE,
  PLAYER_GENDER,
  labelFor,
  type PlayerGender,
} from "@/lib/contact-topics";
import { suggestTeam } from "@/lib/probetraining-team";
import { getPayloadClient } from "@/lib/payload";

function suggestedTeamLine(birthYear: number, gender: PlayerGender) {
  const title = suggestTeam(birthYear, gender)?.title;
  return title ? `Vorgeschlagene Mannschaft: ${title}` : null;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültiges JSON." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Bitte Formularangaben prüfen.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Honeypot filled → pretend success (don't tip off bots).
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, address, subject, message } = parsed.data;
  const training = probetrainingDetails(parsed.data);
  // Der Vorschlag wird hier berechnet, nicht vom Browser uebernommen: so steht
  // in der Anfrage, was zum Zeitpunkt des Absendens galt.
  const trainingLines = training
    ? [
        `Jahrgang: ${training.birthYear} (${labelFor(PLAYER_GENDER, training.playerGender)})`,
        suggestedTeamLine(training.birthYear, training.playerGender),
        `Schon Fußball gespielt: ${labelFor(PLAYED_BEFORE, training.playedBefore)}`,
        training.experience
          ? `Spielerfahrung: ${labelFor(EXPERIENCE, training.experience)}`
          : null,
        training.clubChange
          ? `Vereinswechsel: ${labelFor(CLUB_CHANGE, training.clubChange)}`
          : null,
        training.currentClub
          ? `Aktueller Verein: ${training.currentClub}`
          : null,
      ]
    : [];
  const details = trainingLines.filter(Boolean).join("\n");
  // Die Angaben stehen auch in der gespeicherten Nachricht, damit sie bei einem
  // Mailausfall nicht verloren gehen (kein eigenes Datenbankfeld noetig).
  const storedMessage = details ? `${details}\n\n${message}` : message;

  try {
    const client = await getPayloadClient();
    await client.create({
      collection: "submissions",
      data: {
        name,
        email,
        phone,
        address,
        subject,
        message: storedMessage,
      },
      overrideAccess: true,
    });
  } catch (err) {
    console.error("[/api/contact] failed to persist submission:", err);
    return NextResponse.json(
      { ok: false, error: "Speichern fehlgeschlagen." },
      { status: 500 },
    );
  }

  // INTERIM (2026-07-06): RESEND_FROM_EMAIL sendet aktuell von der verifizierten
  // Domain adatepe.dev, weil svnord.de noch nicht in Resend verifiziert ist.
  // TODO: Vereins-Resend-Konto anlegen, svnord.de per DNS (SPF/DKIM/DMARC)
  // verifizieren und RESEND_FROM_EMAIL auf eine kontakt@svnord.de-Adresse umstellen.
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.RESEND_TO_EMAIL ?? "info@svnord.de";

  if (resendKey && fromEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        replyTo: email,
        subject: subject
          ? `Kontaktformular · ${subject}`
          : `Kontaktformular · Nachricht von ${name}`,
        text: [
          `Name: ${name}`,
          `E-Mail: ${email}`,
          phone ? `Telefon: ${phone}` : null,
          address ? `Adresse: ${address}` : null,
          subject ? `Betreff: ${subject}` : null,
          details || null,
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (err) {
      console.error("[/api/contact] Resend failed (submission saved):", err);
      // Still return success — the submission is persisted in Payload.
    }
  }

  return NextResponse.json({ ok: true });
}
