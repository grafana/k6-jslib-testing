import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that value is `undefined`.
     */
    toBeUndefined(): void;
  }
}

extend("toBeUndefined", {
  match(received) {
    if (received !== undefined) {
      throw new AssertionFailed({
        format: "received",
        received,
      });
    }

    return {
      negate: {
        format: "received",
        received: undefined,
      },
    };
  },
});
