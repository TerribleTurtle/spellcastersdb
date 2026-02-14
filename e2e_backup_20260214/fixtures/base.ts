import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<{ saveLogs: void } & AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
    await use(makeAxeBuilder);
  },
  saveLogs: [async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    const consoleHandler = (msg: any) => {
        const type = msg.type();
        const text = msg.text();
        logs.push(`[${type}] ${text}`);
    };

    const responseHandler = (response: any) => {
        if (response.status() >= 400) {
            logs.push(`[NETWORK] ${response.request().method()} ${response.status()} ${response.url()}`);
        }
    };

    page.on('console', consoleHandler);
    page.on('response', responseHandler);

    await use();

    if (testInfo.status !== 'passed' && testInfo.status !== 'skipped') {
      if (logs.length > 0) {
        // Attach all logs (console + network) to the report
        await testInfo.attach('debug-logs', { 
            body: logs.join('\n'), 
            contentType: 'text/plain' 
        });
      }
    }
  }, { auto: true }],
});

export { expect } from '@playwright/test';
