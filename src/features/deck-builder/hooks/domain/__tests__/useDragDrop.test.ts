import { renderHook, act } from "@testing-library/react";
import { useDragDrop } from "../useDragDrop";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDeckBuilder } from "../useDeckBuilder";
import { DragStartEvent } from "@dnd-kit/core";

// Mock dependencies
vi.mock("../useDeckBuilder", () => ({
  useDeckBuilder: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/services/dnd/drag-routing", () => ({
  DragRoutingService: {
    determineAction: vi.fn(() => ({ type: 'NO_OP' })),
  },
}));

describe("useDragDrop", () => {
  const setActiveDragItemMock = vi.fn();
  const closeInspectorMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDeckBuilder as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setActiveDragItem: setActiveDragItemMock,
      closeInspector: closeInspectorMock,
      mode: "SOLO",
    });
  });

  it("should set active drag item on drag start", () => {
    const { result } = renderHook(() => useDragDrop());

    const mockEvent = {
      active: {
        data: {
          current: {
            item: { entity_id: "test-id", name: "Test Card" }
          }
        }
      }
    } as unknown as DragStartEvent;

    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    expect(setActiveDragItemMock).toHaveBeenCalledWith({ entity_id: "test-id", name: "Test Card" });
    expect(closeInspectorMock).toHaveBeenCalled();
  });

  it("should expose handleDragCancel to clear drag state", () => {
    const { result } = renderHook(() => useDragDrop());

    // This is the reproduction case: 
    // We expect handleDragCancel to exist and clear the state.
    // If it doesn't exist, this test will fail (or we cast to any to verify behavior if it were implemented).
    
    // Check if function exists (Validation of current broken state: it should be undefined currently)
    const hasHandler = "handleDragCancel" in result.current;
    
    if (hasHandler) {
       // If it exists, verify it works (Forward compatibility for when we fix it)
       act(() => {
         result.current.handleDragCancel();
       });
       expect(setActiveDragItemMock).toHaveBeenCalledWith(null);
    } else {
       // Ideally we want this test to Fail if the handler is missing, to prove we need to add it.
       // So we make an assertion that it SHOULD be defined.
       expect(result.current.handleDragCancel).toBeDefined();
    }
  });
});
