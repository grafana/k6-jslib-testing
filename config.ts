import { assert } from "./assert.ts";

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
   * Optional custom assertion function to be used instead of the default assert function.
   *
   * This function should have the same signature as the assert function.
   */
  assertFn?: (...args: Parameters<typeof import("./assert.ts").assert>) => void;
}

/**
 * Creates a default configuration for the expect function.
 * 
 * @returns the default configuration
 */
export function makeDefaultConfig(): ExpectConfig {
  return {
    ...DEFAULT_RETRY_OPTIONS,
    soft: false,
    display: "pretty",
    colorize: true,
    assertFn: assert,
  };
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
