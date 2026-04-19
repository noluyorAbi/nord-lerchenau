"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  className?: string;
};

const DIGIT_RE = /^(\d+)([^\d].*)?$/;

export function StatCounter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
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
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
