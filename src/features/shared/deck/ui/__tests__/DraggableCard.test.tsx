/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DraggableCard } from "../DraggableCard";
import { BrowserItem } from "@/types/browser";
import { EntityCategory } from "@/types/enums";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock Dnd Kit
vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

// Mock Lucide Icons to verify they are rendered
vi.mock("lucide-react", async (importOriginal) => {
    const actual = await importOriginal<typeof import("lucide-react")>();
    return {
        ...actual,
        Shield: (props: any) => <div data-testid="icon-shield" {...props} />,
        Wand2: (props: any) => <div data-testid="icon-wand" {...props} />,
        Swords: (props: any) => <div data-testid="icon-swords" {...props} />,
        HelpCircle: (props: any) => <div data-testid="icon-help" {...props} />,
    };
});

const renderWithTooltip = (component: React.ReactNode) => {
    return render(
        <TooltipProvider>
            {component}
        </TooltipProvider>
    );
};

describe("DraggableCard Badges", () => {
    const mockBaseItem = {
        name: "Test Unit",
        image_required: false,
        tags: []
    };

    it("should render Shield icon for Conqueror class", () => {
        const item = {
            ...mockBaseItem,
            entity_id: "sc1",
            category: EntityCategory.Spellcaster,
            class: "Conqueror"
        } as unknown as BrowserItem;

        renderWithTooltip(
            <DraggableCard 
                item={item} 
                onClick={vi.fn()} 
                onQuickAdd={vi.fn()} 
            />
        );

        expect(screen.getByTestId("icon-shield")).toBeDefined();
    });

    it("should render Wand icon for Enchanter class", () => {
        const item = {
            ...mockBaseItem,
            entity_id: "sc2",
            category: EntityCategory.Spellcaster,
            class: "Enchanter"
        } as unknown as BrowserItem;

        renderWithTooltip(
            <DraggableCard 
                item={item} 
                onClick={vi.fn()} 
                onQuickAdd={vi.fn()} 
            />
        );

        expect(screen.getByTestId("icon-wand")).toBeDefined();
    });

    it("should render Swords icon for Duelist class", () => {
        const item = {
            ...mockBaseItem,
            entity_id: "sc3",
            category: EntityCategory.Spellcaster,
            class: "Duelist"
        } as any;

        renderWithTooltip(
            <DraggableCard 
                item={item} 
                onClick={vi.fn()} 
                onQuickAdd={vi.fn()} 
            />
        );

        expect(screen.getByTestId("icon-swords")).toBeDefined();
    });
});
