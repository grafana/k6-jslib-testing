import type { Locator } from "k6/browser";
import { DEFAULT_RETRY_OPTIONS, type RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import { extend } from "../../extend.ts";
import { green, red } from "../../formatting/index.ts";
import { isLocator } from "../../../expectations/utils.ts";
import { withRetry } from "./utils.ts";

declare module "../../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that the Locator points to a checked input.
     */
    toBeChecked: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never;
  }
}

function checkedMessage(expected: string, received: string) {
  return {
    format: "custom" as const,
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

extend("toBeChecked", {
  match(received, options?: Partial<RetryConfig>) {
    if (!isLocator(received)) {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: [{ name: "Locator" }],
        received: received,
      });
    }

    const retryOptions: Required<RetryConfig> = {
      ...DEFAULT_RETRY_OPTIONS,
      ...this.config,
      ...options,
    };

    return withRetry(this, retryOptions, async () => {
      const checked = await received.isChecked();

      if (!checked) {
        throw new AssertionFailed(
          checkedMessage("checked", "unchecked"),
        );
      }

      return {
        negate: checkedMessage("unchecked", "checked"),
      };
    });
  },
});
