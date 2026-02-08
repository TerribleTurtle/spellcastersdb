import type { RoadmapData } from "@/types/roadmap";

import StatusCategory from "./StatusCategory";

interface StatusDashboardProps {
  data: RoadmapData;
}

export default function StatusDashboard({ data }: StatusDashboardProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary sm:text-5xl">
          Development Roadmap
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-300">
          A transparent view into what&apos;s being built, what&apos;s
          requested, and what&apos;s already live. This roadmap is manually
          curated to show the most important features and improvements.
        </p>
      </header>

      {/* Categories */}
      <div className="space-y-12">
        {data.categories.map((category) => {
          // Filter items for this category
          const categoryItems = data.items.filter(
            (item) => item.category === category.id
          );

          return (
            <StatusCategory
              key={category.id}
              category={category}
              items={categoryItems}
            />
          );
        })}
      </div>

      {/* Footer Note */}
      <footer className="mt-16 border-t border-white/10 pt-8 text-center">
        <p className="text-sm text-slate-500">
          Have a feature request?{" "}
          <a
            href="https://github.com/TerribleTurtle/spellcasters-community-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent hover:underline"
          >
            Open an issue on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
