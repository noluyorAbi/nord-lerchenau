"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

type Props = {
  items: NavItem[];
  glass: boolean;
};

export function SiteNav({ items, glass }: Props) {
  return (
    <nav
      className={`hidden items-center gap-6 font-display text-[15px] font-semibold uppercase tracking-[0.06em] transition-colors duration-300 md:flex ${
        glass ? "text-white/85" : "text-nord-ink/85"
      }`}
    >
      {items.map((item) => (
        <TopItem key={item.href + item.label} item={item} glass={glass} />
      ))}
    </nav>
  );
}

function useHoverOpen() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function clear() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }
  function show() {
    clear();
    setOpen(true);
  }
  function hide() {
    clear();
    timer.current = setTimeout(() => setOpen(false), 140);
  }
  return { open, show, hide };
}

function TopItem({ item, glass }: { item: NavItem; glass: boolean }) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const { open, show, hide } = useHoverOpen();

  return (
    <div
      className="relative"
      onMouseEnter={hasChildren ? show : undefined}
      onMouseLeave={hasChildren ? hide : undefined}
    >
      <Link
        href={item.href}
        className={`flex items-center gap-1 border-b-2 pb-1 transition ${
          open ? "border-nord-gold" : "border-transparent"
        } ${glass ? "hover:text-white" : "hover:text-nord-navy"}`}
      >
        {item.label}
        {hasChildren ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`opacity-80 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path d="M3 4.5 6 7.5l3-3" />
          </svg>
        ) : null}
      </Link>
      {hasChildren && open ? (
        <div
          className="absolute left-0 top-full pt-3"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <Submenu items={item.children!} />
        </div>
      ) : null}
    </div>
  );
}

function Submenu({ items }: { items: NavItem[] }) {
  return (
    <div className="min-w-[240px] rounded-xl border border-white/15 bg-[#0b1b3f] shadow-[0_28px_60px_-12px_rgba(0,0,0,0.6)]">
      <ul className="py-1.5 font-display text-[14px] font-semibold tracking-wide text-white">
        {items.map((child) => (
          <SubItem key={child.href + child.label} item={child} />
        ))}
      </ul>
    </div>
  );
}

function SubItem({ item }: { item: NavItem }) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const { open, show, hide } = useHoverOpen();

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? show : undefined}
      onMouseLeave={hasChildren ? hide : undefined}
    >
      <Link
        href={item.href}
        className={`flex items-center justify-between gap-4 px-4 py-2.5 normal-case transition ${
          open
            ? "bg-white/10 text-nord-gold"
            : "text-white hover:bg-white/10 hover:text-nord-gold"
        }`}
      >
        <span>{item.label}</span>
        {hasChildren ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
            aria-hidden
          >
            <path d="M4.5 3 7.5 6l-3 3" />
          </svg>
        ) : null}
      </Link>
      {hasChildren && open ? (
        <div
          className="absolute left-full top-0 pl-2"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <Submenu items={item.children!} />
        </div>
      ) : null}
    </li>
  );
}
