type Props = {
  eyebrow?: string;
  title: string;
  lede?: string;
};

export function PageHero({ eyebrow, title, lede }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-nord-line bg-nord-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[360px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(96,192,232,0.18)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        {eyebrow ? (
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nord-sky">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-nord-ink md:text-5xl">
          {title}
        </h1>
        {lede ? (
          <p className="mx-auto mt-4 max-w-xl text-base text-nord-muted md:text-lg">
            {lede}
          </p>
        ) : null}
      </div>
    </section>
  );
}
