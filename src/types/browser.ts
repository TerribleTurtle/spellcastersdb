import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

export type BrowserItem = Unit | Spellcaster | Spell | Titan;

export type VirtualRow =
  | { type: "header"; title: string; count: number; isCollapsed?: boolean }
  | { type: "row"; items: BrowserItem[]; startIndex: number };

export interface ItemUsageState {
  isActive: boolean;
  memberOfDecks: number[];
}
