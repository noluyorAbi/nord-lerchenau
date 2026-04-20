import Link from "next/link";

import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/site/MobileMenu";
import { getPayloadClient } from "@/lib/payload";

type NavLink = { label: string; href: string };

const FALLBACK_LINKS: NavLink[] = [
  { label: "Verein", href: "/verein" },
  { label: "Fußball", href: "/fussball" },
  { label: "Sport", href: "/volleyball" },
  { label: "News", href: "/news" },
  { label: "Termine", href: "/termine" },
  { label: "Sponsoren", href: "/sponsoren" },
  { label: "Kontakt", href: "/kontakt" },
];

const CTA = { label: "Mitglied werden", href: "/mitgliedschaft" };

export async function Header() {
  const payload = await getPayloadClient();
  const nav = await payload.findGlobal({ slug: "navigation" });

  const headerLinks = (nav.header ?? []).filter(
    (l): l is { id?: string | null; label: string; href: string } =>
      typeof l?.label === "string" && typeof l?.href === "string",
  );

  const links: NavLink[] = headerLinks.length > 0 ? headerLinks : FALLBACK_LINKS;

  return (
    <header className="sticky top-0 z-30 border-b border-nord-line bg-nord-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-6 px-6 md:px-7">
        <Logo />

        <nav className="hidden items-center gap-7 font-display text-[15px] font-semibold uppercase tracking-[0.06em] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b-2 border-transparent pb-1 text-nord-muted transition hover:text-nord-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={CTA.href}
            className="hidden items-center gap-2 rounded-full bg-nord-gold px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)] md:inline-flex"
          >
            Mitglied werden
          </Link>
          <MobileMenu links={links} cta={CTA} />
        </div>
      </div>
    </header>
  );
}
