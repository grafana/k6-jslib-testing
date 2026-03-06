import { assert } from "./assert.ts";
import {
  DEFAULT_RETRY_OPTIONS,
  type ExpectConfig,
  type RetryConfig,
} from "./config.ts";
import { captureExecutionContext } from "./execution.ts";
import {
  type MatcherErrorInfo,
  MatcherErrorRendererRegistry,
} from "./render.ts";
import { parseStackTrace } from "./stacktrace.ts";
import type { Locator } from "k6/browser";
import { normalizeWhiteSpace } from "./utils/string.ts";

interface ToHaveTextOptions extends RetryConfig {
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

/**
 * LocatorExpectation defines methods for asserting on Locator objects (DOM elements).
 * These assertions retry automatically until they pass or timeout.
 */
export interface LocatorExpectation {
  /**
   * Negates the expectation, causing the assertion to pass when it would normally fail, and vice versa.
   */
  not: LocatorExpectation;

  /**
   * Ensures that the Locator points to an element that contains the given text.
   *
   * If the type of `expected` is a string, both the expected and actual text will have any zero-width
   * characters removed and whitespace characters collapsed to a single space. If the type of `expected`
   * is a regular expression, the content of the element will be matched against the regular expression as-is.
   */
  toContainText(
    expected: RegExp | string,
    options?: Partial<ToHaveTextOptions>,
  ): Promise<void>;
}

/**
 * createLocatorExpectation is a factory function that creates an expectation object for Locator values.
 *
 * Note that although the browser `is` prefixed methods are used, and return boolean values, we
 * throw errors if the condition is not met. This is to ensure that we align with playwright's
 * API, and have matchers return `Promise<void>`, as opposed to `Promise<boolean>`.
 *
 * @param locator the Locator to create an expectation for
 * @param config the configuration for the expectation
 * @param message the optional custom message for the expectation
 * @param isNegated whether the expectation is negated
 * @returns an expectation object over the locator exposing locator-specific methods
 */
export function createLocatorExpectation(
  locator: Locator,
  config: ExpectConfig,
  message?: string,
  isNegated: boolean = false,
): LocatorExpectation {
  // In order to facilitate testing, we support passing in a custom assert function.
  // As a result, we need to make sure that the assert function is always available, and
  // if not, we need to use the default assert function.
  //
  // From this point forward, we will use the `usedAssert` variable to refer to the assert function.
  const usedAssert = config.assertFn ?? assert;
  const isSoft = config.soft ?? false;
  const retryConfig: RetryConfig = {
    timeout: config.timeout,
    interval: config.interval,
  };

  // Configure the renderer with the colorize option.
  MatcherErrorRendererRegistry.configure({
    colorize: config.colorize,
    display: config.display,
  });

  const matchText = async (
    matcherName: string,
    expected: RegExp | string,
    options: Partial<ToHaveTextOptions> = {},
    compareFn: (actual: string, expected: string) => boolean,
  ) => {
    const stacktrace = parseStackTrace(new Error().stack);
    const executionContext = captureExecutionContext(stacktrace);

    if (!executionContext) {
      throw new Error("k6 failed to capture execution context");
    }

    const checkRegExp = (expected: RegExp, actual: string) => {
      // `ignoreCase` should take precedence over the `i` flag of the regex if it is defined.
      const regexp = options.ignoreCase !== undefined
        ? new RegExp(
          expected.source,
          expected.flags.replace("i", "") + (options.ignoreCase ? "i" : ""),
        )
        : expected;

      const info: MatcherErrorInfo = {
        executionContext,
        matcherName,
        expected: regexp.toString(),
        received: actual,
        matcherSpecific: { isNegated },
        customMessage: message,
      };

      const result = regexp.test(actual);

      usedAssert(
        isNegated ? !result : result,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    };

    const checkText = (expected: string, actual: string) => {
      const normalizedExpected = normalizeWhiteSpace(expected);
      const normalizedActual = normalizeWhiteSpace(actual);

      const info: MatcherErrorInfo = {
        executionContext,
        matcherName,
        expected: normalizedExpected,
        received: normalizedActual,
        matcherSpecific: { isNegated },
        customMessage: message,
      };

      const result = options.ignoreCase
        ? compareFn(
          normalizedActual.toLowerCase(),
          normalizedExpected.toLowerCase(),
        )
        : compareFn(normalizedActual, normalizedExpected);

      usedAssert(
        isNegated ? !result : result,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    };

    try {
      await withRetry(
        async () => {
          const actualText = options.useInnerText
            ? await locator.innerText()
            : await locator.textContent();

          if (actualText === null) {
            throw new Error("Element has no text content");
          }

          if (expected instanceof RegExp) {
            checkRegExp(expected, actualText);

            return;
          }

          checkText(expected, actualText);
        },
        { ...retryConfig, ...options },
      );
    } catch (_) {
      const info: MatcherErrorInfo = {
        executionContext,
        matcherName,
        expected: expected.toString(),
        received: "unknown",
        matcherSpecific: { isNegated },
        customMessage: message,
      };

      usedAssert(
        false,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    }
  };

  const expectation: LocatorExpectation = {
    get not(): LocatorExpectation {
      return createLocatorExpectation(locator, config, message, !isNegated);
    },

    toContainText(
      expected: RegExp | string,
      options: Partial<ToHaveTextOptions> = {},
    ) {
      return matchText(
        "toContainText",
        expected,
        options,
        (actual, expected) => actual.includes(expected),
      );
    },

  };

  return expectation;
}

/**
 * Implements retry logic for async assertions.
 *
 * @param assertion Function that performs the actual check
 * @param options Retry configuration
 * @returns Promise that resolves when assertion passes or rejects if timeout is reached
 */
export async function withRetry(
  assertion: () => Promise<void>,
  options: RetryConfig & {
    // Optional test hooks - only used in testing
    _now?: () => number;
    _sleep?: (ms: number) => Promise<void>;
  } = {},
): Promise<boolean> {
  const timeout: number = options.timeout ?? DEFAULT_RETRY_OPTIONS.timeout;
  const interval: number = options.interval ?? DEFAULT_RETRY_OPTIONS.interval;
  const getNow = options._now ?? (() => Date.now());
  const sleep = options._sleep ??
    ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));

  const startTime: number = getNow();

  while (getNow() - startTime < timeout) {
    try {
      await assertion();
      return true;
    } catch (_error) {
      // Ignore error and continue retrying
    }

    await sleep(interval);
  }

  throw new RetryTimeoutError(
    `Expect condition not met within ${timeout}ms timeout`,
  );
}

/**
 * RetryTimeoutError is an error that is thrown when an expectation is not met within a provided timeout.
 */
export class RetryTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryTimeoutError";
  }
}
