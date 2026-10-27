import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import {
  CONSENT_CATEGORIES,
  CONSENT_TEXT,
  existingConsentReason,
  MAX_ENTRIES_PER_EMAIL,
  generateToken,
  PENDING_TTL_MS,
  photoConsentSchema,
  type ConsentStatus,
} from "@/lib/photo-consent";
import { sendConfirmationRequest } from "@/lib/photo-consent-mail";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültiges JSON." },
      { status: 400 },
    );
  }

  const parsed = photoConsentSchema.safeParse(body);
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

  const { team, childName, parentName } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  try {
    const client = await getPayloadClient();

    const teamDoc = await client
      .findByID({ collection: "teams", id: team, depth: 0 })
      .catch(() => null);
    if (!teamDoc || !CONSENT_CATEGORIES.includes(teamDoc.category ?? "")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Bitte Formularangaben prüfen.",
          fieldErrors: { team: ["Bitte Mannschaft auswählen"] },
        },
        { status: 400 },
      );
    }

    // Gleiche Zustimmung schon da (bestaetigt, oder offen und noch gueltig):
    // nichts neu anlegen und keine zweite Mail an dieselbe Adresse schicken.
    const existing = await client.find({
      collection: "photo-consents",
      where: {
        and: [
          { team: { equals: team } },
          { email: { equals: email } },
          { childName: { equals: childName } },
          { status: { not_equals: "widerrufen" } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    // Keine zweite Mail an dieselbe Adresse; die Seite sagt, warum.
    const prior = existing.docs[0];
    const already = existingConsentReason(
      prior
        ? { status: prior.status as ConsentStatus, createdAt: prior.createdAt }
        : undefined,
      new Date(),
    );
    if (already) {
      return NextResponse.json({ ok: true, already });
    }

    // Gegen Mail-Spam an fremde Adressen: Eintraege pro Adresse deckeln,
    // egal in welchem Status. Ein echtes Rate-Limit pro IP fehlt noch.
    const recent = await client.count({
      collection: "photo-consents",
      where: {
        and: [
          { email: { equals: email } },
          {
            createdAt: {
              greater_than: new Date(Date.now() - PENDING_TTL_MS).toISOString(),
            },
          },
        ],
      },
      overrideAccess: true,
    });
    if (recent.totalDocs >= MAX_ENTRIES_PER_EMAIL) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Mit dieser Adresse wurden in den letzten Tagen schon mehrere Zustimmungen eingetragen. Bitte melde dich für weitere direkt beim Verein.",
        },
        { status: 429 },
      );
    }

    const { token, tokenHash } = generateToken();
    const created = await client.create({
      collection: "photo-consents",
      data: {
        team,
        childName,
        parentName,
        email,
        source: "online",
        status: "offen",
        consentText: CONSENT_TEXT,
        tokenHash,
      },
      overrideAccess: true,
    });

    try {
      await sendConfirmationRequest({
        email,
        parentName,
        childName,
        teamName: teamDoc.name,
        token,
      });
    } catch (err) {
      console.error("[/api/foto-zustimmung] Resend failed:", err);
      // Ohne Mail kann niemand bestaetigen; der Eintrag wuerde nur einen
      // neuen Versuch blockieren.
      await client
        .delete({
          collection: "photo-consents",
          id: created.id,
          overrideAccess: true,
        })
        .catch(() => undefined);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Die Bestätigungsmail konnte nicht verschickt werden. Bitte später erneut versuchen.",
        },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[/api/foto-zustimmung] failed to persist consent:", err);
    return NextResponse.json(
      { ok: false, error: "Speichern fehlgeschlagen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
