import type { RoadmapItem, RoadmapItemType } from '@/types/roadmap';

interface StatusItemProps {
  item: RoadmapItem;
}

// Type icon and color mapping
const typeConfig: Record<RoadmapItemType, { icon: string; color: string; label: string; badgeClasses: string }> = {
  bug: { 
    icon: '🐛', 
    color: 'text-red-400', 
    label: 'Bug',
    badgeClasses: 'bg-red-500/10 text-red-300 border-red-500/20'
  },
  feature: { 
    icon: '✨', 
    color: 'text-cyan-400', 
    label: 'Feature',
    badgeClasses: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
  },
  enhancement: { 
    icon: '⚡', 
    color: 'text-purple-400', 
    label: 'Enhancement',
    badgeClasses: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  },
  ux: { 
    icon: '🎨', 
    color: 'text-pink-400', 
    label: 'UX',
    badgeClasses: 'bg-pink-500/10 text-pink-300 border-pink-500/20'
  },
  data: { 
    icon: '📊', 
    color: 'text-amber-400', 
    label: 'Data',
    badgeClasses: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
  },
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
  const { icon, color, label: typeLabel, badgeClasses } = typeConfig[item.type];
  const { label: statusLabel, classes: statusClasses } = statusConfig[item.category];

  return (
    <div className="group relative rounded-lg border border-white/10 bg-surface-card p-3 transition-all hover:border-white/20 hover:bg-surface-hover">
      {/* Header row: Type icon + Title + Badges */}
      <div className="mb-2 flex items-start gap-3">
        {/* Type Icon */}
        <span className={`text-lg ${color} mt-0.5 shrink-0`} title={item.type}>
          {icon}
        </span>

        {/* Title */}
        <h3 className="flex-1 text-sm font-semibold text-white leading-snug pt-0.5">
          {item.title}
        </h3>

        {/* Badges Container */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {/* Status Badge */}
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusClasses}`}
          >
            {statusLabel}
          </span>
          {/* Type Badge */}
          <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClasses}`}>
            {typeLabel}
          </span>
        </div>
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
