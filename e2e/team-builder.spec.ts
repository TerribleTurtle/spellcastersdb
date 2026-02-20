import { expect, test } from "@playwright/test";

test.describe("Team Builder DND", () => {
  test("Switch to Team mode and drag a card into a Team deck slot", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) return;

    await page.goto("/deck-builder");
    await expect(page.getByTestId("deck-builder-desktop-header")).toBeVisible();

    // Dismiss the Welcome Modal if it appears (shown on first visit)
    const dismissButton = page.getByRole("button", { name: /begin casting/i });
    if (await dismissButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dismissButton.click();
      await expect(dismissButton).not.toBeVisible();
    }

    // Switch to Team Mode
    const teamButton = page.getByRole("button", { name: "Team" }).first();
    await expect(teamButton).toBeVisible();
    await teamButton.click();

    // Verify first Team Drawer is visible
    const teamDrawer = page.getByTestId("deck-drawer-0").first();
    await expect(teamDrawer).toBeVisible();

    // Wait for Virtuoso to render browser items
    await page.waitForSelector('[data-testid^="browser-item-"]', {
      state: "attached",
      timeout: 10000,
    });
    const firstCard = page.locator('[data-testid^="browser-item-"]').first();
    await expect(firstCard).toBeVisible();

    // Target a slot inside the team drawer, expanding if collapsed
    const targetSlot = teamDrawer.getByTestId("deck-slot-0").first();
    await expect(targetSlot).toBeAttached();

    const src = await firstCard.boundingBox();
    let tgt = await targetSlot.boundingBox();

    if (!tgt || tgt.height === 0) {
      const header = teamDrawer.getByTestId("deck-drawer-header");
      await header.click();
      await expect(targetSlot).toBeVisible();
      tgt = await targetSlot.boundingBox();
    }

    // Manual pointer drag for dnd-kit PointerSensor compatibility
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
  });
});
