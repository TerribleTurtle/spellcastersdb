import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { JsonLd } from "@/components/common/JsonLd";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { Toaster } from "@/components/ui/Toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "dark",
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


import { ensureDataLoaded } from "@/services/api/api";



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
        <TooltipProvider>
          <Navbar />

          <div className="flex max-w-site-shell mx-auto w-full relative">
            <DesktopSidebar />
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
          </div>
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
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
