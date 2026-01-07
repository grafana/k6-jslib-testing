import type { Page } from "k6/browser";

// @ts-types="../dist/index.d.ts"
import { colorize, expect as globalExpect } from "../dist/index.js";

export const expect = globalExpect.configure({
  soft: true,
});

const context: string[] = [];

interface Context {
  page: Page;
}

interface TestItem {
  name: string;
  assertion: (context: Context) => Promise<void> | void;
}

export const testItems: TestItem[] = [];

export function describe(name: string, fn: () => void) {
  context.push(name);

  fn();

  context.pop();
}

export function it(
  name: string,
  fn: (context: Context) => Promise<void> | void,
) {
  testItems.push({
    name: [...context, name].join(" > "),
    assertion: fn,
  });
}

/**
 * Render an element into the body of the given page.
 */
export function renderElement(
  page: Page,
  tagName: keyof HTMLElementTagNameMap,
  attrs: Record<string, string>,
) {
  return page.evaluate(([tagName, attrs]) => {
    const el = document.createElement(tagName);

    Object.entries(attrs).forEach(([name, value]) => {
      el.setAttribute(name, value);
    });

    document.body.appendChild(el);
  }, [tagName, attrs] as const);
}

interface ExpectWithSpyResult {
  passed: boolean;
  message: string | null;
}

export function makeExpectWithSpy() {
  const result: ExpectWithSpyResult = {
    passed: true,
    message: null,
  };

  const expectFn = expect.configure({
    colorize: false,
    assertFn(condition: boolean, message: string) {
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
  mockFn.calls = [] as Array<{
    condition: boolean;
    message: string;
    soft: boolean;
  }>;

  return mockFn;
}
