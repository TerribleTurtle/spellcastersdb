import type { RoadmapCategory, RoadmapItem } from '@/types/roadmap';
import StatusItem from './StatusItem';

interface StatusCategoryProps {
  category: RoadmapCategory;
  items: RoadmapItem[];
}

export default function StatusCategory({ category, items }: StatusCategoryProps) {
  return (
    <section className="space-y-4">
      {/* Category Header */}
      <div className="border-b border-white/10 pb-3">
        <h2 className="text-2xl font-bold text-white mb-1">
          {category.title}
        </h2>
        <p className="text-sm text-slate-400">
          {category.description}
        </p>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StatusItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 bg-surface-card/50 p-8 text-center">
          <p className="text-sm text-slate-500">
            No items in this category yet
          </p>
        </div>
      )}
    </section>
  );
}
