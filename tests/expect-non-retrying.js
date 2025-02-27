import { expect } from "../dist/index.js";
import { createMockAssertFn, failTest, passTest } from "./testing.js";

export default function testExpectNonRetrying() {
  TEST_CASES.forEach(runTest);
  testToBeInstanceOf();
  testNegation();
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

function testNegation() {
  // Test cases for negation
  const negationTestCases = [
    {
      name: "not.toBe",
      value: 1,
      arg: 2,
      expectedCondition: true, // 1 is not 2, so this should be true
    },
    {
      name: "not.toEqual",
      value: { a: 1 },
      arg: { a: 2 },
      expectedCondition: true, // Objects are not equal, so this should be true
    },
    {
      name: "not.toBeTruthy",
      value: false,
      expectedCondition: true, // false is not truthy, so this should be true
    },
    {
      name: "not.toBeFalsy",
      value: true,
      expectedCondition: true, // true is not falsy, so this should be true
    },
    {
      name: "not.toBeNull",
      value: 1,
      expectedCondition: true, // 1 is not null, so this should be true
    },
    {
      name: "not.toBeUndefined",
      value: 1,
      expectedCondition: true, // 1 is not undefined, so this should be true
    },
  ];

  negationTestCases.forEach((testCase) => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Extract the matcher name from the test case name (remove "not.")
    const matcher = testCase.name.substring(4);

    // Call the matcher with .not
    if (testCase.arg !== undefined) {
      testExpect(testCase.value).not[matcher](testCase.arg);
    } else {
      testExpect(testCase.value).not[matcher]();
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

    passTest(testCase.name);
  });

  // Test double negation
  const mockAssertFn = createMockAssertFn();
  const testExpect = expect.configure({ assertFn: mockAssertFn });

  testExpect(1).not.not.toBe(1);

  if (!mockAssertFn.called) {
    failTest("not.not.toBe", "expected assertFn to be called");
  }

  if (mockAssertFn.calls.length !== 1) {
    failTest("not.not.toBe", "expected assertFn to be called once");
  }

  if (mockAssertFn.calls[0].condition !== true) {
    failTest("not.not.toBe", "expected assertFn condition to be true");
  }

  passTest("not.not.toBe");
}
