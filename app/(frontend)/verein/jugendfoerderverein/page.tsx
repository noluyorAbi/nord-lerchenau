import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const DEFAULT_INTRO =
  "Der Förderverein der Fußballjunioren unterstützt die Jugendmannschaften über das hinaus, was der reine Spielbetrieb hergibt — damit alle Kinder das gleiche Erlebnis haben.";

const DEFAULT_BULLETS = [
  "Zuzahlung zu Ausflügen und Kurzreisen",
  "Zuzahlung zur Ausgestaltung von Feierlichkeiten der Nordjugend",
  "Zuzahlung zur Unterstützung von Aktivitäten und Trainingsbetrieb",
];

const DEFAULT_PRIMARY_EMAIL = "nordjugend@gmx.de";
const DEFAULT_BOARD_NAME = "Ergin Piker";
const DEFAULT_BOARD_ROLE = "1. Vorstand";
const DEFAULT_BOARD_EMAIL = "ergin.piker@svnord.de";
const DEFAULT_FORM_PDF = "/downloads/jfv-beitrittserklaerung.pdf";
const DEFAULT_MIN_FEE = 24;

export default async function JugendfoerderPage() {
  const payload = await getPayloadClient();
  const page = await payload.findGlobal({ slug: "jugendfoerder-page" });

  const hasBody =
    page.body && typeof page.body === "object" && "root" in page.body;
  const iban = page.iban ?? null;

  const intro = (page.intro?.trim() || DEFAULT_INTRO) ?? DEFAULT_INTRO;
  const bullets =
    Array.isArray(page.supportBullets) && page.supportBullets.length > 0
      ? page.supportBullets
          .map((b) => (typeof b?.text === "string" ? b.text.trim() : ""))
          .filter(Boolean)
      : DEFAULT_BULLETS;
  const minFee = page.minAnnualFee ?? DEFAULT_MIN_FEE;
  const formPdfUrl = page.formPdfUrl?.trim() || DEFAULT_FORM_PDF;
  const primaryEmail =
    page.primaryContactEmail?.trim() ||
    page.contactEmail?.trim() ||
    DEFAULT_PRIMARY_EMAIL;
  const boardName = page.boardMemberName?.trim() || DEFAULT_BOARD_NAME;
  const boardRole = page.boardRole?.trim() || DEFAULT_BOARD_ROLE;
  const boardEmail = page.boardContactEmail?.trim() || DEFAULT_BOARD_EMAIL;

  return (
    <>
      <PageHero
        eyebrow="Jugendförderverein"
        title="Für die nächste Generation."
        lede={intro}
      />
      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {hasBody ? (
          <div className="prose prose-neutral prose-lg max-w-none">
            <RichText data={page.body as SerializedEditorState} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-8 text-sm text-nord-muted">
            Haupttext im Admin pflegen —{" "}
            <em>Seiten → Jugendförderverein → Body</em>.
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-nord-line bg-white p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
            Unsere Unterstützung
          </div>
          <ul className="mt-4 space-y-2.5 text-base leading-relaxed text-nord-ink">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="select-none text-nord-gold">›</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl bg-nord-paper-2 p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
            Mitglied werden
          </div>
          <p className="mt-3 text-base leading-relaxed text-nord-ink">
            Der Förderverein der Fußballjunioren erhebt einen{" "}
            <strong>
              Mindest­jahresbeitrag von {minFee}&nbsp;€
            </strong>
            . Der Beitrag ist bewusst niedrig gehalten, damit über darüber
            hinausgehende Zuzahlungen — einmalig oder laufend — eine Spenden­quittung
            ausgestellt werden kann.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={formPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-5 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
            >
              Beitrittserklärung (PDF) ↓
            </a>
            <a
              href={`mailto:${primaryEmail}`}
              className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-5 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-nord-ink transition hover:border-nord-gold hover:text-nord-navy"
            >
              {primaryEmail}
            </a>
          </div>
        </section>

        {iban ? (
          <section className="mt-8 rounded-2xl border border-nord-line bg-white p-6 md:p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Direktspende
            </div>
            <div className="mt-3">
              <div className="text-xs text-nord-muted">IBAN</div>
              <div className="mt-0.5 font-mono text-base font-bold text-nord-ink">
                {iban}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8 rounded-2xl border border-dashed border-nord-line p-6 md:p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-muted">
            Vorstand
          </div>
          <p className="mt-3 text-base leading-relaxed text-nord-ink">
            {boardName}, {boardRole} · Ebereschenstraße 17, 80935 München ·{" "}
            <a
              href={`mailto:${boardEmail}`}
              className="font-semibold text-nord-navy hover:text-nord-navy-2"
            >
              {boardEmail}
            </a>
          </p>
        </section>
      </article>
    </>
  );
}
