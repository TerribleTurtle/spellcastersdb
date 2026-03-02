import { Metadata } from "next";

import { Map } from "lucide-react";

import { GuideCard } from "@/components/guide/GuideCard";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";

import { KNOWN_MAPS } from "./known-maps";

export const metadata: Metadata = {
  title: "Map Chests - SC Guide",
  description:
    "Chest spawn locations, rewards, and rarities for each arena map.",
  openGraph: {
    title: "Map Chests - SC Guide",
    description:
      "Chest spawn locations, rewards, and rarities for each arena map.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Map Chests - SC Guide",
    description:
      "Chest spawn locations, rewards, and rarities for each arena map.",
  },
};

export default function MapChestsIndexPage() {
  return (
    <PageShell
      title="Map Chests"
      subtitle="Discover chest spawn locations and rewards across different arenas."
      maxWidth="5xl"
      breadcrumbs={[
        { label: "Guide", href: routes.guide() },
        { label: "Map Chests", href: routes.guideMapChests() },
      ]}
    >
      <div className="space-y-8">
        <section className="bg-surface-card border border-border-default rounded-lg p-6 lg:p-8">
          <p className="text-text-secondary leading-relaxed mb-6">
            In various arenas, you can find chests that spawn at specific
            locations during a match. These chests provide powerful units and
            spells that can turn the tide of battle. Select a map below to view
            its chest spawn locations, tier groupings, and potential rewards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {KNOWN_MAPS.map((map) => (
              <GuideCard
                key={map.id}
                title={map.name}
                description={map.description}
                href={routes.guideMapChestsDetail(map.id)}
                icon={<Map size={24} />}
                gradient="from-amber-500/10 to-yellow-600/10"
              />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
