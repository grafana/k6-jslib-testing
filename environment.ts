// In the k6 runtime, the __ENV object is available and contains the environment variables.
export declare const __ENV: Record<string, string | undefined>;

/**
 * Environment interface that matches the shape of k6's __ENV object.
 */
export interface Environment {
  [key: string]: string | undefined;
}

type DenoEnv = { env: { toObject(): Record<string, string> } };

function getEnvironment(): Environment {
  const deno = (globalThis as { Deno?: DenoEnv }).Deno;

  if (deno) {
    return deno.env.toObject();
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
        `Invalid value for ${key}. Must be one of: ${allowedValues.join(", ")}`,
      );
    }
    return value;
  },

  /**
   * Parses an environment variable as a non-negative number.
   * @param name The name of the environment variable
   * @throws Error if the value is not a valid non-negative number
   * @returns The parsed number value
   */
  number(name: string): number {
    const value = env[name];
    if (!value) {
      throw new Error(`Environment variable ${name} is not set`);
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      throw new Error(
        `Environment variable ${name} must be a valid number, got: ${value}`,
      );
    }

    if (parsed < 0) {
      throw new Error(
        `Environment variable ${name} must be a non-negative number, got: ${value}`,
      );
    }

    return parsed;
  },
};
