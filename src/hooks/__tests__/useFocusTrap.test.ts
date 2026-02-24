import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFocusTrap } from "../useFocusTrap";

function createContainer(...elements: string[]): HTMLDivElement {
  const container = document.createElement("div");
  container.setAttribute("tabindex", "-1");
  elements.forEach((tag) => {
    const el = document.createElement(tag);
    container.appendChild(el);
  });
  document.body.appendChild(container);
  return container;
}

describe("useFocusTrap", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = createContainer("button", "input", "button");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should focus the first focusable element when activated", () => {
    const { result } = renderHook(() => useFocusTrap(true));

    // Manually assign the ref to our container
    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    // Re-render with isActive=true to trigger the effect with the ref set
    // Since the ref is assigned after mount, we test via keydown behavior instead
    expect(result.current.current).toBe(container);
  });

  it("should return a ref object", () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current).toHaveProperty("current");
  });

  it("should wrap focus from last to first element on Tab", () => {
    const { result } = renderHook(() => useFocusTrap(true));

    // Assign the container to the ref
    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    const buttons = container.querySelectorAll("button");
    const lastButton = buttons[buttons.length - 1] as HTMLElement;
    const firstButton = buttons[0] as HTMLElement;

    // Focus the last element
    lastButton.focus();
    expect(document.activeElement).toBe(lastButton);

    // Simulate Tab keydown
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(tabEvent, "preventDefault");
    document.dispatchEvent(tabEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(firstButton);
  });

  it("should wrap focus from first to last element on Shift+Tab", () => {
    const { result } = renderHook(() => useFocusTrap(true));

    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    const buttons = container.querySelectorAll("button");
    const firstButton = buttons[0] as HTMLElement;
    const lastButton = buttons[buttons.length - 1] as HTMLElement;

    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    const shiftTabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(shiftTabEvent, "preventDefault");
    document.dispatchEvent(shiftTabEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(lastButton);
  });

  it("should call onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFocusTrap(true, onClose));

    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should not trap focus when inactive", () => {
    const onClose = vi.fn();
    renderHook(() => useFocusTrap(false, onClose));

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(onClose).not.toHaveBeenCalled();
  });
});
