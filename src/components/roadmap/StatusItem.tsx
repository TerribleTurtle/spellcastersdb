import type { RoadmapItem } from '@/types/roadmap';

interface StatusItemProps {
  item: RoadmapItem;
}

export default function StatusItem({ item }: StatusItemProps) {
  // Color coding based on category
  const categoryColors = {
    'community-requests': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'in-progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'live': 'bg-green-500/20 text-green-300 border-green-500/30',
  };

  const badgeColor = categoryColors[item.category];

  return (
    <div className="group relative rounded-lg border border-white/10 bg-surface-card p-4 transition-all hover:border-white/20 hover:bg-surface-hover">
      {/* Status Badge */}
      <div className="mb-2 inline-flex items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
          {item.category === 'community-requests' && '📝 Requested'}
          {item.category === 'in-progress' && '🔨 In Progress'}
          {item.category === 'live' && '✅ Live'}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-1.5 text-lg font-semibold text-white">
        {item.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed">
        {item.description}
      </p>

      {/* Subtle hover glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 bg-linear-to-br from-brand-primary/5 to-transparent" />
    </div>
  );
}
