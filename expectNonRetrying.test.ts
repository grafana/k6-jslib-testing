// deno-lint-ignore-file

import { assert } from "@std/assert";
import { createExpectation } from "./expectNonRetrying.ts";
import type { ExpectConfig } from "./config.ts";
import type { SoftMode } from "./assert.ts";
import { setupFastDenoTests, waitForMatcher } from "./test_helpers.ts";

// Configure fast microtask-based delays for Deno tests
setupFastDenoTests();

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

Deno.test("NonRetryingExpectation", async (t) => {
  await t.step("toBe", async () => {
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

    const config = createTestConfig({
      assertFn: mockAssert,
    });

    // Test passing case
    const expectation = createExpectation(true, config);
    expectation.toBe(true);
    await waitForMatcher();

    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for matching values");
    assert(!assertSoft, "Soft should be false by default");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(true, config).toBe(false);
    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for non-matching values",
    );
  });

  await t.step("toBe behavior with Object.is", async () => {
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

    // Test NaN equality
    createExpectation(NaN, config).toBe(NaN);
    await waitForMatcher();
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
    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for +0 === +0");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    createExpectation(0, config).toBe(-0);
    await waitForMatcher();
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
    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for same object reference",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    createExpectation(obj, config).toBe({ a: 1 });
    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for different object references",
    );
  });

  await t.step("toBe with custom message", async () => {
    let assertCalled = false;
    let assertCondition = false;
    let assertMessage = "";
    let assertSoft = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
      assertMessage = message;
      assertSoft = !!soft;
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "pretty", // Change to pretty to see if custom message appears
    };

    // Test with custom message for passing assertion
    const expectation1 = createExpectation(1, config, "unexpected status");
    expectation1.toBe(1);

    // In this test, even with a passing assertion, the custom message will be
    // present, but it won't be rendered.
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for matching values");
    assert(!assertSoft, "Soft should be false by default");

    // Reset mock
    assertCalled = false;
    assertCondition = false;
    assertMessage = "";

    // Test with custom message for failing assertion
    const expectation2 = createExpectation(1, config, "unexpected status");
    expectation2.toBe(0);

    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for non-matching values",
    );
    // For failing assertions, the custom message should appear as the error line
    assert(
      assertMessage.includes("unexpected status"),
      `Custom message should be included in the assert message. Got: ${assertMessage}`,
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;
    assertMessage = "";

    // Test without custom message to ensure it still works
    const expectation3 = createExpectation(1, config);
    expectation3.toBe(1);

    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for matching values");
    // Message should not contain the custom message text
    assert(
      !assertMessage.includes("unexpected status"),
      "Should not include custom message when none is provided",
    );
  });

  await t.step("toBeCloseTo", async () => {
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

  await t.step("toBeCloseTo edge cases", async () => {
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
      softMode: "throw",
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

  await t.step("toBeDefined", async () => {
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

    // Test passing case
    createExpectation("defined value", config).toBeDefined();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for defined values");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(undefined, config).toBeDefined();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for undefined");
  });

  await t.step("toBeFalsy", async () => {
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

    // Test passing case
    createExpectation(false, config).toBeFalsy();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for falsy values");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(true, config).toBeFalsy();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for truthy values");
  });

  await t.step("toBeFalsy with falsy values", async () => {
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

    // Test all falsy values
    const falsyValues = [false, 0, "", null, undefined, NaN];

    for (const value of falsyValues) {
      assertCalled = false;
      assertCondition = false;

      createExpectation(value, config).toBeFalsy();

      await waitForMatcher();
      assert(assertCalled, `Assert should have been called for ${value}`);
      assert(
        assertCondition,
        `Condition should be true for falsy value: ${value}`,
      );
    }
  });

  await t.step("toBeGreaterThan", async () => {
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

    // Test passing case
    createExpectation(5, config).toBeGreaterThan(3);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value > expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(3, config).toBeGreaterThan(5);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false when value <= expected",
    );
  });

  await t.step("toBeGreaterThanOrEqual", async () => {
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

    // Test passing case (greater)
    createExpectation(5, config).toBeGreaterThanOrEqual(3);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value > expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case (equal)
    createExpectation(5, config).toBeGreaterThanOrEqual(5);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value = expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(3, config).toBeGreaterThanOrEqual(5);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false when value < expected");
  });

  await t.step("toBeInstanceOf", async () => {
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

  await t.step("toBeLessThan", async () => {
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

    // Test passing case
    createExpectation(3, config).toBeLessThan(5);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value < expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeLessThan(3);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false when value >= expected",
    );
  });

  await t.step("toBeLessThanOrEqual", async () => {
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

    // Test passing case (less)
    createExpectation(3, config).toBeLessThanOrEqual(5);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value < expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case (equal)
    createExpectation(5, config).toBeLessThanOrEqual(5);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true when value = expected");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeLessThanOrEqual(3);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false when value > expected");
  });

  await t.step("toBeNaN", async () => {
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

    // Test passing case
    createExpectation(NaN, config).toBeNaN();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for NaN");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeNaN();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for non-NaN values");
  });

  await t.step("toBeNull", async () => {
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

    // Test passing case
    createExpectation(null, config).toBeNull();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for null");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeNull();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for non-null values");
  });

  await t.step("toBeTruthy", async () => {
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

    // Test passing case
    createExpectation(true, config).toBeTruthy();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for truthy values");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(false, config).toBeTruthy();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for falsy values");
  });

  await t.step("toBeTruthy with truthy values", async () => {
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

    // Test various truthy values
    const truthyValues = [true, 1, "hello", {}, [], () => {}, new Date()];

    for (const value of truthyValues) {
      assertCalled = false;
      assertCondition = false;

      createExpectation(value, config).toBeTruthy();

      await waitForMatcher();
      assert(assertCalled, "Assert should have been called");
      assert(
        assertCondition,
        `Condition should be true for truthy value: ${String(value)}`,
      );
    }
  });

  await t.step("toBeUndefined", async () => {
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

    // Test passing case
    createExpectation(undefined, config).toBeUndefined();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for undefined");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation(5, config).toBeUndefined();

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for defined values");
  });

  await t.step("toEqual", async () => {
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

    // Test passing case with primitives
    createExpectation(5, config).toEqual(5);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for equal primitives");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case with objects
    createExpectation({ a: 1, b: 2 }, config).toEqual({ a: 1, b: 2 });

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for equal objects");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation({ a: 1 }, config).toEqual({ a: 2 });

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for unequal objects");
  });

  await t.step("toEqual deep equality", async () => {
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

    // Test nested objects
    createExpectation(
      { a: 1, b: { c: 2, d: [3, 4] } },
      config,
    ).toEqual({ a: 1, b: { c: 2, d: [3, 4] } });

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for objects with same properties in different order",
    );
  });

  await t.step("toHaveLength", async () => {
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for correct length");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test passing case with string
    createExpectation("abc", config).toHaveLength(3);

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(!assertCondition, "Condition should be false for incorrect length");
  });

  await t.step("toHaveLength with different types", async () => {
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for empty array");

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test with empty string
    createExpectation("", config).toHaveLength(0);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true for empty string");
  });

  await t.step("toContain with string", async () => {
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for case-sensitive mismatch",
    );
  });

  await t.step("toContain with array", async () => {
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for array not containing object with same content but different reference",
    );
  });

  await t.step("toContain with Set", async () => {
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for Set not containing object with same content but different reference",
    );
  });

  await t.step("toContain with unsupported type", async () => {
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

      await waitForMatcher();
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

  await t.step("negation with .not", async () => {
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
    createExpectation(1, config).not.toBe(2);

    await waitForMatcher();
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

    await waitForMatcher();
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

  await t.step("toContainEqual with array", async () => {
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for array not containing nested object with different content",
    );
  });

  await t.step("toContainEqual with Set", async () => {
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for Set not containing nested object with different content",
    );
  });

  await t.step("toContainEqual with negation", async () => {
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

    await waitForMatcher();
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

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for negated matching values",
    );
  });

  await t.step("toHaveProperty with simple property", async () => {
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

    // Test passing case
    createExpectation({ a: 1 }, config).toHaveProperty("a");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for object with property",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation({ a: 1 }, config).toHaveProperty("b");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for object without property",
    );
  });

  await t.step("toHaveProperty with nested property", async () => {
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

    // Test passing case
    createExpectation({ a: { b: 2 } }, config).toHaveProperty("a.b");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for object with nested property",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case
    createExpectation({ a: { c: 2 } }, config).toHaveProperty("a.b");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for object without nested property",
    );
  });

  await t.step("toHaveProperty with array index", async () => {
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

    // Test passing case
    createExpectation({ a: [1, 2, 3] }, config).toHaveProperty("a[1]");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for object with array property",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case - index out of bounds
    createExpectation({ a: [1, 2, 3] }, config).toHaveProperty("a[5]");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for array index out of bounds",
    );
  });

  await t.step("toHaveProperty with expected value", async () => {
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

    // Test passing case
    createExpectation({ a: 1 }, config).toHaveProperty("a", 1);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for matching property value",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test failing case - wrong value
    createExpectation({ a: 1 }, config).toHaveProperty("a", 2);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for non-matching property value",
    );
  });

  await t.step("toHaveProperty with complex object", async () => {
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
    createExpectation(complexObj, config).toHaveProperty("a.b[1].c", 2);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for complex property path",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    createExpectation(complexObj, config).toHaveProperty("d", true);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for boolean property",
    );
  });

  await t.step("toHaveProperty with unsupported type", async () => {
    let errorThrown = false;
    let errorMessage = "";

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      // This should not be called
    };

    const config: ExpectConfig = {
      assertFn: mockAssert,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    try {
      createExpectation("string", config).toHaveProperty("length");
    } catch (error) {
      errorThrown = true;
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    }

    assert(errorThrown, "Error should be thrown for unsupported type");
    assert(
      errorMessage.includes("only supported for objects"),
      "Error message should mention supported types",
    );
  });

  await t.step("toHaveProperty with Playwright examples", async () => {
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

    const value = {
      a: {
        b: [42],
      },
      c: true,
    };

    // Test: expect(value).toHaveProperty('a.b');
    createExpectation(value, config).toHaveProperty("a.b");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for a.b property",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test: expect(value).toHaveProperty('a.b', [42]);
    createExpectation(value, config).toHaveProperty("a.b", [42]);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for a.b property with array value",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test: expect(value).toHaveProperty('a.b[0]', 42);
    createExpectation(value, config).toHaveProperty("a.b[0]", 42);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for a.b[0] property with value 42",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test: expect(value).toHaveProperty('c');
    createExpectation(value, config).toHaveProperty("c");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for c property",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test: expect(value).toHaveProperty('c', true);
    createExpectation(value, config).toHaveProperty("c", true);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for c property with value true",
    );
  });

  await t.step("toHaveProperty with negation", async () => {
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

    // Test negation with missing property
    createExpectation({ a: 1 }, config).not.toHaveProperty("b");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for negated missing property",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test negation with existing property
    createExpectation({ a: 1 }, config).not.toHaveProperty("a");

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false for negated existing property",
    );

    // Reset mock
    assertCalled = false;
    assertCondition = false;

    // Test negation with expected value
    createExpectation({ a: 1 }, config).not.toHaveProperty("a", 2);

    await waitForMatcher();
    assert(assertCalled, "Assert should have been called");
    assert(
      assertCondition,
      "Condition should be true for negated non-matching property value",
    );
  });

  await t.step("not", async () => {
    // ... existing test ...
  });

  await t.step("otherwise() executes callback on failure", async () => {
    let callbackInvoked = false;
    let errorContext: any = null;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
      softMode?: SoftMode,
    ) => {
      if (!condition) {
        throw new Error(message);
      }
    };

    const config = createTestConfig({ assertFn: mockAssert });

    try {
      createExpectation(5, config)
        .toBe(10)
        .otherwise((ctx) => {
          callbackInvoked = true;
          errorContext = ctx;
        });
    } catch (e) {
      // Expected to throw
    }

    assert(callbackInvoked, "Callback should be invoked on failure");
    assert(errorContext !== null, "Error context should be provided");
    assert(errorContext.matcherName === "toBe", "Matcher name should be toBe");
    assert(errorContext.expected === "10", "Expected value should be 10");
    assert(errorContext.received === "5", "Received value should be 5");
    assert(
      errorContext.message.length > 0,
      "Message should not be empty",
    );
  });

  await t.step("otherwise() NOT executed on success", async () => {
    let callbackInvoked = false;

    const mockAssert = (condition: boolean) => {
      // No-op for successful assertions
    };

    const config = createTestConfig({ assertFn: mockAssert });

    createExpectation(5, config)
      .toBe(5)
      .otherwise(() => {
        callbackInvoked = true;
      });

    assert(!callbackInvoked, "Callback should NOT be invoked on success");
  });

  await t.step("otherwise() works with .not", async () => {
    let callbackInvoked = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
      softMode?: SoftMode,
    ) => {
      if (!condition) {
        throw new Error(message);
      }
    };

    const config = createTestConfig({ assertFn: mockAssert });

    try {
      createExpectation(5, config)
        .not.toBe(5)
        .otherwise(() => {
          callbackInvoked = true;
        });
    } catch (e) {
      // Expected to throw
    }

    assert(callbackInvoked, "Callback should be invoked with .not");
  });

  await t.step("otherwise() works when chained after .not", async () => {
    let callbackInvoked = false;

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
      softMode?: SoftMode,
    ) => {
      if (!condition) {
        throw new Error(message);
      }
    };

    const config = createTestConfig({ assertFn: mockAssert });

    try {
      createExpectation(5, config)
        .not.toBe(5)
        .otherwise(() => {
          callbackInvoked = true;
        });
    } catch (e) {
      // Expected to throw
    }

    assert(
      callbackInvoked,
      "Callback should be invoked when chained after .not",
    );
  });

  await t.step(
    "otherwise() callback error doesn't prevent assertion",
    async () => {
      let assertCalled = false;

      const mockAssert = (
        condition: boolean,
        message: string,
        soft?: boolean,
        softMode?: SoftMode,
      ) => {
        assertCalled = true;
        if (!condition) {
          throw new Error(message);
        }
      };

      const config = createTestConfig({ assertFn: mockAssert });

      try {
        createExpectation(5, config)
          .toBe(10)
          .otherwise(() => {
            throw new Error("Callback error");
          });
      } catch (e) {
        // Expected to throw from assertion, not callback
      }

      assert(
        assertCalled,
        "Assert should still be called despite callback error",
      );
    },
  );

  await t.step(
    "otherwise() warns about async callbacks on sync matchers",
    async () => {
      let warnCalled = false;
      let warnMessage = "";
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        warnCalled = true;
        warnMessage = args.join(" ");
      };

      const mockAssert = (
        condition: boolean,
        message: string,
        soft?: boolean,
        softMode?: SoftMode,
      ) => {
        if (!condition) {
          throw new Error(message);
        }
      };

      const config = createTestConfig({ assertFn: mockAssert });

      try {
        createExpectation(5, config)
          .toBe(10)
          .otherwise(async (ctx) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
          });
      } catch (e) {
        // Expected to throw
      } finally {
        console.warn = originalWarn;
      }

      assert(warnCalled, "Should warn about async callback on sync matcher");
      assert(
        warnMessage.includes("cannot be awaited"),
        `Warning message should mention 'cannot be awaited', got: ${warnMessage}`,
      );
      assert(
        warnMessage.includes("retrying matchers"),
        `Warning message should mention 'retrying matchers', got: ${warnMessage}`,
      );
    },
  );
});
