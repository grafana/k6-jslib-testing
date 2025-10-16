import { assert } from "./assert.ts";
import { envParser } from "./environment.ts";
export const DEFAULT_RETRY_OPTIONS = {
  // 5 seconds default timeout
  timeout: 5000,
  // 100ms between retries
  interval: 100,
};
/**
 * Default configuration values, without any environment overrides
 */
export const DEFAULT_CONFIG = {
  ...DEFAULT_RETRY_OPTIONS,
  soft: false,
  softMode: "throw",
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
  static load(explicitConfig = {}) {
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
  static loadFromEnv() {
    const config = {};
    // Load colorize from environment variable
    if (envParser.hasValue("K6_TESTING_COLORIZE")) {
      config.colorize = envParser.boolean("K6_TESTING_COLORIZE");
    }
    // Load display from environment variable
    if (envParser.hasValue("K6_TESTING_DISPLAY")) {
      config.display = envParser.enum("K6_TESTING_DISPLAY", [
        "inline",
        "pretty",
      ]);
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
      config.softMode = envParser.enum("K6_TESTING_SOFT_MODE", [
        "throw",
        "fail",
      ]);
    }
    return config;
  }
}
