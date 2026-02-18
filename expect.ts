import type { Locator } from "k6/browser";
import { ConfigLoader, type ExpectConfig } from "./config.ts";
import {
  createExpectation as createNonRetryingExpectation,
  type NonRetryingExpectation,
} from "./expectNonRetrying.ts";
import {
  createLocatorExpectation,
  type LocatorExpectation,
} from "./expectRetrying.ts";
import { createMatchers, type MatchersFor } from "./expect/index.ts";

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
 * @param {unknown | Locator | Page} value The value to assert.
 */
export const expect: ExpectFunction = makeExpect();

export interface ExpectFunction {
  /**
   * The expect function can be used directly to assert that a value meets certain conditions.
   *
   * If the value argument provided to it is a Locator or Page, the expect function will
   * return a (asynchronous) RetryingExpectation, otherwise it will return a NonRetryingExpectation.
   */
  <T>(
    value: T,
    message?: string,
  ): Expectations<T>;

  /**
   * The soft function can be used to assert that a value meets certain conditions, but
   * without terminating the test if the assertion is not met.
   */
  soft<T>(
    value: T,
    message?: string,
  ): Expectations<T>;

  /**
   * Creates a new expect instance with the given configuration.
   */
  configure(newConfig: Partial<ExpectConfig>): ExpectFunction;

  /**
   * The configuration used by the expect function.
   */
  readonly config: ExpectConfig;
}

type Expectations<T> =
  & MatchersFor<T>
  & NonRetryingExpectation
  & LocatorExpectation
  & { not: Expectations<T> };

function createExpectations<T>(
  received: T,
  config: ExpectConfig,
  message: string | undefined,
  isNegated: boolean,
): Expectations<T> {
  return {
    ...createNonRetryingExpectation(received, config, message, isNegated),
    ...createLocatorExpectation(
      received as Locator,
      config,
      message,
      isNegated,
    ),

    ...createMatchers<T>({
      received: received,
      config,
      negated: isNegated,
      fail(message) {
        config.assertFn?.(false, message, config.soft, config.softMode);
      },
    }),

    get not() {
      return createExpectations(
        received,
        config,
        message,
        !isNegated,
      );
    },
  } as unknown as Expectations<T>;
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
    ): Expectations<T> {
      return createExpectations(value, config, message, false);
    },
    {
      soft<T>(
        value: T,
        message?: string,
      ): Expectations<T> {
        return createExpectations(
          value,
          { ...config, soft: true },
          message,
          false,
        );
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
