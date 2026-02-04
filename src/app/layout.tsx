import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    template: "%s | SpellcastersDB",
    default: "SpellcastersDB - Community Database & Deck Builder",
  },
  description: "The definitive community hub for Spellcasters Chronicles. Browse units, build decks, and analyze the meta with the most up-to-date data.",
  keywords: ["Spellcasters Chronicles", "Deck Builder", "Unit Database", "Strategy", "Game Data", "Wiki"],
  authors: [{ name: "TerribleTurtle" }],
  creator: "TerribleTurtle",
  metadataBase: new URL("https://spellcastersdb.com"),
  openGraph: {
    title: "SpellcastersDB",
    description: "The definitive community hub for Spellcasters Chronicles.",
    url: "https://spellcastersdb.com",
    siteName: "SpellcastersDB",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-default.png", // We will need to add this image later
        width: 1200,
        height: 630,
        alt: "SpellcastersDB - Community Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpellcastersDB",
    description: "The definitive community hub for Spellcasters Chronicles.",
    creator: "@TerribleTurtle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BetaBanner } from "@/components/layout/BetaBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <BetaBanner />
        <main className="grow">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
