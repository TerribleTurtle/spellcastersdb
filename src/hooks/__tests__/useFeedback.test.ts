import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFeedback } from "../useFeedback";

describe("useFeedback", () => {
  const mockOpenPopup = vi.fn();
  const mockWindowOpen = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("open", mockWindowOpen);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    delete window.Tally;
  });

  it("should use Tally.openPopup when Tally script is loaded", () => {
    window.Tally = {
      openPopup: mockOpenPopup,
    };

    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.openFeedback();
    });

    expect(mockOpenPopup).toHaveBeenCalledTimes(1);
    expect(mockOpenPopup).toHaveBeenCalledWith(
      "Bz7MdK",
      expect.objectContaining({
        layout: "modal",
        hiddenFields: expect.objectContaining({
          deck_url: expect.any(String),
        }),
      })
    );
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it("should fallback to window.open when Tally is not loaded", () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.openFeedback();
    });

    expect(mockOpenPopup).not.toHaveBeenCalled();
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining("https://tally.so/r/Bz7MdK?deck_url="),
      "_blank"
    );
  });
});
