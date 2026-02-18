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
     * Ensures that Locator either does not resolve to any DOM node, or resolves to a non-visible one.
     */
    toBeHidden: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never;
  }
}

function hiddenMessage(expected: string, received: string): AnyError {
  return {
    format: "custom",
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

extend("toBeHidden", {
  match(received, options?: Partial<RetryConfig>) {
    if (!isLocator(received)) {
      throw new AssertionFailed({
        format: "received",
        received: "unknown",
      });
    }

    const locator = received as Locator;
    const retryOptions: Required<RetryConfig> = {
      ...DEFAULT_RETRY_OPTIONS,
      ...this.config,
      ...options,
    };

    return withRetry(this, retryOptions, async () => {
      const hidden = await locator.isHidden();

      if (!hidden) {
        throw new AssertionFailed(
          hiddenMessage("hidden", "visible"),
        );
      }

      return {
        negate: hiddenMessage("visible", "hidden"),
      };
    });
  },
});
