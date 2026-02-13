import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { JsonLd } from "@/components/common/JsonLd";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Spellcasters Chronicles Database",
    default: "Spellcasters Chronicles Database | SpellcastersDB",
  },
  description:
    "The definitive community hub for Spellcasters Chronicles. Browse units, build decks, and analyze the meta with the most up-to-date data.",
  keywords: [
    "Spellcasters Chronicles",
    "Deck Builder",
    "Unit Database",
    "Strategy",
    "Game Data",
    "Wiki",
  ],
  authors: [{ name: "TerribleTurtle" }],
  creator: "TerribleTurtle",
  metadataBase: new URL("https://spellcastersdb.com"),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "SpellcastersDB",
    description: "The definitive community hub for Spellcasters Chronicles.",
    url: "https://spellcastersdb.com",
    siteName: "SpellcastersDB",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-default.svg",
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


import { ensureDataLoaded } from "@/services/data/api";

// ... imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure data is loaded globally for the app
  await ensureDataLoaded();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen pt-16`}
      >
        <Navbar />

        <DesktopSidebar />

        <main className="grow w-full px-0 flex flex-col md:pl-64 transition-all duration-300">
          <div className="w-full mx-auto px-0 md:px-4 sm:px-6 lg:px-8 flex flex-col grow">
            {children}
          </div>
        </main>
        <Footer />
        <JsonLd 
          id="json-ld-website"
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SpellcastersDB",
            "url": "https://spellcastersdb.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://spellcastersdb.com/database?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          } as Record<string, unknown>}
        />
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
