import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that value is NaN.
     */
    toBeNaN(): void;
  }
}

extend("toBeNaN", {
  match(received) {
    if (typeof received !== "number" || !isNaN(received)) {
      throw new AssertionFailed({
        format: "received",
        received,
      });
    }

    return {
      negate: {
        format: "received",
        received: NaN,
      },
    };
  },
});
