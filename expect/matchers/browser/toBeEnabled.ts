import type { Locator } from "k6/browser";
import { DEFAULT_RETRY_OPTIONS, type RetryConfig } from "../../../config.ts";
import { type AnyError, AssertionFailed } from "../../errors.ts";
import { extend } from "../../extend.ts";
import { green, red } from "../../formatting/index.ts";
import { isLocator } from "../../../expectations/utils.ts";
import { withRetry } from "./utils.ts";

declare module "../../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures the Locator points to an enabled element.
     */
    toBeEnabled: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never;
  }
}

function enabledMessage(expected: string, received: string): AnyError {
  return {
    format: "custom",
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

extend("toBeEnabled", {
  match(received, options?: Partial<RetryConfig>) {
    if (!isLocator(received)) {
      throw new AssertionFailed({
        format: "received",
        received: "unknown",
      });
    }

    const retryOptions: Required<RetryConfig> = {
      ...DEFAULT_RETRY_OPTIONS,
      ...this.config,
      ...options,
    };

    return withRetry(this, retryOptions, async () => {
      const enabled = await received.isEnabled();

      if (!enabled) {
        throw new AssertionFailed(
          enabledMessage("enabled", "disabled"),
        );
      }

      return {
        negate: enabledMessage("disabled", "enabled"),
      };
    });
  },
});
