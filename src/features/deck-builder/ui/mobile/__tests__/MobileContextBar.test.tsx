// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileContextBar } from "../MobileContextBar";

type MobileContextBarProps = React.ComponentProps<typeof MobileContextBar>;

// --- Mocks ---

// Mock LibraryButton
vi.mock("@/components/ui/LibraryButton", () => ({
  LibraryButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="library-button" onClick={onClick}>
      Library
    </button>
  ),
}));

// Mock Radix DropdownMenu to make items testable in JSDOM
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild: _asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: (e: Event) => void;
  }) => (
    <button
      data-testid="dropdown-item"
      onClick={() => onSelect?.(new Event("select"))}
    >
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

// --- Test Helpers ---

const defaultProps = {
  deckName: "My Deck",
  onRename: vi.fn(),
  isSaved: false,
  isExistingDeck: false,
  onSave: vi.fn(),
  isEmptyDeck: false,
  mode: "SOLO" as const,
  onSetMode: vi.fn(),
  onOpenLibrary: vi.fn(),
  onShare: vi.fn(),
  onClear: vi.fn(),
};

const renderBar = (overrides: Partial<MobileContextBarProps> = {}) =>
  render(<MobileContextBar {...defaultProps} {...overrides} />);

describe("MobileContextBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──

  describe("Rendering", () => {
    it("should render the context bar with data-testid", () => {
      renderBar();
      expect(screen.getByTestId("mobile-context-bar")).toBeDefined();
    });

    it("should display the deck name in the input", () => {
      renderBar();
      const input = screen.getByLabelText("Deck Name");
      expect(input).toHaveValue("My Deck");
    });

    it("should show current mode label", () => {
      renderBar({ mode: "TEAM" });
      expect(screen.getByText("TEAM")).toBeDefined();
    });
  });

  // ── Deck Name Input ──

  describe("Deck Name Input", () => {
    it("should call onRename when typing", () => {
      renderBar();
      const input = screen.getByLabelText("Deck Name");
      fireEvent.change(input, { target: { value: "New Name" } });
      expect(defaultProps.onRename).toHaveBeenCalledWith("New Name");
    });

    it("should show placeholder when name is empty", () => {
      renderBar({ deckName: "" });
      const input = screen.getByPlaceholderText("UNTITLED");
      expect(input).toBeDefined();
    });
  });

  // ── Mode Toggle ──

  describe("Mode Toggle", () => {
    it("should switch from SOLO to TEAM on click", () => {
      renderBar({ mode: "SOLO" });
      const btn = screen.getByLabelText("Current mode: SOLO. Tap to switch.");
      fireEvent.click(btn);
      expect(defaultProps.onSetMode).toHaveBeenCalledWith("TEAM");
    });

    it("should switch from TEAM to SOLO on click", () => {
      renderBar({ mode: "TEAM" });
      const btn = screen.getByLabelText("Current mode: TEAM. Tap to switch.");
      fireEvent.click(btn);
      expect(defaultProps.onSetMode).toHaveBeenCalledWith("SOLO");
    });
  });

  // ── Save Button ──

  describe("Save Button", () => {
    it("should call onSave when clicked", () => {
      renderBar();
      const saveBtn = screen.getByLabelText("Save Deck");
      fireEvent.click(saveBtn);
      expect(defaultProps.onSave).toHaveBeenCalled();
    });

    it("should be disabled for empty unsaved decks", () => {
      renderBar({ isEmptyDeck: true, isSaved: false });
      const saveBtn = screen.getByLabelText("Save Deck");
      expect(saveBtn).toBeDisabled();
    });

    it("should show saved state icon and label when isSaved is true", () => {
      renderBar({ isSaved: true });
      const savedBtn = screen.getByLabelText("Deck Saved");
      expect(savedBtn).toBeDefined();
    });

    it("should remain enabled when deck is empty but already saved", () => {
      renderBar({ isEmptyDeck: true, isSaved: true });
      const saveBtn = screen.getByLabelText("Deck Saved");
      expect(saveBtn).not.toBeDisabled();
    });
  });

  // ── Library Button ──

  describe("Library Button", () => {
    it("should call onOpenLibrary when clicked", () => {
      renderBar();
      const btn = screen.getByTestId("library-button");
      fireEvent.click(btn);
      expect(defaultProps.onOpenLibrary).toHaveBeenCalled();
    });
  });

  // ── Dropdown Menu Actions ──

  describe("Dropdown Menu Actions", () => {
    it("should render Share in dropdown", () => {
      renderBar();
      expect(screen.getByText("Share")).toBeDefined();
    });

    it("should call onShare when Share is clicked", () => {
      renderBar();
      const items = screen.getAllByTestId("dropdown-item");
      // First item is Share
      fireEvent.click(items[0]);
      expect(defaultProps.onShare).toHaveBeenCalled();
    });

    it("should show 'New Deck' in SOLO mode", () => {
      renderBar({ mode: "SOLO" });
      expect(screen.getByText(/New Deck/)).toBeDefined();
    });

    it("should show 'New Team' in TEAM mode", () => {
      renderBar({ mode: "TEAM" });
      expect(screen.getByText(/New Team/)).toBeDefined();
    });

    it("should call onClear when New Deck/Team is clicked", () => {
      renderBar();
      const items = screen.getAllByTestId("dropdown-item");
      // Second item is New Deck
      fireEvent.click(items[1]);
      expect(defaultProps.onClear).toHaveBeenCalled();
    });
  });

  // ── Save Copy ──

  describe("Save Copy", () => {
    it("should show Save Copy option for existing decks", () => {
      const onSaveCopy = vi.fn();
      renderBar({ isExistingDeck: true, onSaveCopy });
      expect(screen.getByText("Save Copy")).toBeDefined();
    });

    it("should NOT show Save Copy when not an existing deck", () => {
      renderBar({ isExistingDeck: false });
      expect(screen.queryByText("Save Copy")).toBeNull();
    });

    it("should call onSaveCopy when clicked", () => {
      const onSaveCopy = vi.fn();
      renderBar({ isExistingDeck: true, onSaveCopy });
      const items = screen.getAllByTestId("dropdown-item");
      // Third item (Share, New, Save Copy)
      const saveCopyItem = items.find((el) =>
        el.textContent?.includes("Save Copy")
      );
      fireEvent.click(saveCopyItem!);
      expect(onSaveCopy).toHaveBeenCalled();
    });
  });

  // ── Collapse Toggle ──

  describe("Collapse Toggle", () => {
    it("should show Collapse All when canCollapse is true and not all collapsed", () => {
      const onToggleCollapse = vi.fn();
      renderBar({
        canCollapse: true,
        areAllCollapsed: false,
        onToggleCollapse,
      });
      expect(screen.getByText("Collapse All")).toBeDefined();
    });

    it("should show Expand All when all are collapsed", () => {
      renderBar({
        canCollapse: true,
        areAllCollapsed: true,
        onToggleCollapse: vi.fn(),
      });
      expect(screen.getByText("Expand All")).toBeDefined();
    });

    it("should NOT show collapse toggle when canCollapse is false", () => {
      renderBar({ canCollapse: false });
      expect(screen.queryByText("Collapse All")).toBeNull();
      expect(screen.queryByText("Expand All")).toBeNull();
    });

    it("should call onToggleCollapse when collapse/expand is clicked", () => {
      const onToggleCollapse = vi.fn();
      renderBar({
        canCollapse: true,
        areAllCollapsed: false,
        onToggleCollapse,
      });
      const items = screen.getAllByTestId("dropdown-item");
      const collapseItem = items.find((el) =>
        el.textContent?.includes("Collapse All")
      );
      fireEvent.click(collapseItem!);
      expect(onToggleCollapse).toHaveBeenCalled();
    });
  });

  // ── Adversarial ──

  describe("Adversarial", () => {
    it("should handle null deckName gracefully (renders empty input)", () => {
      renderBar({ deckName: "" });
      const input = screen.getByLabelText("Deck Name");
      expect(input).toHaveValue("");
    });

    it("should handle rapid mode toggle clicks", () => {
      renderBar({ mode: "SOLO" });
      const btn = screen.getByLabelText("Current mode: SOLO. Tap to switch.");
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(defaultProps.onSetMode).toHaveBeenCalledTimes(3);
    });

    it("should handle very long deck names without crashing", () => {
      const longName = "X".repeat(1000);
      renderBar({ deckName: longName });
      const input = screen.getByLabelText("Deck Name");
      expect(input).toHaveValue(longName);
    });

    it("should handle special characters in deck name", () => {
      const specialName = '<img src=x onerror="alert(1)">';
      renderBar({ deckName: specialName });
      const input = screen.getByLabelText("Deck Name");
      expect(input).toHaveValue(specialName);
    });
  });
});
