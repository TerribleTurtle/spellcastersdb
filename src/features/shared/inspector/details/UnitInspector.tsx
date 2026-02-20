"use client";

import { EntityMechanics } from "@/components/entity-card/EntityMechanics";
import { EntityStats } from "@/components/entity-card/EntityStats";
import { Unit } from "@/types/api";

import { BaseInspector } from "./BaseInspector";

interface UnitInspectorProps {
  item: Unit;
  onBack?: () => void;
  onClose?: () => void;
}

export function UnitInspector({ item, onBack, onClose }: UnitInspectorProps) {
  return (
    <BaseInspector item={item} onBack={onBack} onClose={onClose}>
      <EntityStats item={item} variant="compact" />
      <EntityMechanics item={item} variant="compact" />

      {item.description && (
        <div className="bg-surface-dim p-3 rounded-lg border border-border-subtle mt-auto">
          <p className="text-xs md:text-base text-text-secondary italic leading-relaxed text-center">
            &quot;{item.description}&quot;
          </p>
        </div>
      )}
    </BaseInspector>
  );
}
