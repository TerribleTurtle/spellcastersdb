/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeckDrawer } from "../DeckDrawer";
import { Deck } from "@/types/deck";

// Mock dependencies
vi.mock("@/store/index", () => ({
  useDeckStore: vi.fn(),
}));

vi.mock("@dnd-kit/core", () => ({
  useDroppable: vi.fn(() => ({ isOver: false, setNodeRef: vi.fn() })),
  useDraggable: vi.fn(() => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null })),
}));

vi.mock("@/features/deck-builder/hooks/ui/useAutoExpand", () => ({
  useAutoExpand: vi.fn(),
}));

// Mock sub-components to reduce noise
vi.mock("../DeckNameInput", () => ({
  DeckNameInput: () => <div data-testid="deck-name-input">Deck Name</div>,
}));

// Fix relative paths for mocks (relative to __tests__ folder)
vi.mock("../../ui/ActiveDeckTray", () => ({
    ActiveDeckTray: () => <div>Tray Content</div>
}));
// Update mock to be interactive
vi.mock("../../ui/DeckActionToolbar", () => ({
    DeckActionToolbar: ({ onSave, onClear, onShare }: any) => (
        <div data-testid="toolbar">
            <button onClick={onSave} aria-label="Save">Save</button>
            <button onClick={onClear} aria-label="Clear">Clear</button>
            <button onClick={onShare} aria-label="Share">Share</button>
        </div>
    )
}));

// Helper to mock store state
import { useDeckStore } from "@/store/index";

describe("DeckDrawer Click Logic", () => {
  const mockOnToggle = vi.fn();
  const mockOnActivate = vi.fn();
  
  const defaultProps = {
    deck: { id: "deck-1", name: "Test Deck", slots: [] } as unknown as Deck,
    onToggle: mockOnToggle,
    onActivate: mockOnActivate,
    slotIndex: 0, 
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: Desktop width
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1280 });
    
    // Default Store: No active slot
    (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      activeSlot: null,
      setActiveSlot: vi.fn(),
      pendingSwapCard: null,
    });
  });

  describe("Team Mode (Desktop)", () => {
    it("should Open AND Activate when clicking a CLOSED drawer", () => {
      // Arrange
      render(
        <DeckDrawer 
          {...defaultProps} 
          isExpanded={false}
        />
      );

      // Act
      fireEvent.click(screen.getByTestId("deck-drawer-header"));

      // Assert
      expect(mockOnToggle).toHaveBeenCalledWith(true);
      expect(mockOnActivate).toHaveBeenCalled();
    });

    it("should Activate (but NOT Close) when clicking an OPEN but INACTIVE drawer", () => {
       // Arrange
       // Store says activeSlot is 1, we are 0. So we are Inactive.
       (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
          activeSlot: 1, 
          setActiveSlot: vi.fn(),
          pendingSwapCard: null,
       });

       render(
        <DeckDrawer 
          {...defaultProps} 
          isExpanded={true}
        />
      );

      // Act
      fireEvent.click(screen.getByTestId("deck-drawer-header"));

      // Assert
      expect(mockOnActivate).toHaveBeenCalled(); // Should become active
      expect(mockOnToggle).not.toHaveBeenCalled(); // Should STAY open (no toggle)
    });

    it("should Close when clicking an OPEN and ACTIVE drawer", () => {
        // Arrange
        // Store says activeSlot is 0. We are 0. So we are Active.
        (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
           activeSlot: 0, 
           setActiveSlot: vi.fn(),
           pendingSwapCard: null,
        });
 
        render(
         <DeckDrawer 
           {...defaultProps} 
           isExpanded={true}
         />
       );
 
       // Act
       fireEvent.click(screen.getByTestId("deck-drawer-header"));
 
       // Assert
       expect(mockOnToggle).toHaveBeenCalledWith(false); // Should close
       // onActivate might be called, strictly speaking it doesn't matter if we are already active, 
       // but strictly "Closing" is the key.
     });
  });

  describe("Solo Mode (Regression Check)", () => {
      // In Solo Mode, we usually don't pass slotIndex or we might pass it but logic differs?
      // Actually Implementation Plan said: "Solo Context: Ensure Solo references pass strictly controlled props that preserve current behavior"
      // Current Solo usage in `SoloEditorDesktop.tsx` passes `variant="static"`.
      // Let's assume for now Solo might use `slotIndex={undefined}` or just different props.
      // But `DeckDrawer` uses `slotIndex` to determine if it's connected to a slot.
      
      it("should just toggle if no slotIndex is provided (Standard/Solo implicit)", () => {
         render(
             <DeckDrawer 
                {...defaultProps}
                slotIndex={undefined}
                isExpanded={false}
             />
         );
         
         fireEvent.click(screen.getByTestId("deck-drawer-header"));
         
         // Current behavior: just toggles.
         expect(mockOnToggle).toHaveBeenCalledWith(true);
      });
  });
});

describe("Toolbar Actions", () => {
    const mockOnSave = vi.fn();
    const mockOnClear = vi.fn();
    const mockOnShare = vi.fn();

    const defaultProps = {
        deck: { id: "deck-1", name: "Test Deck", slots: [] } as unknown as Deck,
        onToggle: vi.fn(),
        onActivate: vi.fn(),
        onSave: mockOnSave,
        onClear: mockOnClear,
        onShare: mockOnShare,
        isExpanded: true
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
           activeSlot: 0, 
           setActiveSlot: vi.fn(),
           pendingSwapCard: null,
        });
    });

    it("should trigger callback when Save is clicked", () => {
        render(<DeckDrawer {...defaultProps} />);
        const saves = screen.getAllByLabelText("Save");
        fireEvent.click(saves[0]);
        expect(mockOnSave).toHaveBeenCalled();
    });

    it("should trigger callback when Clear is clicked", () => {
        render(<DeckDrawer {...defaultProps} />);
        const clears = screen.getAllByLabelText("Clear");
        fireEvent.click(clears[0]);
        expect(mockOnClear).toHaveBeenCalled();
    });

    it("should trigger callback when Share is clicked", () => {
        render(<DeckDrawer {...defaultProps} />);
        const shares = screen.getAllByLabelText("Share");
        fireEvent.click(shares[0]);
        expect(mockOnShare).toHaveBeenCalled();
    });
});
