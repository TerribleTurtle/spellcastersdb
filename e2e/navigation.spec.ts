import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("Footer navigation links resolve correctly", async ({ page }) => {
    await page.goto("/");

    const privacyLink = page.getByTestId("footer-link-privacy");
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await expect(page).toHaveURL(/.*\/privacy/);

    const termsLink = page.getByTestId("footer-link-terms");
    await expect(termsLink).toBeVisible();
    await termsLink.click();
    await expect(page).toHaveURL(/.*\/terms/);
  });

  test("Navbar & Mobile Drawer navigation works (Mobile Only)", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) return;

    await page.goto("/");

    // Mobile Navbar and toggle should be visible
    const navbar = page.getByTestId("navbar");
    await expect(navbar).toBeVisible();

    const mobileToggle = page.getByTestId("navbar-mobile-toggle");
    await expect(mobileToggle).toBeVisible();
    await mobileToggle.click();

    // Drawer should open
    const drawer = page.getByTestId("navbar-mobile-drawer");
    await expect(drawer).toBeVisible();

    // Click a link inside the drawer (e.g., Database)
    const dbLink = page.getByTestId("navbar-drawer-link-database");
    await expect(dbLink).toBeVisible();
    await dbLink.click();

    await expect(page).toHaveURL(/.*\/database/);

    // Drawer should likely have closed (or navigated away, so it's fine)
  });

  test("Desktop Sidebar navigation works (Desktop Only)", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) return;

    await page.goto("/");

    const sidebar = page.getByTestId("desktop-sidebar");
    await expect(sidebar).toBeVisible();

    // Click link in sidebar
    const dbLink = page.getByTestId("sidebar-link-database");
    await expect(dbLink).toBeVisible();
    await dbLink.click();

    await expect(page).toHaveURL(/.*\/database/);

    // Sidebar expand/collapse toggle
    const collapseBtn = page.getByTestId("sidebar-collapse-btn");
    const expandBtn = page.getByTestId("sidebar-expand-btn");

    // Assuming it starts expanded in our 1440x900 viewport:
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await expect(expandBtn).toBeVisible();
    }
  });
});
