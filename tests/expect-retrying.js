import "./expectations/toHaveAttribute.js";

import { browser } from "k6/browser";
import { expect, failTest, passTest, testItems } from "./testing.js";

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
    suite: "toBeEmpty",
    children: [
      {
        name: "input element",
        selector: "#toBeEmptyInput",
        assertion: async (locator) => {
          await expect(locator).toBeEmpty();
        },
      },
      {
        name: "non-input element",
        selector: "#toBeEmptyText",
        assertion: async (locator) => {
          await expect(locator).toBeEmpty();
        },
      },
    ],
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
            pass: false,
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
    suite: "toHaveTitle",
    children: [
      {
        name: "string",
        assertion: async ({ page }) => {
          await expect(page).toHaveTitle(
            "K6 Browser Test Page",
          );
        },
      },
      {
        name: "regexp",
        assertion: async ({ page }) => {
          await expect(page).toHaveTitle(
            /K6 Browser Test Page/i,
          );
        },
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
          await expect(locator).toContainText("elements, new lines");
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
              await expect(locator).toContainText("elements, new lines", {
                useInnerText: true,
              });
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
              await expect(locator).toContainText("NEW LIneS AND WHItesPACES", {
                ignoreCase: true,
              });
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
            pass: false,
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
    suite: "not.toBeEmpty",
    children: [
      {
        name: "input element",
        selector: "#notToBeEmptyInput",
        assertion: async (locator) => {
          await expect(locator).not.toBeEmpty();
        },
      },
      {
        name: "non-input element",
        selector: "#notToBeEmptyText",
        assertion: async (locator) => {
          await expect(locator).not.toBeEmpty();
        },
      },
    ],
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
    name: "not.toHaveTitle",
    assertion: async ({ page }) => {
      await expect(page).not.toHaveTitle("Hello World");
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
  const baseUrl = __ENV.TEST_SERVER_BASE_URL ?? "http://localhost:8000";
  const context = await browser.newContext();

  const testCases = [...testItems, ...standardTestCases];

  // First run standard tests
  for (const testCase of flattenSuites(testCases)) {
    const page = await context.newPage();
    try {
      await page.goto(baseUrl);

      if (testCase.selector) {
        const locator = page.locator(testCase.selector);
        await testCase.assertion(locator);
      } else {
        await testCase.assertion({ page });
      }

      if (testCase.pass === false) {
        failTest(testCase.name, "Expected test to fail but it passed");

        continue;
      }

      passTest(testCase.name);
    } catch (error) {
      if (testCase.pass === false) {
        passTest(testCase.name);

        continue;
      }

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
      await page.goto(baseUrl);

      if (testCase.selector) {
        const locator = page.locator(testCase.selector);
        await testCase.assertion(locator);
      } else {
        await testCase.assertion({ page });
      }

      passTest(testCase.name);
    } catch (error) {
      console.error(`Test case "${testCase.name}" failed: ${error.message}`);
      failTest(testCase.name, error.message);
    } finally {
      await page.close();
    }
  }
}
