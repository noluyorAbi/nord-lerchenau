import Link from "next/link";

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
    links: [{ label: "Instagram", href: "https://www.instagram.com/svnord_ski/" }],
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

  return (
    <footer className="mt-20 bg-nord-navy text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)] md:px-10">
        <div>
          <div className="text-base font-semibold">{site.name ?? "SV Nord München-Lerchenau e.V."}</div>
          {firstAddress ? (
            <div className="mt-2 text-xs text-white/70">
              {firstAddress.street} · {firstAddress.postalCode} {firstAddress.city}
            </div>
          ) : null}
          {contact.email ? (
            <div className="mt-1 text-xs text-white/70">
              <a href={`mailto:${contact.email}`} className="hover:text-white">
                {contact.email}
              </a>
              {contact.phone ? ` · ${contact.phone}` : null}
            </div>
          ) : null}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-nord-gold">
              {col.title}
            </div>
            <ul className="mt-3 space-y-1.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/80 hover:text-white"
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
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-2 px-6 py-5 text-[11px] text-white/60 md:flex-row md:items-center md:px-10">
          <div>© {year} {site.name ?? "SV Nord München-Lerchenau e.V."}</div>
          <div className="flex items-center gap-4">
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-white">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
