import { expect } from "../dist/index.js";
import { browser } from "k6/browser";
import { passTest } from "./testing.js";
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
    name: "toBeChecked",
    selector: "#toBeCheckedCheckbox",
    assertion: async (locator) => {
      // Set up a delayed click that will happen after 1 second
      setTimeout(async () => {
        await locator.click();
      }, 1000);
      await expect(locator).toBeChecked({ timeout: 2000 });
    },
  },
  {
    name: "toBeDisabled",
    selector: "#toBeDisabledInput",
    assertion: async (locator) => {
      await expect(locator).toBeDisabled();
    },
  },
  {
    name: "toBeEditable",
    selector: "#toBeEditableInput",
    assertion: async (locator) => {
      await expect(locator).toBeEditable();
    },
  },
  {
    name: "toBeEnabled",
    selector: "#toBeEnabledInput",
    assertion: async (locator) => {
      await expect(locator).toBeEnabled();
    },
  },
  {
    name: "toBeHidden",
    selector: "#toBeHiddenText",
    assertion: async (locator) => {
      await expect(locator).toBeHidden();
    },
  },
  {
    name: "toBeVisible",
    selector: "#toBeVisibleText",
    assertion: async (locator) => {
      await expect(locator).toBeVisible();
    },
  },
  {
    name: "toHaveValue",
    selector: "#toHaveValueInput",
    assertion: async (locator) => {
      await expect(locator).toHaveValue("test-value");
    },
  },
];

export default async function testExpectRetrying() {
  const context = await browser.newContext();

  for (const testCase of testCases) {
    const page = await context.newPage();
    try {
      await page.goto("http://localhost:8000");
      const locator = page.locator(testCase.selector);
      await testCase.assertion(locator);
      passTest(testCase.name);
    } finally {
      await page.close();
    }
  }
}
