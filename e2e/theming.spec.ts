import { expect, test } from "@playwright/test";

test.describe("Theming", () => {
  test("Changes theme via the theme picker and persists on reload", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");

    // Theme picker trigger might be in sidebar for desktop, and navbar/drawer for mobile.
    // So we first find the trigger.
    let themeTrigger = page.getByTestId("theme-picker-trigger").first();

    // On Mobile, the theme picker is often hidden inside the mobile drawer.
    if (isMobile) {
      const mobileToggle = page.getByTestId("navbar-mobile-toggle");
      await mobileToggle.click();
      const drawer = page.getByTestId("navbar-mobile-drawer");
      await expect(drawer).toBeVisible();
      // Theme trigger should now be visible in drawer, filter by visible to avoid hidden desktop sidebars
      themeTrigger = page
        .getByTestId("theme-picker-trigger")
        .filter({ hasText: "Theme" });
    }

    await expect(themeTrigger).toBeVisible();
    await themeTrigger.click();

    const menu = page.getByTestId("theme-picker-menu");
    await expect(menu).toBeVisible();

    // Choose the 'glitchwitch' theme
    const optionTheme = page.getByTestId("theme-option-theme-glitchwitch");
    await expect(optionTheme).toBeVisible();
    await optionTheme.click();

    // Assert the class attribute on HTML tag includes the theme
    await expect(page.locator("html")).toHaveClass(/.*theme-glitchwitch.*/);

    // Reload the page and assert persistence
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/.*theme-glitchwitch.*/);
  });
});
