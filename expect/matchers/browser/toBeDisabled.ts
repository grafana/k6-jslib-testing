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
     * Ensures the Locator points to a disabled element.
     * Element is disabled if it has "disabled" attribute or is disabled via 'aria-disabled'.
     *
     * Note that only native control elements such as HTML button, input, select, textarea, option, optgroup can be disabled by setting "disabled" attribute.
     * "disabled" attribute on other elements is ignored by the browser.
     */
    toBeDisabled: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never;
  }
}

function disabledMessage(expected: string, received: string): AnyError {
  return {
    format: "custom",
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

extend("toBeDisabled", {
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
      const disabled = await received.isDisabled();

      if (!disabled) {
        throw new AssertionFailed(
          disabledMessage("disabled", "enabled"),
        );
      }

      return {
        negate: disabledMessage("enabled", "disabled"),
      };
    });
  },
});
