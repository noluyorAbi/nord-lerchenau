import Link from "next/link";

export function MembershipCta() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-nord-navy to-nord-navy-2 p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-[radial-gradient(circle,var(--color-nord-sky)_0%,transparent_60%)] opacity-40"
          />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Mit dabei sein.
              </h2>
              <p className="mt-2 text-sm text-white/80 md:text-base">
                Werde Mitglied beim SV Nord — als Spieler, Eltern, Fan oder Förderer.
              </p>
            </div>
            <Link
              href="/mitgliedschaft"
              className="inline-flex items-center gap-2 rounded-lg bg-nord-gold px-5 py-3 text-sm font-semibold text-nord-navy transition hover:brightness-110"
            >
              Mitglied werden →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
