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
    <header className="sticky top-0 z-30 border-b border-nord-line bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6 md:px-10">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-nord-muted md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-nord-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={CTA.href}
            className="hidden rounded-md bg-nord-ink px-3 py-1.5 text-xs font-medium text-white md:inline-flex"
          >
            {CTA.label} →
          </Link>
          <MobileMenu links={links} cta={CTA} />
        </div>
      </div>
    </header>
  );
}
