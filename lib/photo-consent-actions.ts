import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import {
  decideConfirm,
  decideRevoke,
  hashToken,
  hidesTeamPhoto,
  tokenSchema,
  type ConsentStatus,
} from "@/lib/photo-consent";
import { notifyClub } from "@/lib/photo-consent-mail";

/**
 * Gemeinsamer Ablauf fuer die Bestaetigungs- und Widerrufs-Route. Beide laufen
 * per POST aus einer Seite mit Button, nie direkt per GET aus dem Mail-Link:
 * Mail-Scanner rufen Links vorab auf und wuerden sonst ungefragt bestaetigen
 * oder widerrufen.
 */

const MESSAGES = {
  abgelaufen:
    "Der Link ist abgelaufen. Bitte fülle das Formular noch einmal aus.",
  widerrufen: "Diese Zustimmung wurde bereits widerrufen.",
  "schon-bestaetigt": "Diese Zustimmung ist bereits bestätigt.",
} as const;

export async function handleConsentAction(
  request: Request,
  action: "bestaetigen" | "widerrufen",
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültiges JSON." },
      { status: 400 },
    );
  }
  const parsed = tokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Der Link ist ungültig." },
      { status: 400 },
    );
  }

  try {
    const client = await getPayloadClient();
    const found = await client.find({
      collection: "photo-consents",
      where: { tokenHash: { equals: hashToken(parsed.data.token) } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    });
    const consent = found.docs[0];
    if (!consent) {
      return NextResponse.json(
        { ok: false, error: "Der Link ist ungültig." },
        { status: 404 },
      );
    }

    const status = consent.status as ConsentStatus;
    const now = new Date();
    const decision =
      action === "bestaetigen"
        ? decideConfirm(status, consent.createdAt, now)
        : decideRevoke(status);
    if (!decision.ok) {
      return NextResponse.json(
        { ok: false, error: MESSAGES[decision.reason] },
        { status: 409 },
      );
    }

    const team = typeof consent.team === "object" ? consent.team : null;
    const teamId = team?.id ?? (consent.team as number);
    const teamName = team?.name ?? "Mannschaft";

    if (decision.next === "widerrufen" && hidesTeamPhoto(status)) {
      // Art. 7 Abs. 3 DSGVO: nach dem Widerruf muss das Foto sofort weg. Der
      // afterChange-Hook der Teams invalidiert dabei den Seiten-Cache. Das
      // Ausblenden kommt vor dem Statuswechsel: scheitert es, bleibt der
      // Eintrag bestaetigt und ein zweiter Klick versucht es erneut.
      await client.update({
        collection: "teams",
        id: teamId,
        data: { hidePhoto: true },
        overrideAccess: true,
      });
    }

    await client.update({
      collection: "photo-consents",
      id: consent.id,
      data:
        decision.next === "bestaetigt"
          ? { status: "bestaetigt", confirmedAt: now.toISOString() }
          : { status: "widerrufen", revokedAt: now.toISOString() },
      overrideAccess: true,
    });

    const confirmed = await client.count({
      collection: "photo-consents",
      where: {
        and: [
          { team: { equals: teamId } },
          { status: { equals: "bestaetigt" } },
        ],
      },
      overrideAccess: true,
    });

    // Ein nie bestaetigter Eintrag war nie gueltig; der Verein muss nichts tun.
    const clubMustAct =
      decision.next === "bestaetigt" || hidesTeamPhoto(status);
    try {
      if (clubMustAct)
        await notifyClub(
          decision.next === "bestaetigt" ? "bestaetigt" : "widerrufen",
          {
            childName: consent.childName,
            teamName,
            confirmedCount: confirmed.totalDocs,
          },
        );
    } catch (err) {
      // Status ist gespeichert; die Vereinsmail ist nur ein Hinweis.
      console.error(`[/api/foto-zustimmung/${action}] notify failed:`, err);
    }

    return NextResponse.json({
      ok: true,
      teamName,
      photoHidden: decision.next === "widerrufen" && hidesTeamPhoto(status),
    });
  } catch (err) {
    console.error(`[/api/foto-zustimmung/${action}] failed:`, err);
    return NextResponse.json(
      { ok: false, error: "Speichern fehlgeschlagen." },
      { status: 500 },
    );
  }
}
