import { NextResponse } from "next/server";
import { Resend } from "resend";

import { contactSchema } from "@/lib/contact-schema";
import { getPayloadClient } from "@/lib/payload";

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

  const { name, email, subject, message } = parsed.data;

  try {
    const client = await getPayloadClient();
    await client.create({
      collection: "submissions",
      data: { name, email, subject, message },
      overrideAccess: true,
    });
  } catch (err) {
    console.error("[/api/contact] failed to persist submission:", err);
    return NextResponse.json(
      { ok: false, error: "Speichern fehlgeschlagen." },
      { status: 500 },
    );
  }

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
          subject ? `Betreff: ${subject}` : null,
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
