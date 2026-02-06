import type { RoadmapCategory, RoadmapItem, RoadmapItemType } from '@/types/roadmap';
import StatusItem from './StatusItem';

interface StatusCategoryProps {
  category: RoadmapCategory;
  items: RoadmapItem[];
}

// Define type order for sorting
const typeConfig: Record<RoadmapItemType, { order: number }> = {
  bug: { order: 0 },
  feature: { order: 1 },
  enhancement: { order: 2 },
  ux: { order: 3 },
  data: { order: 4 },
};

export default function StatusCategory({ category, items }: StatusCategoryProps) {
  // Sort items by type order (bugs first, then features, etc.)
  const sortedItems = [...items].sort(
    (a, b) => typeConfig[a.type].order - typeConfig[b.type].order
  );

  return (
    <section className="space-y-3">
      {/* Category Header */}
      <div className="border-b border-white/10 pb-2.5">
        <h2 className="text-xl font-bold text-white mb-0.5">
          {category.title}
        </h2>
        <p className="text-xs text-slate-400">
          {category.description}
        </p>
      </div>

      {/* Unified Items Grid */}
      {sortedItems.length > 0 ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedItems.map((item) => (
            <StatusItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 bg-surface-card/50 p-6 text-center">
          <p className="text-xs text-slate-500">
            No items in this category yet
          </p>
        </div>
      )}
    </section>
  );
}
