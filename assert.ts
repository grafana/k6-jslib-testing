// NOTE (@oleiade): This is a shim for the k6/execution module, meaning that
// imports of k6-execution-shim will be replaced with k6/execution in the
// output bundle file.
//
// This allows us to avoid relying on the k6/execution module in the Deno runtime,
// which is not compatible with the k6 runtime. Instead replacing it with a mock
// implementation that does not abort the test. While making sure that we do replace
// it with the real k6/execution module when bundling for the k6 runtime.
//
// It allows us to use the `deno test` command and unit tests in the Deno runtime. While
// still being able to use the `k6 run` command and tests in the k6 runtime.
import exec from "k6-execution-shim";

/**
 * SoftMode defines how soft assertions should be handled when they fail.
 *
 * - 'throw': The assertion will throw an AssertionFailedError, which will fail the iteration but continue the test.
 * - 'fail': The assertion will mark the test as failed using exec.test.fail, but will continue execution.
 */
export type SoftMode = "throw" | "fail";

/**
 * assert is a function that checks a condition and fails the test if the condition is false.
 *
 * As a default, a failing assertion will immediately abort the whole test, exit with code 108, and
 * display an error message. If you want to continue the test after a failing assertion, you can pass
 * `true` as the third argument to `assert`.
 *
 * @param condition condition to assert the truthyness of
 * @param message the message to display if the condition is false
 * @param soft if true, the assertion will mark the test as failed without interrupting the execution
 * @param softMode defines how soft assertions should be handled when they fail (defaults to 'throw')
 */
export function assert(
  condition: boolean,
  message: string,
  soft?: boolean,
  softMode: SoftMode = "throw",
) {
  if (condition) return;

  if (soft) {
    if (softMode === "fail") {
      // Mark the test as failed but continue execution
      exec.test.fail(message);
    } else {
      // Default behavior: throw an error to fail the current iteration
      throw new AssertionFailedError(message);
    }
  } else {
    // This will the k6-execution-shim module's abort method in the Deno runtime.
    // It will instead be replaced with the k6/execution module's abort method
    // in the output bundle file produced by esbuild specifically for the k6 runtime.
    exec.test.abort(message);
  }
}

/**
 * This indicates that an assertion failed.
 *
 * It is used to express a soft assertion's failure, as throwing will not abort the
 * test, and will instead fail the iteration.
 */
export class AssertionFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionFailedError";
  }
}
