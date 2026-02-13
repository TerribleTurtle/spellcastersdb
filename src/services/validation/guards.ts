import { EntityCategory } from "@/types/enums";
import { Spellcaster, Unit, Titan, Spell, UnifiedEntity } from "@/types/api";

/**
 * Type guard to check if an entity is a Spellcaster.
 * Checks for `category === 'Spellcaster'` or presence of specific properties like `spellcaster_id`.
 */
export function isSpellcaster(entity: unknown): entity is Spellcaster {
  if (!entity || typeof entity !== "object") return false;
  
  const candidate = entity as Spellcaster;
  return (
    candidate.category === EntityCategory.Spellcaster || 
    "spellcaster_id" in candidate || 
    // Fallback: Check for unique combination of properties
    ("class" in candidate && "abilities" in candidate)
  );
}

/**
 * Type guard to check if an entity is a Unit (Creature or Building).
 */
export function isUnit(entity: unknown): entity is Unit {
  if (!entity || typeof entity !== "object") return false;
  const candidate = entity as Unit;
  return (
    candidate.category === EntityCategory.Creature || 
    candidate.category === EntityCategory.Building
  );
}

/**
 * Type guard to check if an entity is a Titan.
 */
export function isTitan(entity: unknown): entity is Titan {
    if (!entity || typeof entity !== "object") return false;
    const candidate = entity as Titan;
    return candidate.category === EntityCategory.Titan;
}

/**
 * Type guard to check if an entity is a Spell.
 */
export function isSpell(entity: unknown): entity is Spell {
    if (!entity || typeof entity !== "object") return false;
    const candidate = entity as Spell;
    return candidate.category === EntityCategory.Spell;
}


/**
 * Comprehensive check for any valid game entity (Spellcaster, Unit, Titan, or Spell).
 */
export function isUnifiedEntity(entity: unknown): entity is UnifiedEntity {
    return isSpellcaster(entity) || isUnit(entity) || isTitan(entity) || isSpell(entity);
}
