// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";
import type { Deck } from "@/types/deck";

import { ExportDeckModal } from "../ExportDeckModal";

// --- Mocks ---

// Mock useFocusTrap to return a simple ref
vi.mock("@/hooks/useFocusTrap", () => ({
  useFocusTrap: () => ({ current: null }),
}));

// --- Test Helpers ---

const baseDeck: Deck = {
  name: "Fire Deck",
  spellcaster: null,
  slots: [
    { index: 0, unit: null, allowedTypes: [] },
    { index: 1, unit: null, allowedTypes: [] },
    { index: 2, unit: null, allowedTypes: [] },
    { index: 3, unit: null, allowedTypes: [] },
    { index: 4, unit: null, allowedTypes: [] },
  ],
};

const renderModal = (
  overrides: Partial<Parameters<typeof ExportDeckModal>[0]> = {}
) => {
  const defaultProps = {
    deck: baseDeck,
    isOpen: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
    ...overrides,
  };
  return {
    ...render(<ExportDeckModal {...defaultProps} />),
    props: defaultProps,
  };
};

describe("ExportDeckModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: name is available
    const store = useDeckStore.getState();
    vi.spyOn(store, "checkDeckNameAvailable").mockReturnValue(true);
  });

  // ── Visibility ──

  describe("Visibility", () => {
    it("should render when isOpen is true", () => {
      renderModal();
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getByText("Save to Solo Library")).toBeDefined();
    });

    it("should return null when isOpen is false", () => {
      const { container } = render(
        <ExportDeckModal
          deck={baseDeck}
          isOpen={false}
          onClose={vi.fn()}
          onExport={vi.fn()}
        />
      );
      expect(container.innerHTML).toBe("");
    });
  });

  // ── Input Behavior ──

  describe("Input Behavior", () => {
    it("should pre-populate the input with the deck name", () => {
      renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      expect(input).toHaveValue("Fire Deck");
    });

    it("should update input value on typing", () => {
      renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: "Ice Deck" } });
      expect(input).toHaveValue("Ice Deck");
    });

    it("should submit on Enter key press", () => {
      const { props } = renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(props.onExport).toHaveBeenCalledWith("Fire Deck");
      expect(props.onClose).toHaveBeenCalled();
    });
  });

  // ── Export Validation ──

  describe("Export Validation", () => {
    it("should disable the Save button when name is empty (preventing empty submission)", () => {
      renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: "" } });

      const saveBtn = screen.getByText("Save as Solo");
      expect(saveBtn).toBeDisabled();
    });

    it("should disable the Save button when name is whitespace-only", () => {
      renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: "   " } });

      const saveBtn = screen.getByText("Save as Solo");
      expect(saveBtn).toBeDisabled();
    });

    it("should show error when name already exists in library", () => {
      const store = useDeckStore.getState();
      vi.spyOn(store, "checkDeckNameAvailable").mockReturnValue(false);

      const { props } = renderModal();
      const saveBtn = screen.getByText("Save as Solo");
      fireEvent.click(saveBtn);

      expect(
        screen.getByText(
          "A deck with this name already exists in your library."
        )
      ).toBeDefined();
      expect(props.onExport).not.toHaveBeenCalled();
    });

    it("should clear error when user types after a duplicate-name error", () => {
      const store = useDeckStore.getState();
      vi.spyOn(store, "checkDeckNameAvailable").mockReturnValue(false);

      renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");

      // Trigger duplicate-name error
      fireEvent.click(screen.getByText("Save as Solo"));
      expect(
        screen.getByText(
          "A deck with this name already exists in your library."
        )
      ).toBeDefined();

      // Type again — error should clear
      fireEvent.change(input, { target: { value: "Unique Name" } });
      expect(
        screen.queryByText(
          "A deck with this name already exists in your library."
        )
      ).toBeNull();
    });

    it("should call onExport with trimmed name and close on valid submit", () => {
      const { props } = renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: "  Valid Name  " } });

      fireEvent.click(screen.getByText("Save as Solo"));

      expect(props.onExport).toHaveBeenCalledWith("Valid Name");
      expect(props.onClose).toHaveBeenCalled();
    });
  });

  // ── Close Button ──

  describe("Close & Cancel", () => {
    it("should call onClose when X button is clicked", () => {
      const { props } = renderModal();
      const closeBtn = screen.getByLabelText("Close");
      fireEvent.click(closeBtn);
      expect(props.onClose).toHaveBeenCalled();
    });

    it("should call onClose when Cancel button is clicked", () => {
      const { props } = renderModal();
      const cancelBtn = screen.getByText("Cancel");
      fireEvent.click(cancelBtn);
      expect(props.onClose).toHaveBeenCalled();
    });
  });

  // ── Save Button Disabled State ──

  describe("Save Button State", () => {
    it("should disable the Save button when name is empty", () => {
      renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: "" } });
      const saveBtn = screen.getByText("Save as Solo");
      expect(saveBtn).toBeDisabled();
    });

    it("should enable the Save button when name has content", () => {
      renderModal();
      const saveBtn = screen.getByText("Save as Solo");
      expect(saveBtn).not.toBeDisabled();
    });
  });

  // ── Adversarial ──

  describe("Adversarial", () => {
    it("should handle deck with no name gracefully", () => {
      renderModal({ deck: { ...baseDeck, name: undefined } });
      const input = screen.getByPlaceholderText("Enter deck name...");
      expect(input).toHaveValue("");
    });

    it("should reject names that are exactly the boundary of whitespace", () => {
      const { props } = renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: "\t \n" } });
      fireEvent.click(screen.getByText("Save as Solo"));
      expect(props.onExport).not.toHaveBeenCalled();
    });

    it("should allow very long names (no crash)", () => {
      const longName = "A".repeat(500);
      const { props } = renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: longName } });
      fireEvent.click(screen.getByText("Save as Solo"));
      expect(props.onExport).toHaveBeenCalledWith(longName);
    });

    it("should handle special characters in deck name", () => {
      const specialName = '<script>alert("xss")</script>';
      const { props } = renderModal();
      const input = screen.getByPlaceholderText("Enter deck name...");
      fireEvent.change(input, { target: { value: specialName } });
      fireEvent.click(screen.getByText("Save as Solo"));
      expect(props.onExport).toHaveBeenCalledWith(specialName);
    });

    it("should handle rapid double-click on Save (both fire since onClose is mocked)", () => {
      const { props } = renderModal();
      const saveBtn = screen.getByText("Save as Solo");
      fireEvent.click(saveBtn);
      fireEvent.click(saveBtn);
      // Both clicks fire because mocked onClose doesn't unmount the component
      expect(props.onExport).toHaveBeenCalledTimes(2);
      expect(props.onClose).toHaveBeenCalledTimes(2);
    });
  });
});
