import { expect, test } from "@playwright/test";

test.describe("Deck Edge Cases", () => {
  test("Clear Deck triggers the unsaved changes modal and clears slots", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) return;

    await page.goto("/deck-builder");
    await expect(page.getByTestId("deck-builder-desktop-header")).toBeVisible();

    // Wait for browser items, then Quick Add to populate a slot
    await page.waitForSelector('[data-testid^="browser-item-"]', {
      state: "attached",
      timeout: 10000,
    });
    const firstCard = page.locator('[data-testid^="browser-item-"]').first();
    await page.waitForTimeout(1000);
    await firstCard.dblclick({ force: true });
    await page.waitForTimeout(500);

    // Click Clear
    const clearBtn = page.getByTestId("toolbar-clear-btn").first();
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Assert the Unsaved Changes modal appeared
    const modal = page
      .locator('[role="dialog"]')
      .locator("text=Clear Deck")
      .first();
    await expect(modal).toBeVisible();

    // Confirm discard
    const discardBtn = page
      .locator('[role="dialog"]')
      .getByRole("button", { name: /clear anyway/i })
      .first();
    await expect(discardBtn).toBeVisible();
    await discardBtn.click();

    // Modal should be dismissed
    await expect(modal).not.toBeVisible();
    await page.waitForTimeout(500);
  });
});
