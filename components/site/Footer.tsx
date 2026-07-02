import Link from "next/link";

import { ClubLogo } from "@/components/ClubLogo";
import { getPayloadClient } from "@/lib/payload";
import { mediaSrc } from "@/lib/publicUploads";
import {
  FALLBACK_SPONSORS,
  sponsorLogoFallback,
} from "@/lib/sponsors-fallback";

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
  logoBg: "light" | "dark";
};

export async function Footer() {
  let site: SiteGlobal = {};
  let nav: NavGlobal = {};
  let contact: ContactGlobal = {};
  let dbSponsors: FooterSponsor[] = [];
  try {
    const payload = await getPayloadClient();
    const [siteRes, navRes, contactRes, sponsorsRes] = await Promise.all([
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
    dbSponsors = sponsorsRes.docs.map((doc) => {
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
      const fallback = sponsorLogoFallback(d.name);
      return {
        id: d.id,
        name: d.name,
        url: d.url ?? null,
        logoUrl: mediaSrc(logo) ?? fallback.logoSrc,
        logoBg: fallback.logoBg,
      };
    });
  } catch {
    // DB unavailable (CI build with empty schema). Fall through to defaults.
  }

  const sponsors: FooterSponsor[] =
    dbSponsors.length > 0
      ? dbSponsors
      : FALLBACK_SPONSORS.map((s) => ({
          id: s.id,
          name: s.name,
          url: s.url,
          logoUrl: s.logoSrc,
          logoBg: s.logoBg,
        }));

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

      {sponsors.length > 0 ? (
        <div className="border-t border-white/10">
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
            <div className="flex flex-wrap items-center gap-2.5">
              {sponsors.map((s) => {
                const chip = (
                  <span
                    className={`flex h-12 w-28 items-center justify-center overflow-hidden rounded-lg p-2 transition hover:-translate-y-0.5 ${
                      s.logoUrl && s.logoBg === "light"
                        ? "bg-white"
                        : "bg-white/10 ring-1 ring-inset ring-white/15"
                    }`}
                  >
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logoUrl}
                        alt={`Logo ${s.name}`}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.06em] text-white/70">
                        {s.name}
                      </span>
                    )}
                  </span>
                );
                return s.url ? (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                  >
                    {chip}
                  </a>
                ) : (
                  <span key={s.id} title={s.name}>
                    {chip}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

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
