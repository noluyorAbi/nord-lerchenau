"use client";

import Link from "next/link";

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

function TopItem({ item, glass }: { item: NavItem; glass: boolean }) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  return (
    <div className="relative group/top">
      <Link
        href={item.href}
        className={`flex items-center gap-1 border-b-2 border-transparent pb-1 transition ${
          glass
            ? "hover:text-white group-hover/top:text-white"
            : "hover:text-nord-navy group-hover/top:text-nord-navy"
        }`}
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
            className="opacity-70 transition group-hover/top:rotate-180"
            aria-hidden
          >
            <path d="M3 4.5 6 7.5l3-3" />
          </svg>
        ) : null}
      </Link>
      {hasChildren ? (
        <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition group-hover/top:visible group-hover/top:opacity-100">
          <Submenu items={item.children!} level={1} />
        </div>
      ) : null}
    </div>
  );
}

function Submenu({ items, level }: { items: NavItem[]; level: number }) {
  return (
    <ul className="min-w-[220px] overflow-hidden rounded-lg border border-white/10 bg-nord-navy/95 py-1.5 font-display text-[14px] font-medium tracking-normal text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {items.map((child) => (
        <SubItem key={child.href + child.label} item={child} level={level} />
      ))}
    </ul>
  );
}

function SubItem({ item, level }: { item: NavItem; level: number }) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const groupCls =
    level === 1 ? "group/sub1" : level === 2 ? "group/sub2" : "group/sub3";
  const showCls =
    level === 1
      ? "group-hover/sub1:visible group-hover/sub1:opacity-100"
      : level === 2
        ? "group-hover/sub2:visible group-hover/sub2:opacity-100"
        : "group-hover/sub3:visible group-hover/sub3:opacity-100";

  return (
    <li className={`relative ${groupCls}`}>
      <Link
        href={item.href}
        className={`flex items-center justify-between gap-4 px-4 py-2 normal-case transition hover:bg-white/10 ${
          hasChildren ? "pr-3" : ""
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
            className="opacity-60"
            aria-hidden
          >
            <path d="M4.5 3 7.5 6l-3 3" />
          </svg>
        ) : null}
      </Link>
      {hasChildren ? (
        <div
          className={`invisible absolute left-full top-0 pl-1 opacity-0 transition ${showCls}`}
        >
          <Submenu items={item.children!} level={level + 1} />
        </div>
      ) : null}
    </li>
  );
}
