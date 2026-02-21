> [!WARNING]
> **[ARCHIVED]** This is the original V1 design spec. It has drifted from the live implementation and remains for historical context only.

# **UI/UX Design Specification: Spellcasters Chronicles Deck Builder**

## **1\. Executive Summary**

**Goal:** Transform the existing tab-based deck builder into a streamlined, mobile-first "Single Workspace" application. **Core constraint:** Decks are strictly 6 cards (1 Spellcaster, 1 Titan, 4 Flex). **Key Change:** Remove the dedicated "Inspector" page and "Forge" tab in favor of context-aware Modals and Slide-out Drawers.

## **2\. Mobile Architecture (The "Single Workspace" Concept)**

The app consists of one main screen (The Vault) with two overlay layers (The Deck Drawer and The Command Center).

### **A. The Header (Always Visible)**

- **Left:** Hamburger Menu (Links to Database, Roadmap).
- **Center:** App Title / Current Deck Name (e.g., "Mystic Scribe Deck").
- **Right:** "Command Center" Icon (Gear or Edit Pencil).
  - _Action:_ Opens the Full-Screen Modal for Saving, Team Management, and Meta-data.

### **B. The Workspace (Main View)**

- **Content:** The "Vault" (Card List).
- **Layout:** Infinite scroll grid of cards.
- **Filtering:** Sticky row below Header.
  - _Auto-Context:_ If user selects the "Titan" slot in the drawer, this filter auto-switches to "Titans".
- **Card Interaction:**
  - _Tap:_ Adds card to first available valid slot.
  - _Long Press:_ Opens **Inspector Modal**.

### **C. The Deck Drawer (Bottom Overlay)**

- **State 1: Collapsed (Default while browsing)**
  - _Height:_ \~60px.
  - _Content:_ Mini-summary. "4/6 Cards". Small icons of current selection.
  - _Action:_ Tap or Swipe Up to expand.
- **State 2: Expanded (Active Building)**
  - _Height:_ \~250px (Bottom 30% of screen).
  - _Content:_ The 6 active slots (Hero, Titan, Flex 1-4).
  - _Interaction:_ Drag-and-drop sorting, Drag off to remove.

## **3\. Mobile Wireframes (Text-Based)**

### **Screen 1: The Main Workspace (Browsing)**

`[=]  Mystic Scribe Deck   [Gear]  <-- Header`  
`-------------------------------`  
`[ All ] [ Units ] [ Spells ] ...  <-- Sticky Filter Bar`  
`-------------------------------`  
`|  [Card A]   [Card B]   |      <-- The Vault Grid`  
`|  [Card C]   [Card D]   |          (Scrollable)`  
`|  [Card E]   [Card F]   |`  
`|                        |`  
`|                        |`  
`-------------------------------`  
`[ ^ ]  Icon Icon Icon ... [4/6]   <-- Collapsed Deck Drawer`

### **Screen 2: Inspector Modal (Card Detail)**

_Triggered by Long-Press on a card in Vault._  
`(Background Dimmed)`  
`+---------------------------+`  
`|  [ X ] Close              |`  
`|                           |`  
`|      [ LARGE ART ]        |`  
`|                           |`  
`|  Name: Fire Elementalist  |`  
`|  Role: Spellcaster        |`  
`|                           |`  
`|  [ Passive Ability ]      |`  
`|  Ignition Spark...        |`  
`|                           |`  
`|  [ Active Ability ]       |`  
`|  Flame Strike...          |`  
`|                           |`  
`|  [ ADD TO DECK BUTTON ]   | <-- Primary Action`  
`+---------------------------+`

### **Screen 3: Command Center (The "Forge" Logic)**

_Triggered by tapping \[Gear\] in Header._  
`[ X ]      SETTINGS       [ Save ]`  
`-------------------------------`  
`Deck Name: [ Mystic Scribe  ]`  
`Mode: [ Solo ] / [ Team ]`  
`-------------------------------`  
`ACTIONS:`  
`[ Copy Deck ] [ Share ] [ Delete ]`  
`-------------------------------`  
`TEAM MANAGEMENT (Only in Team Mode):`

`v Slot 1: YOU (Active)         <-- Expanded Accordion`  
 `[Hero] [Titan] [x] [x] [x] [x]`  
 `[ Import Solo Deck ] button`

`> Slot 2: Teammate A           <-- Collapsed`  
 `[Hero Face] [Titan Face] (4/6)`

`> Slot 3: Teammate B           <-- Collapsed`  
 `[Hero Face] [Titan Face] (6/6)`

## **4\. Desktop Adaptation**

We utilize a "Three-Pane" dashboard layout to maximize screen real estate.

- **Left Pane (20% \- The Manager):**
  - Contains the "Command Center" controls permanently.
  - Lists the active Deck (or 3 Team Decks) vertically.
- **Center Pane (50% \- The Vault):**
  - Large grid of cards.
  - Search and filters at the top.
- **Right Pane (30% \- The Inspector):**
  - **Persistent Details.** Clicking a card in the Center Pane immediately populates this pane.
  - _Empty State:_ If no card is selected, show "Select a card to view details" or a placeholder graphic.

## **5\. Interaction Logic**

### **A. Drag & Drop Rules (The "Swap")**

1. **Empty Slot Drop:** Card snaps into place.
2. **Occupied Slot Drop:**
   - _Action:_ User drags Card A (from Vault or Slot 1\) onto Slot 2 (which holds Card B).
   - _Result:_ Card A takes Slot 2\. Card B moves to Slot 1 (if valid) OR returns to Vault (if Slot 1 type is invalid, e.g., swapping a Titan into a Spell slot).
3. **Drag Off:** Dragging a card out of the Drawer area removes it from the deck.

### **B. Auto-Filtering (The "Wizard" Flow)**

1. User taps an empty **Spellcaster Slot**.
2. App automatically applies "Spellcaster" filter to the Vault.
3. User taps a Spellcaster card.
4. Card fills slot.
5. App automatically highlights **Titan Slot** and applies "Titan" filter.

## **6\. Open Questions & Edge Cases (Need User Input)**

**Q1. Team Mode Import Logic** When a user is in Team Mode and wants to "Import" a Solo deck into Slot 2:

- _Current Assumption:_ They tap "Import," select a deck from a list, and it overwrites Slot 2 completely.
- _Risk:_ Does this overwrite the Name of the Team slot, or just the cards?

**Q2. Mobile Dragging Precision** On mobile, dragging from the "Vault" (top) to the "Drawer" (bottom) can be tricky if the list is scrolling.

- _Suggestion:_ Rely primarily on **Tapping** to add cards on mobile, and reserve Drag & Drop strictly for _rearranging_ cards already inside the Drawer. Is this acceptable?

**Q3. The "Empty" Inspector on Desktop** You mentioned the desktop inspector can be empty.

- _Proposal:_ Can we use this empty space to show "Deck Stats" (Mana Curve, Element distribution) whenever no specific card is selected?

**Q4. Validation Feedback** If a user tries to drag a "Building" into the "Titan" slot:

- _Visual:_ Should the slot turn red and reject the drop? Or should we just disable the drag entirely?
