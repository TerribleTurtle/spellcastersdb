import { test, expect } from '@playwright/test';

test('Sanity: Home page loads with correct title', async ({ page }) => {
  await page.goto('/');

  // 1. Check Title
  await expect(page).toHaveTitle(/Spellcasters/);

  // 2. Check Critical UI Element (Save Button)
  // This confirms the DeckBuilder mounted and hydrated
  await expect(page.getByTestId('toolbar-save-btn')).toBeVisible();
});
