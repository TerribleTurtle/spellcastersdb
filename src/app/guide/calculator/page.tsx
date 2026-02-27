import { JsonLd } from "@/components/common/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { getGameSystems, getSpells, getUnits } from "@/services/api/api";

import { UnlockCalculator } from "./components/UnlockCalculator";

export const metadata = {
  title: "Unlock Calculator — Guide",
  description:
    "Calculate the games needed to unlock units and spells. Track knowledge earned from matches and daily bonuses.",
  keywords: [
    "Spellcasters Chronicles",
    "Knowledge Calculator",
    "Unlock Tracker",
    "Progression",
  ],
  openGraph: {
    title: "Unlock Calculator — Guide",
    description: "Calculate the games needed to unlock units and spells.",
    type: "website",
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
    name: "Knowledge Unlock Calculator",
    applicationCategory: "GameUtility",
    description: metadata.description,
    operatingSystem: "Any",
  };

  return (
    <>
      <JsonLd data={jsonLdData} id="json-ld-calculator" />
      <PageShell
        title="Unlock Calculator"
        subtitle="Select incantations, enter your match history, see how many games you need."
        maxWidth="6xl"
        breadcrumbs={[
          { label: "Guide", href: "/guide" },
          { label: "Calculator", href: "/guide/calculator" },
        ]}
      >
        {!systems ? (
          <div className="bg-surface-card border border-status-danger/30 rounded-lg p-6 text-center">
            <p className="text-status-danger-text text-sm">
              Game progression data is currently unavailable.
            </p>
          </div>
        ) : (
          <UnlockCalculator entities={validEntities} systems={systems} />
        )}
      </PageShell>
    </>
  );
}
