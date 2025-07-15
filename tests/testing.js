import { colorize, expect as globalExpect } from "../dist/index.js";

export const expect = globalExpect.configure({
  soft: true,
});

const context = [];

export const testItems = [];

export function describe(name, fn) {
  context.push(name);

  fn();

  context.pop();
}

export function it(name, fn) {
  testItems.push({
    name: [...context, name].join(" > "),
    assertion: fn,
  });
}

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

  return [result, expectFn];
}

export function failTest(testName, message) {
  class TestFailureError extends Error {
    constructor(testName, message) {
      super(colorize(`✗ ${testName}: ${message}`, "red"));
      this.name = "TestFailureError";
      this.testName = testName;
      this.failureMessage = message;
    }
  }

  throw new TestFailureError(testName, message);
}

export function passTest(testName) {
  console.log(colorize(`✓ ${testName}`, "green"));
}

export function createMockAssertFn() {
  const mockFn = function (condition, message, soft = false) {
    mockFn.called = true;
    mockFn.calls.push({
      condition,
      message, // TODO (@oleiade, optional): test for message
      soft,
    });
  };

  // Initialize state
  mockFn.called = false;
  mockFn.calls = [];

  return mockFn;
}
