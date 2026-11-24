"use client";

import { useState } from "react";

type Props = {
  name: string;
  src: string | null;
};

/**
 * Spielerfoto aus dem BFV-Kader. Der BFV liefert für manche Spieler Bild-Links,
 * die ins Leere zeigen (Platzhalter oder gelöschte Fotos). Dann zeigen wir die
 * Initialen statt eines kaputten Bildes.
 */
export function BfvPlayerAvatar({ name, src }: Props) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nord-paper-2 ring-1 ring-nord-line">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-display text-[11px] font-black text-nord-muted">
          {initials}
        </span>
      )}
    </span>
  );
}
