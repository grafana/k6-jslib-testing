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
     * Ensures the Locator points to an empty element. If the element is an input,
     * it will be empty if it has no value. If the element is not an input, it will
     * be empty if it has no text content.
     */
    toBeEmpty: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never;
  }
}

function emptyMessage(expected: string, received: string): AnyError {
  return {
    format: "custom",
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

async function isEmpty(locator: Locator): Promise<boolean> {
  try {
    return await locator.inputValue().then((text) => text.length === 0);
  } catch (error) {
    const msg = error instanceof Error ? error.toString() : String(error);

    // FIXME: This is brittle since it relies on the error message.
    //        We should consider moving the logic to the browser module
    //        in k6 itself.
    //        See https://github.com/grafana/k6-jslib-testing/issues/43
    //        for more details.
    if (
      !msg.includes(
        "Node is not an <input>, <textarea> or <select> element",
      )
    ) {
      throw error;
    }

    const text = await locator.textContent();
    if (text === null || text === undefined) {
      return true;
    }
    return text.trim().length === 0;
  }
}

extend("toBeEmpty", {
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
      const empty = await isEmpty(received);

      if (!empty) {
        throw new AssertionFailed(
          emptyMessage("empty", "not empty"),
        );
      }

      return {
        negate: emptyMessage("not empty", "empty"),
      };
    });
  },
});
