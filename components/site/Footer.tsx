import Link from "next/link";

import { ClubLogo } from "@/components/ClubLogo";
import { getPayloadClient } from "@/lib/payload";
import { mediaSrc } from "@/lib/publicUploads";
import { sponsorTone } from "@/lib/sponsor-visual";
import { FALLBACK_SPONSORS } from "@/lib/sponsors-fallback";

const FALLBACK_COLUMNS = [
  {
    title: "Verein",
    links: [
      { label: "Über uns", href: "/verein" },
      { label: "Vorstand", href: "/verein/vorstand" },
      { label: "Chronik", href: "/verein/chronik" },
      { label: "Vereinsheim", href: "/verein/vereinsheim" },
    ],
  },
  {
    title: "Sport",
    links: [
      { label: "Fußball", href: "/fussball" },
      { label: "Gymnastik", href: "/gymnastik" },
      { label: "Volleyball", href: "/volleyball" },
      { label: "eSport", href: "/esport" },
      { label: "Ski", href: "/ski" },
    ],
  },
  {
    title: "Mitmachen",
    links: [
      { label: "Mitglied werden", href: "/mitgliedschaft" },
      { label: "Sponsoring", href: "/sponsoren" },
    ],
  },
  {
    title: "Folgen",
    links: [
      {
        label: "Instagram",
        href: "https://www.instagram.com/svnord_lerchenau/",
      },
    ],
  },
];

type SiteGlobal = { name?: string | null };
type NavGlobal = {
  footerColumns?: Array<{
    title?: string | null;
    links?: Array<{
      id?: string | null;
      label?: string | null;
      href?: string | null;
    }> | null;
  }> | null;
};
type ContactGlobal = {
  email?: string | null;
  phone?: string | null;
  addresses?: Array<{
    street?: string | null;
    postalCode?: string | null;
    city?: string | null;
  }> | null;
};

type FooterSponsor = {
  id: number | string;
  name: string;
  url: string | null;
  logoUrl: string | null;
};

export async function Footer() {
  let site: SiteGlobal = {};
  let nav: NavGlobal = {};
  let contact: ContactGlobal = {};
  let sponsors: FooterSponsor[] = [];
  try {
    const payload = await getPayloadClient();
    const [siteRes, navRes, contactRes, sponsorRes] = await Promise.all([
      payload.findGlobal({ slug: "site-settings" }),
      payload.findGlobal({ slug: "navigation" }),
      payload.findGlobal({ slug: "contact-info" }),
      payload.find({
        collection: "sponsors",
        sort: "order",
        limit: 40,
        depth: 1,
      }),
    ]);
    site = siteRes as SiteGlobal;
    nav = navRes as NavGlobal;
    contact = contactRes as ContactGlobal;
    sponsors = sponsorRes.docs.map((doc) => {
      const d = doc as unknown as {
        id: number | string;
        name: string;
        url?: string | null;
        logo?:
          | { url?: string | null; filename?: string | null }
          | number
          | null;
      };
      const logo = typeof d.logo === "object" && d.logo ? d.logo : null;
      return {
        id: d.id,
        name: d.name,
        url: d.url ?? null,
        logoUrl: mediaSrc(logo),
      };
    });
  } catch {
    // DB unavailable (CI build with empty schema). Fall through to defaults.
  }
  if (sponsors.length === 0) {
    sponsors = FALLBACK_SPONSORS.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url ?? null,
      logoUrl: null,
    }));
  }

  const columns =
    Array.isArray(nav.footerColumns) && nav.footerColumns.length > 0
      ? nav.footerColumns.map((c) => ({
          title: String(c.title ?? ""),
          links: (c.links ?? [])
            .filter(
              (l): l is { id?: string | null; label: string; href: string } =>
                typeof l?.label === "string" && typeof l?.href === "string",
            )
            .map((l) => ({ label: l.label, href: l.href })),
        }))
      : FALLBACK_COLUMNS;

  const firstAddress =
    Array.isArray(contact.addresses) && contact.addresses.length > 0
      ? contact.addresses[0]
      : null;

  const year = new Date().getFullYear();
  const siteName = site.name ?? "SV Nord München-Lerchenau e.V.";

  return (
    <footer className="relative overflow-hidden bg-nord-navy text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-nord-gold) 0 3px, transparent 3px 10px)",
        }}
      />
      {/* 2026_06_02 Vereinswunsch: Sponsoren auf jeder Seite sichtbar (vgl. fcgap.de). */}
      {sponsors.length > 0 ? (
        <div className="border-b border-white/10">
          <div className="mx-auto w-full max-w-[1320px] px-6 py-8 md:px-7">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-gold">
                Unsere Partner
              </div>
              <Link
                href="/sponsoren"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 transition hover:text-nord-gold"
              >
                Alle Partner →
              </Link>
            </div>
            {/* Endloses, nahtloses Partner-Karussell (läuft von links nach
                rechts). Liste ist verdoppelt; die Animation verschiebt um
                genau 50 %, dadurch kein sichtbarer Sprung. Pausiert bei
                Hover, steht bei reduzierter Bewegung. */}
            <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              <ul className="flex w-max animate-[footer-marquee_45s_linear_infinite] items-center gap-2 pl-2 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                {[...sponsors, ...sponsors].map((s, idx) => {
                  // Fläche pro Logo: dunkle Logos auf hellem Chip, weiße
                  // Logos auf dem dunklen Glas-Chip.
                  const tone = sponsorTone(s.name);
                  const inner = s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logoUrl}
                      alt={`Logo ${s.name}`}
                      loading="lazy"
                      className="max-h-7 w-auto max-w-[8.5rem] object-contain"
                    />
                  ) : (
                    <span className="font-display text-[12px] font-semibold uppercase tracking-[0.05em]">
                      {s.name}
                    </span>
                  );
                  const chip = `flex h-11 items-center rounded-lg border px-3.5 transition hover:border-nord-gold/60 ${
                    tone === "dark"
                      ? "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
                      : "border-white/15 bg-white/95 text-nord-ink hover:bg-white"
                  }`;
                  return (
                    <li
                      key={`${s.id}-${idx}`}
                      aria-hidden={idx >= sponsors.length || undefined}
                      className="shrink-0"
                    >
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={s.name}
                          tabIndex={idx >= sponsors.length ? -1 : undefined}
                          className={chip}
                        >
                          {inner}
                        </a>
                      ) : (
                        <div title={s.name} className={chip}>
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <style>{`
            @keyframes footer-marquee {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      ) : null}
      <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-6 py-16 md:grid-cols-[1.6fr_repeat(4,1fr)] md:px-7">
        <div>
          <ClubLogo
            size={60}
            className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
          />
          <div className="mt-4 font-display text-[18px] font-black uppercase tracking-[-0.01em]">
            SV NORD
          </div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.22em] text-white/60">
            MÜNCHEN-LERCHENAU · 1947
          </div>
          {firstAddress ? (
            <div className="mt-5 text-[13px] leading-relaxed text-white/70">
              {firstAddress.street}
              <br />
              {firstAddress.postalCode} {firstAddress.city}
            </div>
          ) : null}
          {contact.email ? (
            <div className="mt-3 space-y-1 text-[13px] text-white/70">
              <div>
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-nord-gold"
                >
                  {contact.email}
                </a>
              </div>
              {contact.phone ? (
                <div className="font-mono text-xs">{contact.phone}</div>
              ) : null}
            </div>
          ) : null}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
              {col.title}
            </div>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-display text-[14px] font-medium uppercase tracking-[0.04em] text-white/80 transition hover:text-nord-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col items-start justify-between gap-3 px-6 py-6 text-[11px] text-white/50 md:flex-row md:items-center md:px-7">
          <div className="font-mono tracking-[0.04em]">
            © {year} {siteName} · Einmal Nordler, immer Nordler.
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-5">
            <Link
              href="/impressum"
              className="font-display uppercase tracking-[0.08em] hover:text-nord-gold"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="font-display uppercase tracking-[0.08em] hover:text-nord-gold"
            >
              Datenschutz
            </Link>
            <span
              className="hidden h-3 w-px bg-white/15 md:inline-block"
              aria-hidden
            />
            <a
              href="https://adatepe.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono tracking-[0.08em] text-white/40 transition hover:text-nord-gold"
            >
              Built by{" "}
              <span className="font-semibold text-white/70 group-hover:text-nord-gold">
                adatepe.dev
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
