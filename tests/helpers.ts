import { colorize, expect as globalExpect } from "../dist/index.js";

export const expect = globalExpect.configure({
  soft: true,
});

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
