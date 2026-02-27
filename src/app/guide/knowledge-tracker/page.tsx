import Link from "next/link";

import { ArrowRight, Layers } from "lucide-react";

import { JsonLd } from "@/components/common/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { getGameSystems, getSpells, getUnits } from "@/services/api/api";

import { UnlockCalculator } from "./components/UnlockCalculator";

export const metadata = {
  title: "Knowledge Tracker — Guide",
  description:
    "Track the Knowledge needed to unlock units and spells. Forecast your earnings and plan your next unlocks.",
  keywords: [
    "Spellcasters Chronicles",
    "Knowledge Tracker",
    "Unlock Tracker",
    "Progression",
  ],
  openGraph: {
    title: "Knowledge Tracker — Guide",
    description: "Track the Knowledge needed to unlock units and spells.",
    type: "website",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Knowledge Tracker — Guide",
    description: "Track the Knowledge needed to unlock units and spells.",
    images: ["/og-default.png"],
  },
};

export default async function CalculatorPage() {
  const [units, spells, systems] = await Promise.all([
    getUnits(),
    getSpells(),
    getGameSystems(),
  ]);

  const validEntities = [...units, ...spells];

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Knowledge Tracker",
    applicationCategory: "GameUtility",
    description: metadata.description,
    operatingSystem: "Any",
    url: "https://www.spellcastersdb.com/guide/knowledge-tracker",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "SpellcastersDB",
    },
  };

  return (
    <>
      <JsonLd data={jsonLdData} id="json-ld-knowledge-tracker" />
      <PageShell
        title="Knowledge Tracker"
        subtitle="Select units and spells, track your Knowledge bank, and forecast your progress."
        maxWidth="6xl"
        breadcrumbs={[
          { label: "Guide", href: "/guide" },
          { label: "Knowledge Tracker", href: "/guide/knowledge-tracker" },
        ]}
      >
        {!systems ? (
          <div className="bg-surface-card border border-status-danger/30 rounded-lg p-6 text-center">
            <p className="text-status-danger-text text-sm">
              Game progression data is currently unavailable.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Subtle Deck Builder CTA */}
            <div className="flex justify-center md:justify-start">
              <Link
                href="/deck-builder"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors border border-brand-primary/20 group"
              >
                <Layers className="w-4 h-4" />
                Done tracking? Build your deck
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <UnlockCalculator entities={validEntities} systems={systems} />
          </div>
        )}
      </PageShell>
    </>
  );
}
