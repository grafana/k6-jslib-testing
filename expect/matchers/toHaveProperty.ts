import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";
import { getPropertyByPath, isDeepEqual } from "./utils.ts";
import type { AnyError } from "../index.ts";
import { green, red, white } from "../formatting/index.ts";
import { printJsValue } from "../formats/utils.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that property at provided `keyPath` exists on the object and optionally checks
     * that property is equal to the expected. Equality is checked recursively, similarly to expect(value).toEqual().
     *
     * @param keyPath Path to the property. Use dot notation a.b to check nested properties
     *                and indexed a[2] notation to check nested array items.
     * @param expected Optional expected value to compare the property to.
     */
    toHaveProperty(keyPath: string, expected?: unknown): void;
  }
}

function formatError(
  keyPath: string,
  received: unknown,
  expected: { value: unknown } | undefined,
  negated = false,
): AnyError {
  const expectedLabel = expected !== undefined
    ? (negated
      ? "Expected property not to equal"
      : "Expected property to equal")
    : (negated
      ? "Expected property not to exist"
      : "Expected property to exist");

  return {
    format: "custom",
    content: {
      "Property path": white(keyPath),
      [expectedLabel]: expected !== undefined
        ? green(printJsValue(expected.value))
        : "",
      "Received object": red(printJsValue(received)),
    },
  };
}

extend("toHaveProperty", {
  match(received, keyPath, expected) {
    if (typeof received !== "object" || received === null) {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: "object",
        received: received === null ? "null" : typeof received,
      });
    }

    const expectedValue = arguments.length === 3
      ? { value: expected }
      : undefined;

    let receivedValue: unknown;

    try {
      receivedValue = getPropertyByPath(
        received as Record<string, unknown>,
        keyPath,
      );
    } catch {
      throw new AssertionFailed(
        formatError(keyPath, received, expectedValue, false),
      );
    }

    if (expected !== undefined && !isDeepEqual(receivedValue, expected)) {
      throw new AssertionFailed(formatError(keyPath, received, expectedValue));
    }

    return {
      negate() {
        return formatError(keyPath, received, expectedValue, true);
      },
    };
  },
});
