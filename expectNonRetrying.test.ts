// deno-lint-ignore-file

import { assert } from "@std/assert";
import { createExpectation } from "./expectNonRetrying.ts";
import type { ExpectConfig } from "./config.ts";
import { createMatchers } from "./expect/index.ts";

// Helper function to create a test config with correct defaults
function createTestConfig(config: Partial<ExpectConfig> = {}): ExpectConfig {
  return {
    assertFn: config.assertFn !== undefined ? config.assertFn : undefined,
    soft: config.soft !== undefined ? config.soft : false,
    softMode: config.softMode !== undefined ? config.softMode : "throw",
    colorize: config.colorize !== undefined ? config.colorize : false,
    display: config.display !== undefined ? config.display : "inline",
  };
}

function createMatchersWithSpy() {
  let receivedMessage: string | null = null;

  const spy = {
    called: false,
    getMessage() {
      return receivedMessage;
    },

    reset() {
      this.called = false;

      receivedMessage = null;
    },
  };

  return [
    spy,
    <Received>(received: Received, customMessage?: string) =>
      createMatchers<Received>({
        received,
        config: createTestConfig(),
        negated: false,
        message: customMessage,
        fail(message) {
          spy.called = true;
          receivedMessage = message;
        },
      }),
  ] as const;
}

Deno.test("NonRetryingExpectation", async (t) => {
  await t.step("toBe", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    createMatchers(true).toBe(true);

    assert(!spy.called, "fail() should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(true).toBe(false);
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBe behavior with Object.is", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test NaN equality
    createMatchers(NaN).toBe(NaN);
    assert(!spy.called, "fail() should not have been called");

    // Reset mock
    spy.reset();

    // Test +0 and -0 inequality
    createMatchers(-0).toBe(0);
    assert(spy.called, "fail() should have been called");

    // Reset mock
    spy.reset();

    createMatchers(0).toBe(-0);
    assert(spy.called, "fail() should have been called");

    // Reset mock
    spy.reset();

    // Test object reference equality
    const obj = { a: 1 };
    createMatchers(obj).toBe(obj);
    assert(!spy.called, "fail() should not have been called");

    // Reset mock
    spy.reset();

    createMatchers(obj).toBe({ a: 1 });
    assert(spy.called, "fail() should have been called");
  });

  await t.step("toBe with custom message", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test with custom message for passing assertion
    createMatchers(1, "unexpected status").toBe(1);

    // In this test, even with a passing assertion, the custom message will be
    // present, but it won't be rendered.
    assert(spy.getMessage() === null, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test with custom message for failing assertion
    createMatchers(1, "unexpected status").toBe(0);

    // For failing assertions, the custom message should appear as the error line
    assert(
      spy.getMessage()?.includes("unexpected status"),
      `Custom message should be included in the assert message. Got: ${spy.getMessage()}`,
    );

    // Reset mock
    spy.reset();

    // Test without custom message to ensure it still works
    createMatchers(2).toBe(1);

    // Message should not contain the custom message text
    assert(
      !spy.getMessage()?.includes("unexpected status"),
      "Should not include custom message when none is provided",
    );
  });

  await t.step("toBeCloseTo", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case with default precision
    createMatchers(1.234).toBeCloseTo(1.235);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test passing case with custom precision
    createMatchers(1.234).toBeCloseTo(1.2, 1);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(1.23).toBeCloseTo(1.3);
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBeCloseTo edge cases", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test with numbers that should be close enough
    createMatchers(1.2345).toBeCloseTo(1.234, 3);
    assert(!spy.called, "Assert should not have been called");
    // Reset mock
    spy.reset();

    // Test with custom precision
    createMatchers(1.1).toBeCloseTo(1.0, 0);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test with zero precision
    createMatchers(1.5).toBeCloseTo(2, 0);
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBeDefined", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers("defined value").toBeDefined();
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(undefined).toBeDefined();
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBeFalsy", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers(false).toBeFalsy();
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(true).toBeFalsy();
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBeFalsy with falsy values", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test all falsy values
    const falsyValues = [false, 0, "", null, undefined, NaN];

    for (const value of falsyValues) {
      spy.reset();

      createMatchers(value).toBeFalsy();
      assert(!spy.called, `Assert should not have been called for ${value}`);
    }
  });

  await t.step("toBeGreaterThan", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers(5).toBeGreaterThan(3);
    assert(!spy.called, "fail() should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(3).toBeGreaterThan(5);
    assert(spy.called, "fail() should have been called");
  });

  await t.step("toBeGreaterThanOrEqual", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case (greater)
    createMatchers(5).toBeGreaterThanOrEqual(3);
    assert(!spy.called, "fail() should not have been called");

    spy.reset();

    // Test passing case (equal)
    createMatchers(5).toBeGreaterThanOrEqual(5);
    assert(!spy.called, "fail() should not have been called");

    spy.reset();

    // Test failing case
    createMatchers(3).toBeGreaterThanOrEqual(5);
    assert(spy.called, "fail() should have been called");
  });

  await t.step("toBeInstanceOf", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    class TestClass {}
    class OtherClass {}

    // Test passing case
    createMatchers(new TestClass()).toBeInstanceOf(TestClass);
    assert(!spy.called, "fail() should not have been called");

    spy.reset();

    // Test failing case
    createMatchers(new TestClass()).toBeInstanceOf(OtherClass);
    assert(spy.called, "fail() should have been called");
  });

  await t.step("toBeLessThan", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers(3).toBeLessThan(5);
    assert(!spy.called, "fail() should not have been called");

    spy.reset();

    // Test failing case
    createMatchers(5).toBeLessThan(3);
    assert(spy.called, "fail() should have been called");
  });

  await t.step("toBeLessThanOrEqual", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case (less)
    createMatchers(3).toBeLessThanOrEqual(5);
    assert(!spy.called, "fail() should not have been called");

    spy.reset();

    // Test passing case (equal)
    createMatchers(5).toBeLessThanOrEqual(5);
    assert(!spy.called, "fail() should not have been called");

    spy.reset();

    // Test failing case
    createMatchers(5).toBeLessThanOrEqual(3);
    assert(spy.called, "fail() should have been called");
  });

  await t.step("toBeNaN", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers(NaN).toBeNaN();
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(5).toBeNaN();
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBeNull", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers(null).toBeNull();
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(5).toBeNull();
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBeTruthy", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers(true).toBeTruthy();
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(false).toBeTruthy();
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toBeTruthy with truthy values", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test various truthy values
    const truthyValues = [true, 1, "hello", {}, [], () => {}, new Date()];

    for (const value of truthyValues) {
      spy.reset();

      createMatchers(value).toBeTruthy();
      assert(!spy.called, "Assert should not have been called");
    }
  });

  await t.step("toBeUndefined", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers(undefined).toBeUndefined();
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(5).toBeUndefined();
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toEqual", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case with primitives
    createMatchers(5).toEqual(5);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test passing case with objects
    createMatchers({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers({ a: 1 }).toEqual({ a: 2 });
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toEqual deep equality", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test nested objects
    createMatchers(
      { a: 1, b: { c: 2, d: [3, 4] } },
    ).toEqual({ a: 1, b: { c: 2, d: [3, 4] } });
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test arrays with same values but different references
    createMatchers([1, 2, { a: 3 }]).toEqual([1, 2, { a: 3 }]);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test with different object structures
    createMatchers({ a: 1, b: 2 }).toEqual({ b: 2, a: 1 });
    assert(!spy.called, "Assert should not have been called");
  });

  await t.step("toHaveLength", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test passing case with array
    createExpectation([1, 2, 3], config).toHaveLength(3);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for correct length");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case with string
    createExpectation("abc", config).toHaveLength(3);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for correct string length",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation([1, 2], config).toHaveLength(3);
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for incorrect length");
  });

  await t.step("toHaveLength with different types", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test with array
    createExpectation([1, 2, 3], config).toHaveLength(3);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for array with correct length",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with string
    createExpectation("hello", config).toHaveLength(5);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for string with correct length",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with array-like object
    const arrayLike = { length: 3, 0: "a", 1: "b", 2: "c" };
    createExpectation(arrayLike, config).toHaveLength(3);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for array-like object with correct length",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with empty array
    createExpectation([], config).toHaveLength(0);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for empty array");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with empty string
    createExpectation("", config).toHaveLength(0);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for empty string");
  });

  await t.step("toContain with string", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test passing case with string
    createExpectation("hello world", config).toContain("world");
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for string containing substring",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case with string
    createExpectation("hello world", config).toContain("universe");
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for string not containing substring",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test case sensitivity
    createExpectation("hello World", config).toContain("world");
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for case-sensitive mismatch",
    );
  });

  await t.step("toContain with array", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test passing case with array of primitives
    createExpectation([1, 2, 3], config).toContain(2);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for array containing item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case with array
    createExpectation([1, 2, 3], config).toContain(4);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for array not containing item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with array of objects (reference equality)
    const obj = { id: 1 };
    const array = [{ id: 2 }, obj, { id: 3 }];

    createExpectation(array, config).toContain(obj);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for array containing object reference",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with array of objects (different reference but same content)
    createExpectation(array, config).toContain({ id: 1 });
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for array not containing object with same content but different reference",
    );
  });

  await t.step("toContain with Set", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test passing case with Set
    const set = new Set([1, 2, 3]);
    createExpectation(set, config).toContain(2);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for Set containing item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case with Set
    createExpectation(set, config).toContain(4);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for Set not containing item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with Set of objects (reference equality)
    const obj = { id: 1 };
    const objSet = new Set([{ id: 2 }, obj, { id: 3 }]);

    createExpectation(objSet, config).toContain(obj);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for Set containing object reference",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with Set of objects (different reference but same content)
    createExpectation(objSet, config).toContain({ id: 1 });
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for Set not containing object with same content but different reference",
    );
  });

  await t.step("toContain with unsupported type", () => {
    const config: ExpectConfig = {
      assertFn: () => {},
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test with unsupported type
    try {
      createExpectation(123, config).toContain(2);
      assert(false, "Should have thrown an error for unsupported type");
    } catch (error) {
      assert(
        error instanceof Error,
        "Should have thrown an Error for unsupported type",
      );
      assert(
        error.message.includes("only supported for strings, arrays, and sets"),
        "Error message should mention supported types",
      );
    }
  });

  await t.step("toContainEqual with array", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test passing case with array of primitives
    createExpectation([1, 2, 3], config).toContainEqual(2);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for array containing primitive item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case with array
    createExpectation([1, 2, 3], config).toContainEqual(4);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for array not containing item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with array of objects (deep equality)
    const array = [{ id: 2 }, { id: 1 }, { id: 3 }];

    createExpectation(array, config).toContainEqual({ id: 1 });
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for array containing object with same content",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with nested objects
    const nestedArray = [
      { user: { name: "Alice", age: 30 } },
      { user: { name: "Bob", age: 25 } },
    ];

    createExpectation(nestedArray, config).toContainEqual({
      user: { name: "Bob", age: 25 },
    });
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for array containing nested object with same content",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    createExpectation(nestedArray, config).toContainEqual({
      user: { name: "Bob", age: 26 },
    });
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for array not containing nested object with different content",
    );
  });

  await t.step("toContainEqual with Set", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test passing case with Set of primitives
    const set = new Set([1, 2, 3]);
    createExpectation(set, config).toContainEqual(2);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for Set containing primitive item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case with Set
    createExpectation(set, config).toContainEqual(4);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for Set not containing item",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with Set of objects (deep equality)
    const objSet = new Set([{ id: 2 }, { id: 1 }, { id: 3 }]);

    createExpectation(objSet, config).toContainEqual({ id: 1 });
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for Set containing object with same content",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with nested objects
    const nestedSet = new Set([
      { user: { name: "Alice", age: 30 } },
      { user: { name: "Bob", age: 25 } },
    ]);

    createExpectation(nestedSet, config).toContainEqual({
      user: { name: "Bob", age: 25 },
    });
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for Set containing nested object with same content",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    createExpectation(nestedSet, config).toContainEqual({
      user: { name: "Bob", age: 26 },
    });
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for Set not containing nested object with different content",
    );
  });

  await t.step("toContainEqual with negation", () => {
    let assertCalled = false;
    let assertCondition = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test negated passing case
    createExpectation([{ id: 1 }, { id: 2 }], config).not.toContainEqual({
      id: 3,
    });
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for negated non-matching values",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test negated failing case
    createExpectation([{ id: 1 }, { id: 2 }], config).not.toContainEqual({
      id: 1,
    });
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for negated matching values",
    );
  });

  await t.step("toHaveProperty with simple property", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers({ a: 1 }).toHaveProperty("a");
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers({ a: 1 }).toHaveProperty("b");
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toHaveProperty with nested property", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers({ a: { b: 2 } }).toHaveProperty("a.b");
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers({ a: { c: 2 } }).toHaveProperty("a.b");
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toHaveProperty with array index", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers({ a: [1, 2, 3] }).toHaveProperty("a[1]");
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case - index out of bounds
    createMatchers({ a: [1, 2, 3] }).toHaveProperty("a[5]");
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toHaveProperty with expected value", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case
    createMatchers({ a: 1 }).toHaveProperty("a", 1);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case - wrong value
    createMatchers({ a: 1 }).toHaveProperty("a", 2);
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toHaveProperty with complex object", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

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
    createMatchers(complexObj).toHaveProperty("a.b[1].c", 2);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    createMatchers(complexObj).toHaveProperty("d", true);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test failing case
    createMatchers(complexObj).toHaveProperty("a.b[1].c", 3);
    assert(spy.called, "Assert should have been called");
  });

  await t.step("toHaveProperty with unsupported type", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    createMatchers({ a: 1 }).toHaveProperty("length");
    assert(spy.called, "Should have been called for unsupported type");
  });

  await t.step("toHaveProperty with Playwright examples", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    const value = {
      a: {
        b: [42],
      },
      c: true,
    };

    // Test: expect(value).toHaveProperty('a.b');
    createMatchers(value).toHaveProperty("a.b");
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test: expect(value).toHaveProperty('a.b', [42]);
    createMatchers(value).toHaveProperty("a.b", [42]);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test: expect(value).toHaveProperty('a.b[0]', 42);
    createMatchers(value).toHaveProperty("a.b[0]", 42);
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test: expect(value).toHaveProperty('c');
    createMatchers(value).toHaveProperty("c");
    assert(!spy.called, "Assert should not have been called");

    // Reset mock
    spy.reset();

    // Test: expect(value).toHaveProperty('c', true);
    createMatchers(value).toHaveProperty("c", true);
    assert(!spy.called, "Assert should not have been called");
  });

  await t.step("not", () => {
    // ... existing test ...
  });
});
