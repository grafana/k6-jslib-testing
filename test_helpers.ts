import { env } from "./environment.ts";
import { setDelayFunction } from "./delay.ts";

// Helper function to set an environment variable for the duration of a test
export function withEnv(key: string, value: string, fn: () => void) {
  const originalValue = env[key];
  env[key] = value;
  try {
    fn();
  } finally {
    env[key] = originalValue;
  }
}

/**
 * Configure the delay mechanism to use queueMicrotask for faster Deno tests.
 * This makes tests ~10x faster than the default setTimeout(1ms) used in k6.
 *
 * Call this once at the start of your test file.
 */
export function setupFastDenoTests() {
  setDelayFunction((callback) => {
    queueMicrotask(callback);
  });
}

/**
 * Waits for matchers to execute delayed throws.
 * Use this after calling a matcher to allow queueMicrotask/setTimeout to fire.
 */
export async function waitForMatcher(): Promise<void> {
  // Wait for queueMicrotask (Deno) or setTimeout (k6) to fire
  // Use longer timeout to ensure microtask has time to execute
  await new Promise((resolve) => setTimeout(resolve, 20));
}

/**
 * Waits for matcher to throw asynchronously and validates the error.
 * Use this for testing matchers that should fail.
 *
 * Note: Uses .otherwise() to make the throw synchronous.
 */
export function expectToThrowAsync(
  fn: () => void | unknown,
  errorCheck?: (error: Error) => boolean,
): void {
  let thrown = false;
  let error: Error | null = null;

  try {
    // Call the function which should return a MatcherResult
    const result = fn();

    // If it's a MatcherResult with .otherwise(), use that to make it throw synchronously
    if (
      result && typeof result === "object" && "otherwise" in result &&
      typeof result.otherwise === "function"
    ) {
      result.otherwise(() => {
        // Callback will be executed on failure
      });
    }
  } catch (e) {
    thrown = true;
    error = e as Error;
  }

  if (!thrown) {
    throw new Error("Expected function to throw an error");
  }

  if (errorCheck && error && !errorCheck(error)) {
    throw new Error(`Error check failed: ${error.message}`);
  }
}
