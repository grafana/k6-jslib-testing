import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that value is null.
     */
    toBeNull(): void;
  }
}

extend("toBeNull", {
  match(received) {
    if (received !== null) {
      throw new AssertionFailed({
        format: "received",
        received,
      });
    }

    return {
      negate: {
        format: "received",
        received: null,
      },
    };
  },
});
