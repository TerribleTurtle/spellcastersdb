// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTeamEditModal } from "./useTeamEditModal";

describe("useTeamEditModal", () => {
  it("should initialize with modal closed", () => {
    const { result } = renderHook(() =>
      useTeamEditModal({
        hasChanges: false,
        onConfirm: vi.fn(),
      })
    );

    expect(result.current.showEditConfirm).toBe(false);
  });

  describe("requestEdit", () => {
    it("should call onConfirm directly if hasChanges is false", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() =>
        useTeamEditModal({
          hasChanges: false,
          onConfirm,
        })
      );

      act(() => {
        result.current.requestEdit(2);
      });

      expect(onConfirm).toHaveBeenCalledWith(2);
      expect(result.current.showEditConfirm).toBe(false);
    });

    it("should open confirmation modal and NOT call onConfirm if hasChanges is true", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() =>
        useTeamEditModal({
          hasChanges: true,
          onConfirm,
        })
      );

      act(() => {
        result.current.requestEdit(1);
      });

      expect(onConfirm).not.toHaveBeenCalled();
      expect(result.current.showEditConfirm).toBe(true);
    });
  });

  describe("handleConfirm", () => {
    it("should call onConfirm with pending index and close modal", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() =>
        useTeamEditModal({
          hasChanges: true,
          onConfirm,
        })
      );

      // Trigger the modal
      act(() => {
        result.current.requestEdit(3);
      });
      expect(result.current.showEditConfirm).toBe(true);

      // Confirm it
      act(() => {
        result.current.handleConfirm();
      });

      expect(onConfirm).toHaveBeenCalledWith(3);
      expect(result.current.showEditConfirm).toBe(false);
    });

    it("should just close modal if pending index is null", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() =>
        useTeamEditModal({
          hasChanges: true,
          onConfirm,
        })
      );

      act(() => {
        result.current.handleConfirm();
      });

      expect(onConfirm).not.toHaveBeenCalled();
      expect(result.current.showEditConfirm).toBe(false);
    });
  });

  describe("handleCancel", () => {
    it("should close modal and clear pending index without calling confirm", () => {
      const onConfirm = vi.fn();
      const { result } = renderHook(() =>
        useTeamEditModal({
          hasChanges: true,
          onConfirm,
        })
      );

      // Open it first
      act(() => {
        result.current.requestEdit(0);
      });
      expect(result.current.showEditConfirm).toBe(true);

      // Cancel it
      act(() => {
        result.current.handleCancel();
      });

      expect(onConfirm).not.toHaveBeenCalled();
      expect(result.current.showEditConfirm).toBe(false);
    });
  });
});
