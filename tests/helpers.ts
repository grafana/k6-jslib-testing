import { browser } from "k6/browser";
import { colorize, expect as globalExpect, test } from "../dist/index.js";

export const expect = globalExpect.configure({
  soft: true,
});

/**
 * Extend the base test with helpers for browser testing.
 */
const { describe, it } = test.extend({
  defaultOptions: {},

  mergeOptions: (baseOptions) => baseOptions,

  createContext: async () => {
    const browserContext = await browser.newContext();
    const page = await browserContext.newPage();

    return {
      context: {
        page,
      },
      async dispose() {
        await page.close();
        await browserContext.close();
      },
    };
  },
});

export { describe, it };

/**
 * Render an element into the body of the given page.
 */
export function renderElement(page, tagName, attrs) {
  return page.evaluate(([tagName, attrs]) => {
    const el = document.createElement(tagName);

    Object.entries(attrs).forEach(([name, value]) => {
      el.setAttribute(name, value);
    });

    document.body.appendChild(el);
  }, [tagName, attrs]);
}

export function makeExpectWithSpy() {
  const result = {
    passed: true,
    message: null,
  };

  const expectFn = expect.configure({
    colorize: false,
    assertFn(condition, message) {
      result.passed = condition;

      // Remove
      result.message = message.replace(/At: .*$/mg, "At: ...").replace(
        /Line: \d+$/mg,
        "Line: ...",
      );
    },
  });

  return [result, expectFn] as const;
}

export function failTest(testName: string, message: string) {
  class TestFailureError extends Error {
    testName: string;
    failureMessage: string;

    constructor(testName: string, message: string) {
      super(colorize(`✗ ${testName}: ${message}`, "red"));
      this.name = "TestFailureError";
      this.testName = testName;
      this.failureMessage = message;
    }
  }

  throw new TestFailureError(testName, message);
}

export function passTest(testName: string) {
  console.log(colorize(`✓ ${testName}`, "green"));
}

interface MockedAssertCall {
  condition: boolean;
  message: string;
  soft: boolean;
}

export function createMockAssertFn() {
  const mockFn = function (condition: boolean, message: string, soft = false) {
    mockFn.called = true;
    mockFn.calls.push({
      condition,
      message, // TODO (@oleiade, optional): test for message
      soft,
    });
  };

  // Initialize state
  mockFn.called = false;
  mockFn.calls = [] as MockedAssertCall[];

  return mockFn;
}
