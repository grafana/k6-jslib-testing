// In the k6 runtime, the __ENV object is available and contains the environment variables.
export declare const __ENV: Record<string, string | undefined>;

/**
 * Environment interface that matches the shape of k6's __ENV object.
 */
export interface Environment {
  [key: string]: string | undefined;
}

function getEnvironment(): Environment {
  // When running in Deno
  if (typeof Deno !== "undefined") {
    return Deno.env.toObject();
  }

  // When running in k6
  return __ENV;
}

// Export a singleton instance of the environment object
export const env: Environment = getEnvironment();

/**
 * Environment variable parser
 */
export const envParser = {
  /**
   * Check if an environment variable is set
   */
  hasValue(key: string): boolean {
    return env[key] !== undefined;
  },

  /**
   * Parse a boolean environment variable
   * "false" (case insensitive) -> false
   * anything else -> true
   * @throws if value is undefined
   */
  boolean(key: string): boolean {
    const value = env[key]?.toLowerCase();
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value !== "false";
  },

  /**
   * Parse an environment variable that should match specific values
   * @throws if value is undefined or doesn't match allowed values
   */
  enum<T extends string>(key: string, allowedValues: T[]): T {
    const value = env[key]?.toLowerCase() as T;
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    if (!allowedValues.includes(value)) {
      throw new Error(
        `Invalid value for ${key}. Must be one of: ${allowedValues.join(", ")}`
      );
    }
    return value;
  }
};