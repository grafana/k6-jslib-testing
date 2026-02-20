import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";
import { green, red } from "../formatting/index.ts";
import { printJsValue } from "../formats/utils.ts";
import type { AnyError } from "../index.ts";

type CollectionLike = Array<unknown> | Set<unknown> | string;

type ItemType<T extends CollectionLike> = T extends Array<infer U> ? U
  : T extends Set<infer U> ? U
  : T extends string ? string
  : never;

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that a string contains an expected substring using a case-sensitive comparison,
     * or that an Array or Set contains an expected item.
     *
     * @param expected The substring or item to check for
     */
    toContain: Received extends CollectionLike
      ? (expected: ItemType<Received>) => void
      : never;
  }
}

function getReceivedType(received: CollectionLike): string {
  if (typeof received === "string") {
    return "string";
  }

  if (Array.isArray(received)) {
    return "array";
  }

  return "set";
}

function contains(received: CollectionLike, expected: unknown): boolean {
  if (typeof received === "string") {
    return typeof expected === "string" &&
      received.includes(expected);
  }

  if (Array.isArray(received)) {
    return received.includes(expected);
  }

  if (received instanceof Set) {
    return received.has(expected);
  }

  return false;
}

function toContainError(
  negated: boolean,
  expected: unknown,
  received: CollectionLike,
): AnyError {
  const receivedLabel = `Received ${getReceivedType(received)}`;

  const expectedLabel = negated
    ? "Expected not to contain"
    : "Expected to contain";

  return {
    format: "custom",
    content: {
      [expectedLabel]: green(printJsValue(expected)),
      [receivedLabel]: red(printJsValue(received)),
    },
  };
}

function isCollectionLike(value: unknown) {
  return typeof value === "string" ||
    Array.isArray(value) ||
    value instanceof Set;
}

extend("toContain", {
  match(received, expected: unknown) {
    if (!isCollectionLike(received)) {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: [Set, Array, "string"],
        received,
      });
    }

    if (!contains(received, expected)) {
      throw new AssertionFailed(
        toContainError(false, expected, received),
      );
    }

    return {
      negate: toContainError(true, expected, received),
    };
  },
});
