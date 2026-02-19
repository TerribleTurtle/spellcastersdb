import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemePicker } from "@/components/ui/ThemePicker";

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: mockSetTheme,
  }),
}));

// Mock useKonamiCode
vi.mock("@/hooks/useKonamiCode", () => ({
  useKonamiCode: vi.fn(),
}));

describe("ThemePicker", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("renders the toggle button", () => {
    render(<ThemePicker />);
    const button = screen.getByTitle("Change theme");
    expect(button).toBeTruthy();
  });

  it("opens the dropdown when clicked", () => {
    render(<ThemePicker />);
    const button = screen.getByTitle("Change theme");

    // Initially closed (dropdown content not in document)
    expect(screen.queryByText("Arcane")).toBeNull();

    // Click to open
    fireEvent.click(button);

    // Now open
    expect(screen.getByText("Arcane")).toBeTruthy();
    expect(screen.getByText("Inferno")).toBeTruthy();
  });

  it("calls setTheme when a theme is selected", () => {
    render(<ThemePicker />);
    const button = screen.getByTitle("Change theme");
    fireEvent.click(button);

    // Click "Arcane"
    const arcaneButton = screen.getByText("Arcane");
    fireEvent.click(arcaneButton);

    expect(mockSetTheme).toHaveBeenCalledWith("theme-arcane");
  });
});
