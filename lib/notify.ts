import { Resend } from "resend";

/**
 * Fire-and-forget email notification to the developer (Alperen). Used by the
 * AI-Studio change-request flow to ping the dev when a club member submits a
 * request or makes a decision on a preview. Never throws — a failed notification
 * must not break the CMS save.
 *
 * Recipient precedence: DEV_NOTIFY_EMAIL -> RESEND_TO_EMAIL -> info@svnord.de.
 * No-op when RESEND_API_KEY / RESEND_FROM_EMAIL are unset (e.g. local dev).
 */
export async function notifyDev(subject: string, body: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail =
    process.env.DEV_NOTIFY_EMAIL ??
    process.env.RESEND_TO_EMAIL ??
    "info@svnord.de";

  if (!resendKey || !fromEmail) {
    // Surfaces the intent in dev logs without sending.
    console.info(`[notifyDev] (no Resend config) ${subject}`);
    return;
  }

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      text: body,
    });
  } catch (err) {
    console.warn("[notifyDev] failed to send:", err);
  }
}
