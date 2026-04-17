import Link from "next/link";

export function VereinsheimTeaser() {
  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:px-10 md:py-20">
        <div className="aspect-[16/9] rounded-xl bg-[linear-gradient(135deg,var(--color-nord-gold)_0%,#8a6f3a_100%)]" />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nord-sky">
            Unser Zuhause
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-nord-ink md:text-4xl">
            Eschengarten — seit 1984.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-nord-muted md:text-base">
            Selbst gebaut. Vierzig Jahre alt. Treffpunkt für jeden Spieltag,
            jedes Sommerfest und jeden Stammtisch im Münchner Norden.
          </p>
          <Link
            href="/verein/vereinsheim"
            className="mt-5 inline-block text-sm font-semibold text-nord-navy hover:text-nord-navy-2"
          >
            Vereinsheim entdecken →
          </Link>
        </div>
      </div>
    </section>
  );
}
