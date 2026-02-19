import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";
import { green, red, value } from "../formatting/index.ts";
import type { AnyError } from "../index.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Asserts that the value is close to the expected value with a given precision.
     *
     * @param expected the expected value
     * @param precision the number of decimal places to consider
     */
    toBeCloseTo(expected: number, precision?: number): void;
  }
}

function createErrorMessage(
  precision: number,
  expectedDiff: number,
  receivedDiff: number,
): AnyError {
  return {
    format: "custom",
    content: {
      "Expected precision": green(String(precision)),
      "Expected difference": value`< ${green(String(expectedDiff))}`,
      "Received difference": red(String(receivedDiff)),
    },
  };
}

extend("toBeCloseTo", {
  match(received, expected, precision = 2) {
    if (typeof received !== "number") {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: ["number"],
        received: received,
      });
    }

    const expectedDiff = Math.pow(10, -precision) / 2;
    const receivedDiff = Math.abs(expected - received);

    if (receivedDiff >= expectedDiff) {
      throw new AssertionFailed(
        createErrorMessage(precision, expectedDiff, receivedDiff),
      );
    }

    return {
      negate() {
        return createErrorMessage(precision, expectedDiff, receivedDiff);
      },
    };
  },
});
