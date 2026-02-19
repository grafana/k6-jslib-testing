import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Asserts that the value is greater than the expected value.
     *
     * @param expected the expected value
     */
    toBeGreaterThan: Received extends number | bigint
      ? (expected: number | bigint) => void
      : never;
  }
}

extend("toBeGreaterThan", {
  match(received, expected) {
    if (typeof received !== "number" && typeof received !== "bigint") {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: ["number", "bigint"],
        received: received,
      });
    }

    if (!(received > expected)) {
      throw new AssertionFailed({
        format: "relational-comparison",
        expected,
        received,
        operator: ">",
      });
    }

    return {
      negate: {
        format: "relational-comparison",
        expected,
        received,
        operator: ">",
      },
    };
  },
});
