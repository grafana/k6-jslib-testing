import type { Locator } from "k6/browser";
import { DEFAULT_RETRY_OPTIONS, type RetryConfig } from "../../../config.ts";
import { type AnyError, AssertionFailed } from "../../errors.ts";
import { extend } from "../../extend.ts";
import { green, red } from "../../formatting/index.ts";
import { isLocatorWithViewport, withRetry } from "./utils.ts";

export interface ToBeInViewportOptions extends RetryConfig {
  ratio?: number;
}

declare module "../../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that Locator points to a DOM node that intersects the viewport.
     */
    toBeInViewport: Received extends Locator
      ? (options?: Partial<ToBeInViewportOptions>) => Promise<void>
      : never;
  }
}

function inViewportMessage(expected: string, received: string): AnyError {
  return {
    format: "custom",
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

extend("toBeInViewport", {
  match(received, options?: Partial<ToBeInViewportOptions>) {
    if (!isLocatorWithViewport(received)) {
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
      const inViewport = await received.isInViewport(
        options?.ratio === undefined ? undefined : { ratio: options.ratio },
      );

      if (!inViewport) {
        throw new AssertionFailed(
          inViewportMessage("in viewport", "outside viewport"),
        );
      }

      return {
        negate: inViewportMessage("outside viewport", "in viewport"),
      };
    });
  },
});
