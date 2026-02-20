import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { JsonLd } from "@/components/common/JsonLd";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import Footer from "@/components/layout/Footer";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import Navbar from "@/components/layout/Navbar";
import { ThemeColorMeta } from "@/components/providers/ThemeColorMeta";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ensureDataLoaded } from "@/services/api/api";
import "@/styles/index.css";

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
    "A community database for Spellcasters Chronicles. Browse units, build decks, and view game data.",
  keywords: [
    "Spellcasters Chronicles",
    "Deck Builder",
    "Unit Database",
    "Strategy",
    "Game Data",
    "Wiki",
  ],
  applicationName: "Spellcasters DB",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spellcasters DB",
  },
  authors: [{ name: "TerribleTurtle" }],
  creator: "TerribleTurtle",
  metadataBase: new URL("https://spellcastersdb.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
  },
  openGraph: {
    title: "SpellcastersDB",
    description: "A community database for Spellcasters Chronicles.",
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
    description: "A community database for Spellcasters Chronicles.",
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
  alternates: {
    canonical: "./",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure data is loaded globally for the app
  await ensureDataLoaded();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen pt-12 md:pt-16`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-brand-dark focus:rounded-lg focus:font-bold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <TooltipProvider>
            <Navbar />

            <div className="flex max-w-site-shell mx-auto w-full relative">
              <DesktopSidebar />
              <MainLayoutWrapper>{children}</MainLayoutWrapper>
            </div>
            <Footer />
            <JsonLd
              id="json-ld-website"
              data={
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: "SpellcastersDB",
                  url: "https://spellcastersdb.com",
                  potentialAction: {
                    "@type": "SearchAction",
                    target:
                      "https://spellcastersdb.com/database?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                } as Record<string, unknown>
              }
            />
            <Script
              src="https://tally.so/widgets/embed.js"
              strategy="lazyOnload"
            />
            <Analytics />
            <SpeedInsights />
            <Toaster />
            <ThemeColorMeta />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
