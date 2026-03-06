import type { Locator } from "k6/browser";
import { DEFAULT_RETRY_OPTIONS, type RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import { extend } from "../../extend.ts";
import { isLocator, withRetry } from "./utils.ts";

declare module "../../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures the Locator points to an element with the given input value.
     */
    toHaveValue: Received extends Locator
      ? (value: string, options?: Partial<RetryConfig>) => Promise<void>
      : never;
  }
}

extend("toHaveValue", {
  match(received, expected: string, options?: Partial<RetryConfig>) {
    if (typeof expected !== "string") {
      throw new Error("Expected value must be a string.");
    }

    if (!isLocator(received)) {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: [{ name: "Locator" }],
        received,
      });
    }

    const locator = received as Locator;
    const retryOptions: Required<RetryConfig> = {
      ...DEFAULT_RETRY_OPTIONS,
      ...this.config,
      ...options,
    };

    return withRetry(this, retryOptions, async () => {
      const actualValue = await locator.inputValue();

      if (actualValue !== expected) {
        throw new AssertionFailed({
          format: "text-match",
          expected: expected,
          received: actualValue,
        });
      }

      return {
        negate: {
          format: "text-match",
          expected: expected,
          received: actualValue,
        },
      };
    });
  },
});
