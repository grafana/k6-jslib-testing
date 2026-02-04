import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Asserts that the value is equal to the expected value.
     *
     * @param expected the expected value
     */
    toBe(expected: unknown): void;
  }
}

extend("toBe", {
  match(received, expected) {
    if (!Object.is(received, expected)) {
      throw new AssertionFailed({
        format: "expected-received",
        expected,
        received,
      });
    }

    return {
      negate: {
        format: "expected-received",
        expected,
        received,
      },
    };
  },
});
