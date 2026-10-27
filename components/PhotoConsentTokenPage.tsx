import { PageHero } from "@/components/PageHero";
import {
  PhotoConsentAction,
  type ConsentSummary,
} from "@/components/PhotoConsentAction";
import { getPayloadClient } from "@/lib/payload";
import {
  hashToken,
  isPendingExpired,
  tokenSchema,
  type ConsentStatus,
} from "@/lib/photo-consent";

type Props = {
  action: "bestaetigen" | "widerrufen";
  token: string | undefined;
};

const COPY = {
  bestaetigen: {
    title: "Zustimmung bestätigen.",
    lede: "Ein letzter Klick, dann gilt deine Zustimmung zum Mannschaftsfoto.",
  },
  widerrufen: {
    title: "Zustimmung widerrufen.",
    lede: "Du kannst deine Zustimmung jederzeit zurückziehen, ohne Angabe von Gründen.",
  },
} as const;

type Lookup =
  | { kind: "ok"; consent: ConsentSummary }
  | { kind: "invalid" | "expired" | "revoked" | "confirmed" };

/**
 * Liest den Eintrag zum Link nur, damit die Seite vor dem Klick zeigt, um
 * welches Kind und welche Mannschaft es geht. Geaendert wird hier nichts:
 * Mail-Scanner rufen diese Seite vorab auf.
 */
async function lookup(
  action: Props["action"],
  token: string | undefined,
): Promise<Lookup> {
  if (!tokenSchema.safeParse({ token }).success) return { kind: "invalid" };
  const client = await getPayloadClient();
  const found = await client.find({
    collection: "photo-consents",
    where: { tokenHash: { equals: hashToken(token as string) } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  });
  const doc = found.docs[0];
  if (!doc) return { kind: "invalid" };
  const status = doc.status as ConsentStatus;
  if (status === "widerrufen") return { kind: "revoked" };
  if (action === "bestaetigen") {
    if (status === "bestaetigt") return { kind: "confirmed" };
    if (isPendingExpired(doc.createdAt, new Date())) return { kind: "expired" };
  }
  const team = typeof doc.team === "object" ? doc.team : null;
  return {
    kind: "ok",
    consent: {
      childName: doc.childName,
      teamName: team?.name ?? "Mannschaft",
      confirmed: status === "bestaetigt",
    },
  };
}

const NOTICE: Record<Exclude<Lookup["kind"], "ok">, string> = {
  invalid:
    "Dieser Link ist ungültig. Bitte öffne ihn direkt aus der Mail, ohne ihn zu verändern.",
  expired:
    "Dieser Link ist abgelaufen, er gilt 7 Tage. Fülle das Formular einfach noch einmal aus.",
  revoked:
    "Diese Zustimmung wurde bereits widerrufen. Du musst nichts weiter tun.",
  confirmed:
    "Diese Zustimmung ist bereits bestätigt. Du musst nichts weiter tun.",
};

/** Landeseite fuer die Links aus der Bestaetigungsmail. */
export async function PhotoConsentTokenPage({ action, token }: Props) {
  const copy = COPY[action];
  const result = await lookup(action, token);
  return (
    <>
      <PageHero eyebrow="Mannschaftsfoto" title={copy.title} lede={copy.lede} />
      <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
        <section className="rounded-2xl border border-nord-line bg-white p-6 shadow-[0_1px_0_rgba(11,27,63,0.04)] md:p-10">
          {result.kind === "ok" ? (
            <PhotoConsentAction
              action={action}
              token={token as string}
              consent={result.consent}
            />
          ) : (
            <p className="max-w-prose text-sm leading-relaxed text-nord-muted">
              {NOTICE[result.kind]}
              {result.kind === "expired" ? (
                <>
                  {" "}
                  <a
                    href="/foto-zustimmung"
                    className="font-semibold text-nord-navy hover:text-nord-navy-2"
                  >
                    Zum Formular →
                  </a>
                </>
              ) : null}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
