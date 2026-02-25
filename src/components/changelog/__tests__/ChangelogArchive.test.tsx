import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChangelogArchive } from "../ChangelogArchive";
import { useChangelogSearch } from "../hooks/useChangelogSearch";

// --- Mocks ---
vi.mock("../hooks/useChangelogSearch", () => ({
  useChangelogSearch: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    "aria-label": ariaLabel,
    title,
    onClick,
  }: any) => (
    <a
      href={href}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      data-testid="mock-link"
    >
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/DiffLine", () => ({
  DiffLine: ({ diff }: any) => (
    <div data-testid="diff-line">{diff.text || "diff"}</div>
  ),
}));

vi.mock("@/components/ui/LocalDate", () => ({
  LocalDate: ({ iso }: any) => <span data-testid="local-date">{iso}</span>,
}));

vi.mock("@/components/ui/PatchBadge", () => ({
  PatchBadge: ({ type }: any) => (
    <span data-testid={`patch-badge-${type}`}>{type}</span>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock("@/lib/routes", () => ({
  routes: {
    entityLinkFromChangelog: vi.fn((id, _cat) => `/mock-link/${id}`),
  },
}));

// --- Test Data ---
const mockFlatRows = Array.from({ length: 60 }).map((_, i) => ({
  key: `patch1-${i}`,
  patchId: "patch1",
  version: "1.0.0",
  patchType: "Patch",
  patchTitle: "Release 1",
  patchDate: "2024-01-01T00:00:00Z",
  patchTimestamp: 1704067200000,
  patchTags: [],
  targetId: `target-${i}`,
  name: `Entity ${i}`,
  field: "field_name",
  changeType: i % 2 === 0 ? "edit" : "add",
  category: i % 2 === 0 ? "Unit" : "Spell",
  diffs: [{ type: "add", text: "+ new line" }],
}));

const defaultMockState = {
  searchQuery: "",
  setSearchQuery: vi.fn(),
  sortMode: "date-desc",
  setSortMode: vi.fn(),
  filters: { patchTypes: [], changeTypes: [], categories: [] },
  results: mockFlatRows,
  totalCount: 100, // Pretend we have 100 total, but 60 in results
  allCategories: ["Unit", "Spell", "Mechanic"],
  hasActiveFilters: false,
  togglePatchType: vi.fn(),
  toggleChangeType: vi.fn(),
  toggleCategory: vi.fn(),
  clearAll: vi.fn(),
};

describe("ChangelogArchive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useChangelogSearch as any).mockReturnValue({ ...defaultMockState });
  });

  describe("Normal Coverage (Rendering & Interaction)", () => {
    it("should render PAGE_SIZE (50) rows initially", () => {
      render(<ChangelogArchive patches={[]} />); // patches prop isn't used by the mock

      const rows = screen.getAllByText(/Entity \d+/);
      expect(rows.length).toBe(50); // Hardcoded PAGE_SIZE = 50 in component

      // Check total count display
      expect(screen.getByText("50")).toBeDefined(); // Math.min(visibleCount, results.length)
      expect(screen.getByText("60")).toBeDefined(); // results.length
      expect(screen.getByText("(filtered from 100)")).toBeDefined();
    });

    it("should handle search input interaction", () => {
      const setSearchQuery = vi.fn();
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        setSearchQuery,
      });

      render(<ChangelogArchive patches={[]} />);
      const input = screen.getByLabelText("Search changes");

      fireEvent.change(input, { target: { value: "test query" } });
      expect(setSearchQuery).toHaveBeenCalledWith("test query");
    });

    it("should render clear search button when query exists", () => {
      const setSearchQuery = vi.fn();
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        searchQuery: "active search",
        setSearchQuery,
      });

      render(<ChangelogArchive patches={[]} />);
      const clearBtn = screen.getByLabelText("Clear search");
      fireEvent.click(clearBtn);

      expect(setSearchQuery).toHaveBeenCalledWith("");
    });

    it("should handle sort dropdown interaction", () => {
      const setSortMode = vi.fn();
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        setSortMode,
      });

      render(<ChangelogArchive patches={[]} />);
      const select = screen.getByLabelText("Sort order");

      fireEvent.change(select, { target: { value: "name-asc" } });
      expect(setSortMode).toHaveBeenCalledWith("name-asc");
    });

    it("should handle filter toggles", () => {
      const togglePatchType = vi.fn();
      const toggleChangeType = vi.fn();
      const toggleCategory = vi.fn();

      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        togglePatchType,
        toggleChangeType,
        toggleCategory,
      });

      render(<ChangelogArchive patches={[]} />);

      // Open filters
      fireEvent.click(screen.getByText("Filters"));

      // Click one of each
      fireEvent.click(screen.getByText("Patch", { selector: "button" }));
      expect(togglePatchType).toHaveBeenCalledWith("Patch");

      fireEvent.click(screen.getByText("Added", { selector: "button" }));
      expect(toggleChangeType).toHaveBeenCalledWith("add");

      fireEvent.click(screen.getByText("Unit", { selector: "button" }));
      expect(toggleCategory).toHaveBeenCalledWith("Unit");
    });

    it("should expand and collapse rows", () => {
      // Just mock 1 row to make querying easier
      const singleRow = [mockFlatRows[0]];
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        results: singleRow,
      });

      render(<ChangelogArchive patches={[]} />);

      // By default, diff lines shouldn't be visible
      expect(screen.queryByTestId("diff-line")).toBeNull();

      // Click the row (the button holding the Entity Name)
      const rowBtn = screen.getByText("Entity 0").closest("button");
      fireEvent.click(rowBtn!);

      // Diff line should now appear
      expect(screen.getAllByTestId("diff-line")).toHaveLength(1);

      // Click again to collapse
      fireEvent.click(rowBtn!);
      expect(screen.queryByTestId("diff-line")).toBeNull();
    });

    it("should handle pagination (Load More)", () => {
      render(<ChangelogArchive patches={[]} />);

      expect(screen.getAllByText(/Entity \d+/)).toHaveLength(50);

      // Click load more
      const loadMoreBtn = screen.getByText(/Load 10 more/);
      fireEvent.click(loadMoreBtn);

      // Now 60 should be visible
      expect(screen.getAllByText(/Entity \d+/)).toHaveLength(60);

      // Load more button should disappear
      expect(screen.queryByText(/Load \d+ more/)).toBeNull();
    });

    it("should render empty state when no results", () => {
      const clearAll = vi.fn();
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        results: [],
        totalCount: 100,
        clearAll,
      });

      render(<ChangelogArchive patches={[]} />);

      expect(screen.getByText("No changes found")).toBeDefined();

      const clearBtn = screen.getByText("Clear all filters");
      fireEvent.click(clearBtn);
      expect(clearAll).toHaveBeenCalled();
    });

    it("should clear all filters from the top-level button", () => {
      const clearAll = vi.fn();
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        hasActiveFilters: true,
        clearAll,
      });

      render(<ChangelogArchive patches={[]} />);

      // This button appears when searchQuery || hasActiveFilters is true
      const clearBtn = screen.getByText("Clear all");
      fireEvent.click(clearBtn);
      expect(clearAll).toHaveBeenCalled();
    });
  });

  describe("Adversarial Scenarios", () => {
    it("should safely render XSS payloads as escaped text, not HTML", () => {
      const xssPayload = "<script>alert('xss')</script>";
      const evilRow = {
        ...mockFlatRows[0],
        name: xssPayload,
        targetId: "xss-id",
      };
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        results: [evilRow],
      });

      render(<ChangelogArchive patches={[]} />);

      // React inherently escapes text nodes, so we just verify the exact string is in the document
      const element = screen.getByText(xssPayload);
      expect(element.tagName.toLowerCase()).not.toBe("script"); // It should be in a span/button
    });

    it("should handle absurdly large diff arrays without crashing (cap at 8)", () => {
      const massiveDiffs = Array.from({ length: 150 }).map((_, i) => ({
        type: "add",
        text: `+ Line ${i}`,
      }));
      const bigRow = { ...mockFlatRows[0], diffs: massiveDiffs };
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        results: [bigRow],
      });

      render(<ChangelogArchive patches={[]} />);

      const rowBtn = screen.getByText("Entity 0").closest("button");
      fireEvent.click(rowBtn!); // Expand

      // Should cap at 8 diff lines
      expect(screen.getAllByTestId("diff-line")).toHaveLength(8);

      // Should show the remainder label
      expect(screen.getByText("+142 more changes...")).toBeDefined();
    });

    it("should render safely when patches array is completely empty", () => {
      // Meaning useChangelogSearch returns 0 results and 0 total
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        results: [],
        totalCount: 0,
      });

      expect(() => render(<ChangelogArchive patches={[]} />)).not.toThrow();
      expect(screen.getByText("No changes found")).toBeDefined();
    });

    it("should handle rapid filter spam without crashing", () => {
      const togglePatchType = vi.fn();
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        togglePatchType,
      });

      render(<ChangelogArchive patches={[]} />);
      fireEvent.click(screen.getByText("Filters"));

      const patchBtn = screen.getByText("Patch", { selector: "button" });
      const hotfixBtn = screen.getByText("Hotfix", { selector: "button" });

      for (let i = 0; i < 20; i++) {
        fireEvent.click(patchBtn);
        fireEvent.click(hotfixBtn);
      }

      expect(togglePatchType).toHaveBeenCalledTimes(40);
    });

    it("should handle pagination overshoot safely", () => {
      // If PAGE_SIZE is 50, but we somehow have 52 items, clicking "Load More" requests 50 more (100 total)
      // The slice should just cap at 52 and not throw.
      const weirdRows = Array.from({ length: 52 }).map((_, i) => ({
        ...mockFlatRows[0],
        key: `k-${i}`,
        name: `E${i}`,
      }));
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        results: weirdRows,
      });

      render(<ChangelogArchive patches={[]} />);
      expect(screen.getAllByText(/E\d+/)).toHaveLength(50);

      fireEvent.click(screen.getByText(/Load 2 more/));
      expect(screen.getAllByText(/E\d+/)).toHaveLength(52);
    });

    it("should handle empty `diffs` array gracefully (hide expand icon)", () => {
      const emptyDiffRow = { ...mockFlatRows[0], diffs: [] };
      (useChangelogSearch as any).mockReturnValue({
        ...defaultMockState,
        results: [emptyDiffRow],
      });

      render(<ChangelogArchive patches={[]} />);

      const rowBtn = screen.getByText("Entity 0").closest("button");

      // Should not crash, and should not render any diff lines
      expect(screen.queryByTestId("diff-line")).toBeNull();

      // Clicking it shouldn't crash either
      fireEvent.click(rowBtn!);
      expect(screen.queryByTestId("diff-line")).toBeNull();
    });
  });
});
