import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { getConsumables } from "@/services/api/api";

export const metadata = {
  title: "Consumables",
  description: "Potions, scrolls, and artifacts.",
};

export default async function ConsumablesIndexPage() {
  const consumables = await getConsumables();

  return (
    <PageShell
      title="Consumables"
      maxWidth="6xl"
      breadcrumbs={[{ label: "Consumables", href: "/consumables" }]}
    >
      {consumables.length === 0 ? (
        <p className="text-text-muted">
          No consumables found. Check the data source.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {consumables.map((item) => (
            <Link
              key={item.entity_id}
              href={`/consumables/${item.entity_id}`}
              className="block group bg-surface-card border border-border-default rounded-xl p-6 transition-all hover:bg-surface-hover hover:border-brand-secondary/50 hover:-translate-y-1"
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-secondary/20 flex items-center justify-center text-3xl">
                  🧪
                </div>
              </div>
              <h2 className="text-xl font-bold text-center text-text-primary group-hover:text-brand-secondary transition-colors mb-2">
                {item.name}
              </h2>
              <div className="flex justify-center gap-2 mb-4">
                <span
                  className={`text-xs px-2 py-1 rounded font-bold uppercase
                      ${
                        item.rarity === "Common"
                          ? "bg-surface-hover text-text-secondary"
                          : item.rarity === "Rare"
                            ? "bg-blue-900/50 text-blue-300"
                            : item.rarity === "Epic"
                              ? "bg-purple-900/50 text-purple-300"
                              : "bg-yellow-900/50 text-yellow-300"
                      }
                   `}
                >
                  {item.rarity}
                </span>
              </div>
              <p className="text-sm text-text-muted text-center line-clamp-3">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
