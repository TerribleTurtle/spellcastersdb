import { expect, test } from "@playwright/test";

test.describe("Team Builder DND", () => {
  test("Switch to Team mode and drag a card into a Team deck slot", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) return;

    await page.goto("/deck-builder");
    await expect(page.getByTestId("deck-builder-desktop-header")).toBeVisible();

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
    await page.waitForTimeout(1000);

    // Target a slot inside the team drawer, expanding if collapsed
    const targetSlot = teamDrawer.getByTestId("deck-slot-0").first();
    await expect(targetSlot).toBeAttached();

    const src = await firstCard.boundingBox();
    let tgt = await targetSlot.boundingBox();

    if (!tgt || tgt.height === 0) {
      const header = teamDrawer.getByTestId("deck-drawer-header");
      await header.click();
      await page.waitForTimeout(500);
      tgt = await targetSlot.boundingBox();
    }

    // Manual pointer drag for dnd-kit PointerSensor compatibility
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
    }

    await page.waitForTimeout(500);
  });
});
