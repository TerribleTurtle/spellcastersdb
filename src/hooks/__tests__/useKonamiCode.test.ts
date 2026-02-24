import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useKonamiCode } from "../useKonamiCode";

// Mock next-themes
const mockSetTheme = vi.fn();
let mockTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

function enterKonamiCode() {
  KONAMI_SEQUENCE.forEach(pressKey);
}

describe("useKonamiCode", () => {
  beforeEach(() => {
    mockTheme = "dark";
    mockSetTheme.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should activate rainbow theme on correct Konami Code sequence", () => {
    renderHook(() => useKonamiCode());

    enterKonamiCode();

    expect(mockSetTheme).toHaveBeenCalledWith("theme-rainbow");
  });

  it("should save the previous theme before activating rainbow", () => {
    mockTheme = "ocean";
    renderHook(() => useKonamiCode());

    enterKonamiCode();

    expect(localStorage.getItem("sp-prev-theme")).toBe("ocean");
    expect(mockSetTheme).toHaveBeenCalledWith("theme-rainbow");
  });

  it("should toggle back to the previous theme if already rainbow", () => {
    mockTheme = "theme-rainbow";
    localStorage.setItem("sp-prev-theme", "forest");
    renderHook(() => useKonamiCode());

    enterKonamiCode();

    expect(mockSetTheme).toHaveBeenCalledWith("forest");
  });

  it("should not activate on an incomplete sequence", () => {
    renderHook(() => useKonamiCode());

    // Only press the first 5 keys
    KONAMI_SEQUENCE.slice(0, 5).forEach(pressKey);

    expect(mockSetTheme).not.toHaveBeenCalled();
  });

  it("should reset progress on an incorrect key", () => {
    renderHook(() => useKonamiCode());

    // Start the sequence then break it
    pressKey("ArrowUp");
    pressKey("ArrowUp");
    pressKey("ArrowDown");
    pressKey("x"); // wrong key — should reset

    // Now complete the full sequence
    enterKonamiCode();

    // Should only have been called once (the successful attempt)
    expect(mockSetTheme).toHaveBeenCalledOnce();
  });

  it("should allow restart with the first key after a wrong key", () => {
    renderHook(() => useKonamiCode());

    // Partial sequence then wrong key
    pressKey("ArrowUp");
    pressKey("ArrowUp");
    pressKey("x"); // resets

    // Immediately start with ArrowUp (counts as position 1)
    pressKey("ArrowUp");

    // Continue from position 1 (the second ArrowUp)
    pressKey("ArrowUp");
    pressKey("ArrowDown");
    pressKey("ArrowDown");
    pressKey("ArrowLeft");
    pressKey("ArrowRight");
    pressKey("ArrowLeft");
    pressKey("ArrowRight");
    pressKey("b");
    pressKey("a");

    expect(mockSetTheme).toHaveBeenCalledOnce();
  });

  it("should default to 'dark' when toggling back with no saved previous theme", () => {
    mockTheme = "theme-rainbow";
    // No sp-prev-theme in localStorage
    renderHook(() => useKonamiCode());

    enterKonamiCode();

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
