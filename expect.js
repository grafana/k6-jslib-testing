import { ConfigLoader } from "./config.ts";
import { createExpectation as createNonRetryingExpectation } from "./expectNonRetrying.ts";
import { createExpectation as createRetryingExpectation } from "./expectRetrying.ts";
import { isLocator, isPage } from "./expectations/utils.ts";
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
export const expect = makeExpect();
/**
 * Creates a new expect function with the given configuration.
 *
 * This allows us
 *
 * @param baseConfig The base configuration for the expect function.
 * @returns
 */
function makeExpect(baseConfig) {
  /**
   * Loads the configuration for the expect function.
   */
  const config = ConfigLoader.load(baseConfig);
  return Object.assign(function (value, message) {
    if (isLocator(value) || isPage(value)) {
      return createRetryingExpectation(value, config, message);
    } else {
      return createNonRetryingExpectation(value, config, message);
    }
  }, {
    soft(value, message) {
      if (isLocator(value) || isPage(value)) {
        return createRetryingExpectation(
          value,
          { ...config, soft: true },
          message,
        );
      } else {
        return createNonRetryingExpectation(
          value,
          { ...config, soft: true },
          message,
        );
      }
    },
    configure(newConfig) {
      return makeExpect(newConfig);
    },
    get config() {
      return { ...config };
    },
  });
}
