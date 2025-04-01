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

export interface ExpectationFailure {
  message: Array<Record<string, string>>;
}

export interface Expectation {
  fail(reason: FailureReason): void;
}

export type MatcherFn<
  Actual = any,
  Expected extends any[] = any[],
  Return extends Promise<void> | void = Promise<void> | void,
> = (expectation: Expectation, actual: Actual, ...expected: Expected) => Return;

type ToExpectFn<Matcher> = Matcher extends
  MatcherFn<infer _Actual, infer Expected, infer Return>
  ? (...expected: Expected) => Return
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

class ExpectationContext implements Expectation {
  reason: FailureReason | null = null;

  name: string;
  actual: unknown;

  negated: boolean;

  config: ExpectConfig;
  message: string | undefined;

  executionContext: ExecutionContext;

  constructor(
    name: string,
    actual: unknown,
    negated: boolean,
    config: ExpectConfig,
    message: string | undefined,
    executionContext: ExecutionContext,
  ) {
    this.name = name;
    this.actual = actual;
    this.negated = negated;
    this.config = config;
    this.message = message;
    this.executionContext = executionContext;
  }

  fail(reason: FailureReason) {
    this.reason = this.reason ?? reason;

    return this;
  }

  catch(error: unknown) {
    this.fail(new UncaughtErrorReason(error));

    this.assert();
  }

  assert() {
    // If we have a negated expectation and no failure, then we just fail it
    // before doing any actual asserting.
    if (this.negated && this.reason === null) {
      this.fail(new NegatedAssertionReason());
    }

    const info: MatcherErrorInfo = {
      matcherName: this.name,
      executionContext: this.executionContext,
      received: "",
      expected: "",
      customMessage: this.message,
    };

    const message = this.reason &&
      new FailureReasonErrorRenderer(this.name, this.reason)
        .render(info, this.config);

    const assert = this.config.assertFn ?? builtinAssert;
    const passed = this.negated ? this.reason !== null : this.reason === null;

    assert(passed, message ?? "", this.config.soft);
  }
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
  const matchers: Record<string, MatcherFn> = {};

  for (const [name, matcher] of Object.entries(expect.matchers)) {
    // Create matcher functions that take the expected value, passes them to the
    // corresponding matcher function and then assert the expectation. For instance,
    // the `toEqual(expectation, actual, expected)` matcher will be transformed into
    // `toEqual(expected)`.
    matchers[name] = (...args: [...unknown[]]) => {
      const stackTrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stackTrace);

      if (executionContext === undefined) {
        throw new Error(
          `Failed to capture execution context in matcher '${name}'.`,
        );
      }

      const expectation = new ExpectationContext(
        name,
        actual,
        negated,
        config,
        message,
        executionContext,
      );

      try {
        const promise = matcher(expectation, actual, ...args);

        // If the matcher returned a promise then we need wait for it to resolve
        // before asserting the expectation. The promise is returned to the caller
        // so that they can await it in their code.
        if (promise instanceof Promise) {
          return promise
            .then(() => {
              expectation.assert();
            })
            .catch((error) => {
              expectation.catch(error);
            });
        }

        expectation.assert();
      } catch (error) {
        expectation.catch(error);
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

export const expect = makeGlobalExpect();
