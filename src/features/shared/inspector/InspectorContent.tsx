import { EntityDisplayItem } from "@/components/entity-card/types";
import { UnitInspector } from "./details/UnitInspector";
import { SpellInspector } from "./details/SpellInspector";
import { TitanInspector } from "./details/TitanInspector";
import { SpellcasterInspector } from "./details/SpellcasterInspector";
import { isSpellcaster, isTitan } from "@/services/validation/guards";
import { Unit, Spell, Titan, Spellcaster } from "@/types/api";

interface InspectorContentProps {
  item: EntityDisplayItem;
  onBack?: () => void;
  onClose?: () => void;
}

export function InspectorContent({ item, onBack, onClose }: InspectorContentProps) {
  // Dispatch to specialized inspector
  if (isSpellcaster(item)) {
    return <SpellcasterInspector item={item as Spellcaster} onBack={onBack} onClose={onClose} />;
  }

  if (isTitan(item)) {
    return <TitanInspector item={item as Titan} onBack={onBack} onClose={onClose} />;
  }

  // Check category for Spell vs Unit
  const category = "category" in item ? item.category : "";

  if (category === "Spell") {
    return <SpellInspector item={item as Spell} onBack={onBack} onClose={onClose} />;
  }

  // Default to Unit Inspector
  return <UnitInspector item={item as unknown as Unit} onBack={onBack} onClose={onClose} />;
}
