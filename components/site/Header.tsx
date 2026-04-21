import { HeaderShell } from "@/components/site/HeaderShell";
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

  return <HeaderShell links={links} cta={CTA} />;
}
