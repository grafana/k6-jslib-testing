import type { Locator } from "k6/browser";
import { ConfigLoader, type ExpectConfig } from "./config.ts";
import {
  createExpectation as createNonRetryingExpectation,
  type NonRetryingExpectation,
} from "./expectNonRetrying.ts";
import {
  createExpectation as createRetryingExpectation,
  type RetryingExpectation,
} from "./expectRetrying.ts";
import { isLocator } from "./expectations/utils.ts";

/**
 * The expect function is used to assert that a value meets certain conditions.
 *
 * The expect function can be used in two ways:
 *
 * 1. Non-retrying: The expect function will perform the assertion only once. If the assertion
 * is not met, the test will fail.
 * 2. Retrying: The expect function will perform the assertion multiple times, until the assertion
 * is met or the timeout is reached. If the assertion is not met, the test will fail.
 *
 * @param {unknown | Locator} value The value to assert.
 */
export const expect: ExpectFunction = makeExpect();

export interface ExpectFunction {
  /**
   * The expect function can be used directly to assert that a value meets certain conditions.
   *
   * If the value argument provided to it is a Locator, the expect function will
   * return a (asynchronous) RetryingExpectation, otherwise it will return a NonRetryingExpectation.
   */
  <T>(value: T, message?: string): T extends Locator ? RetryingExpectation
    : NonRetryingExpectation;

  /**
   * The soft function can be used to assert that a value meets certain conditions, but
   * without terminating the test if the assertion is not met.
   */
  soft<T>(
    value: T,
    message?: string,
  ): T extends Locator ? RetryingExpectation : NonRetryingExpectation;

  /**
   * Creates a new expect instance with the given configuration.
   */
  configure(newConfig: Partial<ExpectConfig>): ExpectFunction;

  /**
   * The configuration used by the expect function.
   */
  readonly config: ExpectConfig;
}

/**
 * Creates a new expect function with the given configuration.
 *
 * This allows us
 *
 * @param baseConfig The base configuration for the expect function.
 * @returns
 */
function makeExpect(baseConfig?: Partial<ExpectConfig>): ExpectFunction {
  /**
   * Loads the configuration for the expect function.
   */
  const config = ConfigLoader.load(baseConfig);

  return Object.assign(
    function <T>(
      value: T,
      message?: string,
    ): T extends Locator ? RetryingExpectation : NonRetryingExpectation {
      if (isLocator(value)) {
        return createRetryingExpectation(
          value as Locator,
          config,
          message,
        ) as T extends Locator ? RetryingExpectation : NonRetryingExpectation;
      } else {
        return createNonRetryingExpectation(
          value,
          config,
          message,
        ) as T extends Locator ? RetryingExpectation : NonRetryingExpectation;
      }
    },
    {
      soft<T>(
        value: T,
        message?: string,
      ): T extends Locator ? RetryingExpectation : NonRetryingExpectation {
        if (isLocator(value)) {
          return createRetryingExpectation(
            value as Locator,
            { ...config, soft: true },
            message,
          ) as T extends Locator ? RetryingExpectation : NonRetryingExpectation;
        } else {
          return createNonRetryingExpectation(
            value,
            { ...config, soft: true },
            message,
          ) as T extends Locator ? RetryingExpectation : NonRetryingExpectation;
        }
      },
      configure(newConfig: Partial<ExpectConfig>): ExpectFunction {
        return makeExpect(newConfig);
      },
      get config(): ExpectConfig {
        return { ...config };
      },
    },
  );
}
