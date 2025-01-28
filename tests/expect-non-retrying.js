import { expect } from "../dist/index.js";
import { createMockAssertFn, failTest, passTest } from "./testing.js";

export default function testExpectNonRetrying() {
  TEST_CASES.forEach(runTest);
  testToBeInstanceOf();
}

const TEST_CASES = [
  {
    name: "toBe",
    matcher: "toBe",
    value: true,
    arg: true,
    expectedCondition: true,
  },
  {
    name: "toBeCloseTo",
    matcher: "toBeCloseTo",
    value: 10,
    arg: [9.9, 0.1],
    expectedCondition: true,
  },
  {
    name: "toBeCloseTo",
    matcher: "toBeCloseTo",
    value: 10,
    arg: [11, 1],
    expectedCondition: true,
  },
  {
    name: "toBeDefined",
    matcher: "toBeDefined",
    value: 10,
    expectedCondition: true,
  },
  {
    name: "toBeFalsy",
    matcher: "toBeFalsy",
    value: false,
    expectedCondition: true,
  },
  {
    name: "toBeGreaterThan",
    matcher: "toBeGreaterThan",
    value: 2,
    arg: 1,
    expectedCondition: true,
  },
  {
    name: "toBeGreaterThanOrEqual",
    matcher: "toBeGreaterThanOrEqual",
    value: 2,
    arg: 1,
    expectedCondition: true,
  },
  {
    name: "toBeLessThan",
    matcher: "toBeLessThan",
    value: 1,
    arg: 2,
    expectedCondition: true,
  },
  {
    name: "toBeLessThanOrEqual",
    matcher: "toBeLessThanOrEqual",
    value: 1,
    arg: 2,
    expectedCondition: true,
  },
  {
    name: "toBeNaN",
    matcher: "toBeNaN",
    value: NaN,
    expectedCondition: true,
  },
  {
    name: "toBeNull",
    matcher: "toBeNull",
    value: null,
    expectedCondition: true,
  },
  {
    name: "toBeTruthy",
    matcher: "toBeTruthy",
    value: true,
    expectedCondition: true,
  },
  {
    name: "toBeUndefined",
    matcher: "toBeUndefined",
    value: undefined,
    expectedCondition: true,
  },
  {
    name: "toEqual",
    matcher: "toEqual",
    value: { a: 1 },
    arg: { a: 1 },
    expectedCondition: true,
  },
  {
    name: "toHaveLength",
    matcher: "toHaveLength",
    value: [1, 2, 3],
    arg: 3,
    expectedCondition: true,
  },
];

function runTest(testCase) {
  const mockAssertFn = createMockAssertFn();
  const testExpect = expect.configure({ assertFn: mockAssertFn });

  // Dynamically call the matcher with appropriate arguments
  if (Array.isArray(testCase.arg)) {
    testExpect(testCase.value)[testCase.matcher](...testCase.arg);
  } else {
    testExpect(testCase.value)[testCase.matcher](testCase.arg);
  }

  // Verify the mock assertions
  if (!mockAssertFn.called) {
    failTest(testCase.name, "expected assertFn to be called");
  }

  if (mockAssertFn.calls.length !== 1) {
    failTest(testCase.name, "expected assertFn to be called once");
  }

  if (mockAssertFn.calls[0].condition !== testCase.expectedCondition) {
    failTest(
      testCase.name,
      `expected assertFn condition to be ${testCase.expectedCondition}`,
    );
  }

  if (mockAssertFn.calls[0].soft !== false) {
    failTest(
      testCase.name,
      "expected assertFn to be called with soft === false",
    );
  }

  passTest(testCase.name);
}

class Example {}
function testToBeInstanceOf() {
  const mockAssertFn = createMockAssertFn();
  const testExpect = expect.configure({ assertFn: mockAssertFn });

  testExpect(new Example()).toBeInstanceOf(Example);

  if (!mockAssertFn.called) {
    failTest("toBeInstanceOf", "expected assertFn to be called");
  }

  if (mockAssertFn.calls.length !== 1) {
    failTest("toBeInstanceOf", "expected assertFn to be called once");
  }

  if (mockAssertFn.calls[0].condition !== true) {
    failTest("toBeInstanceOf", "expected assertFn condition to be true");
  }

  if (mockAssertFn.calls[0].soft !== false) {
    failTest(
      "toBeInstanceOf",
      "expected assertFn to be called with soft === false",
    );
  }

  passTest("toBeInstanceOf");
}
