import Link from "next/link";

import { Box } from "lucide-react";

import { routes } from "@/lib/routes";
import { type MapChest } from "@/types/map-chests";

interface MapChestTableProps {
  chests: readonly MapChest[];
}

// Helper to get consistent rarity colors
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Common":
      return "bg-status-success/15 border-status-success/30 text-status-success-text";
    case "Epic":
      return "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400";
    case "Legendary":
      return "bg-brand-accent/15 border-brand-accent/30 text-brand-accent";
    default:
      return "bg-surface-inset border-border-default text-text-secondary";
  }
};

export function MapChestTable({ chests }: MapChestTableProps) {
  if (!chests || chests.length === 0) {
    return (
      <div className="bg-surface-card border border-dashed border-border-default rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <Box size={32} className="text-text-dimmed mb-3" />
        <p className="text-text-muted">No chest data available for this map.</p>
      </div>
    );
  }

  // Group chests by Tier (T1, T2, etc.)
  const chestsByTier = chests.reduce(
    (acc, chest) => {
      const tier = chest.tier;
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(chest);
      return acc;
    },
    {} as Record<string, MapChest[]>
  );

  // Sort tiers numerically (T1, T2, T3, T4)
  const sortedTiers = Object.keys(chestsByTier).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  return (
    <div className="space-y-8">
      {sortedTiers.map((tier) => {
        const tierChests = chestsByTier[tier];
        const tierNumber = tier.replace(/\D/g, ""); // Extract just the number for display

        return (
          <section key={tier} className="flex flex-col gap-4">
            {/* Tier Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-border-default">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                Tier {tierNumber}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-inset text-xs font-semibold text-text-muted border border-border-subtle">
                {tierChests.length}{" "}
                {tierChests.length === 1 ? "chest" : "chests"}
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-surface-card border border-border-default rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-surface-dim border-b border-border-default text-text-muted">
                    <tr>
                      <th className="px-5 py-3 font-semibold w-1/4">
                        Location
                      </th>
                      <th className="px-5 py-3 font-semibold w-1/4">Reward</th>
                      <th className="px-5 py-3 font-semibold w-1/4">Type</th>
                      <th className="px-5 py-3 font-semibold w-1/4">Rarity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {tierChests.map((chest, index) => {
                      const linkHref =
                        chest.reward_type === "Spell"
                          ? routes.spell(chest.reward_entity_id)
                          : routes.unit(chest.reward_entity_id);

                      // Formatting entity ID nicely if possible (e.g. fire_ball -> Fire Ball)
                      const displayTitle = chest.reward_entity_id
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");

                      return (
                        <tr
                          key={`${chest.location}-${index}`}
                          className="hover:bg-surface-dim/50 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium text-text-primary">
                            {chest.location}
                          </td>
                          <td className="px-5 py-3">
                            <Link
                              href={linkHref}
                              className="font-medium text-brand-primary hover:text-brand-accent hover:underline transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
                            >
                              {displayTitle}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-text-secondary">
                            {chest.reward_type}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold border tracking-wide uppercase ${getRarityColor(
                                chest.rarity
                              )}`}
                            >
                              {chest.rarity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {tierChests.map((chest, index) => {
                const linkHref =
                  chest.reward_type === "Spell"
                    ? routes.spell(chest.reward_entity_id)
                    : routes.unit(chest.reward_entity_id);

                const displayTitle = chest.reward_entity_id
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");

                return (
                  <div
                    key={`mobile-${chest.location}-${index}`}
                    className="bg-surface-card border border-border-default rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-semibold text-text-primary text-base">
                        {chest.location}
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${getRarityColor(
                          chest.rarity
                        )}`}
                      >
                        {chest.rarity}
                      </span>
                    </div>

                    <div className="bg-surface-dim border border-border-subtle rounded p-3 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-text-muted mb-1 block">
                          Reward ({chest.reward_type})
                        </div>
                        <Link
                          href={linkHref}
                          className="font-bold text-brand-primary text-sm hover:underline"
                        >
                          {displayTitle}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
