// deno-lint-ignore-file

import { assert } from "jsr:@std/assert";
import { createExpectation } from "./expectNonRetrying.ts";
import type { ExpectConfig } from "./config.ts";

Deno.test("NonRetryingExpectation", async (t) => {
  await t.step("toBe", () => {
    // Mock assert function
    let assertCalled = false;
    let assertCondition = false;
    let assertSoft = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
      assertSoft = !!soft;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      colorize: false,
      display: "inline",
    };

    // Test passing case
    const expectation = createExpectation(true, config);
    expectation.toBe(true);

    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for matching values");
    assert(!assertSoft, "Soft should be false by default");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(true, config).toBe(false);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for non-matching values",
    );
  });

  await t.step("toBe behavior with Object.is", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test NaN equality
    createExpectation(NaN, config).toBe(NaN);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for NaN === NaN with Object.is",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test +0 and -0 inequality
    createExpectation(0, config).toBe(0);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for +0 === +0");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    createExpectation(0, config).toBe(-0);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for +0 !== -0 with Object.is",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test object reference equality
    const obj = { a: 1 };
    createExpectation(obj, config).toBe(obj);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for same object reference",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    createExpectation(obj, config).toBe({ a: 1 });
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for different object references",
    );
  });

  await t.step("toBeCloseTo", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case with default precision
    createExpectation(1.23, config).toBeCloseTo(1.22);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for close numbers with default precision",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case with custom precision
    createExpectation(1.234, config).toBeCloseTo(1.2, 1);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for close numbers with custom precision",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(1.23, config).toBeCloseTo(1.3);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for numbers that are not close",
    );
  });

  await t.step("toBeCloseTo edge cases", () => {
    let assertCalled = false;
    let assertCondition = false;
    let debugInfo = {};

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;

      // Extract debug info from the message
      if (typeof message === "string" && message.includes("matcherSpecific")) {
        try {
          const match = message.match(/matcherSpecific: ({[^}]+})/);
          if (match && match[1]) {
            debugInfo = JSON.parse(match[1].replace(/'/g, '"'));
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      colorize: false,
      display: "inline",
    };

    // Test with numbers that should be close enough
    createExpectation(1.2345, config).toBeCloseTo(1.234, 3);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for numbers close with specified precision",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;
    debugInfo = {};

    // Test with custom precision
    createExpectation(1.1, config).toBeCloseTo(1.0, 0);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for numbers close with custom precision",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;
    debugInfo = {};

    // Test with zero precision
    createExpectation(1.5, config).toBeCloseTo(2, 0);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true when rounding to integers",
    );
  });

  await t.step("toBeDefined", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation("defined value", config).toBeDefined();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for defined values");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(undefined, config).toBeDefined();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for undefined");
  });

  await t.step("toBeFalsy", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation(false, config).toBeFalsy();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for falsy values");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(true, config).toBeFalsy();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for truthy values");
  });

  await t.step("toBeFalsy with falsy values", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test all falsy values
    const falsyValues = [false, 0, "", null, undefined, NaN];

    for (const value of falsyValues) {
      assertCalled = false;
      assertCondition = false;

      createExpectation(value, config).toBeFalsy();
      assert(assertCalled, `Assert should have been called for ${value}`);
      assert(
        assertCondition,
        `Condition should be true for falsy value: ${value}`,
      );
    }
  });

  await t.step("toBeGreaterThan", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation(5, config).toBeGreaterThan(3);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value > expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(3, config).toBeGreaterThan(5);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false when value <= expected",
    );
  });

  await t.step("toBeGreaterThanOrEqual", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case (greater)
    createExpectation(5, config).toBeGreaterThanOrEqual(3);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value > expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case (equal)
    createExpectation(5, config).toBeGreaterThanOrEqual(5);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value = expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(3, config).toBeGreaterThanOrEqual(5);
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false when value < expected");
  });

  await t.step("toBeInstanceOf", () => {
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
      colorize: false,
      display: "inline",
    };

    class TestClass {}
    class OtherClass {}

    // Test passing case
    createExpectation(new TestClass(), config).toBeInstanceOf(TestClass);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for correct instance");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(new TestClass(), config).toBeInstanceOf(OtherClass);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for incorrect instance",
    );
  });

  await t.step("toBeLessThan", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation(3, config).toBeLessThan(5);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value < expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeLessThan(3);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false when value >= expected",
    );
  });

  await t.step("toBeLessThanOrEqual", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case (less)
    createExpectation(3, config).toBeLessThanOrEqual(5);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value < expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case (equal)
    createExpectation(5, config).toBeLessThanOrEqual(5);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value = expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeLessThanOrEqual(3);
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false when value > expected");
  });

  await t.step("toBeNaN", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation(NaN, config).toBeNaN();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for NaN");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeNaN();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for non-NaN values");
  });

  await t.step("toBeNull", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation(null, config).toBeNull();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for null");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeNull();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for non-null values");
  });

  await t.step("toBeTruthy", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation(true, config).toBeTruthy();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for truthy values");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(false, config).toBeTruthy();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for falsy values");
  });

  await t.step("toBeTruthy with truthy values", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test various truthy values
    const truthyValues = [true, 1, "hello", {}, [], () => {}, new Date()];

    for (const value of truthyValues) {
      assertCalled = false;
      assertCondition = false;

      createExpectation(value, config).toBeTruthy();
      assert(assertCalled, "Assert should have been called");
      assert(
        assertCondition,
        `Condition should be true for truthy value: ${String(value)}`,
      );
    }
  });

  await t.step("toBeUndefined", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case
    createExpectation(undefined, config).toBeUndefined();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for undefined");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeUndefined();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for defined values");
  });

  await t.step("toEqual", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test passing case with primitives
    createExpectation(5, config).toEqual(5);
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for equal primitives");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case with objects
    createExpectation({ a: 1, b: 2 }, config).toEqual({ a: 1, b: 2 });
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for equal objects");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation({ a: 1 }, config).toEqual({ a: 2 });
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for unequal objects");
  });

  await t.step("toEqual deep equality", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test nested objects
    createExpectation(
      { a: 1, b: { c: 2, d: [3, 4] } },
      config,
    ).toEqual({ a: 1, b: { c: 2, d: [3, 4] } });
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for deeply equal objects",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test arrays with same values but different references
    createExpectation([1, 2, { a: 3 }], config).toEqual([1, 2, { a: 3 }]);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for equal arrays with objects",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with different object structures
    createExpectation({ a: 1, b: 2 }, config).toEqual({ b: 2, a: 1 });
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for objects with same properties in different order",
    );
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

  await t.step("negation with .not", () => {
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
      colorize: false,
      display: "inline",
    };

    // Test negated passing case
    createExpectation(1, config).not.toBe(2);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for negated non-matching values",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test negated failing case
    createExpectation(1, config).not.toBe(1);
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for negated matching values",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test double negation
    createExpectation(1, config).not.not.toBe(1);
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for double negated matching values",
    );
  });
});
