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
     * Ensures the Locator points to an editable element.
     */
    toBeEditable: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never;
  }
}

function editableMessage(expected: string, received: string): AnyError {
  return {
    format: "custom",
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

extend("toBeEditable", {
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
      const editable = await locator.isEditable();

      if (!editable) {
        throw new AssertionFailed(
          editableMessage("editable", "uneditable"),
        );
      }

      return {
        negate: editableMessage("uneditable", "editable"),
      };
    });
  },
});
