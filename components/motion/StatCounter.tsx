"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  className?: string;
};

const DIGIT_RE = /^(\d+)([^\d].*)?$/;

export function StatCounter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  const match = value.match(DIGIT_RE);
  const target = match ? Number(match[1]) : 0;
  const suffix = match?.[2] ?? "";

  const count = useMotionValue(match ? 0 : target);
  const rendered = useTransform(count, (v) =>
    match ? Math.round(v).toString() + suffix : value,
  );

  useEffect(() => {
    if (!match) return;
    if (!inView || reduced) {
      count.set(target);
      return;
    }
    count.set(0);
    const controls = animate(count, target, {
      duration: 1.4,
      ease: [0.2, 0.8, 0.2, 1],
    });
    return () => controls.stop();
  }, [inView, reduced, match, target, count]);

  return (
    <motion.span ref={ref} className={className}>
      {rendered}
    </motion.span>
  );
}
