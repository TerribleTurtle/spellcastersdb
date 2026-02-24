"use client";

import { useMemo } from "react";

import Link from "next/link";

import { EntityImage } from "@/components/ui/EntityImage";
import { routes } from "@/lib/routes";
import { UnifiedEntity } from "@/types/api";

interface RelatedEntitiesProps {
  entities: UnifiedEntity[];
  title?: string;
}

/** Deterministic spread sample — picks evenly spaced items from the array */
function spreadSample<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

export function RelatedEntities({
  entities,
  title = "Related",
}: RelatedEntitiesProps) {
  // Pick up to 6 evenly spread items (deterministic, pure)
  const sample = useMemo(() => spreadSample(entities, 6), [entities]);

  if (!sample || sample.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-text-dimmed uppercase tracking-widest">
        {title}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {sample.map((entity) => (
          <Link
            key={entity.entity_id}
            href={routes.entityLink(entity)}
            className="group flex flex-col items-center gap-2 p-2 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-hover hover:border-brand-accent/30 transition-all"
          >
            <EntityImage entity={entity} className="w-14 h-14 rounded-lg" />
            <span className="text-[10px] font-bold text-text-muted group-hover:text-text-primary transition-colors truncate w-full text-center">
              {entity.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
