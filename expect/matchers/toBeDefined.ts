import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Asserts that the value is not `undefined`.
     */
    toBeDefined(): void;
  }
}

extend("toBeDefined", {
  match(received) {
    if (received === undefined) {
      throw new AssertionFailed({
        format: "received",
        received: undefined,
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
