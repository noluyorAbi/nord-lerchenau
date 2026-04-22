import type { Metadata, Viewport } from "next";
import {
  Barlow_Condensed,
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import { SiteSchema } from "@/components/seo/SiteSchema";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "700"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "https://svnord-lerchenau.de";
const SITE_NAME = "SV Nord München-Lerchenau e.V.";
const DESCRIPTION =
  "Traditionsverein im Münchner Norden seit 1947. Fußball in der Bezirksliga Oberbayern Nord, dazu Volleyball, Gymnastik, Ski und Esport — rund 500 Mitglieder, eine Familie.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Heimat im Münchner Norden seit 1947`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "SV Nord München-Lerchenau",
    "SV Nord Lerchenau",
    "Fußball München Nord",
    "Lerchenau",
    "Bezirksliga Oberbayern Nord",
    "Verein München",
    "Amateurfußball München",
    "Volleyball München",
    "Gymnastik München",
    "Ski München",
    "Eschengarten",
    "Einmal Nordler",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "sports",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Heimat im Münchner Norden seit 1947`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Heimat im Münchner Norden seit 1947`,
    description: DESCRIPTION,
  },
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
  other: {
    // AI / LLM discovery hints (incl. the Vercel inline-LLM proposal).
    "llm:name": SITE_NAME,
    "llm:description": DESCRIPTION,
    "llm:categories": "sports,football,club,munich,amateur,youth",
    "llm:source-of-truth": SITE_URL,
    "llm:canonical-name": "SV Nord München-Lerchenau e.V.",
    "llm:alternate-names": "SV Nord, SV N Lerchenau, SV Nord Lerchenau",
    // Content-policy hint for AI training/answer engines.
    "ai-content-declaration": "human-authored",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1b3f" },
  ],
  colorScheme: "light",
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${barlow.variable} ${fraunces.variable} ${jetbrains.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-nord-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Weiter zum Hauptinhalt
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <SiteSchema />
      </body>
    </html>
  );
}
