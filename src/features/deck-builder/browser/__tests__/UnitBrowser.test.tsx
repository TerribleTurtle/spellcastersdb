/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnitBrowser } from "../UnitBrowser";
import { BrowserItem, VirtualRow } from "@/types/browser";
import { EntityCategory } from "@/types/enums";

// --- Mocks ---

// Mock Virtuoso to render items directly (JSDOM specific)
vi.mock("react-virtuoso", () => ({
  Virtuoso: ({ data, itemContent }: any) => (
    <div data-testid="virtuoso-container">
      {data.map((item: any, index: number) => (
        <div key={index} data-testid="virtuoso-item-wrapper">
          {itemContent(index, item)}
        </div>
      ))}
    </div>
  ),
}));

// Mock Hooks
vi.mock("@/features/deck-builder/hooks/ui/useUnitBrowserState", () => ({
  useUnitBrowserState: vi.fn(() => ({
    searchQuery: "",
    setSearchQuery: vi.fn(),
    debouncedSearchQuery: "",
    groupMode: "All",
    setGroupMode: vi.fn(),
    showFilters: false,
    setShowFilters: vi.fn(),
    activeFilters: {},
    activeFilterCount: 0
  }))
}));

vi.mock("@/features/deck-builder/hooks/domain/useUnitFiltering", () => ({
  useUnitFiltering: vi.fn(() => ({
    groupedContent: [] // Logic handled by util mock mostly
  }))
}));

vi.mock("@/features/deck-builder/hooks/ui/useResponsiveGrid", () => ({
  useResponsiveGrid: vi.fn(() => 2) // Fixed 2 columns
}));

// Mock Utils to control what is rendered regardless of inputs
vi.mock("../utils", () => ({
  prepareVirtualizationRows: vi.fn()
}));

// Mock Sub-components to keep output clean and focus on UnitBrowser hierarchy
vi.mock("../UnitBrowserHeader", () => ({
    UnitBrowserHeader: () => <div data-testid="browser-header">Header</div>
}));
vi.mock("../UnitGroupHeader", () => ({
    UnitGroupHeader: ({ title, count, onToggle }: any) => (
        <div data-testid="group-header" onClick={onToggle}>
            {title} ({count})
        </div>
    )
}));
vi.mock("../UnitGridRow", () => ({
    UnitGridRow: ({ items, onQuickAdd }: any) => (
        <div data-testid="grid-row">
            {items.map((item: any) => (
                <div key={item.entity_id} data-testid="grid-item">
                    {item.name}
                    <button aria-label="Quick Add" onClick={() => onQuickAdd(item)}>
                        +
                    </button>
                </div>
            ))}
        </div>
    )
}));

import { prepareVirtualizationRows } from "../utils";

describe("UnitBrowser", () => {
    const mockOnSelect = vi.fn();
    const mockOnQuickAdd = vi.fn();
    const mockItems: BrowserItem[] = [
        { entity_id: "u1", name: "Goblin", category: EntityCategory.Creature } as any
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render empty state if no virtual data", () => {
        (prepareVirtualizationRows as any).mockReturnValue([]);
        
        // We pass items to ensure the Skeleton check (items.length === 0) is bypassed,
        // allowing us to test the "No results found" state which occurs when filtering yields no matches.
        render(
            <UnitBrowser 
                items={mockItems} 
                onSelectItem={mockOnSelect} 
                onQuickAdd={mockOnQuickAdd} 
            />
        );

        expect(screen.getByText("No results found.")).toBeDefined();
    });

    it("should render virtual rows when data exists", () => {
        const mockRows: VirtualRow[] = [
            { type: "header", title: "Creatures", count: 1, isCollapsed: false },
            { type: "row", items: mockItems, startIndex: 0 }
        ];
        (prepareVirtualizationRows as any).mockReturnValue(mockRows);

        render(
            <UnitBrowser 
                items={mockItems} 
                onSelectItem={mockOnSelect} 
                onQuickAdd={mockOnQuickAdd} 
            />
        );

        expect(screen.getByTestId("virtuoso-container")).toBeDefined();
        expect(screen.getByTestId("group-header").textContent).toContain("Creatures (1)");
        expect(screen.getByTestId("grid-row")).toBeDefined();
        expect(screen.getByText("Goblin")).toBeDefined();
    });

    it("should handle quick add interaction", () => {
        const mockRows: VirtualRow[] = [
            { type: "row", items: mockItems, startIndex: 0 }
        ];
        (prepareVirtualizationRows as any).mockReturnValue(mockRows);

        render(
            <UnitBrowser 
                items={mockItems} 
                onSelectItem={mockOnSelect} 
                onQuickAdd={mockOnQuickAdd} 
            />
        );

        const btn = screen.getByLabelText("Quick Add");
        fireEvent.click(btn);

        expect(mockOnQuickAdd).toHaveBeenCalledWith(mockItems[0]);
    });
});
