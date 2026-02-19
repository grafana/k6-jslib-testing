// deno-lint-ignore-file

import { assert } from "@std/assert";
import { createExpectation } from "./expectNonRetrying.ts";
import type { ExpectConfig } from "./config.ts";
import { createMatchers } from "./expect/index.ts";
import { createMatchersWithSpy } from "./test_helpers.ts";

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
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case with array
    createMatchers([1, 2, 3]).toHaveLength(3);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test passing case with string
    createMatchers("abc").toHaveLength(3);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test failing case
    createMatchers([1, 2]).toHaveLength(3);
    assert(spy.called, "Assert should have been called on fail");
  });

  await t.step("toHaveLength with different types", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test with array
    createMatchers([1, 2, 3]).toHaveLength(3);
    assert(!spy.called, "Array with correct length should pass");

    spy.reset();

    // Test with string
    createMatchers("hello").toHaveLength(5);
    assert(!spy.called, "String with correct length should pass");

    spy.reset();

    // Test with array-like object
    const arrayLike = { length: 3, 0: "a", 1: "b", 2: "c" };
    createMatchers(arrayLike).toHaveLength(3);
    assert(!spy.called, "Array-like with correct length should pass");

    spy.reset();

    // Test with empty array
    createMatchers([]).toHaveLength(0);
    assert(!spy.called, "Empty array should pass");

    spy.reset();

    // Test with empty string
    createMatchers("").toHaveLength(0);
    assert(!spy.called, "Empty string should pass");
  });

  await t.step("toContain with string", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case with string
    createMatchers("hello world").toContain("world");
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test failing case with string
    createMatchers("hello world").toContain("universe");
    assert(spy.called, "Assert should have been called on fail");

    spy.reset();

    // Test case sensitivity
    createMatchers("hello World").toContain("world");
    assert(spy.called, "Condition should be false for case-sensitive mismatch");
  });

  await t.step("toContain with array", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case with array of primitives
    createMatchers([1, 2, 3]).toContain(2);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test failing case with array
    createMatchers([1, 2, 3]).toContain(4);
    assert(spy.called, "Assert should have been called on fail");

    spy.reset();

    // Test with array of objects (reference equality)
    const obj = { id: 1 };
    const array = [{ id: 2 }, obj, { id: 3 }];

    createMatchers(array).toContain(obj);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test with array of objects (different reference but same content)
    createMatchers(array).toContain({ id: 1 });
    assert(spy.called, "Condition should be false for different reference");
  });

  await t.step("toContain with Set", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case with Set
    const set = new Set([1, 2, 3]);
    createMatchers(set).toContain(2);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test failing case with Set
    createMatchers(set).toContain(4);
    assert(spy.called, "Assert should have been called on fail");

    spy.reset();

    // Test with Set of objects (reference equality)
    const obj = { id: 1 };
    const objSet = new Set([{ id: 2 }, obj, { id: 3 }]);

    createMatchers(objSet).toContain(obj);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test with Set of objects (different reference but same content)
    createMatchers(objSet).toContain({ id: 1 });
    assert(spy.called, "Condition should be false for different reference");
  });

  await t.step("toContain with unsupported type", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test with unsupported type - matcher throws AssertionFailed, extend calls fail()
    // @ts-expect-error - expected type mismatch
    createMatchers(123).toContain(2);
    assert(spy.called, "Assert should have been called for unsupported type");
  });

  await t.step("toContainEqual with array", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // Test passing case with array of primitives
    createMatchers([1, 2, 3]).toContainEqual(2);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test failing case with array
    createMatchers([1, 2, 3]).toContainEqual(4);
    assert(spy.called, "Assert should have been called on fail");

    spy.reset();

    // Test with array of objects (deep equality)
    const array = [{ id: 2 }, { id: 1 }, { id: 3 }];
    createMatchers(array).toContainEqual({ id: 1 });
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    // Test with nested objects
    const nestedArray = [
      { user: { name: "Alice", age: 30 } },
      { user: { name: "Bob", age: 25 } },
    ];
    createMatchers(nestedArray).toContainEqual({
      user: { name: "Bob", age: 25 },
    });
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    createMatchers(nestedArray).toContainEqual({
      user: { name: "Bob", age: 26 },
    });
    assert(spy.called, "Assert should have been called on fail");
  });

  await t.step("toContainEqual with Set", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    const set = new Set([1, 2, 3]);
    createMatchers(set).toContainEqual(2);
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    createMatchers(set).toContainEqual(4);
    assert(spy.called, "Assert should have been called on fail");

    spy.reset();

    const objSet = new Set([{ id: 2 }, { id: 1 }, { id: 3 }]);
    createMatchers(objSet).toContainEqual({ id: 1 });
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    const nestedSet = new Set([
      { user: { name: "Alice", age: 30 } },
      { user: { name: "Bob", age: 25 } },
    ]);
    createMatchers(nestedSet).toContainEqual({
      user: { name: "Bob", age: 25 },
    });
    assert(!spy.called, "Assert should not have been called on pass");

    spy.reset();

    createMatchers(nestedSet).toContainEqual({
      user: { name: "Bob", age: 26 },
    });
    assert(spy.called, "Assert should have been called on fail");
  });

  await t.step("toContainEqual with negation", () => {
    const [spy, createMatchers] = createMatchersWithSpy();

    // .not.toContainEqual when value is not in collection -> pass
    createMatchers([{ id: 1 }, { id: 2 }], undefined, true).toContainEqual({
      id: 3,
    });
    assert(!spy.called, "Negated pass should not call fail");

    spy.reset();

    // .not.toContainEqual when value is in collection -> fail
    createMatchers([{ id: 1 }, { id: 2 }], undefined, true).toContainEqual({
      id: 1,
    });
    assert(spy.called, "Negated fail should call fail");
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
