"use client";

import { Spell } from "@/types/api";
import { BaseInspector } from "./BaseInspector";
import { EntityStats } from "@/components/entity-card/EntityStats";
import { EntityMechanics } from "@/components/entity-card/EntityMechanics";

interface SpellInspectorProps {
  item: Spell;
  onBack?: () => void;
  onClose?: () => void;
}

export function SpellInspector({ item, onBack, onClose }: SpellInspectorProps) {
  return (
    <BaseInspector item={item} onBack={onBack} onClose={onClose}>
      <EntityStats item={item} variant="compact" />
      <EntityMechanics item={item} variant="compact" />
      
      {item.description && (
        <div className="bg-black/20 p-3 rounded-lg border border-white/5 mt-auto">
          <p className="text-xs text-gray-300 italic leading-relaxed text-center">
            &quot;{item.description}&quot;
          </p>
        </div>
      )}
    </BaseInspector>
  );
}
