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
