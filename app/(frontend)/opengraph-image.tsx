import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const alt =
  "SV Nord München-Lerchenau e.V. — Traditionsverein im Münchner Norden seit 1947";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "public", "svnord-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background:
          "linear-gradient(135deg, #050e24 0%, #0b1b3f 45%, #14306e 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Diagonal gold ribbon */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -200,
          width: 900,
          height: 180,
          background:
            "linear-gradient(90deg, rgba(200,169,106,0) 0%, rgba(200,169,106,0.25) 45%, rgba(200,169,106,0.45) 100%)",
          transform: "rotate(-18deg)",
          display: "flex",
        }}
      />

      {/* Faint pitch diagonal lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(200,169,106,0.05) 0 1px, transparent 1px 36px)",
          display: "flex",
        }}
      />

      {/* Top gold hairline w/ red flash */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background:
            "linear-gradient(90deg, #c8a96a 0%, #c8a96a 44%, #d43a2f 44%, #d43a2f 56%, #c8a96a 56%, #c8a96a 100%)",
          display: "flex",
        }}
      />

      {/* Vertical gold stripe (left edge accent) */}
      <div
        style={{
          position: "absolute",
          top: 32,
          bottom: 32,
          left: 48,
          width: 3,
          background:
            "linear-gradient(180deg, rgba(200,169,106,0) 0%, #c8a96a 15%, #c8a96a 85%, rgba(200,169,106,0) 100%)",
          display: "flex",
        }}
      />

      {/* MAIN GRID */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "72px 80px 60px 80px",
          zIndex: 1,
        }}
      >
        {/* LEFT — typography column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 60%",
            justifyContent: "space-between",
            paddingRight: 48,
          }}
        >
          {/* Eyebrow badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 16px",
                border: "1.5px solid rgba(200,169,106,0.6)",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.24em",
                color: "#c8a96a",
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#c8a96a",
                }}
              />
              e.V. · Seit 1947
            </div>
            <div
              style={{
                display: "flex",
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.82)",
                textTransform: "uppercase",
              }}
            >
              Bezirksliga Oberbayern
            </div>
          </div>

          {/* Masthead */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 128,
                fontWeight: 900,
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                color: "#ffffff",
              }}
            >
              SV NORD
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 96,
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                color: "#c8a96a",
                fontStyle: "italic",
                marginTop: -6,
              }}
            >
              München-Lerchenau
            </div>
          </div>

          {/* Rule + motto */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 60,
                height: 3,
                background: "#c8a96a",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontStyle: "italic",
                color: "rgba(244,241,234,0.94)",
                letterSpacing: "0.005em",
              }}
            >
              &bdquo;Einmal Nordler, immer Nordler.&ldquo;
            </div>
          </div>

          {/* Footer row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  letterSpacing: "0.22em",
                  color: "rgba(200,169,106,0.9)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Fussball · Volleyball · Gymnastik · Ski · Esport
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#ffffff",
                  marginTop: 10,
                }}
              >
                svnord-lerchenau.de
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — crest medallion */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
            width: 340,
          }}
        >
          {/* Medallion */}
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 300,
              height: 300,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Outer glow ring */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at center, rgba(200,169,106,0.35) 0%, rgba(200,169,106,0) 65%)",
                display: "flex",
              }}
            />
            {/* Gold ring */}
            <div
              style={{
                position: "absolute",
                inset: 16,
                borderRadius: 999,
                border: "2px solid rgba(200,169,106,0.65)",
                display: "flex",
              }}
            />
            {/* Inner navy disc */}
            <div
              style={{
                position: "absolute",
                inset: 34,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at 35% 25%, #20387a 0%, #0b1b3f 60%, #050e24 100%)",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
                display: "flex",
              }}
            />
            <img
              src={logoSrc}
              width={200}
              height={200}
              alt=""
              style={{
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))",
              }}
            />
          </div>

          {/* Chip under medallion */}
          <div
            style={{
              display: "flex",
              marginTop: 28,
              padding: "10px 20px",
              borderRadius: 8,
              background: "#c8a96a",
              color: "#0b1b3f",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Tabellenführer · 2025/26
          </div>

          {/* Coordinates tag */}
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 12,
              letterSpacing: "0.22em",
              color: "rgba(200,169,106,0.7)",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            48.1994° N · 11.5545° E
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
