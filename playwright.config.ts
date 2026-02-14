import { defineConfig, devices } from '@playwright/test';

/**
 * Simplified Playwright Config for "Reboot"
 * focused on stability first, features second.
 */
export default defineConfig({
  testDir: './e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. */
  reporter: 'html',

  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. */
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Test against mobile viewports. */
    // NOTE: DEFERRED. User mandated "Desktop First". Do not uncomment without instruction.
    // {
    //    name: 'Mobile Chrome',
    //    use: { ...devices['Pixel 5'], hasTouch: true },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
