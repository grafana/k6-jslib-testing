import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Asserts that the value is truthy.
     */
    toBeFalsy(): void;
  }
}

extend("toBeFalsy", {
  match(received) {
    if (received) {
      throw new AssertionFailed({
        format: "received",
        received: received,
      });
    }

    return {
      negate: {
        format: "received",
        received,
      },
    };
  },
});
