// deno-lint-ignore-file no-explicit-any

import { ConfigLoader, type ExpectConfig } from "./config.ts";
import { captureExecutionContext, type ExecutionContext } from "./execution.ts";
import {
  createExpectation as createNonRetryingExpectation,
  type NonRetryingExpectation,
} from "./expectNonRetrying.ts";
import {
  createExpectation as createRetryingExpectation,
  type RetryingExpectation,
} from "./expectRetrying.ts";
import { parseStackTrace } from "./stacktrace.ts";
import { isLocator } from "./utils/locator.ts";
import { assert as builtinAssert } from "./assert.ts";
import {
  type FailureReason,
  NegatedAssertionReason,
  UncaughtErrorReason,
} from "./reason.ts";
import { FailureReasonErrorRenderer, type MatcherErrorInfo } from "./render.ts";

export interface Pass {
  passed: true;
}

export interface Fail {
  passed: false;
  reason: FailureReason;
}

export type PassOrFail = Pass | Fail;

export type MatcherFn<
  Actual = any,
  Expected extends any[] = any[],
  Return extends Promise<PassOrFail> | PassOrFail = PassOrFail,
> = (actual: Actual, ...expected: Expected) => Return;

export type AsyncMatcherFn<Actual = any, Expected extends any[] = any[]> =
  MatcherFn<Actual, Expected, Promise<PassOrFail>>;

export type ExpectFn<
  Expected extends any[] = any[],
  Return extends Promise<void> | void = Promise<void> | void,
> = (
  ...expected: Expected
) => Return;

type ToVoid<Return> = Return extends Promise<any> ? Promise<void>
  : void;

type ToExpectFn<Matcher> = Matcher extends
  MatcherFn<infer _Actual, infer Expected, infer Return>
  ? ExpectFn<Expected, ToVoid<Return>>
  : never;

// deno-lint-ignore no-empty-interface
export interface Matchers<Actual> {}

export interface Matchers<Actual> {
  onTempThing: MatcherFn<Actual, [string]>;
}

export type AnyMatchers = {
  [Name in keyof Matchers<any>]: MatcherFn<unknown, unknown[]>;
};

export type ApplicableMatchers<Actual> =
  & RetryingExpectation // Legacy matchers
  & NonRetryingExpectation // Legacy matchers
  & {
    [
      K in keyof Matchers<Actual> as Matchers<Actual> extends MatcherFn<Actual>
        ? K
        : never
    ]: Matchers<Actual>[K] extends MatcherFn ? ToExpectFn<Matchers<Actual>[K]>
      : never;
  }
  & {
    readonly not: ApplicableMatchers<Actual>;
  };

export interface ExpectFunction {
  <Actual>(
    actual: Actual,
    message?: string,
  ): ApplicableMatchers<Actual>;

  soft: <Actual>(
    actual: Actual,
    message?: string,
  ) => ApplicableMatchers<Actual>;

  configure: (newConfig: Partial<ExpectConfig>) => ExpectFunction;

  readonly config: Readonly<ExpectConfig>;
}

export interface GlobalExpectFunction extends ExpectFunction {
  readonly matchers: Readonly<AnyMatchers>;

  register<Name extends keyof AnyMatchers>(
    name: Name,
    matcher: AnyMatchers[Name],
  ): void;
}

interface ExpectationContext {
  name: string;
  actual: unknown;

  negated: boolean;

  config: ExpectConfig;
  message: string | undefined;

  executionContext: ExecutionContext;
}

function handleResult(
  { name, negated, config, executionContext, message }: ExpectationContext,
  result: PassOrFail,
) {
  console.log("handleResult", negated, result);
  let reason = !result.passed ? result.reason : undefined;

  if (reason === undefined && negated) {
    reason = new NegatedAssertionReason();
  }

  const info: MatcherErrorInfo = {
    matcherName: name,
    received: "",
    expected: "",
    executionContext: executionContext,
    customMessage: message,
  };

  const errorMessage = reason && new FailureReasonErrorRenderer(name, reason);

  const assert = config.assertFn ?? builtinAssert;
  const passed = negated ? !result.passed : result.passed;

  assert(
    passed,
    errorMessage?.render(info, config) ?? "Assertion failed",
    config.soft,
  );
}

function handleError(context: ExpectationContext, error: unknown) {
  handleResult(context, {
    passed: false,
    reason: new UncaughtErrorReason(error),
  });
}

interface MakeApplicableMatchers<Actual> {
  actual: Actual;
  negated: boolean;
  config: ExpectConfig;
  message: string | undefined;
}

function makeApplicableMatchers<Actual>(
  { actual, negated, config, message }: MakeApplicableMatchers<Actual>,
): ApplicableMatchers<Actual> {
  const matchers: Record<string, ExpectFn> = {};

  for (const [name, matcher] of Object.entries(expect.matchers)) {
    // Create matcher functions that take the expected value, passes them to the
    // corresponding matcher function and then assert the expectation. For instance,
    // the `toEqual(actual, expected)` matcher will be transformed into `toEqual(expected)`.
    matchers[name] = (...args: [...unknown[]]) => {
      const stackTrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stackTrace);

      if (executionContext === undefined) {
        throw new Error(
          `Failed to capture execution context in matcher '${name}'.`,
        );
      }

      const context: ExpectationContext = {
        name,
        actual,
        negated,
        config,
        message,
        executionContext,
      };

      try {
        const result = matcher(actual, ...args);

        // If the matcher returned a promise then we need wait for it to resolve
        // before asserting the expectation. The promise is returned to the caller
        // so that they can await it in their code.
        if (result instanceof Promise) {
          return result
            .then((result) => {
              handleResult(context, result);
            })
            .catch((error) => {
              handleError(context, error);
            });
        }

        handleResult(context, result);
      } catch (error) {
        handleError(context, error);
      }
    };
  }

  // Keep compatibility with the old API so we don't have to rewrite everything at once.
  const oldMatchers = isLocator(actual)
    ? createRetryingExpectation(actual, config, message, negated)
    : createNonRetryingExpectation(actual, config, message, negated);

  return {
    ...oldMatchers,
    ...matchers,

    get not() {
      return makeApplicableMatchers({
        actual,
        negated: !negated,
        config,
        message,
      });
    },
  } as ApplicableMatchers<Actual>;
}

function makeExpect(baseConfig: Partial<ExpectConfig>): ExpectFunction {
  const config = ConfigLoader.load(baseConfig);

  const expect = <Actual>(actual: Actual, message?: string) => {
    return makeApplicableMatchers({
      actual,
      negated: false,
      config,
      message,
    });
  };

  return Object.assign(expect, {
    config,

    soft<Actual>(actual: Actual, message?: string) {
      return makeApplicableMatchers({
        actual,
        negated: false,
        config: {
          ...config,
          soft: true,
        },
        message,
      });
    },

    configure(newConfig: Partial<ExpectConfig>) {
      return makeExpect({ ...config, ...newConfig });
    },
  });
}

function makeGlobalExpect(): GlobalExpectFunction {
  const expect = makeExpect({});
  const matchers = {} as AnyMatchers;

  return Object.assign(expect, {
    matchers,

    register<Name extends keyof AnyMatchers>(
      name: Name,
      matcher: AnyMatchers[Name],
    ) {
      matchers[name] = matcher;
    },
  });
}

export function pass(): Pass {
  return { passed: true };
}

export function fail(reason: FailureReason): Fail {
  return { passed: false, reason };
}

export const expect: GlobalExpectFunction = makeGlobalExpect();
