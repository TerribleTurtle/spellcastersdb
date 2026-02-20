import { expect, test } from "@playwright/test";

test.describe("Deck Builder DND (Mobile)", () => {
  test("Touch drag a card into a mobile dock slot", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) return;

    await page.goto("/deck-builder");

    const mobileDock = page.getByTestId("mobile-deck-dock");
    await expect(mobileDock).toBeAttached();

    // Wait for Virtuoso to render browser items
    const firstCard = page.locator('[data-testid^="browser-item-"]').first();
    await expect(firstCard).toBeAttached();
    await page.waitForTimeout(1000);

    const targetSlot = page.getByTestId("deck-slot-0").first();
    await expect(targetSlot).toBeAttached();

    // Manual pointer drag for dnd-kit PointerSensor compatibility
    const src = await firstCard.boundingBox();
    const tgt = await targetSlot.boundingBox();

    if (src && tgt) {
      await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.move(
        src.x + src.width / 2 + 10,
        src.y + src.height / 2 + 10,
        { steps: 5 }
      );
      await page.waitForTimeout(100);
      await page.mouse.move(tgt.x + tgt.width / 2, tgt.y + tgt.height / 2, {
        steps: 10,
      });
      await page.waitForTimeout(100);
      await page.mouse.up();
    } else {
      // Fallback: dispatch pointer events directly when Virtuoso hides elements from Playwright
      await firstCard.dispatchEvent("pointerdown", {
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerType: "touch",
      });
      await page.waitForTimeout(100);
      await firstCard.dispatchEvent("pointermove", {
        button: 0,
        clientX: 120,
        clientY: 120,
        pointerType: "touch",
      });
      await page.waitForTimeout(100);
      await targetSlot.dispatchEvent("pointermove", {
        button: 0,
        clientX: 150,
        clientY: 300,
        pointerType: "touch",
      });
      await page.waitForTimeout(100);
      await targetSlot.dispatchEvent("pointerup", {
        button: 0,
        clientX: 150,
        clientY: 300,
        pointerType: "touch",
      });
    }
  });
});
