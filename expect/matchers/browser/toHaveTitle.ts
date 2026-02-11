import type { Page } from "k6/browser";
import { DEFAULT_RETRY_OPTIONS, type RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import { extend } from "../../extend.ts";
import { normalizeWhiteSpace } from "../../../utils/string.ts";
import { isPage } from "../../../expectations/utils.ts";
import { withRetry } from "./utils.ts";

declare module "../../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that the Page's title matches the given title.
     */
    toHaveTitle: Received extends Page ? (
        expected: RegExp | string,
        options?: Partial<RetryConfig>,
      ) => Promise<void>
      : never;
  }
}

extend("toHaveTitle", {
  match(
    received,
    expected: RegExp | string,
    options?: Partial<RetryConfig>,
  ) {
    if (!isPage(received)) {
      throw new AssertionFailed({
        format: "received",
        received: "unknown",
      });
    }

    const retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...this.config,
      ...options,
    };

    return withRetry(this, retryOptions, async () => {
      const actual = await received.title();
      const normalizedActual = normalizeWhiteSpace(actual);

      if (expected instanceof RegExp) {
        const result = expected.test(normalizedActual);

        if (!result) {
          throw new AssertionFailed({
            format: "text-match",
            expected: expected,
            received: normalizedActual,
            message: `'${normalizedActual}' did not match pattern ${expected}`,
          });
        }

        return {
          negate: {
            format: "text-match",
            expected: expected,
            received: normalizedActual,
          },
        };
      }

      const normalizedExpected = normalizeWhiteSpace(expected);

      if (normalizedActual !== normalizedExpected) {
        throw new AssertionFailed({
          format: "text-match",
          expected: normalizedExpected,
          received: normalizedActual,
          message:
            `'${normalizedActual}' did not match '${normalizedExpected}'`,
        });
      }

      return {
        negate: {
          format: "text-match",
          expected: normalizedExpected,
          received: normalizedActual,
        },
      };
    });
  },
});
