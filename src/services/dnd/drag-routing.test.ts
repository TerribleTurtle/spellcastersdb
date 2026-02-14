
import { describe, it, expect } from 'vitest';
import { DragRoutingService } from './drag-routing';
import { EntityCategory } from '@/types/enums';
import { DragData, DropData } from '@/types/dnd';
import { Unit } from '@/types/api';

// Minimal mock factories
const createActive = (data: DragData) => ({
  id: "active-id",
  data: { current: data },
  rect: { current: { initial: null, translated: null } },
  // dnd-kit properties we don't use
} as unknown as import('@dnd-kit/core').Active);

const createOver = (data: DropData) => ({
  id: "over-id",
  data: { current: data },
  rect: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
  disabled: false,
} as unknown as import('@dnd-kit/core').Over);

const mockUnit = (id = "u1") : Unit => ({
    entity_id: id,
    name: "Mock Unit",
    category: EntityCategory.Creature,
    rank: "I"
} as unknown as Unit);

describe('DragRoutingService (Data-Driven)', () => {

  describe('ACTION: SET_SLOT (Browser -> Slot)', () => {
      it('returns SET_SLOT with correct payload', () => {
          const item = mockUnit("u1");
          const active = createActive({ type: "BROWSER_CARD", item });
          const over = createOver({ type: "DECK_SLOT", slotIndex: 2, deckId: "d1" });
          
          const action = DragRoutingService.determineAction(active, over);
          
          expect(action).toEqual({
              type: 'SET_SLOT',
              index: 2,
              item,
              deckId: "d1"
          });
      });

      it('returns NO_OP if item is Spellcaster being dropped on unit slot', () => {
          const item = { spellcaster_id: "s1", name: "Caster" };
          const active = createActive({ type: "BROWSER_CARD", item });
          const over = createOver({ type: "DECK_SLOT", slotIndex: 0 });
          
          const action = DragRoutingService.determineAction(active, over);
          expect(action).toEqual({ type: 'NO_OP' });
      });
  });

  describe('ACTION: MOVE_SLOT (Slot -> Slot)', () => {
      it('returns MOVE_SLOT (Swap) within same deck', () => {
          const active = createActive({ 
              type: "DECK_SLOT", 
              sourceSlotIndex: 0, 
              sourceDeckId: "d1", 
              item: mockUnit() 
          });
          const over = createOver({ 
              type: "DECK_SLOT", 
              slotIndex: 1, 
              deckId: "d1" 
          });
          
          const action = DragRoutingService.determineAction(active, over);
          
          expect(action).toEqual({
              type: 'MOVE_SLOT',
              sourceIndex: 0,
              targetIndex: 1,
              sourceDeckId: "d1",
              deckId: "d1"
          });
      });

      it('returns MOVE_SLOT (Cross-Deck)', () => {
          const active = createActive({ 
              type: "DECK_SLOT", 
              sourceSlotIndex: 0, 
              sourceDeckId: "d1", 
              item: mockUnit() 
          });
          const over = createOver({ 
              type: "DECK_SLOT", 
              slotIndex: 1, 
              deckId: "d2" 
          });
          
          const action = DragRoutingService.determineAction(active, over);
          
          expect(action).toEqual({
              type: 'MOVE_SLOT',
              sourceIndex: 0,
              targetIndex: 1,
              sourceDeckId: "d1",
              deckId: "d2"
          });
      });
  });

  describe('ACTION: HEADER DROP (Auto-Add)', () => {
      it('returns SET_SLOT with index -1 (Auto) when dropping browser on header', () => {
           const item = mockUnit("u1");
           const active = createActive({ type: "BROWSER_CARD", item });
           const over = createOver({ type: "DECK_HEADER", deckId: "d1" });

           const action = DragRoutingService.determineAction(active, over);

           expect(action).toEqual({
               type: 'SET_SLOT',
               index: -1,
               item,
               deckId: "d1"
           });
      });
      
      it('returns MOVE_SLOT with target -1 (Auto) when dropping slot on header', () => {
           const active = createActive({ 
               type: "DECK_SLOT", 
               sourceSlotIndex: 0, 
               sourceDeckId: "d1", 
               item: mockUnit() 
           });
           const over = createOver({ type: "DECK_HEADER", deckId: "d2" });

           const action = DragRoutingService.determineAction(active, over);

           expect(action).toEqual({
               type: 'MOVE_SLOT',
               sourceIndex: 0,
               targetIndex: -1,
               sourceDeckId: "d1",
               deckId: "d2"
           });
      });
  });

});
