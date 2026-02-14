import { test, expect } from './fixtures/base';

test.describe('Home Page', () => {
  test('has title', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Spellcasters/);
  });

  test('renders deck builder', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Deck Builder/i })).toBeAttached();
    
    // Ensure all images are loaded before snapshot
    await page.waitForFunction(() => {
      const images = Array.from(document.images);
      return images.every((img) => img.complete);
    });
    
    // Ensure fonts are loaded
    await page.evaluate(() => document.fonts.ready);

    // Visual Check: Home Page
    await expect(page).toHaveScreenshot('home-page.png');
  });


});
