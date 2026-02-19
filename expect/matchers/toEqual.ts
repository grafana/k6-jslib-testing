import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";
import { isDeepEqual } from "./utils.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Asserts that the value is equal to the expected value.
     *
     * @param expected the expected value
     */
    toEqual(expected: unknown): void;
  }
}

extend("toEqual", {
  match(received, expected) {
    if (!isDeepEqual(received, expected)) {
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
