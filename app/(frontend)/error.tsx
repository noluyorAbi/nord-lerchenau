"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error on /:", error);
  }, [error]);

  return (
    <section className="relative overflow-hidden bg-nord-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[420px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,140,140,0.18)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-20 text-center md:py-28">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-nord-muted">
          500 · Ein Fehler ist passiert
        </div>
        <h1
          className="mt-6 font-display font-black leading-[0.92] tracking-[-0.02em] text-nord-ink"
          style={{ fontSize: "clamp(48px, 10vw, 120px)" }}
        >
          Spielabbruch.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-nord-muted md:text-lg">
          Etwas auf unserer Seite ist schiefgelaufen. Versuch es bitte erneut —
          wenn das Problem bleibt, melde dich kurz unter{" "}
          <a
            href="mailto:info@svnord.de"
            className="font-semibold text-nord-navy hover:text-nord-navy-2"
          >
            info@svnord.de
          </a>
          .
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-nord-navy px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
          >
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-ink transition hover:border-nord-navy hover:bg-nord-navy hover:text-white"
          >
            Zur Startseite
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-nord-muted">
            Ref: {error.digest}
          </p>
        ) : null}
      </div>
    </section>
  );
}
