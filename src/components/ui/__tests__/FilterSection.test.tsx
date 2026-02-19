import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterSection } from "@/components/ui/FilterSection";

describe("FilterSection", () => {
  const defaultProps = {
    title: "Test Section",
    options: ["Option A", "Option B"],
    selected: [],
    onToggle: vi.fn(),
  };

  it("renders title and options (initially expanded)", () => {
    render(<FilterSection {...defaultProps} />);

    expect(screen.getByText("Test Section")).toBeTruthy();
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("Option B")).toBeTruthy();
  });

  it("toggles options", () => {
    render(<FilterSection {...defaultProps} />);

    const optionA = screen.getByText("Option A");
    fireEvent.click(optionA);

    expect(defaultProps.onToggle).toHaveBeenCalledWith("Option A");
  });

  it("collapses when title is clicked", () => {
    render(<FilterSection {...defaultProps} />);

    const toggleBtn = screen.getByRole("button", { name: /test section/i });
    fireEvent.click(toggleBtn);

    // Options should be gone
    expect(screen.queryByText("Option A")).toBeNull();

    // Click again to expand
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Option A")).toBeTruthy();
  });

  it("renders grid variant correctly", () => {
    // In grid mode, the button itself has the class, not a parent container
    render(<FilterSection {...defaultProps} isGrid />);
    const optionButton = screen.getByText("Option A");
    expect(optionButton).toHaveClass("flex items-center justify-center");
  });
});
