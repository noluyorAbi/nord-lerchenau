import Link from "next/link";

export function MembershipCta() {
  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-7 md:py-20">
        <div className="relative overflow-hidden rounded-[24px] bg-nord-ink p-10 md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--color-nord-gold) 0%, transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--color-nord-gold) 0 3px, transparent 3px 24px)",
              opacity: 0.12,
            }}
          />

          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-gold">
                Mitmachen
              </div>
              <h2
                className="mt-4 font-display font-black leading-[0.92] tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(44px, 6vw, 84px)" }}
              >
                Werde <span className="text-nord-gold">Nordler</span>.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/75">
                Ob als Spieler, Eltern, Fan oder Förderer — beim SV Nord ist
                Platz für jede und jeden. 500 Mitglieder, sechs Sportarten, ein
                Vereinsheim mit Biergarten.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <Link
                href="/mitgliedschaft"
                className="group inline-flex items-center gap-2.5 rounded-full bg-nord-gold px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-nord-navy transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
              >
                Mitglied werden
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                href="/sponsoren"
                className="group inline-flex items-center gap-2.5 rounded-full border border-white/25 px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-white transition duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-nord-navy"
              >
                Sponsor werden
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
