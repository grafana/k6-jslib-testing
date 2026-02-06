import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that value is true in a boolean context, anything but false, 0, '', null, undefined or NaN.
     * Use this method when you don't care about the specific value.
     */
    toBeTruthy(): void;
  }
}

extend("toBeTruthy", {
  match(received) {
    if (!received) {
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
