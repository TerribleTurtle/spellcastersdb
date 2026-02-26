import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterSidebar } from "@/components/database/FilterSidebar";

// Mock FilterSection to simplify
vi.mock("@/components/ui/FilterSection", () => ({
  FilterSection: ({ title }: { title: string }) => (
    <div data-testid={`filter-section-${title}`}>{title}</div>
  ),
}));

const defaultProps = {
  searchQuery: "",
  setSearchQuery: vi.fn(),
  activeFilters: {
    schools: [],
    ranks: [],
    categories: [],
    classes: [],
  },
  toggleFilter: vi.fn(),
  clearFilters: vi.fn(),
};

describe("FilterSidebar", () => {
  it("renders all filter sections", () => {
    render(<FilterSidebar {...defaultProps} />);

    expect(screen.getByTestId("filter-section-Category")).toBeTruthy();
    expect(screen.getByTestId("filter-section-Class")).toBeTruthy();
    expect(screen.getByTestId("filter-section-Magic School")).toBeTruthy();
    expect(screen.getByTestId("filter-section-Rank")).toBeTruthy();
  });

  it("renders search input", () => {
    render(<FilterSidebar {...defaultProps} />);
    const input = screen.getByPlaceholderText("Search cards...");
    expect(input).toBeTruthy();
  });

  it("calls setSearchQuery on input change", () => {
    render(<FilterSidebar {...defaultProps} />);
    const input = screen.getByPlaceholderText("Search cards...");
    fireEvent.change(input, { target: { value: "test" } });
    expect(defaultProps.setSearchQuery).toHaveBeenCalledWith("test");
  });

  it("shows clear filters button when filters are active", () => {
    const propsWithFilters = {
      ...defaultProps,
      activeFilters: { ...defaultProps.activeFilters, schools: ["Fire"] },
    };
    render(<FilterSidebar {...propsWithFilters} />);

    const clearBtn = screen.getByText(/Clear all filters/i);
    expect(clearBtn).toBeTruthy();

    fireEvent.click(clearBtn);
    expect(defaultProps.clearFilters).toHaveBeenCalled();
  });

  it("renders sort controls when sort props are provided", () => {
    const sortProps = {
      ...defaultProps,
      sortBy: "name" as const,
      setSortBy: vi.fn(),
      sortOrder: "asc" as const,
      setSortOrder: vi.fn(),
    };
    render(<FilterSidebar {...sortProps} />);
    expect(screen.getByTestId("sort-controls")).toBeTruthy();
    expect(screen.getByTestId("sort-select")).toBeTruthy();
    expect(screen.getByTestId("sort-order-toggle")).toBeTruthy();
  });

  it("does not render sort controls without sort props", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.queryByTestId("sort-controls")).toBeNull();
  });

  it("calls setSortBy on selection change", () => {
    const setSortBy = vi.fn();
    const sortProps = {
      ...defaultProps,
      sortBy: "name" as const,
      setSortBy,
      sortOrder: "asc" as const,
      setSortOrder: vi.fn(),
    };
    render(<FilterSidebar {...sortProps} />);
    fireEvent.change(screen.getByTestId("sort-select"), {
      target: { value: "health" },
    });
    expect(setSortBy).toHaveBeenCalledWith("health");
  });

  it("calls setSortOrder on toggle click", () => {
    const setSortOrder = vi.fn();
    const sortProps = {
      ...defaultProps,
      sortBy: "name" as const,
      setSortBy: vi.fn(),
      sortOrder: "asc" as const,
      setSortOrder,
    };
    render(<FilterSidebar {...sortProps} />);
    fireEvent.click(screen.getByTestId("sort-order-toggle"));
    expect(setSortOrder).toHaveBeenCalledWith("desc");
  });
});
