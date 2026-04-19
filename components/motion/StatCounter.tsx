"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  label: string;
};

const DIGIT_RE = /^(\d+)([^\d].*)?$/;

export function StatCounter({ value, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduced) {
      setDisplay(value);
      return;
    }
    const match = value.match(DIGIT_RE);
    if (!match) {
      setDisplay(value);
      return;
    }
    const target = Number(match[1]);
    const suffix = match[2] ?? "";
    setDisplay("0" + suffix);

    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toString() + suffix),
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <div ref={ref} className="px-6 py-6 md:px-8 md:py-7">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-nord-ink md:text-3xl">
        {display}
      </div>
    </div>
  );
}
