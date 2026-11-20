import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  buildMail,
  decodePdf,
  spielerpassSubmitSchema,
} from "@/lib/spielerpass-submit";

/**
 * Nimmt den im Browser erzeugten Antrag entgegen und schickt ihn per Mail an
 * den Verein. Es wird bewusst nichts in der Datenbank gespeichert.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const parsed = spielerpassSubmitSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Bitte Angaben prüfen.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Honeypot gefüllt: so tun, als wäre alles gut.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const { pdf, website: _website, ...data } = parsed.data;
  void _website;
  const pdfBytes = decodePdf(pdf);
  if (!pdfBytes) {
    return NextResponse.json(
      { ok: false, error: "Die PDF-Datei ist ungültig." },
      { status: 400 },
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.RESEND_TO_EMAIL ?? "info@svnord.de";
  if (!resendKey || !fromEmail) {
    console.error("[/api/spielerpass] RESEND_API_KEY/RESEND_FROM_EMAIL fehlt");
    return NextResponse.json(
      { ok: false, error: "Der Versand ist gerade nicht möglich." },
      { status: 503 },
    );
  }

  const { subject, text, fileName } = buildMail(data, new Date());
  try {
    const { error } = await new Resend(resendKey).emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject,
      text,
      attachments: [{ filename: fileName, content: pdfBytes }],
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    // Keine Antragsdaten ins Log, nur der Fehler.
    console.error("[/api/spielerpass] Versand fehlgeschlagen:", err);
    return NextResponse.json(
      { ok: false, error: "Der Versand ist fehlgeschlagen." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
