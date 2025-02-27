import { expect } from "../dist/index.js";
import { browser } from "k6/browser";
import { failTest, passTest } from "./testing.js";
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

// First run the standard tests
const standardTestCases = [
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

// Then run the negation tests
const negationTestCases = [
  {
    name: "not.toBeChecked",
    selector: "#notToBeCheckedCheckbox",
    assertion: async (locator) => {
      // This checkbox should remain unchecked
      await expect(locator).not.toBeChecked({ timeout: 1000 });
    },
  },
  {
    name: "not.toBeDisabled",
    selector: "#toBeEnabledInput",
    assertion: async (locator) => {
      await expect(locator).not.toBeDisabled();
    },
  },
  {
    name: "not.toBeEditable",
    selector: "#toBeDisabledInput",
    assertion: async (locator) => {
      await expect(locator).not.toBeEditable();
    },
  },
  {
    name: "not.toBeEnabled",
    selector: "#toBeDisabledInput",
    assertion: async (locator) => {
      await expect(locator).not.toBeEnabled();
    },
  },
  {
    name: "not.toBeHidden",
    selector: "#toBeVisibleText",
    assertion: async (locator) => {
      await expect(locator).not.toBeHidden();
    },
  },
  {
    name: "not.toBeVisible",
    selector: "#toBeHiddenText",
    assertion: async (locator) => {
      await expect(locator).not.toBeVisible();
    },
  },
  {
    name: "not.toHaveValue",
    selector: "#toHaveValueInput",
    assertion: async (locator) => {
      await expect(locator).not.toHaveValue("wrong-value");
    },
  },
];

export default async function testExpectRetrying() {
  const context = await browser.newContext();

  // First run standard tests
  for (const testCase of standardTestCases) {
    const page = await context.newPage();
    try {
      await page.goto("http://localhost:8000");
      const locator = page.locator(testCase.selector);
      await testCase.assertion(locator);
      passTest(testCase.name);
    } catch (error) {
      console.error(`Test case "${testCase.name}" failed: ${error.message}`);
      failTest(testCase.name, error.message);
    } finally {
      await page.close();
    }
  }

  // Then run negation tests
  for (const testCase of negationTestCases) {
    const page = await context.newPage();
    try {
      await page.goto("http://localhost:8000");
      const locator = page.locator(testCase.selector);
      await testCase.assertion(locator);
      passTest(testCase.name);
    } catch (error) {
      console.error(`Test case "${testCase.name}" failed: ${error.message}`);
      failTest(testCase.name, error.message);
    } finally {
      await page.close();
    }
  }
}
