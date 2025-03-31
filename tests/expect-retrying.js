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
  {
    suite: "toHaveText",
    children: [
      {
        name: "string",
        selector: "#toHaveText",
        assertion: async (locator) => {
          await expect(locator).toHaveText(
            "Some text with elements, new lines and whitespaces",
          );
        },
      },
      {
        name: "string must be exact match",
        selector: "#toHaveText",
        assertion: async (locator) => {
          await expect(locator).not.toHaveText(
            "text with elements, new lines and",
          );
        },
      },
      {
        name: "regexp",
        selector: "#toHaveText",
        assertion: async (locator) => {
          await expect(locator).toHaveText(
            /Some(.*)\n\s+new lines and(\s+)whitespaces/i,
          );
        },
      },
      {
        suite: "useInnerText",
        children: [
          {
            name: "string",
            selector: "#toHaveText",
            assertion: async (locator) => {
              await expect(locator).toHaveText(
                "Some text with elements, new lines and whitespaces",
                { useInnerText: true },
              );
            },
          },
          {
            name: "regexp",
            selector: "#toHaveText",
            assertion: async (locator) => {
              await expect(locator).toHaveText(
                /Some(.*)\s+new lines and(\s+)whitespaces/i,
                { useInnerText: true },
              );
            },
          },
        ],
      },
      {
        suite: "ignoreCase",
        children: [
          {
            name: "string",
            selector: "#toHaveText",
            assertion: async (locator) => {
              await expect(locator).toHaveText(
                "SOmE TEXt wITH ELEmENTS, NEW LIneS AND WHItesPACES",
                { ignoreCase: true },
              );
            },
          },
          {
            name: "removes 'i' from regexp",
            selector: "#toHaveText",
            assertion: async (locator) => {
              await expect(locator).not.toHaveText(
                /some(.*)\s+new lines and(\s+)whitespaces/i,
                { ignoreCase: false },
              );
            },
          },
          {
            name: "adds 'i' to regexp",
            selector: "#toHaveText",
            assertion: async (locator) => {
              await expect(locator).toHaveText(
                /some(.*)\s+new lines and(\s+)whitespaces/,
                { ignoreCase: true },
              );
            },
          },
        ],
      },
    ],
  },
  {
    suite: "toContainText",
    children: [
      {
        name: "string",
        selector: "#toContainText",
        assertion: async (locator) => {
          await expect(locator).toContainText(
            "elements, new lines",
          );
        },
      },
      {
        name: "regexp",
        selector: "#toContainText",
        assertion: async (locator) => {
          await expect(locator).toContainText(
            /Some(.*)\n\s+new lines and(\s+)whitespaces/i,
          );
        },
      },
      {
        suite: "useInnerText",
        children: [
          {
            name: "string",
            selector: "#toContainText",
            assertion: async (locator) => {
              await expect(locator).toContainText(
                "elements, new lines",
                { useInnerText: true },
              );
            },
          },
          {
            name: "regexp",
            selector: "#toContainText",
            assertion: async (locator) => {
              await expect(locator).toContainText(
                /Some(.*)\s+new lines and(\s+)whitespaces/i,
                { useInnerText: true },
              );
            },
          },
        ],
      },
      {
        suite: "ignoreCase",
        children: [
          {
            name: "string",
            selector: "#toContainText",
            assertion: async (locator) => {
              await expect(locator).toContainText(
                "NEW LIneS AND WHItesPACES",
                { ignoreCase: true },
              );
            },
          },
          {
            name: "removes 'i' from regexp",
            selector: "#toContainText",
            assertion: async (locator) => {
              await expect(locator).not.toContainText(
                /some(.*)\s+new lines and(\s+)whitespaces/i,
                { ignoreCase: false },
              );
            },
          },
          {
            name: "adds 'i' to regexp",
            selector: "#toContainText",
            assertion: async (locator) => {
              await expect(locator).toContainText(
                /some(.*)\s+new lines and(\s+)whitespaces/,
                { ignoreCase: true },
              );
            },
          },
        ],
      },
    ],
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
    name: "not.toHaveText",
    selector: "#toHaveText",
    assertion: async (locator) => {
      await expect(locator).not.toHaveText("This is not at all what it says!");
    },
  },
  {
    name: "not.toContainText",
    selector: "#toContainText",
    assertion: async (locator) => {
      await expect(locator).not.toContainText(
        "This is not at all what it says!",
      );
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

function flattenSuites(tests) {
  return tests.flatMap((testOrSuite) => {
    if (testOrSuite.suite !== undefined) {
      return flattenSuites(testOrSuite.children).map((child) => ({
        ...child,
        name: `${testOrSuite.suite} > ${child.name}`,
      }));
    }

    return testOrSuite;
  });
}

export default async function testExpectRetrying() {
  const context = await browser.newContext();

  // First run standard tests
  for (const testCase of flattenSuites(standardTestCases)) {
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
  for (const testCase of flattenSuites(negationTestCases)) {
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
