/**
 * This is a mock implementation of the k6/execution module for non-k6 environments.
 *
 * It is used to avoid relying on the k6/execution module in the Deno runtime,
 * which is not compatible with the k6 runtime. Instead replacing it with a mock
 * implementation that does not abort the test. While making sure that we do replace
 * it with the real k6/execution module when bundling for the k6 runtime (using esbuild).
 *
 * It allows us to use the `deno test` command and unit tests in the Deno runtime. While
 * still being able to use the `k6 run` command and tests in the k6 runtime.
 */

// Default/mock export for non-k6 environments:
export default {
  test: {
    abort(message: string): void {
      throw new AbortedTestError(`Test aborted: ${message}`);
    },
    fail(message: string): void {
      throw new Error(`Test marked as failed: ${message}`);
    },
  },
};

/**
 * This indicates that the test was aborted.
 *
 * It is used to indicate that the test was aborted in the Deno runtime, where
 * the k6/execution module is not available.
 */
export class AbortedTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AbortedTestError";
  }
}
