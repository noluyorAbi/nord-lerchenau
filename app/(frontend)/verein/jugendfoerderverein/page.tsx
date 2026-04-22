import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const JFV_BODY = `
Liebe Eltern, liebe Freunde des SV Nord Lerchenau,

seit vielen Jahren wird in der Jugend der Fußballabteilung des SV Nord Lerchenau eine sehr erfolgreiche Jugendarbeit geleistet. Der SV Nord Lerchenau bietet jungen Menschen eine hervorragende Möglichkeit zur sportlichen Betätigung mit allen positiven Wirkungen einer sozialen Gemeinschaft, die ein Verein erzielt. Nicht nur beim Sport, sondern auch bei der Ausgestaltung des Vereinslebens hat die Fußballjugend einen hohen Stand erreicht. Diesen Standard wollen wir halten und weiter heben — trotz angespannter wirtschaftlicher Lage.

Mit der Gründung des Fördervereins der Fußballjunioren haben wir eine Möglichkeit geschaffen, die zahlreichen Jugendmannschaften der Fußball-Abteilung finanziell zu unterstützen. Die für einen geregelten Sportbetrieb notwendigen Aufwendungen werden weiterhin vom SV Nord Lerchenau bestritten — unsere Mittel und Unterstützungen sind für Anschaffungen und Aktivitäten gedacht, die darüber hinausgehen.

Ziel des Fördervereins der Fußballjunioren ist es, das Angebot an die Kinder und Jugendlichen rund um den Sport zu intensivieren.
`.trim();

const JFV_BULLETS = [
  "Zuzahlung zu Ausflügen und Kurzreisen",
  "Zuzahlung zur Ausgestaltung von Feierlichkeiten der Nordjugend",
  "Zuzahlung zur Unterstützung von Aktivitäten und Trainingsbetrieb",
];

const JFV_CONTACT_EMAIL_PRIMARY = "nordjugend@gmx.de";
const JFV_CONTACT_EMAIL_BOARD = "ergin.piker@svnord.de";
const JFV_FORM_PDF = "/downloads/jfv-beitrittserklaerung.pdf";

export default async function JugendfoerderPage() {
  const payload = await getPayloadClient();
  const page = await payload.findGlobal({ slug: "jugendfoerder-page" });

  const hasBody =
    page.body && typeof page.body === "object" && "root" in page.body;
  const iban = page.iban ?? null;

  return (
    <>
      <PageHero
        eyebrow="Jugendförderverein"
        title="Für die nächste Generation."
        lede="Der Förderverein der Fußballjunioren unterstützt die Jugendmannschaften über das hinaus, was der reine Spielbetrieb hergibt — damit alle Kinder das gleiche Erlebnis haben."
      />
      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {hasBody ? (
          <div className="prose prose-neutral prose-lg max-w-none">
            <RichText data={page.body as SerializedEditorState} />
          </div>
        ) : (
          <div className="prose prose-neutral prose-lg max-w-none whitespace-pre-line text-nord-ink">
            {JFV_BODY}
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-nord-line bg-white p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
            Unsere Unterstützung
          </div>
          <ul className="mt-4 space-y-2.5 text-base leading-relaxed text-nord-ink">
            {JFV_BULLETS.map((b) => (
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
            <strong>Mindest­jahresbeitrag von 24&nbsp;€</strong>. Der Beitrag
            ist bewusst niedrig gehalten, damit über darüber hinausgehende
            Zuzahlungen — einmalig oder laufend — eine Spenden­quittung
            ausgestellt werden kann.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={JFV_FORM_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-5 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
            >
              Beitrittserklärung (PDF) ↓
            </a>
            <a
              href={`mailto:${JFV_CONTACT_EMAIL_PRIMARY}`}
              className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-5 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-nord-ink transition hover:border-nord-gold hover:text-nord-navy"
            >
              {JFV_CONTACT_EMAIL_PRIMARY}
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
            Ergin Piker, 1. Vorstand · Ebereschenstraße 17, 80935 München ·{" "}
            <a
              href={`mailto:${JFV_CONTACT_EMAIL_BOARD}`}
              className="font-semibold text-nord-navy hover:text-nord-navy-2"
            >
              {JFV_CONTACT_EMAIL_BOARD}
            </a>
          </p>
        </section>
      </article>
    </>
  );
}
