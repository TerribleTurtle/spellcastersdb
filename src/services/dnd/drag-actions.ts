import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

export type SlotIndex = 0 | 1 | 2 | 3 | 4;

export type DragActionType =
  | "MOVE_SLOT"
  | "SET_SLOT"
  | "CLEAR_SLOT"
  | "SET_SPELLCASTER"
  | "REMOVE_SPELLCASTER"
  | "NO_OP";

export type DragAction =
  | { type: "MOVE_SLOT"; sourceIndex: SlotIndex; targetIndex: SlotIndex }
  | { type: "SET_SLOT"; index: SlotIndex; item: Unit | Spell | Titan }
  | { type: "CLEAR_SLOT"; index: SlotIndex }
  | { type: "SET_SPELLCASTER"; item: Spellcaster }
  | { type: "REMOVE_SPELLCASTER" }
  | { type: "NO_OP" };
