"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef } from "react";

type Variant = "positron" | "liberty" | "bright" | "dark";

type Props = {
  lat: number;
  lon: number;
  zoom?: number;
  label?: string;
  variant?: Variant;
  className?: string;
};

const STYLES: Record<Variant, string> = {
  positron: "https://tiles.openfreemap.org/styles/positron",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  bright: "https://tiles.openfreemap.org/styles/bright",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

export function MapEmbed({
  lat,
  lon,
  zoom = 15.5,
  label,
  variant = "positron",
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let map: import("maplibre-gl").Map | null = null;
    let markerEl: HTMLDivElement | null = null;
    let observer: ResizeObserver | null = null;
    let raf = 0;
    const resizeTimers: number[] = [];

    async function waitForSize(el: HTMLElement): Promise<void> {
      if (el.clientWidth > 0 && el.clientHeight > 0) return;
      await new Promise<void>((resolve) => {
        const ro = new ResizeObserver(() => {
          if (el.clientWidth > 0 && el.clientHeight > 0) {
            ro.disconnect();
            resolve();
          }
        });
        ro.observe(el);
      });
    }

    async function init() {
      if (!hostRef.current) return;
      const host = hostRef.current;

      // Don't construct maplibre until the container has layout. If the parent
      // uses `aspect-ratio`, the browser might not have finalized height yet.
      await waitForSize(host);
      if (cancelled) return;

      const maplibre = await import("maplibre-gl");
      if (cancelled) return;

      map = new maplibre.Map({
        container: host,
        style: STYLES[variant],
        center: [lon, lat],
        zoom,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });

      const doResize = () => {
        if (map) map.resize();
      };

      // Belt-and-suspenders: a few nudges to catch any layout races on first
      // paint (hydration, font swaps, parent transitions, scrollbar changes).
      map.on("load", doResize);
      raf = requestAnimationFrame(doResize);
      resizeTimers.push(window.setTimeout(doResize, 120));
      resizeTimers.push(window.setTimeout(doResize, 400));

      observer = new ResizeObserver(doResize);
      observer.observe(host);

      map.addControl(
        new maplibre.NavigationControl({ showCompass: false }),
        "bottom-right",
      );

      markerEl = document.createElement("div");
      markerEl.className = "sv-nord-marker";
      markerEl.innerHTML = `
        <span class="pin-ring"></span>
        <span class="pin-core">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>
          </svg>
        </span>
      `;

      const marker = new maplibre.Marker({ element: markerEl, anchor: "bottom" })
        .setLngLat([lon, lat])
        .addTo(map);

      if (label) {
        marker.setPopup(
          new maplibre.Popup({ offset: 28, closeButton: false }).setHTML(
            `<div class="sv-nord-popup">${label}</div>`,
          ),
        );
      }
    }

    void init();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      resizeTimers.forEach((id) => clearTimeout(id));
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [lat, lon, zoom, variant, label]);

  return (
    <div
      ref={hostRef}
      className={className ?? "relative h-full w-full"}
      aria-label={label ?? "Karte"}
      role="img"
      style={{ minHeight: 240 }}
    >
      <style jsx global>{`
        .sv-nord-marker {
          position: relative;
          width: 36px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sv-nord-marker .pin-ring {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: rgba(200, 169, 106, 0.22);
          animation: sv-nord-pulse 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .sv-nord-marker .pin-core {
          position: relative;
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: #0b1b3f;
          color: #c8a96a;
          box-shadow:
            0 0 0 2px #ffffff,
            0 8px 18px rgba(11, 27, 63, 0.35);
        }
        @keyframes sv-nord-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.55;
          }
          60% {
            transform: scale(1.9);
            opacity: 0;
          }
        }

        /* MapLibre chrome — tune for brand */
        .maplibregl-canvas {
          outline: none;
        }
        .maplibregl-ctrl-attrib {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(6px);
          font-size: 10px !important;
          padding: 2px 8px !important;
          border-radius: 8px 0 0 0 !important;
          color: #5b6475 !important;
        }
        .maplibregl-ctrl-attrib a {
          color: #0b1b3f !important;
        }
        .maplibregl-ctrl-bottom-right .maplibregl-ctrl-attrib-button {
          background-color: rgba(255, 255, 255, 0.9) !important;
        }
        .maplibregl-ctrl-group {
          border: 0 !important;
          box-shadow: 0 6px 18px rgba(11, 27, 63, 0.18) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .maplibregl-ctrl-group button {
          background: #ffffff !important;
          color: #0b1b3f !important;
          width: 34px !important;
          height: 34px !important;
        }
        .maplibregl-ctrl-group button:hover {
          background: #c8a96a !important;
        }
        .maplibregl-ctrl-group button + button {
          border-top: 1px solid rgba(11, 27, 63, 0.08) !important;
        }
        .maplibregl-ctrl-group button .maplibregl-ctrl-icon {
          filter: none !important;
        }
        .sv-nord-popup {
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0b1b3f;
          padding: 4px 6px;
        }
        .maplibregl-popup-content {
          border-radius: 10px !important;
          padding: 6px 10px !important;
          box-shadow: 0 10px 24px rgba(11, 27, 63, 0.25) !important;
          border: 1px solid rgba(11, 27, 63, 0.08);
        }
        .maplibregl-popup-tip {
          border-top-color: #ffffff !important;
        }
        .maplibregl-ctrl-logo {
          display: none !important;
        }
        .maplibregl-cooperative-gesture-screen {
          font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}
