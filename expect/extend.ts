// deno-lint-ignore-file no-explicit-any
import { colorize } from "../colors.ts";
import type { ExpectConfig } from "../config.ts";
import {
  captureExecutionContext,
  type ExecutionContext,
} from "../execution.ts";
import { parseStackTrace } from "../stacktrace.ts";
import { type AnyError, AssertionFailed } from "./errors.ts";
import { formatErrorWithContext } from "./formatting/utils.ts";
import { printError } from "./printers/index.ts";

// Makes sure that the `Value` is async if the matcher function `Fn` is async.
type KeepAsync<Fn extends MatcherFn, Value> = ReturnType<Fn> extends
  Promise<infer _> ? Promise<Value> : Value;

// We need to use `any` here for proper type inference of matcher functions.
export type MatcherFn = (...args: any[]) => Promise<void> | void;

/**
 * The `Matchers` interface is the extension point for adding new matchers.
 * Matchers can extend this interface using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * and then implement the matcher using the `expect.extend` function.
 *
 * The `Received` type parameter represents the type of value passed to the
 * `expect` function and can be used to filter available matchers.
 *
 * @example
 * ```ts
 * import { expect } from "k6/expect";
 *
 * declare module "k6/expect" {
 *   interface Matchers<Received> {
 *     // Adds a matcher that will be available for all received types
 *     toSay(message: string): void
 *
 *     // Adds a matcher that will only be available when the received value is a string
 *     toStartWith: Received extends string ? (prefix: string) => void : never;
 *   }
 * }
 *
 * expect.extend("toSay", {
 *   // ...matcher implementation...
 * })
 *
 * expect.extend("toStartWith", {
 *   // ...matcher implementation...
 * })
 * ```
 */
// deno-lint-ignore no-empty-interface
export interface Matchers<Received> {
}

/**
 * Utility interface for extracting only function properties from the `Matchers` interface.
 */
type ValidMatchers<Received = any> = {
  [
    K in keyof Matchers<Received> as Matchers<Received>[K] extends never ? never
      : K
  ]: Matchers<Received>[K] extends MatcherFn ? Matchers<Received>[K]
    : never;
};

/**
 * Utility type for extracting the matchers that can handle the given `Received` type.
 */
export type MatchersFor<Received> = {
  [
    K in keyof ValidMatchers<Received> as ValidMatchers<Received>[K] extends
      never ? never : K
  ]: ValidMatchers<Received>[K];
};

/**
 * A function that will instantiate a matcher with the given expect context.
 */
type MatcherFactory<Fn extends MatcherFn> = (context: ExpectContext) => Fn;

type MatcherRegistry = {
  [Name in keyof ValidMatchers]?: MatcherFactory<MatcherFn>;
};

export type NegationFn<Fn extends MatcherFn> = (
  this: MatcherContext,
  ...args: Parameters<Fn>
) => AnyError;

/**
 * Represents the negated version of a succcesful assertion and is returned
 * by the matcher in case of a successful match. The error provided will be
 * used when the assertion has been called after the `not` property.
 */
export type NegatedResult<Fn extends MatcherFn = MatcherFn> =
  | { negate: NegationFn<Fn> | AnyError }
  | NegationFn<Fn>;

/**
 * Contains information about the call to `expect`, including the received value.
 */
interface ExpectContext {
  received: unknown;

  negated: boolean;
  message?: string;
  config: ExpectConfig;

  fail(message: string): void;
}

export interface MatcherCall {
  name: string;
  args: unknown[];
  fn: (...args: any[]) => Promise<NegatedResult> | NegatedResult;
}

/**
 * The context object that is available inside matcher implementations. It
 * contains additional information about the current expectation.
 */
export interface MatcherContext {
  matcher: MatcherCall;
  received: unknown;

  config: ExpectConfig;
  executionContext: ExecutionContext;
}

/**
 * The interface that must be implemented when adding a new matcher. All matchers
 * must have a `match` function that performs the actual assertion logic, and
 * a `negate` function that provides the error details when the expectation is
 * negated.
 */
export interface MatcherImpl<
  Matcher extends MatcherFn = MatcherFn,
> {
  /**
   * Performs the actual matching logic.
   *
   * The `match` function should throw an `AssertionFailed` error when the assertion
   * fails. Throwing any other type of error will be treated as an unexpected error,
   * either because of a bug in the matcher implementation or because the user passed
   * invalid arguments to the matcher.
   *
   * If the assertion passes, it needs to provide a way to negate the result in case
   * the assertion was called with the `not` property. This is done by returning either
   * an object with a negate property or a function to negate the result.
   *
   * @param this The matcher context.
   * @param received The received value.
   * @param args The matcher arguments.
   *
   * @returns The error of the matcher _if_ it was negated.
   */
  match(
    this: MatcherContext,
    received: unknown,
    ...args: Parameters<Matcher>
  ): KeepAsync<Matcher, NegatedResult<Matcher>>;
}

const registry: MatcherRegistry = {};

/**
 * Adds a new matcher to the expect function.
 *
 * To define a matchers, first extend the `Matchers` interface using declaration merging
 * then implement the matcher using this function.
 *
 * @param name The name of the matcher.
 * @param matcher The matcher implementation.
 *
 * @example
 * ```ts
 * import { extend } from "k6/expect";
 *
 * declare module "k6/expect" {
 *   interface Matchers<Received> {
 *     toBeEven(): void;
 *   }
 * }
 *
 * extend("toBeEven", {
 *   match(received) {
 *     // matcher logic
 *
 *     // return negated error
 *     return {
 *       negate: {
 *         ...
 *       }
 *     }
 *   },
 * })
 */
export function extend<Name extends keyof ValidMatchers>(
  name: Name,
  matcher: MatcherImpl<ValidMatchers[Name]>,
): void {
  type CurrentMatcherFn = ValidMatchers[Name];
  type CurrentNegatedResult = NegatedResult<CurrentMatcherFn>;

  registry[name] = (context: ExpectContext): MatcherFn => {
    // This is the function that will be called by the user, e.g. `expect(value).toBe(...)`.
    // It handles all the boilerplate around calling the matcher implementation, including
    // capturing the execution context, handling negation, formatting errors, etc.
    return (...args: Parameters<CurrentMatcherFn>) => {
      const stackTrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stackTrace);

      if (executionContext === undefined) {
        throw new Error(
          `Failed to capture execution context for matcher '${String(name)}'.`,
        );
      }

      function getNegationFunction(
        result: CurrentNegatedResult,
      ) {
        if (typeof result === "function") {
          return result;
        }

        const { negate } = result;

        if (typeof negate === "function") {
          return negate;
        }

        return () => negate;
      }

      // Handle the successful case of the matcher both synchronously and asynchronously
      function handleSuccess(
        matcherContext: MatcherContext,
        result: CurrentNegatedResult,
      ) {
        if (!context.negated) {
          return;
        }

        // If negated, the expectation actually failed so we used the negated result.
        return handleFail(
          matcherContext,
          getNegationFunction(result).call(matcherContext, ...args),
        );
      }

      // Handle the error case of the matcher both synchronously and asynchronously
      function handleError(matcherContext: MatcherContext, error: unknown) {
        if (error instanceof AssertionFailed === false) {
          throw error;
        }

        if (context.negated) {
          return;
        }

        handleFail(matcherContext, error.details);
      }

      // Formats and prints the given error and then fails the test using the
      // configured fail method.
      function handleFail(
        matcherContext: MatcherContext,
        error: AnyError,
      ) {
        const formattedError = formatErrorWithContext({
          error,
          negated: context.negated,
          matcher: {
            name: String(name),
            fn: matcher.match,
            args,
          },
          executionContext: matcherContext.executionContext,
          message: context.message,
        });

        const printedError = printError({
          printer: context.config.display === "inline"
            ? "logfmt"
            : context.config.display,
          error: formattedError,
          colorize: context.config.colorize
            ? ({ value, color }) => colorize(value, color)
            : (value) => value.value,
        });

        context.fail(printedError);
      }

      const matcherContext: MatcherContext = {
        matcher: {
          name,
          args,
          fn: matcher.match,
        },
        received: context.received,
        config: context.config,
        executionContext,
      };

      try {
        const result = matcher.match.call(
          matcherContext,
          context.received,
          ...args,
        );

        // We can't use `await` because that would make synchronous matchers
        // asynchronous, so in order to catch errors we need to use the `then`
        // and `catch` methods.
        if (result instanceof Promise) {
          return result
            .then((result) => handleSuccess(matcherContext, result))
            .catch((error) => handleError(matcherContext, error));
        }

        return handleSuccess(matcherContext, result);
      } catch (error) {
        return handleError(matcherContext, error);
      }
    };
  };
}

/**
 * Takes the current expect context (including the received value) and instantiates
 * all registered matchers, returning an object with the matcher functions (e.g. toBe,
 * toEqual, etc.).
 */
export function createMatchers<Received>(
  context: ExpectContext,
): MatchersFor<Received> {
  const matchers: Record<string, MatcherFn> = {};

  for (const [name, factory] of Object.entries(registry)) {
    matchers[name] = factory(context);
  }

  return matchers as MatchersFor<Received>;
}
