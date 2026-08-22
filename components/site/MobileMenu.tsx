"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import type { NavItem } from "@/lib/nav-tree";

type Props = {
  items: NavItem[];
  cta?: { label: string; href: string };
  theme?: "light" | "dark";
};

/**
 * Stable identity for one row. `href` alone is not unique: "Verein" and its
 * own "Übersicht" child both point at `/verein`, so keying on href would tie
 * two unrelated rows to the same open/closed state.
 */
function keyOf(parentKey: string, item: NavItem, index: number) {
  return `${parentKey}/${index}:${item.href}`;
}

/** Keys of every row from the tree root down to the one matching `pathname`. */
function branchFor(
  items: NavItem[],
  pathname: string,
  parentKey = "",
): string[] {
  for (const [index, item] of items.entries()) {
    const key = keyOf(parentKey, item, index);
    if (item.href === pathname) return [key];
    const deeper = branchFor(item.children ?? [], pathname, key);
    if (deeper.length > 0) return [key, ...deeper];
  }
  return [];
}

export function MobileMenu({ items, cta, theme = "light" }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);

  // Unfold to the section the visitor is already in, so the current page is
  // visible on open instead of hidden behind two taps.
  function handleOpenChange(next: boolean) {
    if (next) setExpanded(branchFor(items, pathname));
    setOpen(next);
  }

  const triggerColor =
    theme === "dark"
      ? "text-white hover:bg-white/10"
      : "text-nord-ink hover:bg-black/5";

  function toggle(key: string) {
    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Menü öffnen"
          className={`inline-flex size-10 items-center justify-center rounded-md transition duration-150 ease-out active:scale-[0.97] lg:hidden ${triggerColor}`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="menu-overlay fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="menu-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl">
          <Dialog.Title className="sr-only">Menü</Dialog.Title>
          <Dialog.Description className="sr-only">
            Navigation der SV Nord Website
          </Dialog.Description>
          <div className="flex items-center justify-between border-b border-nord-line px-5 py-4">
            <Logo />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Menü schließen"
                className="inline-flex size-10 items-center justify-center rounded-md text-nord-ink transition duration-150 ease-out hover:bg-black/5 active:scale-[0.97]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M5 5l10 10M15 5l-10 10" />
                </svg>
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <MobileNavItem
                  key={keyOf("", item, index)}
                  rowKey={keyOf("", item, index)}
                  item={item}
                  depth={0}
                  pathname={pathname}
                  expanded={expanded}
                  onToggle={toggle}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>
          </nav>
          {cta ? (
            <div className="border-t border-nord-line px-5 py-4">
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg bg-nord-gold px-4 py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.04em] text-nord-navy transition duration-150 ease-out active:scale-[0.97]"
              >
                {cta.label}
              </Link>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type ItemProps = {
  item: NavItem;
  rowKey: string;
  depth: number;
  pathname: string;
  expanded: string[];
  onToggle: (key: string) => void;
  onNavigate: () => void;
};

function MobileNavItem({
  item,
  rowKey,
  depth,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: ItemProps) {
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const isOpen = expanded.includes(rowKey);
  const isActive = pathname === item.href;
  const panelId = `menu-${rowKey.replace(/[^a-zA-Z0-9]+/g, "-")}`;

  return (
    <li>
      <div className="flex items-stretch gap-1">
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive ? "page" : undefined}
          className={`flex min-h-11 flex-1 items-center rounded-md pr-3 transition-colors duration-150 ease-out hover:bg-black/5 ${
            depth === 0
              ? "font-display text-[17px] font-semibold uppercase tracking-[0.04em]"
              : "text-[15px]"
          } ${isActive ? "text-nord-gold-ink" : "text-nord-ink"}`}
          style={{ paddingLeft: `${0.75 + depth * 0.875}rem` }}
        >
          {item.label}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(rowKey)}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${item.label} ${isOpen ? "zuklappen" : "aufklappen"}`}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-nord-muted transition duration-150 ease-out hover:bg-black/5 hover:text-nord-ink active:scale-[0.97]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${
                isOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            >
              <path d="M3 4.5 6 7.5l3-3" />
            </svg>
          </button>
        ) : null}
      </div>
      {hasChildren ? (
        <div
          id={panelId}
          // `inert` keeps collapsed links out of tab order and out of the
          // accessibility tree; `display: none` would kill the transition.
          inert={!isOpen}
          className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <ul className="min-h-0 overflow-hidden">
            {children.map((child, index) => (
              <MobileNavItem
                key={keyOf(rowKey, child, index)}
                rowKey={keyOf(rowKey, child, index)}
                item={child}
                depth={depth + 1}
                pathname={pathname}
                expanded={expanded}
                onToggle={onToggle}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
