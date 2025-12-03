import type { OtherwiseCallback, OtherwiseErrorContext } from "./expectNonRetrying.ts";

/**
 * Result object returned by non-retrying (synchronous) matchers.
 * Allows optional .otherwise() chaining after the matcher executes.
 */
export interface MatcherResult {
  /**
   * Registers a callback to execute if the matcher failed.
   * If the matcher passed, this is a no-op.
   * This is a terminal operation that returns void.
   *
   * NOTE: Async callbacks are not awaited in synchronous matchers.
   * Use retrying matchers (toBeVisible, toBeChecked, etc.) for async operations.
   *
   * @param callback Function to execute on failure
   * @returns void (terminal operation)
   */
  otherwise(callback: OtherwiseCallback): void;
}

/**
 * Result object returned by retrying (asynchronous) matchers.
 * Allows optional .otherwise() chaining after the matcher executes.
 */
export interface AsyncMatcherResult {
  /**
   * Registers a callback to execute if the matcher failed.
   * If the matcher passed, this is a no-op.
   * This is a terminal operation that returns Promise<void>.
   *
   * Async callbacks will be awaited before throwing the error.
   *
   * @param callback Function to execute on failure (can be async)
   * @returns Promise<void> (terminal operation)
   */
  otherwise(callback: OtherwiseCallback): Promise<void>;
}

/**
 * Internal implementation of MatcherResult for synchronous matchers.
 * Encapsulates the result of a matcher execution along with error context.
 */
export class MatcherResultImpl implements MatcherResult {
  private otherwiseCalled = false;

  constructor(
    private passed: boolean,
    private errorContext: OtherwiseErrorContext | null,
    private throwError: (() => void) | null,
  ) {
    // Use setTimeout with 1ms delay to allow .otherwise() to be called first
    // queueMicrotask runs too early in k6's runtime
    if (this.throwError) {
      setTimeout(() => {
        if (!this.otherwiseCalled) {
          this.throwError!();
        }
      }, 1);
    }
  }

  otherwise(callback: OtherwiseCallback): void {
    this.otherwiseCalled = true;

    // Only execute callback if the matcher failed and we have error context
    if (!this.passed && this.errorContext) {
      try {
        const result = callback(this.errorContext);

        // Warn if async callback used with sync matcher
        if (result instanceof Promise) {
          console.warn(
            "Warning: .otherwise() callback returned a Promise but cannot be awaited " +
            "in synchronous matchers. Use retrying matchers (toBeVisible, toHaveText, etc.) for async operations."
          );

          // Catch any errors in the async callback
          result.catch((callbackError) => {
            console.error("Error in async .otherwise() callback:", callbackError);
          });
        }
      } catch (callbackError) {
        console.error("Error in .otherwise() callback:", callbackError);
      }

      // When .otherwise() is used, throw a catchable error instead of using exec.test.abort()
      // This allows the error to be caught in try-catch blocks
      throw new Error(this.errorContext.message);
    }
  }
}

/**
 * Internal implementation of AsyncMatcherResult for asynchronous matchers.
 * Encapsulates the result of an async matcher execution along with error context.
 */
export class AsyncMatcherResultImpl implements AsyncMatcherResult {
  private otherwiseCalled = false;

  constructor(
    private passed: boolean,
    private errorContext: OtherwiseErrorContext | null,
    private throwError: (() => void) | null,
  ) {
    // Use setTimeout with 1ms delay to allow .otherwise() to be called first
    // queueMicrotask runs too early in k6's runtime
    if (this.throwError) {
      setTimeout(() => {
        if (!this.otherwiseCalled) {
          this.throwError!();
        }
      }, 1);
    }
  }

  async otherwise(callback: OtherwiseCallback): Promise<void> {
    this.otherwiseCalled = true;

    // Only execute callback if the matcher failed and we have error context
    if (!this.passed && this.errorContext) {
      try {
        const result = callback(this.errorContext);

        // If callback returned a Promise, await it
        if (result instanceof Promise) {
          await result;
        }
      } catch (callbackError) {
        console.error("Error in .otherwise() callback:", callbackError);
      }

      // When .otherwise() is used, throw a catchable error instead of using exec.test.abort()
      // This allows the error to be caught in try-catch blocks
      throw new Error(this.errorContext.message);
    }
  }
}

/**
 * A Promise-like wrapper for AsyncMatcherResult that enables direct .otherwise() chaining
 * without requiring await. This class implements PromiseLike<void> so it can still be
 * awaited if needed.
 *
 * Example usage:
 *   expect(locator).toBeVisible().otherwise((ctx) => { ... })
 *   // OR
 *   await expect(locator).toBeVisible()
 */
export class PromiseLikeMatcherResult implements PromiseLike<void> {
  private otherwiseCalled = false;
  private resultPromise: Promise<AsyncMatcherResult>;

  constructor(resultPromise: Promise<AsyncMatcherResult>) {
    this.resultPromise = resultPromise;
  }

  /**
   * Registers a callback to execute if the matcher failed.
   * This is called synchronously on the wrapper, but the callback
   * execution happens after the async matcher completes.
   *
   * @param callback Function to execute on failure
   * @returns Promise<void> for awaiting
   */
  otherwise(callback: OtherwiseCallback): Promise<void> {
    this.otherwiseCalled = true;

    return this.resultPromise.then((result) => {
      // Chain the .otherwise() call on the resolved AsyncMatcherResult
      return result.otherwise(callback);
    });
  }

  /**
   * Implements PromiseLike<void> to allow awaiting this object.
   * When awaited, it resolves the inner promise and returns void.
   */
  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // If .otherwise() was called, don't throw automatically
    if (this.otherwiseCalled) {
      // The .otherwise() path handles the promise
      return Promise.resolve() as any;
    }

    // Normal path: await the result, which will trigger auto-throw if failed
    return this.resultPromise.then(() => {
      // Matcher succeeded, resolve with void
      if (onfulfilled) {
        return onfulfilled(undefined as void);
      }
      return undefined as any;
    }, onrejected);
  }

  /**
   * Implements catch for Promise compatibility
   */
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): PromiseLike<void | TResult> {
    return this.then(undefined, onrejected);
  }

  /**
   * Implements finally for Promise compatibility
   */
  finally(onfinally?: (() => void) | null): PromiseLike<void> {
    return this.then(
      (value) => {
        if (onfinally) onfinally();
        return value;
      },
      (reason) => {
        if (onfinally) onfinally();
        throw reason;
      },
    );
  }
}
