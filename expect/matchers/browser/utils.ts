import type { RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import type { NegatedResult } from "../../extend.ts";

export async function withRetry(
  retryOptions: Required<RetryConfig>,
  assertion: () => Promise<NegatedResult>,
): Promise<NegatedResult> {
  const timeout = retryOptions.timeout;
  const interval = retryOptions.interval;

  const start = Date.now();

  while (true) {
    try {
      return await assertion();
    } catch (err) {
      // Errors that are not AssertionFailed are treated as bugs or user input errors.
      if (err instanceof AssertionFailed === false) {
        throw err;
      }

      const elapsed = Date.now() - start;

      if (elapsed + interval > timeout) {
        // Retries exhausted, re-throw last AssertionFailed
        throw err;
      }
      // Sleep for interval then retry
      await new Promise((res) => setTimeout(res, interval));
    }
  }
}
