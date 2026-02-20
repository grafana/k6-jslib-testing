import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";
import { green, red } from "../formatting/index.ts";
import { printJsValue } from "../formats/utils.ts";
import { isDeepEqual } from "./utils.ts";
import type { AnyError } from "../index.ts";

type ArrayOrSet = Array<unknown> | Set<unknown>;

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that value is an Array or Set and contains an item equal to the expected.
     *
     * For objects, this method recursively checks equality of all fields, rather than comparing objects by reference.
     * For primitive values, this method is equivalent to expect(value).toContain().
     *
     * @param expected The item to check for deep equality within the collection
     */
    toContainEqual: Received extends ArrayOrSet ? (expected: unknown) => void
      : never;
  }
}

function getReceivedType(received: ArrayOrSet): "array" | "set" {
  return Array.isArray(received) ? "array" : "set";
}

function containsEqual(received: ArrayOrSet, expected: unknown): boolean {
  if (Array.isArray(received)) {
    return received.some((item) => isDeepEqual(item, expected));
  }

  return Array.from(received).some((item) => isDeepEqual(item, expected));
}

function toContainEqualError(
  negated: boolean,
  expected: unknown,
  received: ArrayOrSet,
): AnyError {
  const receivedType = getReceivedType(received);
  const receivedLabel = `Received ${receivedType}` as const;
  const expectedLabel = negated
    ? "Expected not to contain equal"
    : "Expected to contain equal";

  return {
    format: "custom",
    content: {
      [expectedLabel]: green(printJsValue(expected)),
      [receivedLabel]: red(printJsValue(received)),
    },
  };
}

function isArrayOrSet(value: unknown): value is ArrayOrSet {
  return Array.isArray(value) || value instanceof Set;
}

extend("toContainEqual", {
  match(received, expected) {
    if (!isArrayOrSet(received)) {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: [Array, Set],
        received,
      });
    }

    if (!containsEqual(received, expected)) {
      throw new AssertionFailed(
        toContainEqualError(false, expected, received),
      );
    }

    return {
      negate: toContainEqualError(true, expected, received),
    };
  },
});
