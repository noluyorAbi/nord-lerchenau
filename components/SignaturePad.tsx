"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  legend: string;
  hint?: string;
  /** PNG mit transparentem Hintergrund, oder null, solange nichts da ist. */
  onChange: (png: Uint8Array | null) => void;
};

const W = 800;
const H = 240;
const INK = "#0b1b3f";

/** Schneidet die leeren Ränder ab, damit die Unterschrift das Feld füllt. */
function trimToInk(src: HTMLCanvasElement): HTMLCanvasElement | null {
  const ctx = src.getContext("2d");
  if (!ctx) return null;
  const { width, height } = src;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const pad = 6;
  const x0 = Math.max(0, minX - pad);
  const y0 = Math.max(0, minY - pad);
  const w = Math.min(width, maxX + pad) - x0;
  const h = Math.min(height, maxY + pad) - y0;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")?.drawImage(src, x0, y0, w, h, 0, 0, w, h);
  return out;
}

function toPng(canvas: HTMLCanvasElement): Promise<Uint8Array | null> {
  return new Promise((resolve) =>
    canvas.toBlob(async (blob) => {
      resolve(blob ? new Uint8Array(await blob.arrayBuffer()) : null);
    }, "image/png"),
  );
}

/** Foto oder Scan einer Unterschrift: Weiss wird durchsichtig, der Rest bleibt Tinte. */
async function inkFromImage(file: File): Promise<HTMLCanvasElement | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // Helles Papier → 0, dunkle Tinte → 255; dazwischen weich.
    const alpha = Math.max(0, Math.min(255, (225 - lum) * 3));
    d[i] = 11;
    d[i + 1] = 27;
    d[i + 2] = 63;
    d[i + 3] = Math.min(d[i + 3], alpha);
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function SignaturePad({ legend, hint, onChange }: Props) {
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [hasInk, setHasInk] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const publish = useCallback(
    async (canvas: HTMLCanvasElement | null) => {
      const trimmed = canvas ? trimToInk(canvas) : null;
      onChange(trimmed ? await toPng(trimmed) : null);
    },
    [onChange],
  );

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = INK;
  }, [mode]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pos(e);
    last.current = p;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const p = pos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    setHasInk(true);
    void publish(canvasRef.current);
  }

  function clear() {
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, W, H);
    setHasInk(false);
    setPreview(null);
    setError(undefined);
    onChange(null);
  }

  async function onFile(file: File | undefined) {
    setError(undefined);
    if (!file) return;
    try {
      const ink = await inkFromImage(file);
      const trimmed = ink ? trimToInk(ink) : null;
      if (!trimmed) {
        setError("Auf dem Bild ist keine Unterschrift zu erkennen.");
        return;
      }
      setPreview(trimmed.toDataURL("image/png"));
      onChange(await toPng(trimmed));
    } catch {
      setError(
        "Das Bild konnte nicht gelesen werden. Probiere ein JPG oder PNG.",
      );
    }
  }

  const tab = (value: "draw" | "upload", label: string) => (
    <button
      type="button"
      onClick={() => {
        if (mode !== value) {
          clear();
          setMode(value);
        }
      }}
      aria-pressed={mode === value}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
        mode === value
          ? "bg-nord-ink text-white"
          : "bg-nord-paper-2 text-nord-ink hover:bg-nord-line"
      }`}
    >
      {label}
    </button>
  );

  return (
    <fieldset>
      <legend className="text-[11px] font-semibold uppercase tracking-[0.1em] text-nord-muted">
        {legend}
      </legend>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-nord-muted">{hint}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        {tab("draw", "Zeichnen")}
        {tab("upload", "Bild hochladen")}
      </div>

      {mode === "draw" ? (
        <div className="mt-2">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            aria-label={`${legend}: hier mit Maus oder Finger unterschreiben`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className="aspect-[10/3] w-full touch-none rounded-lg border border-dashed border-nord-navy-2/50 bg-white"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-nord-muted">
            <span>
              {hasInk
                ? "Unterschrift erfasst."
                : "Mit Maus oder Finger hier unterschreiben."}
            </span>
            <button
              type="button"
              onClick={clear}
              disabled={!hasInk}
              className="font-semibold text-nord-ink underline disabled:opacity-40"
            >
              Neu beginnen
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void onFile(e.target.files?.[0])}
            className="block w-full text-sm text-nord-ink file:mr-3 file:rounded-lg file:border-0 file:bg-nord-ink file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <p className="text-xs leading-relaxed text-nord-muted">
            Foto oder Scan deiner Unterschrift auf weißem Papier. Das Bild
            bleibt auf deinem Gerät.
          </p>
          {preview ? (
            <Image
              src={preview}
              alt="Vorschau der Unterschrift"
              width={300}
              height={90}
              unoptimized
              className="h-auto max-h-24 w-auto rounded-lg border border-nord-line bg-white p-2"
            />
          ) : null}
        </div>
      )}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}
