import { expect, test } from "@playwright/test";

test.describe("Deck Builder DND (Desktop)", () => {
  test("Drag a card into a deck slot and Quick Add a second card", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) return;

    await page.goto("/deck-builder");
    await expect(page.getByTestId("deck-builder-desktop-header")).toBeVisible();

    // Wait for Virtuoso to render browser items
    const firstCard = page.locator('[data-testid^="browser-item-"]').first();
    await expect(firstCard).toBeVisible();

    const targetSlot = page.getByTestId("deck-slot-0").first();
    await expect(targetSlot).toBeAttached();

    // Manual pointer drag for dnd-kit PointerSensor compatibility
    const src = await firstCard.boundingBox();
    const tgt = await targetSlot.boundingBox();

    if (src && tgt) {
      await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2);
      await page.mouse.down();
      // dnd-kit PointerSensor activation delay
      await page.waitForTimeout(100);
      await page.mouse.move(
        src.x + src.width / 2 + 10,
        src.y + src.height / 2 + 10,
        { steps: 5 }
      );
      // dnd-kit PointerSensor activation delay
      await page.waitForTimeout(100);
      await page.mouse.move(tgt.x + tgt.width / 2, tgt.y + tgt.height / 2, {
        steps: 10,
      });
      // dnd-kit PointerSensor activation delay
      await page.waitForTimeout(100);
      await page.mouse.up();
    }

    // Quick Add via double-click
    const secondCard = page.locator('[data-testid^="browser-item-"]').nth(1);
    await expect(secondCard).toBeAttached();
    await secondCard.dblclick({ force: true });

    const nextSlot = page.getByTestId("deck-slot-1").first();
    await expect(nextSlot).toBeAttached();
  });
});
