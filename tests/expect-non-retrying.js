import { expect } from "../dist/index.js";
import { createMockAssertFn, failTest, passTest } from "./testing.js";

export default function testExpectNonRetrying() {
  TEST_CASES.forEach(runTest);
  testToBeInstanceOf();
  testToContain();
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
  {
    name: "toContain with String",
    matcher: "toContain",
    value: "hello world",
    arg: "world",
    expectedCondition: true,
  },
  {
    name: "toContain with Array",
    matcher: "toContain",
    value: [1, 2, 3],
    arg: 2,
    expectedCondition: true,
  },
  {
    name: "toContain with Set",
    matcher: "toContain",
    value: new Set([1, 2, 3]),
    arg: 2,
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

function testToContain() {
  // Test with string
  const stringTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect("hello world").toContain("world");
    if (!mockAssertFn.called) {
      failTest("toContain with string", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContain with string",
        "expected condition to be true for string containing substring",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect("hello world").toContain("universe");
    if (!mockAssertFn.called) {
      failTest("toContain with string", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContain with string",
        "expected condition to be false for string not containing substring",
      );
    }

    passTest("toContain with string");
  };

  // Test with array
  const arrayTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect([1, 2, 3]).toContain(2);
    if (!mockAssertFn.called) {
      failTest("toContain with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContain with array",
        "expected condition to be true for array containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect([1, 2, 3]).toContain(4);
    if (!mockAssertFn.called) {
      failTest("toContain with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContain with array",
        "expected condition to be false for array not containing item",
      );
    }

    passTest("toContain with array");
  };

  // Test with Set
  const setTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect(new Set([1, 2, 3])).toContain(2);
    if (!mockAssertFn.called) {
      failTest("toContain with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContain with Set",
        "expected condition to be true for Set containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect(new Set([1, 2, 3])).toContain(4);
    if (!mockAssertFn.called) {
      failTest("toContain with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContain with Set",
        "expected condition to be false for Set not containing item",
      );
    }

    passTest("toContain with Set");
  };

  // Test with unsupported type
  const unsupportedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    try {
      testExpect(123).toContain(2);
      failTest("toContain with unsupported type", "expected to throw an error");
    } catch (error) {
      if (!(error instanceof Error)) {
        failTest(
          "toContain with unsupported type",
          "expected to throw an Error",
        );
      }
      if (
        !error.message.includes("only supported for strings, arrays, and sets")
      ) {
        failTest(
          "toContain with unsupported type",
          "expected error message to mention supported types",
        );
      }
      passTest("toContain with unsupported type");
    }
  };

  // Run all tests
  stringTest();
  arrayTest();
  setTest();
  unsupportedTest();
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
    {
      name: "not.toContain with string",
      matcher: "toContain",
      value: "hello world",
      arg: "universe",
      expectedCondition: true, // "hello world" does not contain "universe", so this should be true
    },
    {
      name: "not.toContain with array",
      matcher: "toContain",
      value: [1, 2, 3],
      arg: 4,
      expectedCondition: true, // [1, 2, 3] does not contain 4, so this should be true
    },
    {
      name: "not.toContain with set",
      matcher: "toContain",
      value: new Set([1, 2, 3]),
      arg: 4,
      expectedCondition: true, // new Set([1, 2, 3]) does not contain 4, so this should be true
    },
  ];

  negationTestCases.forEach((testCase) => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Extract the matcher name from the test case name or use the provided matcher property
    const matcher = testCase.matcher || testCase.name.substring(4);

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
