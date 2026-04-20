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
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(ellipse at top left, #1a3168 0%, #0b1b3f 55%, #050e24 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 15%, rgba(110, 199, 234, 0.18) 0%, transparent 45%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background:
              "linear-gradient(90deg, #c8a96a 0%, #c8a96a 40%, #d43a2f 40%, #d43a2f 60%, #c8a96a 60%, #c8a96a 100%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            zIndex: 1,
          }}
        >
          <img
            src={logoSrc}
            width={130}
            height={130}
            alt=""
            style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#c8a96a",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
              }}
            >
              e.V. · München · seit 1947
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.05em",
              }}
            >
              Bezirksliga Oberbayern Nord
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            SV Nord
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: "#c8a96a",
              fontStyle: "italic",
            }}
          >
            München-Lerchenau
          </div>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 68,
                height: 3,
                background: "#c8a96a",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: "rgba(244,241,234,0.92)",
                letterSpacing: "0.01em",
              }}
            >
              Fußball · Volleyball · Gymnastik · Ski · Esport
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              fontSize: 24,
              fontStyle: "italic",
              color: "rgba(200,169,106,0.85)",
              letterSpacing: "0.01em",
            }}
          >
            „Einmal Nordler, immer Nordler.&ldquo;
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
