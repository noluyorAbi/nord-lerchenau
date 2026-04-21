import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function SponsorenPage() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "sponsors",
    sort: "order",
    limit: 100,
    depth: 1,
  });

  const premium = result.docs.filter((s) => s.tier === "premium");
  const standard = result.docs.filter((s) => s.tier === "standard");

  return (
    <>
      <PageHero
        eyebrow="Partner"
        title="Unsere Sponsoren"
        lede="Ohne die Unterstützung unserer Sponsoren wäre vieles nicht möglich. Vielen Dank!"
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <section className="mb-14 grid gap-8 rounded-2xl bg-nord-paper-2 p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-nord-muted">
              Liebe Sponsoren
            </div>
            <p className="text-base leading-relaxed text-nord-ink">
              Der SV Nord München-Lerchenau e.V. ist ein traditioneller
              Sportverein im Münchner Norden, der im Jahr 1947 gegründet wurde.
              Derzeit haben wir rund 500 Mitglieder in Fußball, Volleyball,
              Gymnastik, Ski und Esport.
            </p>
            <p className="mt-3 text-base leading-relaxed text-nord-ink">
              Im Fußballbereich stellen wir zwei Herren- und elf
              Jugendmannschaften. Im Durchschnitt begrüßen wir 100–150 Zuschauer
              bei unseren Heimspielen der ersten Herrenmannschaft, die aktuell
              in der Bezirksliga Oberbayern Nord spielt.
            </p>
            <p className="mt-3 text-base leading-relaxed text-nord-muted">
              Der SV Nord wird in der Lerchenau als sympathischer, familiärer
              und sehr sozialer Verein wahrgenommen — wir bieten Sponsoren
              damit eine große Reichweite und mit Werbung auf den Trikots einen
              gesteigerten Bekanntheitsgrad.
            </p>
          </div>
          <div className="rounded-xl border border-nord-line bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-nord-gold">
              Das bieten wir Ihnen
            </div>
            <ul className="mt-4 space-y-2 text-sm text-nord-ink">
              <li className="flex gap-2">
                <span className="text-nord-gold">›</span> Höherer
                Bekanntheitsgrad für Ihr Unternehmen
              </li>
              <li className="flex gap-2">
                <span className="text-nord-gold">›</span> Ausdruck sozialen
                Engagements (z.B. Mannschaftsfotos)
              </li>
              <li className="flex gap-2">
                <span className="text-nord-gold">›</span> Zusätzliche Werbung
                auf Social Media (Instagram, Facebook)
              </li>
              <li className="flex gap-2">
                <span className="text-nord-gold">›</span> Aushang auf unseren
                Spielankündigungsplakaten
              </li>
            </ul>
          </div>
        </section>

        {premium.length > 0 ? (
          <section className="mb-14">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-nord-gold">
              Premium Partner
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {premium.map((s) => (
                <SponsorCard key={s.id} sponsor={s} size="large" />
              ))}
            </div>
          </section>
        ) : null}

        {standard.length > 0 ? (
          <section>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
              Weitere Partner
            </h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {standard.map((s) => (
                <SponsorCard key={s.id} sponsor={s} size="small" />
              ))}
            </div>
          </section>
        ) : null}

        {result.docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Noch keine Sponsoren erfasst. Pflege sie im Admin unter{" "}
            <em>Verein → Sponsors</em>.
          </div>
        ) : null}

        <section className="mt-16 rounded-2xl bg-gradient-to-br from-nord-navy to-nord-navy-2 p-8 text-white md:p-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Sponsor werden?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
            Ihre Unterstützung fließt direkt in Ausrüstung, Trikots und
            Veranstaltungen. Melden Sie sich gerne bei uns — wir freuen uns auf
            das Gespräch.
          </p>
          <Link
            href="/kontakt"
            className="mt-6 inline-flex rounded-lg bg-nord-gold px-5 py-3 text-sm font-semibold text-nord-navy hover:brightness-110"
          >
            Kontakt aufnehmen →
          </Link>
        </section>
      </div>
    </>
  );
}

type SponsorProps = {
  sponsor: Awaited<
    ReturnType<Awaited<ReturnType<typeof getPayloadClient>>["find"]>
  > extends { docs: Array<infer T> }
    ? T
    : never;
  size: "large" | "small";
};

function SponsorCard({ sponsor, size }: SponsorProps) {
  const s = sponsor as unknown as {
    name: string;
    url?: string | null;
    logo?: { url?: string | null; filename?: string | null } | number | null;
  };
  const logo = typeof s.logo === "object" && s.logo ? s.logo : null;
  const logoUrl = logo
    ? logo.filename
      ? `/uploads/${logo.filename}`
      : (logo.url ?? null)
    : null;

  const content = (
    <div
      className={`group flex items-center justify-center overflow-hidden rounded-xl border border-nord-line bg-nord-navy ${
        size === "large" ? "aspect-[16/9] p-8" : "aspect-[3/2] p-5"
      } transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`Logo ${s.name}`}
          className="max-h-full max-w-full object-contain transition group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <span
          className={`text-center font-serif italic text-white/80 ${
            size === "large" ? "text-2xl" : "text-base"
          }`}
        >
          {s.name}
        </span>
      )}
    </div>
  );

  return s.url ? (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      className="block"
      title={s.name}
    >
      {content}
    </a>
  ) : (
    content
  );
}
