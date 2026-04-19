import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

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
  };
  const content = (
    <div
      className={`flex items-center justify-center rounded-xl border border-nord-line bg-white ${
        size === "large" ? "aspect-[16/9] p-6" : "aspect-[3/2] p-4"
      } transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <span
        className={`text-center font-serif italic text-nord-muted ${
          size === "large" ? "text-2xl" : "text-base"
        }`}
      >
        {s.name}
      </span>
    </div>
  );

  return s.url ? (
    <a href={s.url} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
}
