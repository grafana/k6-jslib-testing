import type { Locator } from "k6/browser";
import { DEFAULT_RETRY_OPTIONS, type RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import { extend } from "../../extend.ts";
import { normalizeWhiteSpace } from "../../../utils/string.ts";
import { isLocator, withRetry } from "./utils.ts";

export interface ToContainTextOptions extends RetryConfig {
  /**
   * If true, comparison will be case-insensitive. If defined, this option will override the `i` flag of
   * regular expressions. Defaults to `undefined`.
   */
  ignoreCase?: boolean;

  /**
   * If true, the text will be compared using `innerText()` instead of `textContent()`. Defaults to `false`.
   */
  useInnerText?: boolean;
}

declare module "../../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that the Locator points to an element that contains the given text.
     * If the type of `expected` is a string, both the expected and actual text will have any zero-width
     * characters removed and whitespace collapsed to a single space. If the type of `expected`
     * is a regular expression, the content of the element will be matched against the regular expression as-is.
     */
    toContainText: Received extends Locator ? (
        expected: RegExp | string,
        options?: Partial<ToContainTextOptions>,
      ) => Promise<void>
      : never;
  }
}

extend("toContainText", {
  match(
    received,
    expected: RegExp | string,
    options?: Partial<ToContainTextOptions>,
  ) {
    if (!isLocator(received)) {
      throw new AssertionFailed({
        format: "received",
        received: "unknown",
      });
    }

    const locator = received as Locator;
    const retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...this.config,
      ...options,
    };

    return withRetry(this, retryOptions, async () => {
      const actualText = options?.useInnerText
        ? await locator.innerText()
        : await locator.textContent();

      if (actualText === null) {
        throw new AssertionFailed({
          format: "text-match",
          expected: expected instanceof RegExp ? expected : expected,
          received: "",
          message: "Element has no text content",
        });
      }

      const normalizedActual = normalizeWhiteSpace(actualText);

      if (expected instanceof RegExp) {
        const regexp = options?.ignoreCase !== undefined
          ? new RegExp(
            expected.source,
            expected.flags.replace("i", "") +
              (options.ignoreCase ? "i" : ""),
          )
          : expected;

        const result = regexp.test(normalizedActual);

        if (!result) {
          throw new AssertionFailed({
            format: "text-match",
            expected: regexp,
            received: normalizedActual,
            message: `'${normalizedActual}' did not match pattern ${regexp}`,
          });
        }

        return {
          negate: {
            format: "text-match",
            expected: regexp,
            received: normalizedActual,
          },
        };
      }

      const normalizedExpected = normalizeWhiteSpace(expected);

      const actual = options?.ignoreCase
        ? normalizedActual.toLowerCase()
        : normalizedActual;

      const exp = options?.ignoreCase
        ? normalizedExpected.toLowerCase()
        : normalizedExpected;

      if (!actual.includes(exp)) {
        throw new AssertionFailed({
          format: "text-match",
          expected: normalizedExpected,
          received: normalizedActual,
          message:
            `'${normalizedActual}' did not contain '${normalizedExpected}'`,
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
