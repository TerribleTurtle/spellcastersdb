import { UnifiedEntity, Unit, Spell, Titan } from "@/types/api";
import { Deck, SlotIndex } from "@/types/deck";
import { isSpellcaster, isTitan } from "@/services/validation/guards";
import { TITAN_SLOT_INDEX } from "@/services/config/constants";

/**
 * Checks if a specific item is already present in a specific slot of the deck.
 */
export function getSlotStatus(
  deck: Deck, 
  item: UnifiedEntity, 
  slotIndex: SlotIndex
): "ALREADY_IN" | null {
  if (isSpellcaster(item)) return null;

  const slot = deck.slots[slotIndex];
  const entity = item as Unit | Spell | Titan;
  
  // Check if the slot contains this exact entity
  const isExample = slot.unit?.entity_id === entity.entity_id;
  
  return isExample ? "ALREADY_IN" : null;
}

/**
 * Checks if a Titan is already in its dedicated slot (index 4).
 */
export function getTitanStatus(deck: Deck, item: UnifiedEntity): boolean {
  if (!isTitan(item)) return false;
  
  const titanSlot = deck.slots[TITAN_SLOT_INDEX];
  return titanSlot?.unit?.entity_id === (item as Titan).entity_id;
}
