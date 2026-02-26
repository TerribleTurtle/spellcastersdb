import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useScrollLock } from "../useScrollLock";

describe("useScrollLock", () => {
  it("should set body overflow to hidden when active", () => {
    expect(document.body.style.overflow).not.toBe("hidden");

    const { unmount } = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    // Should restore on unmount
    expect(document.body.style.overflow).toBe("");
  });

  it("should do nothing when inactive", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = renderHook(() => useScrollLock(false));

    // Shouldn't have changed it
    expect(document.body.style.overflow).toBe("scroll");

    unmount();

    // Shouldn't have changed it on unmount
    expect(document.body.style.overflow).toBe("scroll");

    // Clean up purely for tests
    document.body.style.overflow = "";
  });

  it("should prevent default on touchmove events when active and cancelable", () => {
    renderHook(() => useScrollLock(true));

    // Standard touchmove event
    const event1 = new Event("touchmove", { cancelable: true });
    let preventDefaultCalled = false;
    event1.preventDefault = () => {
      preventDefaultCalled = true;
    };
    document.dispatchEvent(event1);

    expect(preventDefaultCalled).toBe(true);

    // Uncancelable touchmove event
    const event2 = new Event("touchmove", { cancelable: false });
    preventDefaultCalled = false;
    event2.preventDefault = () => {
      preventDefaultCalled = true;
    };
    document.dispatchEvent(event2);

    expect(preventDefaultCalled).toBe(false);
  });
});
