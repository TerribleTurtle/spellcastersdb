import { test, expect } from './fixtures/base';

test.describe('Deck Builder (Solo) - Critical Path', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/deck-builder');
        // Wait for hydration
        await expect(page.getByRole('heading', { name: /Deck Builder/i })).toBeVisible({ timeout: 10000 });
    });

    test('Critical Path: Add Unit & Save', async ({ page }) => {
        // 0. Ensure we are in Edit Mode (Dismiss Summary if open)
        const editBtn = page.getByTestId('edit-deck-btn');
        if (await editBtn.isVisible()) {
            await editBtn.click();
            await expect(editBtn).not.toBeVisible();
        }

        // 1. Add a unit (Double Click)
        // Wait for browser items to load
        const unitCard = page.locator('div[data-testid^="browser-item-"]').first();
        await expect(unitCard).toBeVisible({ timeout: 10000 });
        await unitCard.dblclick({ force: true });
        
        // 2. Verify it was added
        const slot1 = page.locator('div[id^="active-deck-"]:visible').locator('div', { hasText: 'Incant. 1' });
        await expect(slot1.first()).toBeVisible();

        // 3. Setup Dialog Handler for Save Prompt
        page.on('dialog', async dialog => {
            if (dialog.type() === 'prompt') {
                await dialog.accept('My Awesome Deck');
            } else {
                await dialog.accept();
            }
        });

        // 4. Click Save (Toolbar)
        const saveBtn = page.getByTestId('toolbar-save-btn');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();
        
        // 5. Verify "Saved" state
        await expect(saveBtn).toHaveText(/Saved/i);
    });
});
