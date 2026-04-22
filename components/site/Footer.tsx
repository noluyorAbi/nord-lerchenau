import Link from "next/link";

import { ClubLogo } from "@/components/ClubLogo";
import { getPayloadClient } from "@/lib/payload";

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
      { label: "Volleyball", href: "/volleyball" },
      { label: "Gymnastik", href: "/gymnastik" },
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
      { label: "Instagram", href: "https://www.instagram.com/svnord_ski/" },
    ],
  },
];

export async function Footer() {
  const payload = await getPayloadClient();
  const [site, nav, contact] = await Promise.all([
    payload.findGlobal({ slug: "site-settings" }),
    payload.findGlobal({ slug: "navigation" }),
    payload.findGlobal({ slug: "contact-info" }),
  ]);

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
