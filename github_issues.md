# GitHub Issues

> **Generated on:** 2026-02-14

| Issue | Title | Labels | Link |
| :--- | :--- | :--- | :--- |
| #21 | Investigation - Titan | `investigation`, `mechanics` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/21) |
| #20 | Truncate Long Build Names | `ui`, `css` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/20) |
| #19 | Optimize Stat Layout | `ui`, `stats` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/19) |
| #18 | Full Deck double-click behavior | `logic`, `interaction` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/18) |
| #17 | Prevent Text Selection on Drag | `mobile`, `interaction` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/17) |
| #16 | Lock Scroll on Drag | `bug`, `mobile`, `interaction` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/16) |
| #15 | Mobile Plus Button Sizing | `ui`, `mobile`, `cleanup` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/15) |
| #14 | Reorder Mobile Share Window | `ui`, `mobile` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/14) |
| #13 | Fix Mobile Build Section Sizing | `bug`, `mobile`, `layout` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/13) |
| #12 | Increase Mobile Close Button Hitbox | `mobile`, `accessibility` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/12) |
| #11 | Fix Mobile Button Overlap | `bug`, `ui`, `mobile` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/11) |
| #9 | Info Panel Visibility | `enhancement`, `ui`, `desktop` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/9) |
| #8 | Rename Delete to Clear | `ui`, `semantics` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/8) |
| #7 | Remove Redundant Controls | `ui`, `cleanup` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/7) |
| #6 | Relocate Solo/Team Switcher | `ui`, `desktop` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/6) |
| #5 | Mobile Data Migration Safety | `bug`, `mobile`, `data` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/5) |
| #4 | Refine Search Logic weights | `bug`, `logic` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/4) |
| #3 | Improve Deck Naming Logic | `enhancement`, `logic` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/3) |
| #2 | Refactor Save Button Logic | `core-logic`, `ux` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/2) |
| #1 | Implement Auto-Save | `enhancement`, `core-logic` | [Link](https://github.com/TerribleTurtle/spellcastersdb/issues/1) |

## Details

### #21: Investigation - Titan
**Labels**: `investigation`, `mechanics`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/21

> > **Context**: User suggested putting the "Titan" at the bottom of the mobile share view.
> > **Action**: Define "Titan." is this a specific Unit Type, a Summon, or a secondary Hero? Does the UI need a dedicated "Titan Slot"?

---

### #20: Truncate Long Build Names
**Labels**: `ui`, `css`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/20

> > **Context**: Long build names break the layout.
> > **Requirement**: Truncate long Build Names to 2 lines, then shrink font size if necessary (CSS `line-clamp` or dynamic font scaling).
> 
> ---
> 
> ## Investigation Needed

---

### #19: Optimize Stat Layout
**Labels**: `ui`, `stats`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/19

> > **Requirement**:
> >
> > 1. Move DPS to the top right (next to Health) for better readability.
> > 2. Group Damage and Attack Speed together as they are related.

---

### #18: Full Deck double-click behavior
**Labels**: `logic`, `interaction`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/18

> > **Current**: Double-clicking a card when deck is full does nothing, leaving the user unsure if the action failed.
> > **Fix**: Trigger a popup: "Deck full. Select a slot to swap?"
> 
> ---
> 
> ## Stats & Attributes

---

### #17: Prevent Text Selection on Drag
**Labels**: `mobile`, `interaction`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/17

> > **Context**: Long-pressing the card name (which takes up 1/3 of the card) triggers text copy/selection instead of the intended drag interaction.
> > **Fix**: Apply CSS `user-select: none;` to card elements to force drag interactions.

---

### #16: Lock Scroll on Drag
**Labels**: `bug`, `mobile`, `interaction`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/16

> > **Context**: Dragging a card causes the background to scroll, making precise drops difficult.
> > **Fix**: Lock body scroll `overflow: hidden` while a drag event is active.

---

### #15: Mobile Plus Button Sizing
**Labels**: `ui`, `mobile`, `cleanup`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/15

> > **Context**: The huge "+" button takes up too much space and distracts from card readability.
> > **Requirement**: Evaluate removing it if double-tap adds cards reliably, or make it significantly smaller.
> 
> ---
> 
> ## Interaction & Gestures (Mobile)

---

### #14: Reorder Mobile Share Window
**Labels**: `ui`, `mobile`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/14

> > **Context**: The current order is suboptimal for small screens.
> > **Requirement**: Reorder elements for better visibility:
> >
> > 1. Hero (Top)
> > 2. Cards (Middle)
> > 3. Titan (Bottom)

---

### #13: Fix Mobile Build Section Sizing
**Labels**: `bug`, `mobile`, `layout`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/13

> > **Context**: The Build section expands unintentionally, pushing other elements off-screen or taking up too much vertical real estate.
> > **Requirement**: Fix the layout sizing constraints.

---

### #12: Increase Mobile Close Button Hitbox
**Labels**: `mobile`, `accessibility`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/12

> > **Context**: The 'X' in the top right is too small and hard to tap reliably.
> > **Requirement**: Increase the hit-box size significantly.

---

### #11: Fix Mobile Button Overlap
**Labels**: `bug`, `ui`, `mobile`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/11

> > **Context**: The "Edit" button melds with the "Save" button in the top right, making both hard to retry.
> > **Requirement**: Fix the overlap/spacing.

---

### #9: Info Panel Visibility
**Labels**: `enhancement`, `ui`, `desktop`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/9

> > **Context**: Users currently have to scroll down to read card details, which breaks the flow of deck building.
> > **Requirement**: Make the card info panel "sticky" or hover-based so users don't have to scroll down to read card details.

---

### #8: Rename Delete to Clear
**Labels**: `ui`, `semantics`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/8

> > **Context**: The label "Delete" implies deleting the file/deck indefinitely from the database, whereas the action actually just empties the current slots.
> > **Requirement**:
> >
> > 1. Rename the "Delete" button to "Clear" (to imply emptying slots).
> > 2. **Icon**: Use a Broom, Duster, or Eraser.

---

### #7: Remove Redundant Controls
**Labels**: `ui`, `cleanup`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/7

> > **Context**: "Delete" and "Save" buttons appear in two places, causing clutter and potential confusion about their scope.
> > **Requirement**: Remove the duplicate "Delete" and "Save" buttons.

---

### #6: Relocate Solo/Team Switcher
**Labels**: `ui`, `desktop`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/6

> > **Context**: The switcher is currently hidden in the Library, making it hard to see which mode is active.
> > **Requirement**:
> >
> > 1. Move this from the Library to the Top Bar (next to the Save button).
> > 2. **Visual**: Add a border or color shift to clearly distinguish between Solo and Team modes.

---

### #5: Mobile Data Migration Safety
**Labels**: `bug`, `mobile`, `data`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/5

> > **Context**: Users reported data loss on recent updates. Local storage data needs to be robust against schema changes.
> > **Requirement**: Ensure local storage decks are migrated properly in future updates (Post-EA Task).
> 
> ---
> 
> ## Desktop UI/UX

---

### #4: Refine Search Logic weights
**Labels**: `bug`, `logic`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/4

> > **Context**: The search algorithm weighs description text too heavily. For example, searching "Fire" pulls "Wolven Hunter" because "Fire" appears vaguely in its description, cluttering results.
> > **Requirement**: Review the search algorithm. Weight description text significantly lower than Name/Tag matches, or exclude description from basic search.

---

### #3: Improve Deck Naming Logic
**Labels**: `enhancement`, `logic`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/3

> > **Context**: Currently, the deck name auto-updates based on the selected Hero, which frustrates users trying to maintain custom deck names.
> > **Requirement**:
> >
> > 1. Stop auto-renaming decks based on the Hero.
> > 2. Default new decks to "New Deck".
> > 3. Add a visual sub-category label in the UI: `HeroName - Deck Name`.

---

### #2: Refactor Save Button Logic
**Labels**: `core-logic`, `ux`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/2

> > **Context**: Users are confused that the "Save" button doesn't automatically update the active Share Link/Snapshot. They expect "Save" to make their current link valid with new changes, but it only saves to their local profile.
> > **Requirement**:
> >
> > 1. Rename current button to "Save to Library".
> > 2. Differentiate clearly between saving to the user's profile and generating a snapshot link.

---

### #1: Implement Auto-Save
**Labels**: `enhancement`, `core-logic`

**Link**: https://github.com/TerribleTurtle/spellcastersdb/issues/1

> > **Context**: Users risk losing data if they forget to save manually. Currently, there is no safety net for browser crashes or accidental closes.
> > **Requirement**: Implement an "AutoSave" checkbox (Default: ON).
> > **Triggers**: Trigger save on any card change to prevent data loss.

---

