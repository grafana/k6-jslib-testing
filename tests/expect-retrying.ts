import "./expectations/toHaveAttribute.ts";

import {
  browser,
  type BrowserContext,
  type Locator,
  type Page,
} from "k6/browser";
import { expect, testItems } from "./testing.ts";
import { dedent, trimEmptyLines } from "./utils.ts";
import type { ExpectFunction } from "../expect.ts";
import execution from "k6/execution";
import { colorize } from "../colors.ts";

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

interface Context {
  expect: ExpectFunction;
  page: Page;
}

interface LocatorTestCase {
  name: string;
  suite?: undefined;
  selector: string;
  expectedError?: string;
  assertion: (context: Context & { locator: Locator }) => Promise<void> | void;
}

interface PageTestCase {
  name: string;
  suite?: undefined;
  selector?: undefined;
  expectedError?: string;
  assertion: (context: Context) => Promise<void> | void;
}

interface TestSuite {
  name?: undefined;
  suite: string;
  selector?: undefined;
  assertion?: undefined;
  children: Array<TestCase>;
}

type TestCase = LocatorTestCase | PageTestCase | TestSuite;

// First run the standard tests
const standardTestCases: TestCase[] = [
  {
    name: "toBeChecked (pass)",
    selector: "#toBeCheckedCheckbox",
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeChecked({ timeout: 2000 });
    },
  },
  {
    name: "toBeChecked (fail)",
    selector: "#notToBeCheckedCheckbox",
    expectedError: dedent`
         Error: expect(locator).toBeChecked()
            At: ...

      Expected: checked
      Received: unchecked
      Call log: 
        - expect.toBeChecked with timeout 1000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeChecked({ timeout: 1000 });
    },
  },
  {
    name: "toBeDisabled (pass)",
    selector: "#toBeDisabledInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeDisabled();
    },
  },
  {
    name: "toBeDisabled (fail)",
    selector: "#toBeEnabledInput",
    expectedError: dedent`
         Error: expect(locator).toBeDisabled()
            At: ...

      Expected: disabled
      Received: enabled
      Call log: 
        - expect.toBeDisabled with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeDisabled();
    },
  },
  {
    name: "toBeEditable (pass)",
    selector: "#toBeEditableInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeEditable();
    },
  },
  {
    name: "toBeEditable (fail)",
    selector: "#toBeDisabledInput",
    expectedError: dedent`
         Error: expect(locator).toBeEditable()
            At: ...

      Expected: editable
      Received: uneditable
      Call log: 
        - expect.toBeEditable with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeEditable();
    },
  },
  {
    suite: "toBeEmpty",
    children: [
      {
        name: "input element (pass)",
        selector: "#toBeEmptyInput",
        assertion: async ({ expect, locator }) => {
          await expect(locator).toBeEmpty();
        },
      },
      {
        name: "input element (fail)",
        selector: "#notToBeEmptyInput",

        expectedError: dedent`
             Error: expect(locator).toBeEmpty()
                At: ...

          Expected: empty
          Received: not empty
          Call log: 
            - expect.toBeEmpty with timeout 5000ms
            - waiting for locator

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).toBeEmpty();
        },
      },
      {
        name: "non-input element (pass)",
        selector: "#toBeEmptyText",
        assertion: async ({ expect, locator }) => {
          await expect(locator).toBeEmpty();
        },
      },
      {
        name: "non-input element (fail)",
        selector: "#notToBeEmptyText",

        expectedError: dedent`
             Error: expect(locator).toBeEmpty()
                At: ...

          Expected: empty
          Received: not empty
          Call log: 
            - expect.toBeEmpty with timeout 5000ms
            - waiting for locator

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).toBeEmpty();
        },
      },
    ],
  },
  {
    name: "toBeEnabled (pass)",
    selector: "#toBeEnabledInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeEnabled();
    },
  },
  {
    name: "toBeEnabled (fail)",
    selector: "#toBeDisabledInput",
    expectedError: dedent`
         Error: expect(locator).toBeEnabled()
            At: ...

      Expected: enabled
      Received: disabled
      Call log: 
        - expect.toBeEnabled with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeEnabled();
    },
  },
  {
    name: "toBeHidden (pass)",
    selector: "#toBeHiddenText",
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeHidden();
    },
  },
  {
    name: "toBeHidden (fail)",
    selector: "#toBeVisibleText",
    expectedError: dedent`
         Error: expect(locator).toBeHidden()
            At: ...

      Expected: hidden
      Received: visible
      Call log: 
        - expect.toBeHidden with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeHidden();
    },
  },
  {
    name: "toBeVisible (pass)",
    selector: "#toBeVisibleText",
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeVisible();
    },
  },
  {
    name: "toBeVisible (fail)",
    selector: "#toBeHiddenText",
    expectedError: dedent`
         Error: expect(locator).toBeVisible()
            At: ...

      Expected: visible
      Received: hidden
      Call log: 
        - expect.toBeVisible with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).toBeVisible();
    },
  },
  {
    name: "toHaveValue (pass)",
    selector: "#toHaveValueInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).toHaveValue("test-value");
    },
  },
  {
    name: "toHaveValue (fail)",
    selector: "#toHaveValueInput",
    expectedError: dedent`
         Error: expect(received).toHaveValue(expected)
            At: ...

      Expected: wrong-value
      Received: unknown
      Call log: 
        - expect.toHaveValue with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).toHaveValue("wrong-value");
    },
  },
  {
    suite: "toHaveText",
    children: [
      {
        name: "string (pass)",
        selector: "#toHaveText",
        assertion: async ({ expect, locator }) => {
          await expect(locator).toHaveText(
            "Some text with elements, new lines and whitespaces",
          );
        },
      },
      {
        name: "string (fail)",
        selector: "#toHaveText",

        expectedError: dedent`
             Error: expect(received).toHaveText(expected)
                At: ...

          Expected: Wrong text
          Received: unknown

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).toHaveText("Wrong text");
        },
      },
      {
        name: "string must be exact match (pass)",
        selector: "#toHaveText",
        assertion: async ({ expect, locator }) => {
          await expect(locator).not.toHaveText(
            "text with elements, new lines and",
          );
        },
      },
      {
        name: "string must be exact match (fail)",
        selector: "#toHaveText",

        expectedError: dedent`
             Error: expect(received).toHaveText(expected)
                At: ...

          Expected: Some text with elements, new lines and whitespaces
          Received: unknown

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).not.toHaveText(
            "Some text with elements, new lines and whitespaces",
          );
        },
      },
      {
        name: "regexp (pass)",
        selector: "#toHaveText",
        assertion: async ({ expect, locator }) => {
          await expect(locator).toHaveText(
            /Some(.*)\n\s+new lines and(\s+)whitespaces/i,
          );
        },
      },
      {
        name: "regexp (fail)",
        selector: "#toHaveText",

        expectedError: dedent`
             Error: expect(received).toHaveText(expected)
                At: ...

          Expected: /does not match/i
          Received: unknown

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).toHaveText(/does not match/i);
        },
      },
      {
        suite: "useInnerText",
        children: [
          {
            name: "string (pass)",
            selector: "#toHaveText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText(
                "Some text with elements, new lines and whitespaces",
                { useInnerText: true },
              );
            },
          },
          {
            name: "string (fail)",
            selector: "#toHaveText",

            expectedError: dedent`
                 Error: expect(received).toHaveText(expected)
                    At: ...

              Expected: Wrong text
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText("Wrong text", {
                useInnerText: true,
              });
            },
          },
          {
            name: "regexp (pass)",
            selector: "#toHaveText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText(
                /Some(.*)\s+new lines and(\s+)whitespaces/i,
                { useInnerText: true },
              );
            },
          },
          {
            name: "regexp (fail)",
            selector: "#toHaveText",

            expectedError: dedent`
                 Error: expect(received).toHaveText(expected)
                    At: ...

              Expected: /does not match/i
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText(/does not match/i, {
                useInnerText: true,
              });
            },
          },
        ],
      },
      {
        suite: "ignoreCase",
        children: [
          {
            name: "string (pass)",
            selector: "#toHaveText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText(
                "SOmE TEXt wITH ELEmENTS, NEW LIneS AND WHItesPACES",
                { ignoreCase: true },
              );
            },
          },
          {
            name: "string (fail)",
            selector: "#toHaveText",

            expectedError: dedent`
                 Error: expect(received).toHaveText(expected)
                    At: ...

              Expected: WRONG TEXT
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText("WRONG TEXT", {
                ignoreCase: true,
              });
            },
          },
          {
            name: "removes 'i' from regexp (pass)",
            selector: "#toHaveText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).not.toHaveText(
                /some(.*)\s+new lines and(\s+)whitespaces/i,
                { ignoreCase: false },
              );
            },
          },
          {
            name: "removes 'i' from regexp (fail)",
            selector: "#toHaveText",

            expectedError: dedent`
                 Error: expect(received).toHaveText(expected)
                    At: ...

              Expected: /Some(.*)/
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).not.toHaveText(
                /Some(.*)/,
                { ignoreCase: false },
              );
            },
          },
          {
            name: "adds 'i' to regexp (pass)",
            selector: "#toHaveText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText(
                /some(.*)\s+new lines and(\s+)whitespaces/,
                { ignoreCase: true },
              );
            },
          },
          {
            name: "adds 'i' to regexp (fail)",
            selector: "#toHaveText",

            expectedError: dedent`
                 Error: expect(received).toHaveText(expected)
                    At: ...

              Expected: /does not match/
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toHaveText(
                /does not match/,
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
        name: "string (pass)",
        assertion: async ({ expect, page }) => {
          await expect(page).toHaveTitle(
            "K6 Browser Test Page",
          );
        },
      },
      {
        name: "string (fail)",

        expectedError: dedent`
             Error: expect(received).pageExpectedReceived(expected)
                At: ...

          Expected: Wrong Title
          Received: unknown
          Call log: 
            - expect.toHaveTitle
            - waiting for page

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, page }) => {
          await expect(page).toHaveTitle("Wrong Title");
        },
      },
      {
        name: "regexp (pass)",
        assertion: async ({ expect, page }) => {
          await expect(page).toHaveTitle(
            /K6 Browser Test Page/i,
          );
        },
      },
      {
        name: "regexp (fail)",

        expectedError: dedent`
             Error: expect(received).pageExpectedReceived(expected)
                At: ...

          Expected: /Wrong Title/i
          Received: unknown
          Call log: 
            - expect.toHaveTitle
            - waiting for page

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, page }) => {
          await expect(page).toHaveTitle(/Wrong Title/i);
        },
      },
    ],
  },
  {
    suite: "toContainText",
    children: [
      {
        name: "string (pass)",
        selector: "#toContainText",
        assertion: async ({ expect, locator }) => {
          await expect(locator).toContainText("elements, new lines");
        },
      },
      {
        name: "string (fail)",
        selector: "#toContainText",

        expectedError: dedent`
             Error: expect(received).toContainText(expected)
                At: ...

          Expected: does not exist
          Received: unknown

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).toContainText("does not exist");
        },
      },
      {
        name: "regexp (pass)",
        selector: "#toContainText",
        assertion: async ({ expect, locator }) => {
          await expect(locator).toContainText(
            /Some(.*)\n\s+new lines and(\s+)whitespaces/i,
          );
        },
      },
      {
        name: "regexp (fail)",
        selector: "#toContainText",

        expectedError: dedent`
             Error: expect(received).toContainText(expected)
                At: ...

          Expected: /does not match/i
          Received: unknown

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).toContainText(/does not match/i);
        },
      },
      {
        suite: "useInnerText",
        children: [
          {
            name: "string (pass)",
            selector: "#toContainText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText("elements, new lines", {
                useInnerText: true,
              });
            },
          },
          {
            name: "string (fail)",
            selector: "#toContainText",

            expectedError: dedent`
                 Error: expect(received).toContainText(expected)
                    At: ...

              Expected: does not exist
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText("does not exist", {
                useInnerText: true,
              });
            },
          },
          {
            name: "regexp (pass)",
            selector: "#toContainText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText(
                /Some(.*)\s+new lines and(\s+)whitespaces/i,
                { useInnerText: true },
              );
            },
          },
          {
            name: "regexp (fail)",
            selector: "#toContainText",

            expectedError: dedent`
                 Error: expect(received).toContainText(expected)
                    At: ...

              Expected: /does not match/i
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText(/does not match/i, {
                useInnerText: true,
              });
            },
          },
        ],
      },
      {
        suite: "ignoreCase",
        children: [
          {
            name: "string (pass)",
            selector: "#toContainText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText("NEW LIneS AND WHItesPACES", {
                ignoreCase: true,
              });
            },
          },
          {
            name: "string (fail)",
            selector: "#toContainText",

            expectedError: dedent`
                 Error: expect(received).toContainText(expected)
                    At: ...

              Expected: DOES NOT EXIST
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText("DOES NOT EXIST", {
                ignoreCase: true,
              });
            },
          },
          {
            name: "removes 'i' from regexp (pass)",
            selector: "#toContainText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).not.toContainText(
                /some(.*)\s+new lines and(\s+)whitespaces/i,
                { ignoreCase: false },
              );
            },
          },
          {
            name: "removes 'i' from regexp (fail)",
            selector: "#toContainText",

            expectedError: dedent`
                 Error: expect(received).toContainText(expected)
                    At: ...

              Expected: /Some(.*)/
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).not.toContainText(
                /Some(.*)/,
                { ignoreCase: false },
              );
            },
          },
          {
            name: "adds 'i' to regexp (pass)",
            selector: "#toContainText",
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText(
                /some(.*)\s+new lines and(\s+)whitespaces/,
                { ignoreCase: true },
              );
            },
          },
          {
            name: "adds 'i' to regexp (fail)",
            selector: "#toContainText",

            expectedError: dedent`
                 Error: expect(received).toContainText(expected)
                    At: ...

              Expected: /does not match/
              Received: unknown

              Filename: expect-retrying.ts
                  Line: ...
            `,
            assertion: async ({ expect, locator }) => {
              await expect(locator).toContainText(
                /does not match/,
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
const negationTestCases: TestCase[] = [
  {
    name: "not.toBeChecked (pass)",
    selector: "#notToBeCheckedCheckbox",
    assertion: async ({ expect, locator }) => {
      // This checkbox should remain unchecked
      await expect(locator).not.toBeChecked({ timeout: 1000 });
    },
  },
  {
    name: "not.toBeChecked (fail)",
    selector: "#toBeCheckedCheckbox",
    expectedError: dedent`
         Error: expect(locator).toBeChecked()
            At: ...

      Expected: checked
      Received: unchecked
      Call log: 
        - expect.toBeChecked with timeout 1000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeChecked({ timeout: 1000 });
    },
  },
  {
    name: "not.toBeDisabled (pass)",
    selector: "#toBeEnabledInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeDisabled();
    },
  },
  {
    name: "not.toBeDisabled (fail)",
    selector: "#toBeDisabledInput",
    expectedError: dedent`
         Error: expect(locator).toBeDisabled()
            At: ...

      Expected: disabled
      Received: enabled
      Call log: 
        - expect.toBeDisabled with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeDisabled();
    },
  },
  {
    name: "not.toBeEditable (pass)",
    selector: "#toBeDisabledInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeEditable();
    },
  },
  {
    name: "not.toBeEditable (fail)",
    selector: "#toBeEditableInput",
    expectedError: dedent`
         Error: expect(locator).toBeEditable()
            At: ...

      Expected: editable
      Received: uneditable
      Call log: 
        - expect.toBeEditable with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeEditable();
    },
  },
  {
    suite: "not.toBeEmpty",
    children: [
      {
        name: "input element (pass)",
        selector: "#notToBeEmptyInput",
        assertion: async ({ expect, locator }) => {
          await expect(locator).not.toBeEmpty();
        },
      },
      {
        name: "input element (fail)",
        selector: "#toBeEmptyInput",

        expectedError: dedent`
             Error: expect(locator).toBeEmpty()
                At: ...

          Expected: empty
          Received: not empty
          Call log: 
            - expect.toBeEmpty with timeout 5000ms
            - waiting for locator

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).not.toBeEmpty();
        },
      },
      {
        name: "non-input element (pass)",
        selector: "#notToBeEmptyText",
        assertion: async ({ expect, locator }) => {
          await expect(locator).not.toBeEmpty();
        },
      },
      {
        name: "non-input element (fail)",
        selector: "#toBeEmptyText",
        expectedError: dedent`
             Error: expect(locator).toBeEmpty()
                At: ...

          Expected: empty
          Received: not empty
          Call log: 
            - expect.toBeEmpty with timeout 5000ms
            - waiting for locator

          Filename: expect-retrying.ts
              Line: ...
        `,
        assertion: async ({ expect, locator }) => {
          await expect(locator).not.toBeEmpty();
        },
      },
    ],
  },
  {
    name: "not.toBeEnabled (pass)",
    selector: "#toBeDisabledInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeEnabled();
    },
  },
  {
    name: "not.toBeEnabled (fail)",
    selector: "#toBeEnabledInput",
    expectedError: dedent`
         Error: expect(locator).toBeEnabled()
            At: ...

      Expected: enabled
      Received: disabled
      Call log: 
        - expect.toBeEnabled with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeEnabled();
    },
  },
  {
    name: "not.toBeHidden (pass)",
    selector: "#toBeVisibleText",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeHidden();
    },
  },
  {
    name: "not.toBeHidden (fail)",
    selector: "#toBeHiddenText",
    expectedError: dedent`
         Error: expect(locator).toBeHidden()
            At: ...

      Expected: hidden
      Received: visible
      Call log: 
        - expect.toBeHidden with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeHidden();
    },
  },
  {
    name: "not.toBeVisible (pass)",
    selector: "#toBeHiddenText",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeVisible();
    },
  },
  {
    name: "not.toBeVisible (fail)",
    selector: "#toBeVisibleText",
    expectedError: dedent`
         Error: expect(locator).toBeVisible()
            At: ...

      Expected: visible
      Received: hidden
      Call log: 
        - expect.toBeVisible with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toBeVisible();
    },
  },
  {
    name: "not.toHaveText (pass)",
    selector: "#toHaveText",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toHaveText("This is not at all what it says!");
    },
  },
  {
    name: "not.toHaveText (fail)",
    selector: "#toHaveText",
    expectedError: dedent`
         Error: expect(received).toHaveText(expected)
            At: ...

      Expected: Some text with elements, new lines and whitespaces
      Received: unknown

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toHaveText(
        "Some text with elements, new lines and whitespaces",
      );
    },
  },
  {
    name: "not.toHaveTitle (pass)",
    assertion: async ({ expect, page }) => {
      await expect(page).not.toHaveTitle("Hello World");
    },
  },
  {
    name: "not.toHaveTitle (fail)",
    expectedError: dedent`
         Error: expect(received).pageExpectedReceived(expected)
            At: ...

      Expected: K6 Browser Test Page
      Received: unknown
      Call log: 
        - expect.toHaveTitle
        - waiting for page

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, page }) => {
      await expect(page).not.toHaveTitle("K6 Browser Test Page");
    },
  },
  {
    name: "not.toContainText (pass)",
    selector: "#toContainText",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toContainText(
        "This is not at all what it says!",
      );
    },
  },
  {
    name: "not.toContainText (fail)",
    selector: "#toContainText",
    expectedError: dedent`
         Error: expect(received).toContainText(expected)
            At: ...

      Expected: elements, new lines
      Received: unknown

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toContainText("elements, new lines");
    },
  },
  {
    name: "not.toHaveValue (pass)",
    selector: "#toHaveValueInput",
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toHaveValue("wrong-value");
    },
  },
  {
    name: "not.toHaveValue (fail)",
    selector: "#toHaveValueInput",
    expectedError: dedent`
         Error: expect(received).toHaveValue(expected)
            At: ...

      Expected: test-value
      Received: unknown
      Call log: 
        - expect.toHaveValue with timeout 5000ms
        - waiting for locator

      Filename: expect-retrying.ts
          Line: ...
    `,
    assertion: async ({ expect, locator }) => {
      await expect(locator).not.toHaveValue("test-value");
    },
  },
];

function flattenSuites(
  tests: TestCase[],
): Array<LocatorTestCase | PageTestCase> {
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

class AssertionFailed {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

const testExpect = expect.configure({
  colorize: false,
  assertFn: (condition, message) => {
    if (!condition) {
      throw new AssertionFailed(message);
    }
  },
});

function fail(testName: string, message: string) {
  console.log(colorize("✗ " + testName + ":\n" + message + "\n", "red"));

  return false;
}

function pass(testName: string) {
  console.log(colorize("✓ " + testName, "green"));

  return true;
}

export default async function testExpectRetrying() {
  const context = await browser.newContext();

  const testCases = [...testItems, ...standardTestCases, ...negationTestCases];

  const failed: TestCase[] = [];

  for (const testCase of flattenSuites(testCases)) {
    const passed = await runTestCase(context, testCase);

    if (!passed) {
      failed.push(testCase);
    }
  }

  if (failed.length > 0) {
    // @ts-expect-error There seems to be some weird interaction with @types/k6 and the k6 package
    execution.test.fail(`${failed.length}/${testCases.length} tests failed.`);
  }
}

async function runTestCase(
  context: BrowserContext,
  testCase: PageTestCase | LocatorTestCase,
) {
  const page = await context.newPage();

  try {
    const baseUrl = __ENV.TEST_SERVER_BASE_URL ?? "http://localhost:8000";

    await page.goto(baseUrl);

    if (testCase.selector) {
      const locator = page.locator(testCase.selector);
      await testCase.assertion({ expect: testExpect, page, locator });
    }

    if (testCase.selector === undefined) {
      await testCase.assertion({ expect: testExpect, page });
    }

    if (testCase.expectedError) {
      return fail(testCase.name, "Expected test to fail but it passed");
    }

    return pass(testCase.name);
  } catch (error) {
    if (error instanceof AssertionFailed === false) {
      throw error;
    }

    if (testCase.expectedError === undefined) {
      return fail(
        testCase.name,
        "Expected test to pass but it failed with error: \n" + error.message,
      );
    }

    // Optionally verify the error message matches expected
    const normalized = error.message.replace(/At: .*$/mg, "At: ...").replace(
      /Line: \d+$/mg,
      "Line: ...",
    );

    if (trimEmptyLines(normalized) !== trimEmptyLines(testCase.expectedError)) {
      return fail(
        testCase.name,
        `Formatted error message does not match the expected output.\nExpected:\n${testCase.expectedError}\n\nActual:\n${normalized}`,
      );
    }

    return pass(testCase.name);
  } finally {
    await page.close();
  }
}
