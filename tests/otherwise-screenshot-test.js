import { browser } from "k6/browser";
import { expect, failTest, passTest } from "./testing.js";

export const options = {
  scenarios: {
    browser: {
      executor: "shared-iterations",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

const testCases = [
  {
    name: ".otherwise() takes actual screenshot before assertion fails",
    assertion: async ({ page }) => {
      let screenshotTaken = false;
      let callbackExecuted = false;

      try {
        await expect(page.locator("#element-that-does-not-exist"))
          .otherwise(async (ctx) => {
            callbackExecuted = true;
            // Real screenshot
            await page.screenshot({ path: "test-failure-screenshot.png" });
            screenshotTaken = true;
          })
          .toBeVisible();
      } catch (e) {
        // Expected to fail
      }

      if (!callbackExecuted) {
        throw new Error("Screenshot callback was not executed");
      }
      if (!screenshotTaken) {
        throw new Error("Screenshot was not taken before assertion failed");
      }
    },
  },
];

export default async function testOtherwiseScreenshot() {
  const baseUrl = __ENV.TEST_SERVER_BASE_URL ?? "http://localhost:8000";
  const context = await browser.newContext();

  for (const testCase of testCases) {
    const page = await context.newPage();
    try {
      await page.goto(baseUrl);

      await testCase.assertion({ page });

      passTest(testCase.name);
    } catch (error) {
      failTest(testCase.name, error.message);
    } finally {
      await page.close();
    }
  }
}
