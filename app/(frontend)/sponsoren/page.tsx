import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";
import { mediaSrc } from "@/lib/publicUploads";
import { FALLBACK_SPONSORS } from "@/lib/sponsors-fallback";

export const dynamic = "force-dynamic";

// Hardcoded editorial copy kept as a regression-proof fallback. The page reads
// the "sponsoren-page" global and only falls back to these exact values when a
// field is empty, so it renders identically with an empty/unsaved global.
const FALLBACK = {
  hero: {
    eyebrow: "Partner",
    title: "Unsere Sponsoren",
    lede: "Ohne die Unterstützung unserer Sponsoren wäre vieles nicht möglich. Vielen Dank!",
  },
  story: {
    eyebrow: "Liebe Sponsoren",
    paragraph1:
      "Der SV Nord München-Lerchenau e.V. ist ein traditioneller Sportverein im Münchner Norden, der im Jahr 1947 gegründet wurde. Derzeit haben wir über 600 Mitglieder in Fußball, Volleyball, Gymnastik, Ski und eSport.",
    paragraph2:
      "Im Fußballbereich stellen wir zwei Herren- und elf Jugendmannschaften. Im Durchschnitt begrüßen wir 100–150 Zuschauer bei unseren Heimspielen der ersten Herrenmannschaft, die aktuell in der Landesliga spielt.",
    paragraph3:
      "Der SV Nord wird in der Lerchenau als sympathischer, familiärer und sehr sozialer Verein wahrgenommen — wir bieten Sponsoren damit eine große Reichweite und mit Werbung auf den Trikots einen gesteigerten Bekanntheitsgrad.",
  },
  offer: {
    title: "Das bieten wir Ihnen",
    items: [
      "Höherer Bekanntheitsgrad für Ihr Unternehmen",
      "Ausdruck sozialen Engagements (z.B. Mannschaftsfotos)",
      "Zusätzliche Werbung auf Social Media (Instagram, Facebook)",
      "Aushang auf unseren Spielankündigungsplakaten",
    ],
  },
  sponsorHeadings: {
    premium: "Premium Partner",
    standard: "Weitere Partner",
  },
  becomeSponsor: {
    title: "Sponsor werden?",
    text: "Ihre Unterstützung fließt direkt in Ausrüstung, Trikots und Veranstaltungen. Melden Sie sich gerne bei uns — wir freuen uns auf das Gespräch.",
    ctaLabel: "Kontakt aufnehmen →",
    ctaHref: "/kontakt",
  },
  donation: {
    eyebrow: "Spende",
    title: "Kurzer Pass, großer Impact: Spenden sammeln leicht gemacht!",
    paragraph1:
      "Damit wir bei unseren Projekten und Anschaffungen — neue Trikots, Trainingslager und mehr — den nächsten Schritt machen können, brauchen wir eure Unterstützung als „Multiplikatoren“.",
    paragraph2:
      "Wir haben ab sofort einen QR-Code für Spenden, den ihr ganz einfach an Eltern, Freunde oder Gönner weiterschicken könnt.",
    benefitsTitle: "Warum das ein Gamechanger ist",
    benefits: [
      {
        label: "Kein Stress:",
        text: "Der Spender scannt den Code einfach mit seiner Banking-App.",
      },
      {
        label: "Kein Tippen:",
        text: "IBAN und Verwendungszweck sind schon teilweise fertig hinterlegt.",
      },
      {
        label: "Schneller Abschluss:",
        text: "Es dauert keine 30 Sekunden – die Hürde zu helfen war noch nie so niedrig.",
      },
    ],
    closingLabel: "Eure Mithilfe:",
    closingText:
      "Teilt den QR-Code in euren Team-Gruppen oder zeigt ihn bei den nächsten Elternabenden und Spieltagen. Jede kleine Summe bringt uns weiter — gemeinsam bewegen wir mehr. Danke für euren Einsatz!",
    signatureLine1: "Für Fragen stehe ich euch gerne zur Verfügung.",
    signatureLine2: "Viele Grüße, Ralf",
    poweredBy: "Powered by Zahlen-mit-Code.com",
    qrImage: "/spenden-qr.png",
    qrAlt: "QR-Code für Spende an SV Nord München-Lerchenau",
    qrCaption: "Jetzt scannen & spenden",
  },
  jugend: {
    eyebrow: "Jugendförderverein",
    title: "Unsere Jugend braucht Sie",
    text: "Mit dem Jugendförderverein unterstützen Sie gezielt die Nachwuchsarbeit des SV Nord München-Lerchenau. Jeder Beitrag kommt direkt unseren jungen Spielerinnen und Spielern zugute.",
    ctaLabel: "Zum Jugendförderverein →",
    ctaHref: "/verein/jugendfoerderverein",
  },
};

type DonationBenefit = { label: string; text: string };

type ListSponsor = {
  id: string | number;
  name: string;
  url?: string | null;
  tier: string;
  logo?: { url?: string | null; filename?: string | null } | number | null;
};

export default async function SponsorenPage() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "sponsors",
    sort: "order",
    limit: 100,
    depth: 1,
  });

  const cms = await payload.findGlobal({ slug: "sponsoren-page" });

  const cmsOfferItems = cms.offer?.items;
  const offerItems: string[] =
    cmsOfferItems && cmsOfferItems.length > 0
      ? cmsOfferItems.map((i) => i.text)
      : FALLBACK.offer.items;

  const cmsDonationBenefits = cms.donation?.benefits;
  const donationBenefits: DonationBenefit[] =
    cmsDonationBenefits && cmsDonationBenefits.length > 0
      ? cmsDonationBenefits.map((b) => ({ label: b.label, text: b.text }))
      : FALLBACK.donation.benefits;

  const dbSponsors = result.docs as unknown as ListSponsor[];
  const sponsors: ListSponsor[] =
    dbSponsors.length > 0
      ? dbSponsors
      : FALLBACK_SPONSORS.map((s) => ({
          id: s.id,
          name: s.name,
          url: s.url,
          tier: s.tier,
          logo: null,
        }));

  const premium = sponsors.filter((s) => s.tier === "premium");
  const standard = sponsors.filter((s) => s.tier === "standard");

  return (
    <>
      <PageHero
        eyebrow={cms.hero?.eyebrow ?? FALLBACK.hero.eyebrow}
        title={cms.hero?.title ?? FALLBACK.hero.title}
        lede={cms.hero?.lede ?? FALLBACK.hero.lede}
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <section className="mb-14 grid gap-8 rounded-2xl bg-nord-paper-2 p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-nord-muted">
              {cms.story?.eyebrow ?? FALLBACK.story.eyebrow}
            </div>
            <p className="text-base leading-relaxed text-nord-ink">
              {cms.story?.paragraph1 ?? FALLBACK.story.paragraph1}
            </p>
            <p className="mt-3 text-base leading-relaxed text-nord-ink">
              {cms.story?.paragraph2 ?? FALLBACK.story.paragraph2}
            </p>
            <p className="mt-3 text-base leading-relaxed text-nord-muted">
              {cms.story?.paragraph3 ?? FALLBACK.story.paragraph3}
            </p>
          </div>
          <div className="rounded-xl border border-nord-line bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-nord-gold">
              {cms.offer?.title ?? FALLBACK.offer.title}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-nord-ink">
              {offerItems.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-nord-gold">›</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {premium.length > 0 ? (
          <section className="mb-14">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-nord-gold">
              {cms.sponsorHeadings?.premium ?? FALLBACK.sponsorHeadings.premium}
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
              {cms.sponsorHeadings?.standard ??
                FALLBACK.sponsorHeadings.standard}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {standard.map((s) => (
                <SponsorCard key={s.id} sponsor={s} size="small" />
              ))}
            </div>
          </section>
        ) : null}

        {sponsors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Noch keine Sponsoren erfasst. Pflege sie im Admin unter{" "}
            <em>Verein → Sponsors</em>.
          </div>
        ) : null}

        <section className="mt-16 rounded-2xl bg-gradient-to-br from-nord-navy to-nord-navy-2 p-8 text-white md:p-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {cms.becomeSponsor?.title ?? FALLBACK.becomeSponsor.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
            {cms.becomeSponsor?.text ?? FALLBACK.becomeSponsor.text}
          </p>
          <Link
            href={cms.becomeSponsor?.ctaHref ?? FALLBACK.becomeSponsor.ctaHref}
            className="mt-6 inline-flex rounded-lg bg-nord-gold px-5 py-3 text-sm font-semibold text-nord-navy hover:brightness-110"
          >
            {cms.becomeSponsor?.ctaLabel ?? FALLBACK.becomeSponsor.ctaLabel}
          </Link>
        </section>

        <section className="mt-10 grid gap-8 rounded-2xl border border-nord-line bg-nord-paper-2 p-8 md:grid-cols-[1fr_auto] md:gap-12 md:p-12">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-nord-gold">
              {cms.donation?.eyebrow ?? FALLBACK.donation.eyebrow}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-nord-ink md:text-3xl">
              {cms.donation?.title ?? FALLBACK.donation.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-nord-ink md:text-base">
              {cms.donation?.paragraph1 ?? FALLBACK.donation.paragraph1}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-nord-ink md:text-base">
              {cms.donation?.paragraph2 ?? FALLBACK.donation.paragraph2}
            </p>

            <div className="mt-6 rounded-xl border border-nord-line bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-nord-gold">
                {cms.donation?.benefitsTitle ?? FALLBACK.donation.benefitsTitle}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-nord-ink">
                {donationBenefits.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nord-gold">›</span>
                    <span>
                      <strong>{b.label}</strong> {b.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-nord-ink md:text-base">
              <strong>
                {cms.donation?.closingLabel ?? FALLBACK.donation.closingLabel}
              </strong>{" "}
              {cms.donation?.closingText ?? FALLBACK.donation.closingText}
            </p>
            <p className="mt-4 text-sm italic text-nord-muted">
              {cms.donation?.signatureLine1 ?? FALLBACK.donation.signatureLine1}
              <br />
              {cms.donation?.signatureLine2 ?? FALLBACK.donation.signatureLine2}
            </p>
            <p className="mt-4 text-xs text-nord-muted">
              {cms.donation?.poweredBy ?? FALLBACK.donation.poweredBy}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="self-start rounded-xl border border-nord-line bg-white p-4 shadow-sm">
              <Image
                src={cms.donation?.qrImage ?? FALLBACK.donation.qrImage}
                alt={cms.donation?.qrAlt ?? FALLBACK.donation.qrAlt}
                width={240}
                height={240}
                className="h-[240px] w-[240px] object-contain"
              />
              <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-nord-muted">
                {cms.donation?.qrCaption ?? FALLBACK.donation.qrCaption}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-gradient-to-br from-nord-navy to-nord-navy-2 p-8 text-white md:p-12">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-nord-gold">
            {cms.jugend?.eyebrow ?? FALLBACK.jugend.eyebrow}
          </div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {cms.jugend?.title ?? FALLBACK.jugend.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
            {cms.jugend?.text ?? FALLBACK.jugend.text}
          </p>
          <Link
            href={cms.jugend?.ctaHref ?? FALLBACK.jugend.ctaHref}
            className="mt-6 inline-flex rounded-lg bg-nord-gold px-5 py-3 text-sm font-semibold text-nord-navy hover:brightness-110"
          >
            {cms.jugend?.ctaLabel ?? FALLBACK.jugend.ctaLabel}
          </Link>
        </section>
      </div>
    </>
  );
}

type SponsorProps = {
  sponsor: ListSponsor;
  size: "large" | "small";
};

function SponsorCard({ sponsor, size }: SponsorProps) {
  const s = sponsor;
  const logo = typeof s.logo === "object" && s.logo ? s.logo : null;
  const logoUrl = mediaSrc(logo);

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
