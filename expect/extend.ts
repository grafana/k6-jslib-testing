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

// We need to use `any` here for proper type inference of matcher functions.
// deno-lint-ignore no-explicit-any
type MatcherFn = (...args: any[]) => Promise<void> | void;

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
 * Utility interface for extractin only function properties from the `Matchers` interface.
 */
type ValidMatchers<Received = unknown> = {
  [K in keyof Matchers<Received>]: Matchers<Received>[K] extends MatcherFn
    ? Matchers<Received>[K]
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
  [Name in keyof ValidMatchers]?: MatcherFactory<ValidMatchers[Name]>;
};

type ReturnState<Fn extends MatcherFn, State> = ReturnType<Fn> extends
  Promise<unknown> ? Promise<State> : State;

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

/**
 * The context object that is available inside matcher implementations. It
 * contains additional information about the current expectation.
 */
export interface MatcherContext {
  received: unknown;

  config: ExpectConfig;
  executionContext: ExecutionContext;
}

/**
 * The context object that is available inside negated matcher implementations. It
 * contains additional information about the current expectation as well as
 * any state returned from the `matcher` function.
 */
export interface NegatedMatcherContext<State> extends MatcherContext {
  state: State;
}

/**
 * The interface that must be implemented when adding a new matcher. All matchers
 * must have a `match` function that performs the actual assertion logic, and
 * a `negate` function that provides the error details when the expectation is
 * negated.
 */
export interface MatcherImpl<
  Matcher extends MatcherFn = MatcherFn,
  State = unknown,
> {
  /**
   * Performs the actual matching logic.
   *
   * The `match` function should throw an `AssertionFailed` error when the assertion
   * fails. Throwing any other type of error will be treated as an unexpected error,
   * either because of a bug in the matcher implementation or because the user passed
   * invalid arguments to the matcher.
   *
   * If the assertion passes, it can optionally return a state object that will be
   * passed to the `negate` function in case of a negated expectation. This can be
   * useful to avoid recomputing values in the `negate` function.
   *
   * @param this The matcher context.
   * @param received The received value.
   * @param args The matcher arguments.
   *
   * @returns An optional state object that will be passed to the negated matcher context.
   */
  match(
    this: MatcherContext,
    received: unknown,
    ...args: Parameters<Matcher>
  ): ReturnState<Matcher, State>;

  /**
   * The `negate` function is called when the expectation is negated (i.e. when using `.not`)
   * and the expectation has passed. The function should return the error that should be
   * printed to the user.
   *
   * @param this The negated matcher context, containing any state returned from the `match` function.
   * @param received The received value.
   * @param args the matcher arguments.
   */
  negate(
    this: NegatedMatcherContext<State>,
    received: unknown,
    ...args: Parameters<Matcher>
  ): AnyError;
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
 *   },
 *
 *   negate() {
 *     // return negated error
 *   }
 * })
 */
export function extend<Name extends keyof ValidMatchers, State>(
  name: Name,
  matcher: MatcherImpl<ValidMatchers[Name], State>,
): void {
  registry[name] = (context: ExpectContext) => {
    // This is the function that will be called by the user, e.g. `expect(value).toBe(...)`.
    // It handles all the boilerplate around calling the matcher implementation, including
    // capturing the execution context, handling negation, formatting errors, etc.
    return (...args: Parameters<ValidMatchers[Name]>) => {
      const stackTrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stackTrace);

      if (executionContext === undefined) {
        throw new Error(
          `Failed to capture execution context for matcher '${String(name)}'.`,
        );
      }

      // Handle the successful case of the matcher both synchronously and asynchronously
      function handleSuccess(matcherContext: MatcherContext, result: State) {
        if (!context.negated) {
          return;
        }

        const negatedContext: NegatedMatcherContext<State> = {
          ...matcherContext,
          state: result,
        };

        // If negated, the expectation actually failed so we call the negate function
        // on the matcher to get the error details.
        return handleFail(
          matcherContext,
          matcher.negate.call(
            negatedContext,
            matcherContext.received,
            ...args,
          ),
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
        received: context.received,
        config: context.config,
        executionContext,
      };

      try {
        const result = matcher.match.call(
          matcherContext,
          context.received,
          ...args,
        ) as Promise<State> | State;

        // We can't use `await` because that would make synchronous matchers
        // asynchronous, so in order to catch errors we need to use the `then`
        // and `catch` methods.
        if (result instanceof Promise) {
          return result
            .then((state) => handleSuccess(matcherContext, state))
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
