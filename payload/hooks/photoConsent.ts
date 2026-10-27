import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
} from "payload";

import {
  generateToken,
  hidesTeamPhoto,
  PAPER_CONSENT_TEXT,
  statusTimestamps,
  type ConsentStatus,
} from "@/lib/photo-consent";

/**
 * Hooks der Collection photo-consents. Die Online-Route setzt alles selbst;
 * diese Hooks sorgen dafuer, dass ein Eintrag oder eine Aenderung von Hand im
 * Admin dieselben Regeln einhaelt.
 */

/** Kontext-Schalter: die Route hat das Team-Foto schon selbst ausgeblendet. */
export const PHOTO_HANDLED = "photoConsentPhotoHandled";

/**
 * Von Hand angelegte Eintraege (Papier-Einwilligung) haben keinen Mail-Link.
 * Sie bekommen trotzdem einen zufaelligen Token-Hash, damit das Pflichtfeld
 * gefuellt ist; der Token selbst wird nie verschickt und ist damit wertlos.
 */
export const fillManualConsent: CollectionBeforeValidateHook = ({
  data,
  operation,
}) => {
  if (operation !== "create" || !data) return data;
  return {
    ...data,
    tokenHash: data.tokenHash ?? generateToken().tokenHash,
    consentText:
      data.consentText ??
      (data.source === "papier" ? PAPER_CONSENT_TEXT : undefined),
  };
};

export const stampStatusChange: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  const next = (data.status ?? originalDoc?.status) as
    | ConsentStatus
    | undefined;
  if (!next) return data;
  return {
    ...data,
    ...statusTimestamps(
      next,
      {
        confirmedAt: data.confirmedAt ?? originalDoc?.confirmedAt,
        revokedAt: data.revokedAt ?? originalDoc?.revokedAt,
      },
      new Date(),
    ),
  };
};

/**
 * Wird eine bestaetigte Zustimmung widerrufen, muss das Foto weg, auch wenn
 * jemand den Status im Admin von Hand umstellt (Art. 7 Abs. 3 DSGVO). Laeuft
 * im selben Request, damit es mit der Statusaenderung zusammen gespeichert wird.
 */
export const hidePhotoOnRevoke: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (operation !== "update" || context[PHOTO_HANDLED]) return doc;
  const before = previousDoc?.status as ConsentStatus | undefined;
  if (doc.status !== "widerrufen" || !before || !hidesTeamPhoto(before))
    return doc;
  const teamId = typeof doc.team === "object" ? doc.team?.id : doc.team;
  if (teamId == null) return doc;
  await req.payload.update({
    collection: "teams",
    id: teamId,
    data: { hidePhoto: true },
    overrideAccess: true,
    req,
  });
  return doc;
};
