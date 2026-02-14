import { test, expect } from './fixtures/base';

test.describe('Deck Builder (Team) - Integration', () => {

    const MOCK_DECK = {
        id: 'mock-deck-123',
        name: 'Mock Solo Deck',
        spellcaster: null,
        slots: [
            { index: 0, unit: null, allowedTypes: ['UNIT', 'SPELL'] },
            { index: 1, unit: null, allowedTypes: ['UNIT', 'SPELL'] },
            { index: 2, unit: null, allowedTypes: ['UNIT', 'SPELL'] },
            { index: 3, unit: null, allowedTypes: ['UNIT', 'SPELL'] },
            { index: 4, unit: null, allowedTypes: ['TITAN'] },
        ]
    };

    const INJECT_STATE = {
        state: {
            savedDecks: [MOCK_DECK],
            mode: 'SOLO' // Start in SOLO, switch to TEAM
        },
        version: 0 // Zustand persist version
    };

    test.beforeEach(async ({ page, context }) => {
        // 1. CLEAR Storage to ensure clean state
        await context.clearCookies();
        // 2. Go to page to initialize storage (or just set it directly before goto if supported, but usually need domain context)
        await page.goto('/deck-builder');
        
        // 3. Inject Data
        await page.evaluate((data) => {
            localStorage.setItem('spellcasters-store-v2', JSON.stringify(data));
        }, INJECT_STATE);

        // 4. Reload to hydrate store from storage
        await page.reload();
        await expect(page.getByRole('heading', { name: /Deck Builder/i })).toBeVisible({ timeout: 10000 });
    });

    test('Team Mode: Import Solo Deck', async ({ page }) => {
        // 0. Dismiss Summary if open
        const editBtn = page.getByTestId('edit-deck-btn');
        if (await editBtn.isVisible()) {
            await editBtn.click();
            await expect(editBtn).not.toBeVisible();
        }

        // 1. Open Command Center (Library)
        // We added a header button for this
        const libraryBtn = page.getByTestId('header-library-btn');
        await expect(libraryBtn).toBeVisible();
        await libraryBtn.click();

        // 2. Switch to Team Mode
        const teamSwitch = page.getByTestId('mode-switch-team');
        await expect(teamSwitch).toBeVisible();
        await teamSwitch.click();

        // 3. Verify Team UI (3 Slots should appear)
        // We expect 3 drawers. We instrumented them with IDs deck-drawer-0, 1, 2
        // Note: Layout might duplicate for responsive, so scope to visible
        const slot1Drawer = page.locator('[data-testid="deck-drawer-0"]:visible');
        await expect(slot1Drawer).toBeVisible();
        await expect(page.locator('[data-testid="deck-drawer-1"]:visible')).toBeVisible();
        await expect(page.locator('[data-testid="deck-drawer-2"]:visible')).toBeVisible();

        // 4. Click Import on Slot 1
        // Ensure the drawer actions are visible (Desktop always visible if xl, Mobile might need expand)
        // Check if toolbar button is visible. Use locator with :visible because DeckDrawer renders it twice (desktop/mobile).
        const importBtn = slot1Drawer.locator('[data-testid="toolbar-import-btn"]:visible');
        if (!(await importBtn.isVisible())) {
             // Click header to expand
             // We need to find the header within the drawer
             // DeckDrawer has `data-testid="deck-drawer-header"`? 
             // We didn't add it to the header explicitly, but `DeckDrawer.tsx` has `data-testid="deck-drawer-header"` on line 168!
             const header = slot1Drawer.getByTestId('deck-drawer-header');
             await header.click();
        }
        
        await expect(importBtn).toBeVisible();
        await importBtn.click();

        // 5. Select the Mock Deck from Command Center
        // Wait for modal
        const modal = page.locator('div[role="dialog"]'); // Assuming generic dialog role or we can assume it opens
        // Better: look for our specific mock deck in the list
        const deckItem = page.getByText('Mock Solo Deck');
        await expect(deckItem).toBeVisible();
        await deckItem.click();

        // 5. Verify Import
        // The drawer header should now say "Mock Solo Deck" (actually input value)
        // The header has an input for the name.
        const nameInput = slot1Drawer.locator('input[value="Mock Solo Deck"]');
        await expect(nameInput).toBeVisible();
    });

});
