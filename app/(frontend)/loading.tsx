export default function Loading() {
  return (
    <section className="relative overflow-hidden border-b border-nord-line bg-nord-paper">
      <div className="relative mx-auto max-w-[1320px] px-6 py-12 md:px-7 md:py-24">
        <div className="h-3 w-24 animate-pulse rounded bg-nord-line" />
        <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-nord-line md:h-20" />
        <div className="mt-3 h-12 w-1/2 animate-pulse rounded bg-nord-line md:h-20" />
        <div className="mt-8 h-4 w-2/3 max-w-xl animate-pulse rounded bg-nord-line" />
        <div className="mt-2 h-4 w-1/2 max-w-xl animate-pulse rounded bg-nord-line" />
      </div>
    </section>
  );
}
