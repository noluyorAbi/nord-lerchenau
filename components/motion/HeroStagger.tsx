"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function HeroStagger({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = root.querySelectorAll<HTMLElement>("[data-hero-item]");
    if (!items.length) return;
    if (reduced) {
      gsap.set(items, { clearProps: "all", opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(items, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function HeroItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-hero-item className={className}>
      {children}
    </div>
  );
}
