import {
  DEFAULT_RETRY_OPTIONS,
  type ExpectConfig,
  type RetryConfig,
} from "./config.ts";
import type { Locator } from "k6/browser";

/**
 * LocatorExpectation defines methods for asserting on Locator objects (DOM elements).
 * These assertions retry automatically until they pass or timeout.
 */
export interface LocatorExpectation {
  /**
   * Negates the expectation, causing the assertion to pass when it would normally fail, and vice versa.
   */
  not: LocatorExpectation;
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
  return {
    get not(): LocatorExpectation {
      return createLocatorExpectation(locator, config, message, !isNegated);
    },
  };
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
