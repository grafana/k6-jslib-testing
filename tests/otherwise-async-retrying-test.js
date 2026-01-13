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
    name:
      ".otherwise() async callback with toBeVisible completes before assertion",
    selector: "#nonexistent-element",
    assertion: async (locator) => {
      let asyncCallbackExecuted = false;
      let asyncOperationCompleted = false;

      try {
        await expect(locator)
          .otherwise(async (ctx) => {
            asyncCallbackExecuted = true;
            // Simulate async operation like screenshot
            await new Promise((resolve) => setTimeout(resolve, 50));
            asyncOperationCompleted = true;
          })
          .toBeVisible();
      } catch (e) {
        // Expected to fail
      }

      if (!asyncCallbackExecuted) {
        throw new Error("Async callback was not executed");
      }
      if (!asyncOperationCompleted) {
        throw new Error(
          "Async operation did not complete before assertion failed",
        );
      }
    },
  },
  {
    name: ".otherwise() async callback with toHaveText",
    selector: "h1",
    assertion: async (locator) => {
      let callbackCompleted = false;

      try {
        await expect(locator)
          .otherwise(async (ctx) => {
            await new Promise((resolve) => setTimeout(resolve, 20));
            callbackCompleted = true;
          })
          .toHaveText("Wrong Title That Does Not Exist");
      } catch (e) {
        // Expected to fail
      }

      if (!callbackCompleted) {
        throw new Error("Async callback did not complete");
      }
    },
  },
  {
    name: ".otherwise() sync callback still works with retrying matchers",
    selector: "#another-nonexistent",
    assertion: async (locator) => {
      let syncCallback = false;

      try {
        await expect(locator)
          .otherwise((ctx) => {
            syncCallback = true;
          })
          .toBeVisible();
      } catch (e) {
        // Expected to fail
      }

      if (!syncCallback) {
        throw new Error("Sync callback was not executed");
      }
    },
  },
  {
    name: ".otherwise() async callback with .not modifier",
    selector: "body",
    assertion: async (locator) => {
      let notAsyncCallback = false;

      try {
        // body IS visible, so .not.toBeVisible() should fail
        await expect(locator)
          .not.otherwise(async (ctx) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            notAsyncCallback = true;
          })
          .toBeVisible();
      } catch (e) {
        // Expected to fail
      }

      if (!notAsyncCallback) {
        throw new Error("Async callback with .not did not execute");
      }
    },
  },
  {
    name: ".otherwise() async callback with toHaveAttribute",
    selector: "body",
    assertion: async (locator) => {
      let attributeCallback = false;

      try {
        await expect(locator)
          .otherwise(async (ctx) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            attributeCallback = true;
          })
          .toHaveAttribute("nonexistent-attr", "value");
      } catch (e) {
        // Expected to fail
      }

      if (!attributeCallback) {
        throw new Error("Async callback with toHaveAttribute did not execute");
      }
    },
  },
  {
    name: ".otherwise() multiple async callbacks - last wins",
    selector: "#nonexistent",
    assertion: async (locator) => {
      let firstCallback = false;
      let secondCallback = false;

      try {
        await expect(locator)
          .otherwise(async () => {
            firstCallback = true;
          })
          .otherwise(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            secondCallback = true;
          })
          .toBeVisible();
      } catch (e) {
        // Expected to fail
      }

      if (firstCallback) {
        throw new Error("First callback should not have been invoked");
      }
      if (!secondCallback) {
        throw new Error("Second callback was not invoked");
      }
    },
  },
  {
    name: ".otherwise() async callback receives correct error context",
    selector: "#nonexistent",
    assertion: async (locator) => {
      let errorContext = null;

      try {
        await expect(locator)
          .otherwise(async (ctx) => {
            errorContext = ctx;
          })
          .toBeVisible();
      } catch (e) {
        // Expected to fail
      }

      if (!errorContext) {
        throw new Error("Callback did not receive error context");
      }
      if (!errorContext.message) {
        throw new Error("Error context missing message");
      }
      if (!errorContext.matcherName) {
        throw new Error("Error context missing matcherName");
      }
      if (errorContext.matcherName !== "toBeVisible") {
        throw new Error(
          `Expected matcherName to be "toBeVisible", got "${errorContext.matcherName}"`,
        );
      }
    },
  },
];

export default async function testOtherwiseAsyncRetrying() {
  const baseUrl = __ENV.TEST_SERVER_BASE_URL ?? "http://localhost:8000";
  const context = await browser.newContext();

  for (const testCase of testCases) {
    const page = await context.newPage();
    try {
      await page.goto(baseUrl);

      const locator = page.locator(testCase.selector);
      await testCase.assertion(locator);

      passTest(testCase.name);
    } catch (error) {
      failTest(testCase.name, error.message);
    } finally {
      await page.close();
    }
  }
}
