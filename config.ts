import { assert, type SoftMode } from "./assert.ts";
import { envParser } from "./environment.ts";

/**
 * Options that can be set for the expect function.
 */
export interface ExpectConfig extends RenderConfig, RetryConfig {
  /**
   * Setting this option to true will make the assertions performed by expect
   * to be always soft, meaning that they will not fail the test if the assertion
   * is not met.
   */
  soft: boolean;

  /**
   * Controls how soft assertions behave when they fail.
   *
   * - 'throw': The assertion will throw an AssertionFailedError which will fail the iteration but continue the test.
   * - 'fail': The assertion will mark the test as failed using exec.test.fail but will continue execution.
   *
   * @default 'throw'
   */
  softMode: SoftMode;

  /**
   * Optional custom assertion function to be used instead of the default assert function.
   *
   * This function should have the same signature as the assert function.
   */
  assertFn?: (...args: Parameters<typeof import("./assert.ts").assert>) => void;
}

/**
 * The configuration for the retry behavior.
 */
export interface RetryConfig {
  /**
   * Maximum amount of time to retry in milliseconds.
   * @default 5000
   */
  timeout?: number;

  /**
   * Time between retries in milliseconds.
   * @default 100
   */
  interval?: number;
}

export const DEFAULT_RETRY_OPTIONS: Required<RetryConfig> = {
  // 5 seconds default timeout
  timeout: 5000,
  // 100ms between retries
  interval: 100,
};

/**
 * The configuration for the renderer.
 */
export interface RenderConfig {
  /**
   * Setting this option to false will disable the colorization of the output of the
   * expect function. The default is true.
   */
  colorize: boolean;

  /**
   * Expectations can be displayed in two different ways: inline or pretty.
   * The default is pretty.
   *
   * When displayed inline, the expectation will be displayed in a single line, to
   * make it easier to interpret the output when written to logs.
   *
   * When displayed pretty, the expectation will be displayed in a more human-readable
   * format, with each part of the expectation in a separate line.
   */
  display: DisplayFormat;
}

/**
 * The display format to use.
 *
 * "pretty" is the default format and outputs in a human readable format with aligned columns.
 * "inline" is a logfmt style format that outputs in a single line.
 */
export type DisplayFormat = "inline" | "pretty";

/**
 * Default configuration values, without any environment overrides
 */
export const DEFAULT_CONFIG: ExpectConfig = {
  ...DEFAULT_RETRY_OPTIONS,
  soft: false,
  softMode: "fail",
  colorize: true,
  display: "pretty",
  assertFn: assert,
};

/**
 * Configuration loader that handles different sources of configuration
 * with clear precedence rules
 */
export class ConfigLoader {
  /**
   * Loads configuration with the following precedence (highest to lowest):
   * 1. Environment variables
   * 2. Explicit configuration passed to the function
   * 3. Default values
   */
  static load(explicitConfig: Partial<ExpectConfig> = {}): ExpectConfig {
    const envConfig = ConfigLoader.loadFromEnv();

    return {
      ...DEFAULT_CONFIG,
      ...explicitConfig,
      ...envConfig,
    };
  }

  /**
   * Loads configuration from environment variables
   * Returns only the values that are explicitly set in the environment
   */
  private static loadFromEnv(): Partial<ExpectConfig> {
    const config: Partial<ExpectConfig> = {};

    // Load colorize from environment variable
    if (envParser.hasValue("K6_TESTING_COLORIZE")) {
      config.colorize = envParser.boolean("K6_TESTING_COLORIZE");
    }

    // Load display from environment variable
    if (envParser.hasValue("K6_TESTING_DISPLAY")) {
      config.display = envParser.enum<DisplayFormat>(
        "K6_TESTING_DISPLAY",
        ["inline", "pretty"],
      );
    }

    // Load timeout from environment variable
    if (envParser.hasValue("K6_TESTING_TIMEOUT")) {
      config.timeout = envParser.number("K6_TESTING_TIMEOUT");
    }

    // Load interval from environment variable
    if (envParser.hasValue("K6_TESTING_INTERVAL")) {
      config.interval = envParser.number("K6_TESTING_INTERVAL");
    }

    // Load softMode from environment variable
    if (envParser.hasValue("K6_TESTING_SOFT_MODE")) {
      config.softMode = envParser.enum<SoftMode>(
        "K6_TESTING_SOFT_MODE",
        ["throw", "fail"],
      );
    }

    return config;
  }
}
