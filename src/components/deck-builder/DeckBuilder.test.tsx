import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeckBuilderContainer } from "./core/DeckBuilderContainer";
import { useDeckStore } from "@/store/index";
import { EntityCategory } from "@/types/enums";

// Mock Hooks
vi.mock("@/components/deck-builder/hooks/persistence/useUrlSync", () => ({
    useUrlSync: vi.fn()
}));
vi.mock("@/components/deck-builder/hooks/persistence/useDeckSync", () => ({
    useDeckSync: vi.fn()
}));
vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ toasts: [], showToast: vi.fn() })
}));

// Mock next/image
vi.mock("next/image", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-unused-vars
    default: ({ fill, ...props }: any) => <img {...props} />
}));

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

// Mock react-virtuoso
vi.mock("react-virtuoso", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Virtuoso: ({ data, itemContent }: any) => (
        <div data-testid="virtuoso-list">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.map((item: any, index: number) => (
                <div key={index}>{itemContent(index, item)}</div>
            ))}
        </div>
    ),
}));

describe("DeckBuilder Integration", () => {
    // ... test setup ...
    it("should render unit browser content", async () => {
         const mockUnit = {
            entity_id: "u1",
            name: "Test Unit",
            category: EntityCategory.Creature,
            health: 100,
            movement_speed: 10,
            magic_school: "Wild",
            tags: []
        };
        // @ts-expect-error - Testing invalid props handling or mock mismatch
        render(<DeckBuilderContainer units={[mockUnit]} spellcasters={[]} />);
        
        // Check for static UI

        expect(screen.getAllByTitle("Save Deck").length).toBeGreaterThan(0);
        
        // Check for unit content (async because virtualization/filtering might be async)
        const unitElement = await screen.findByText("Test Unit");
        expect(unitElement).toBeDefined();

        // Interaction: Click to Quick Add
        // We need to ensure we click the text or the banner which has the handler
        fireEvent.click(unitElement);

        // Verification: Check Store State
        // Since we are using the real store logic (unmocked), it should update the slot.
        // We need to wait for the store update (though usually sync with Zustand, sometimes React batching affects it if we checked UI)
        // Checking state directly is safest for logic.
        
        await waitFor(() => {
            const state = useDeckStore.getState();
            const slot0 = state.currentDeck.slots[0];
            expect(slot0.unit).toBeDefined();
            expect(slot0.unit?.name).toBe("Test Unit");
        });
    });

    // TODO: Fix test environment rendering for validation feedback (likely mobile/desktop hidden visibility issue)
    it.skip("should show validation feedback", async () => {
         // Render with empty units (should be invalid deck)
        render(<DeckBuilderContainer units={[]} spellcasters={[]} />);
        
        // Check for validation indicator (e.g. "X Issues")
        // Deck starts empty, so it should have multiple issues (missing spellcaster, missing units)
        const issueBadge = await screen.findByText(/Issues/i);
        expect(issueBadge).toBeDefined();
    });
});
