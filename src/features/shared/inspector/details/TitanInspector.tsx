"use client";

import { Titan } from "@/types/api";
import { BaseInspector } from "./BaseInspector";
import { EntityStats } from "@/components/entity-card/EntityStats";
import { EntityMechanics } from "@/components/entity-card/EntityMechanics";

interface TitanInspectorProps {
  item: Titan;
  onBack?: () => void;
  onClose?: () => void;
}

export function TitanInspector({ item, onBack, onClose }: TitanInspectorProps) {
  return (
    <BaseInspector item={item} onBack={onBack} onClose={onClose}>
      <EntityStats item={item} variant="compact" />
      <EntityMechanics item={item} variant="compact" />
      
      {item.description && (
        <div className="bg-surface-dim p-3 rounded-lg border border-border-subtle mt-auto">
          <p className="text-xs text-text-secondary italic leading-relaxed text-center">
            &quot;{item.description}&quot;
          </p>
        </div>
      )}
    </BaseInspector>
  );
}
