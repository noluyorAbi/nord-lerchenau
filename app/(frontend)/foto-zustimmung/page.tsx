import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import {
  PhotoConsentForm,
  type ConsentTeamOption,
} from "@/components/PhotoConsentForm";
import { cachedQuery, collectionTag } from "@/lib/cms";
import { getPayloadClient } from "@/lib/payload";
import { CONSENT_TEXT } from "@/lib/photo-consent";

export const metadata: Metadata = {
  title: "Zustimmung Mannschaftsfoto",
  description:
    "Eltern stimmen hier online zu, dass Mannschaftsfotos mit ihrem Kind auf svnord.de gezeigt werden.",
  alternates: { canonical: "/foto-zustimmung" },
};

const SPORT_LABEL: Record<string, string> = {
  fussball: "Fußball",
  volleyball: "Volleyball",
  gymnastik: "Gymnastik",
  ski: "Ski",
  esport: "Esport",
  schiedsrichter: "Schiedsrichter",
};

export default async function FotoZustimmungPage() {
  const result = await cachedQuery(
    ["foto-zustimmung-teams"],
    [collectionTag("teams")],
    async () => {
      const payload = await getPayloadClient();
      return payload.find({
        collection: "teams",
        // Nur Kinder- und Jugendteams: bei Erwachsenen braucht es keine Eltern.
        where: {
          category: { in: ["junioren", "juniorinnen", "bambini"] },
        },
        sort: "order",
        limit: 200,
        depth: 0,
      });
    },
  );

  const teams: ConsentTeamOption[] = result.docs.map((t) => ({
    id: t.id,
    label:
      t.sport === "fussball"
        ? t.name
        : `${t.name} (${SPORT_LABEL[t.sport] ?? t.sport})`,
  }));

  return (
    <>
      <PageHero
        eyebrow="Für Eltern"
        title="Zustimmung zum Mannschaftsfoto."
        lede="Mit einer kurzen Online-Zustimmung darf das Mannschaftsfoto mit deinem Kind auf unserer Website erscheinen."
      />

      <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
        <section className="rounded-2xl border border-nord-line bg-white p-6 shadow-[0_1px_0_rgba(11,27,63,0.04)] md:p-10">
          <div className="mb-7 md:mb-9">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold-ink">
              Einmal pro Kind
            </div>
            <h2
              className="mt-2 font-display font-black leading-[1.05] text-nord-ink"
              style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}
            >
              So funktioniert&apos;s.
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-nord-muted">
              Formular ausfüllen, dann den Link in der Bestätigungsmail
              anklicken. Erst danach gilt die Zustimmung. Solange nicht alle
              Eltern einer Mannschaft zugestimmt haben, blenden wir das Foto
              aus.
            </p>
          </div>

          {teams.length > 0 ? (
            <PhotoConsentForm teams={teams} consentText={CONSENT_TEXT} />
          ) : (
            <p className="text-sm text-nord-muted">
              Gerade sind keine Jugendmannschaften eingetragen. Bitte melde dich
              über das{" "}
              <a
                href="/kontakt"
                className="font-semibold text-nord-navy hover:text-nord-navy-2"
              >
                Kontaktformular
              </a>
              .
            </p>
          )}

          <p className="mt-7 border-t border-nord-line pt-5 text-[11px] leading-relaxed text-nord-muted">
            Wir speichern Mannschaft, die Namen und deine E-Mail-Adresse, um die
            Zustimmung nachweisen zu können. Mehr dazu in unserer{" "}
            <a
              href="/datenschutz"
              className="font-semibold text-nord-navy hover:text-nord-navy-2"
            >
              Datenschutzerklärung
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}
