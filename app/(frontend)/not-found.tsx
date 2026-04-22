import Link from "next/link";

const QUICK_LINKS = [
  { href: "/", label: "Startseite" },
  { href: "/fussball", label: "Fußball" },
  { href: "/termine", label: "Termine" },
  { href: "/news", label: "News" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-nord-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[420px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(110,199,234,0.18)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-20 text-center md:py-28">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-nord-muted">
          404 · Seite nicht gefunden
        </div>
        <h1
          className="mt-6 font-display font-black leading-[0.92] tracking-[-0.02em] text-nord-ink"
          style={{ fontSize: "clamp(56px, 12vw, 160px)" }}
        >
          Daneben.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-nord-muted md:text-lg">
          Diese Seite gibt&apos;s nicht — oder nicht mehr. Vielleicht ist dein
          Link veraltet, oder du hast dich vertippt. Hier sind die wichtigsten
          Wegweiser zurück:
        </p>

        <ul className="mx-auto mt-10 flex flex-wrap justify-center gap-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-ink transition hover:border-nord-navy hover:bg-nord-navy hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-nord-muted">
          &bdquo;Einmal Nordler, immer Nordler.&ldquo;
        </p>
      </div>
    </section>
  );
}
