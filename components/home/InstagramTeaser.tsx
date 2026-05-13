"use client";

import Link from "next/link";
import { useState } from "react";

import { SectionEyebrow } from "@/components/SectionEyebrow";

const IG_HANDLE = "svnord_lerchenau";
const IG_PROFILE_URL = `https://www.instagram.com/${IG_HANDLE}/`;
const IG_EMBED_URL = `https://www.instagram.com/${IG_HANDLE}/embed/`;

export function InstagramTeaser() {
  const [consent, setConsent] = useState(false);

  return (
    <section className="border-b border-nord-line bg-nord-paper-2">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="06" label="Social" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Instagram.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-nord-muted">
              Folge dem SV Nord auf{" "}
              <Link
                href={IG_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-nord-navy underline-offset-2 hover:underline"
              >
                @{IG_HANDLE}
              </Link>{" "}
              für tägliche Einblicke, Match-Highlights und Vereinsleben.
            </p>
          </div>
          <Link
            href={IG_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-nord-line px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper md:inline-flex"
          >
            Profil öffnen ↗
          </Link>
        </div>

        {consent ? (
          <div className="overflow-hidden rounded-2xl border border-nord-line bg-white shadow-sm">
            <iframe
              src={IG_EMBED_URL}
              title={`Instagram-Beiträge von @${IG_HANDLE}`}
              loading="lazy"
              className="block h-[640px] w-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="encrypted-media"
            />
            <div className="border-t border-nord-line bg-nord-paper-2 px-5 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-nord-muted">
              Direkt auf{" "}
              <Link
                href={IG_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nord-navy hover:text-nord-gold"
              >
                Instagram.com ↗
              </Link>{" "}
              ansehen
            </div>
          </div>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-nord-line bg-gradient-to-br from-[#f6f0e8] via-white to-[#fff5f6] p-10 md:p-14">
            <div className="max-w-xl text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#fdc468] via-[#e1306c] to-[#5851db] text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-7"
                  aria-hidden
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
              </div>
              <h3 className="mt-5 font-display text-2xl font-black text-nord-ink">
                Instagram-Feed laden
              </h3>
              <p className="mt-3 text-sm text-nord-muted">
                Beim Laden werden Daten an Meta Platforms Ireland Ltd.
                übertragen (Cookies, IP-Adresse). Erst nach deinem Klick. Mehr
                in unserer{" "}
                <Link
                  href="/datenschutz"
                  className="font-semibold text-nord-navy underline-offset-2 hover:underline"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setConsent(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e1306c] to-[#5851db] px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.04em] text-white shadow-sm transition hover:opacity-90"
                >
                  Feed laden →
                </button>
                <Link
                  href={IG_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-nord-line bg-white px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-white"
                >
                  Auf Instagram öffnen ↗
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
