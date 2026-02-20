import { EntityDisplayItem } from "@/components/entity-card/types";
import { isSpellcaster, isTitan } from "@/services/validation/guards";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

import { SpellInspector } from "./details/SpellInspector";
import { SpellcasterInspector } from "./details/SpellcasterInspector";
import { TitanInspector } from "./details/TitanInspector";
import { UnitInspector } from "./details/UnitInspector";

interface InspectorContentProps {
  item: EntityDisplayItem;
  onBack?: () => void;
  onClose?: () => void;
}

export function InspectorContent({
  item,
  onBack,
  onClose,
}: InspectorContentProps) {
  // Dispatch to specialized inspector
  if (isSpellcaster(item)) {
    return (
      <SpellcasterInspector
        item={item as Spellcaster}
        onBack={onBack}
        onClose={onClose}
      />
    );
  }

  if (isTitan(item)) {
    return (
      <TitanInspector item={item as Titan} onBack={onBack} onClose={onClose} />
    );
  }

  // Check category for Spell vs Unit
  const category = "category" in item ? item.category : "";

  if (category === "Spell") {
    return (
      <SpellInspector item={item as Spell} onBack={onBack} onClose={onClose} />
    );
  }

  // Default to Unit Inspector
  return (
    <UnitInspector
      item={item as unknown as Unit}
      onBack={onBack}
      onClose={onClose}
    />
  );
}
