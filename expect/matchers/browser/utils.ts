import type { RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import type { MatcherFn, NegatedResult } from "../../extend.ts";
import type { MatcherContext } from "../../extend.ts";
import type { AnyError } from "../../index.ts";
import { red } from "../../formatting/index.ts";

export async function withRetry<Fn extends MatcherFn>(
  context: MatcherContext,
  config: Required<RetryConfig>,
  assertion: () => Promise<NegatedResult<Fn>>,
): Promise<NegatedResult<Fn>> {
  const timeout = config.timeout;
  const interval = config.interval;

  const trace = [
    `expect.${context.matcher.name} with timeout ${config.timeout}ms`,
  ];

  const start = Date.now();

  while (true) {
    try {
      const result = await assertion();

      return {
        negate(...args) {
          const inner = typeof result === "function"
            ? result.apply(context, args)
            : typeof result.negate === "function"
            ? result.negate.apply(context, args)
            : result.negate;

          return {
            format: "trace",
            inner,
            trace,
          };
        },
      };
    } catch (err) {
      // Errors that are not AssertionFailed or caused by a locator throwing are
      // treated as bugs or user input errors.
      if (err instanceof AssertionFailed === false && !isLocatorError(err)) {
        throw err;
      }

      trace.push(getTraceMessage(context, err));

      const elapsed = Date.now() - start;

      if (elapsed + interval > timeout) {
        // Retries exhausted, re-throw last AssertionFailed with trace attached
        throw new AssertionFailed({
          format: "trace",
          inner: getInnerError(err),
          trace,
        });
      }

      // Sleep for interval then retry
      await new Promise((res) => setTimeout(res, interval));
    }
  }
}

function isLocatorError(err: unknown) {
  return typeof err === "object" &&
    err !== null &&
    Object.keys(err).length === 0 &&
    String(err).includes("timed out after");
}

function getInnerError(err: unknown): AnyError {
  if (err instanceof AssertionFailed) {
    return err.details;
  }

  return {
    format: "custom",
    content: {
      Message: red("Failed to find element for locator"),
    },
  };
}

function getTraceMessage(context: MatcherContext, err: unknown): string {
  if (err instanceof AssertionFailed === false) {
    return String(err);
  }

  return err.details.message ?? `assertion ${context.matcher.name} failed`;
}
