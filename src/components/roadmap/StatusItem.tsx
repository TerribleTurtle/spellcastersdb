import type { RoadmapItem, RoadmapItemType } from '@/types/roadmap';

interface StatusItemProps {
  item: RoadmapItem;
}

// Type icon and color mapping
const typeConfig: Record<RoadmapItemType, { icon: string; color: string }> = {
  bug: { icon: '🐛', color: 'text-red-400' },
  feature: { icon: '✨', color: 'text-cyan-400' },
  enhancement: { icon: '⚡', color: 'text-purple-400' },
  ux: { icon: '🎨', color: 'text-pink-400' },
  data: { icon: '📊', color: 'text-amber-400' },
};

// Status badge styles
const statusConfig = {
  'community-requests': {
    label: 'Requested',
    classes: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  'in-progress': {
    label: 'In Progress',
    classes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  live: {
    label: 'Live',
    classes: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
};

export default function StatusItem({ item }: StatusItemProps) {
  const { icon, color } = typeConfig[item.type];
  const { label, classes } = statusConfig[item.category];

  return (
    <div className="group relative rounded-lg border border-white/10 bg-surface-card p-3 transition-all hover:border-white/20 hover:bg-surface-hover">
      {/* Header row: Type icon + Title + Status badge */}
      <div className="mb-1.5 flex items-center gap-2">
        {/* Type Icon */}
        <span className={`text-sm ${color}`} title={item.type}>
          {icon}
        </span>

        {/* Title */}
        <h3 className="flex-1 text-base font-semibold text-white leading-tight">
          {item.title}
        </h3>

        {/* Status Badge */}
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${classes}`}
        >
          {label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed pl-6">
        {item.description}
      </p>

      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 bg-linear-to-br from-brand-primary/5 to-transparent" />
    </div>
  );
}
