import { expect } from "../dist/index.js";
import { createMockAssertFn, failTest, passTest } from "./testing.js";

export default function testExpectNonRetrying() {
  TEST_CASES.forEach(runTest);
  testToBeInstanceOf();
  testToContain();
  testToContainEqual();
  testToHaveProperty();
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
  {
    name: "toContainEqual with Array",
    matcher: "toContainEqual",
    value: [{ id: 1 }, { id: 2 }],
    arg: { id: 1 },
    expectedCondition: true,
  },
  {
    name: "toContainEqual with Set",
    matcher: "toContainEqual",
    value: new Set([{ id: 1 }, { id: 2 }]),
    arg: { id: 1 },
    expectedCondition: true,
  },
  {
    name: "toHaveProperty with simple property",
    matcher: "toHaveProperty",
    value: { a: 1 },
    arg: "a",
    expectedCondition: true,
  },
  {
    name: "toHaveProperty with nested property",
    matcher: "toHaveProperty",
    value: { a: { b: 2 } },
    arg: "a.b",
    expectedCondition: true,
  },
  {
    name: "toHaveProperty with array index",
    matcher: "toHaveProperty",
    value: { a: [1, 2, 3] },
    arg: "a[1]",
    expectedCondition: true,
  },
  {
    name: "toHaveProperty with expected value",
    matcher: "toHaveProperty",
    value: { a: 1 },
    arg: ["a", 1],
    expectedCondition: true,
  },
  {
    name: "toHaveProperty with nested expected value",
    matcher: "toHaveProperty",
    value: { a: { b: 2 } },
    arg: ["a.b", 2],
    expectedCondition: true,
  },
  {
    name: "toHaveProperty with array index and expected value",
    matcher: "toHaveProperty",
    value: { a: [1, 2, 3] },
    arg: ["a[1]", 2],
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

function testToContainEqual() {
  // Test with array
  const arrayTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case with primitives
    testExpect([1, 2, 3]).toContainEqual(2);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with array",
        "expected condition to be true for array containing primitive item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect([1, 2, 3]).toContainEqual(4);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContainEqual with array",
        "expected condition to be false for array not containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test with objects (deep equality)
    testExpect([{ id: 2 }, { id: 1 }, { id: 3 }]).toContainEqual({ id: 1 });
    if (!mockAssertFn.called) {
      failTest(
        "toContainEqual with array objects",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with array objects",
        "expected condition to be true for array containing object with same content",
      );
    }

    passTest("toContainEqual with array");
  };

  // Test with Set
  const setTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case with primitives
    testExpect(new Set([1, 2, 3])).toContainEqual(2);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with Set",
        "expected condition to be true for Set containing primitive item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect(new Set([1, 2, 3])).toContainEqual(4);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContainEqual with Set",
        "expected condition to be false for Set not containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test with objects (deep equality)
    testExpect(new Set([{ id: 2 }, { id: 1 }, { id: 3 }])).toContainEqual({
      id: 1,
    });
    if (!mockAssertFn.called) {
      failTest(
        "toContainEqual with Set objects",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with Set objects",
        "expected condition to be true for Set containing object with same content",
      );
    }

    passTest("toContainEqual with Set");
  };

  // Test with unsupported type
  const unsupportedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    try {
      testExpect("string").toContainEqual("s");
      failTest(
        "toContainEqual with unsupported type",
        "expected to throw an error",
      );
    } catch (error) {
      if (!(error instanceof Error)) {
        failTest(
          "toContainEqual with unsupported type",
          "expected to throw an Error",
        );
      }
      if (
        !error.message.includes("only supported for arrays and sets")
      ) {
        failTest(
          "toContainEqual with unsupported type",
          "expected error message to mention supported types",
        );
      }
      passTest("toContainEqual with unsupported type");
    }
  };

  // Run all tests
  arrayTest();
  setTest();
  unsupportedTest();
}

function testToHaveProperty() {
  // Test with simple property
  const simpleTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: 1 }).toHaveProperty("a");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with simple property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with simple property",
        "expected condition to be true for object with property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect({ a: 1 }).toHaveProperty("b");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with missing property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with missing property",
        "expected condition to be false for object without property",
      );
    }

    passTest("toHaveProperty with simple property");
  };

  // Test with nested property
  const nestedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: { b: 2 } }).toHaveProperty("a.b");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with nested property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with nested property",
        "expected condition to be true for object with nested property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect({ a: { c: 2 } }).toHaveProperty("a.b");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with missing nested property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with missing nested property",
        "expected condition to be false for object without nested property",
      );
    }

    passTest("toHaveProperty with nested property");
  };

  // Test with array index
  const arrayTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: [1, 2, 3] }).toHaveProperty("a[1]");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with array index",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with array index",
        "expected condition to be true for object with array property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case - index out of bounds
    testExpect({ a: [1, 2, 3] }).toHaveProperty("a[5]");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with out of bounds index",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with out of bounds index",
        "expected condition to be false for array index out of bounds",
      );
    }

    passTest("toHaveProperty with array index");
  };

  // Test with expected value
  const expectedValueTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: 1 }).toHaveProperty("a", 1);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with expected value",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with expected value",
        "expected condition to be true for matching property value",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case - wrong value
    testExpect({ a: 1 }).toHaveProperty("a", 2);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with wrong expected value",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with wrong expected value",
        "expected condition to be false for non-matching property value",
      );
    }

    passTest("toHaveProperty with expected value");
  };

  // Test with complex object
  const complexTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    const complexObj = {
      a: {
        b: [
          { c: 1 },
          { c: 2 },
        ],
      },
      d: true,
    };

    // Test passing cases
    testExpect(complexObj).toHaveProperty("a.b[1].c", 2);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with complex path",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with complex path",
        "expected condition to be true for complex property path",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    testExpect(complexObj).toHaveProperty("d", true);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with boolean value",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with boolean value",
        "expected condition to be true for boolean property",
      );
    }

    passTest("toHaveProperty with complex object");
  };

  // Test with unsupported type
  const unsupportedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    try {
      testExpect("string").toHaveProperty("length");
      failTest(
        "toHaveProperty with unsupported type",
        "expected to throw an error",
      );
    } catch (error) {
      if (!(error instanceof Error)) {
        failTest(
          "toHaveProperty with unsupported type",
          "expected to throw an Error",
        );
      }
      if (
        !error.message.includes("only supported for objects")
      ) {
        failTest(
          "toHaveProperty with unsupported type",
          "expected error message to mention supported types",
        );
      }
      passTest("toHaveProperty with unsupported type");
    }
  };

  // Test Playwright examples
  const playwrightExamplesTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    const value = {
      a: {
        b: [42],
      },
      c: true,
    };

    // Test: expect(value).toHaveProperty('a.b');
    testExpect(value).toHaveProperty("a.b");
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 1",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 1",
        "expected condition to be true for a.b property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('a.b', [42]);
    testExpect(value).toHaveProperty("a.b", [42]);
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 2",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 2",
        "expected condition to be true for a.b property with array value",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('a.b[0]', 42);
    testExpect(value).toHaveProperty("a.b[0]", 42);
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 3",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 3",
        "expected condition to be true for a.b[0] property with value 42",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('c');
    testExpect(value).toHaveProperty("c");
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 4",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 4",
        "expected condition to be true for c property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('c', true);
    testExpect(value).toHaveProperty("c", true);
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 5",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 5",
        "expected condition to be true for c property with value true",
      );
    }

    passTest("Playwright examples for toHaveProperty");
  };

  // Run all tests
  simpleTest();
  nestedTest();
  arrayTest();
  expectedValueTest();
  complexTest();
  unsupportedTest();
  playwrightExamplesTest();
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
    {
      name: "not.toContainEqual with array",
      matcher: "toContainEqual",
      value: [{ id: 1 }, { id: 2 }],
      arg: { id: 3 },
      expectedCondition: true, // [{ id: 1 }, { id: 2 }] does not contain { id: 3 }, so this should be true
    },
    {
      name: "not.toContainEqual with set",
      matcher: "toContainEqual",
      value: new Set([{ id: 1 }, { id: 2 }]),
      arg: { id: 3 },
      expectedCondition: true, // new Set([{ id: 1 }, { id: 2 }]) does not contain { id: 3 }, so this should be true
    },
    {
      name: "not.toHaveProperty with missing property",
      matcher: "toHaveProperty",
      value: { a: 1 },
      arg: "b",
      expectedCondition: true, // { a: 1 } does not have property 'b', so this should be true
    },
    {
      name: "not.toHaveProperty with existing property but wrong value",
      matcher: "toHaveProperty",
      value: { a: 1 },
      arg: ["a", 2],
      expectedCondition: true, // { a: 1 } has property 'a' but not with value 2, so this should be true
    },
    {
      name: "not.toHaveProperty with nested missing property",
      matcher: "toHaveProperty",
      value: { a: { b: 1 } },
      arg: "a.c",
      expectedCondition: true, // { a: { b: 1 } } does not have property 'a.c', so this should be true
    },
    {
      name: "not.toHaveProperty with array index out of bounds",
      matcher: "toHaveProperty",
      value: { a: [1, 2, 3] },
      arg: "a[5]",
      expectedCondition: true, // { a: [1, 2, 3] } does not have property 'a[5]', so this should be true
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
