"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/Logo";

type NavLink = { label: string; href: string };

type Props = {
  links: NavLink[];
  cta?: { label: string; href: string };
  theme?: "light" | "dark";
};

export function MobileMenu({ links, cta, theme = "light" }: Props) {
  const [open, setOpen] = useState(false);
  const triggerColor =
    theme === "dark"
      ? "text-white hover:bg-white/10"
      : "text-nord-ink hover:bg-black/5";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Menü öffnen"
          className={`inline-flex size-10 items-center justify-center rounded-md transition md:hidden ${triggerColor}`}
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <Dialog.Title className="sr-only">Menü</Dialog.Title>
          <Dialog.Description className="sr-only">
            Navigation der SV Nord Website
          </Dialog.Description>
          <div className="flex items-center justify-between">
            <Logo />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Menü schließen"
                className="inline-flex size-10 items-center justify-center rounded-md text-nord-ink hover:bg-black/5"
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
          <nav className="mt-10 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-lg font-medium text-nord-ink hover:bg-black/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {cta ? (
            <div className="mt-auto pt-8">
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg bg-nord-ink px-4 py-3 text-center text-sm font-semibold text-white"
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
