import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MatchdayTicker } from "@/components/site/MatchdayTicker";
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

export const metadata: Metadata = {
  title: {
    default: "SV Nord München-Lerchenau e.V.",
    template: "%s · SV Nord München-Lerchenau",
  },
  description:
    "Traditionsverein im Münchner Norden seit 1947. Fußball, Volleyball, Gymnastik, Ski. ~500 Mitglieder, eine Familie.",
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
        <MatchdayTicker />
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
