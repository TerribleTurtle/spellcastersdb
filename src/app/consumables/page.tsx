import Link from "next/link";

import { getConsumables } from "@/services/api/api";

export const metadata = {
  title: "Consumables",
  description: "Potions, scrolls, and artifacts.",
};

export default async function ConsumablesIndexPage() {
  const consumables = await getConsumables();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-secondary to-brand-accent">
          Consumables
        </h1>

        {consumables.length === 0 ? (
          <p className="text-gray-400">
            No consumables found. Check the data source.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {consumables.map((item) => (
              <Link
                key={item.entity_id}
                href={`/consumables/${item.entity_id}`}
                className="block group bg-surface-card border border-white/10 rounded-xl p-6 transition-all hover:bg-surface-hover hover:border-brand-secondary/50 hover:-translate-y-1"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-brand-secondary/20 flex items-center justify-center text-3xl">
                    🧪
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center text-white group-hover:text-brand-secondary transition-colors mb-2">
                  {item.name}
                </h2>
                <div className="flex justify-center gap-2 mb-4">
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold uppercase
                        ${
                          item.rarity === "Common"
                            ? "bg-gray-700 text-gray-300"
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
                <p className="text-sm text-gray-400 text-center line-clamp-3">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
