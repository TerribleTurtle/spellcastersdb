"use client";

import { EntityStats } from "@/components/entity-card/EntityStats";
import { SpellcasterAbilities } from "@/components/entity-card/SpellcasterAbilities";
import { Spellcaster } from "@/types/api";

import { BaseInspector } from "./BaseInspector";

interface SpellcasterInspectorProps {
  item: Spellcaster;
  onBack?: () => void;
  onClose?: () => void;
}

export function SpellcasterInspector({
  item,
  onBack,
  onClose,
}: SpellcasterInspectorProps) {
  return (
    <BaseInspector item={item} onBack={onBack} onClose={onClose}>
      <EntityStats item={item} variant="compact" />
      <SpellcasterAbilities item={item} variant="compact" />
    </BaseInspector>
  );
}
