"use client";

import Link from "next/link";
import gsap from "gsap";
import { useEffect, useRef } from "react";

import { ClubLogo } from "@/components/ClubLogo";
import type { FupaMatch, FupaTeamRef } from "@/lib/fupa";

type Props = {
  nextMatch: FupaMatch | null;
  opponent: FupaTeamRef | null;
  opponentCrest: string | null;
  kickoffTime: string;
  compLabel: string;
  matchDateLine: string;
};

const TILT_MAX_X = 14;
const TILT_MAX_Y = 10;
const INNER_PARALLAX = 10;

export function HeroMatchCard({
  nextMatch,
  opponent,
  opponentCrest,
  kickoffTime,
  compLabel,
  matchDateLine,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const inner = innerRef.current;
    const shine = shineRef.current;
    if (!card || !inner || !shine) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Reveal animation on mount
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: 24, rotateX: -14, scale: 0.96 },
      {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.2,
      },
    );

    // Quick tweens for cursor-driven tilt + parallax
    const rotY = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    const rotX = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const innerX = gsap.quickTo(inner, "x", { duration: 0.7, ease: "power3.out" });
    const innerY = gsap.quickTo(inner, "y", { duration: 0.7, ease: "power3.out" });
    const shineOp = gsap.quickTo(shine, "opacity", { duration: 0.4, ease: "power2.out" });

    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    function onMove(e: MouseEvent) {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      pending = { x: relX, y: relY };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!pending) return;
        const { x, y } = pending;
        rotY((x - 0.5) * 2 * TILT_MAX_X);
        rotX((0.5 - y) * 2 * TILT_MAX_Y);
        innerX((0.5 - x) * INNER_PARALLAX);
        innerY((0.5 - y) * INNER_PARALLAX * 0.7);
        // Shine position via CSS vars for the two radial gradients
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
      });
    }

    function onEnter() {
      shineOp(1);
    }

    function onLeave() {
      rotY(0);
      rotX(0);
      innerX(0);
      innerY(0);
      shineOp(0);
      card?.style.setProperty("--mx", "50%");
      card?.style.setProperty("--my", "50%");
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="relative flex items-center"
      style={{ perspective: 1200 }}
    >
      <div
        ref={cardRef}
        className="group relative w-full overflow-hidden rounded-[20px] border border-white/15 bg-nord-ink/60 p-6 shadow-[0_20px_60px_rgba(5,14,36,0.45)] backdrop-blur-md transition-shadow duration-300 will-change-transform hover:shadow-[0_30px_80px_rgba(5,14,36,0.65)]"
        style={
          {
            transformStyle: "preserve-3d",
            ["--mx" as string]: "50%",
            ["--my" as string]: "50%",
          } as React.CSSProperties
        }
      >
        {/* Shine layer — follows cursor, fades in on hover */}
        <div
          ref={shineRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0"
          style={{
            background: `
              radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.22) 0%, transparent 55%),
              radial-gradient(circle at var(--mx) var(--my), rgba(200,169,106,0.35) 0%, transparent 40%)
            `,
            mixBlendMode: "screen",
          }}
        />

        {/* Gold border glow on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-nord-gold/0 transition-[box-shadow,--tw-ring-color] duration-300 group-hover:ring-nord-gold/40"
        />

        {/* Parallax inner content */}
        <div
          ref={innerRef}
          className="relative"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
              Nächstes Spiel
            </div>
            <span className="inline-flex items-center rounded-full border border-nord-gold px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold">
              {compLabel}
            </span>
          </div>

          <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
            {matchDateLine}
          </div>

          {nextMatch && opponent ? (
            <>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
                <div
                  className="flex flex-col items-center gap-2"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <ClubLogo
                    size={52}
                    className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  />
                  <div className="text-center font-display text-[14px] font-extrabold leading-tight sm:text-[16px]">
                    SV Nord
                    <br />
                    Lerchenau
                  </div>
                </div>
                <div
                  className="font-display text-[36px] font-black leading-none text-nord-gold drop-shadow-[0_6px_18px_rgba(200,169,106,0.35)] sm:text-[44px]"
                  style={{ transform: "translateZ(60px)" }}
                >
                  vs
                </div>
                <div
                  className="flex flex-col items-center gap-2"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-md bg-white/95 p-1.5 shadow-lg sm:size-14">
                    {opponentCrest ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={opponentCrest}
                        alt={`Wappen ${opponent.name.full}`}
                        className="size-full object-contain"
                      />
                    ) : (
                      <span className="font-display text-[14px] font-black text-nord-navy sm:text-[16px]">
                        {opponent.name.short}
                      </span>
                    )}
                  </div>
                  <div className="line-clamp-2 text-center font-display text-[14px] font-extrabold leading-tight sm:text-[16px]">
                    {opponent.name.full}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                <div style={{ transform: "translateZ(20px)" }}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Anstoß
                  </div>
                  <div className="font-display text-[28px] font-black leading-none text-nord-gold">
                    {kickoffTime}
                  </div>
                </div>
                <Link
                  href="/fussball"
                  style={{ transform: "translateZ(25px)" }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:bg-nord-gold hover:shadow-[0_10px_24px_rgba(200,169,106,0.4)]"
                >
                  Spielinfo →
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-lg border border-white/15 bg-white/5 p-5 text-center text-sm text-white/70">
              Aktuell kein Spiel angesetzt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
