import type { Locator, Page } from "k6/browser";
import type { RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import type { MatcherFn, NegatedResult } from "../../extend.ts";
import type { MatcherContext } from "../../extend.ts";
import type { AnyError } from "../../index.ts";
import { red } from "../../formatting/index.ts";

/**
 * Checks if the given value is a browser Locator.
 *
 * If it quacks like a duck, it's a duck.
 *
 * @param value The value to check.
 * @returns Whether the value is a Locator.
 */
export function isLocator(value: unknown): value is Locator {
  if (!value || typeof value !== "object") {
    return false;
  }

  const locatorProperties = [
    "clear",
    "isEnabled",
    "isHidden",
    "getAttribute",
    "selectOption",
    "press",
    "type",
    "dispatchEvent",
    "dblclick",
    "setChecked",
    "isDisabled",
    "focus",
    "innerText",
    "inputValue",
    "check",
    "isEditable",
    "fill",
    "textContent",
    "hover",
    "waitFor",
    "click",
    "uncheck",
    "isChecked",
    "isVisible",
    "innerHTML",
    "tap",
  ];

  const hasLocatorProperties = (value: object): boolean => {
    return locatorProperties.every((prop) => prop in value);
  };

  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    hasLocatorProperties(value)
  );
}

/**
 * Checks if the given value is a browser Page.
 *
 * If it quacks like a duck, it's a duck.
 *
 * @param value The value to check.
 * @returns Whether the value is a Page.
 */
export function isPage(value: unknown): value is Page {
  if (!value || typeof value !== "object") {
    return false;
  }

  const pageProperties = [
    "title",
    "goto",
    "url",
    "close",
    "mainFrame",
    "waitForLoadState",
  ];

  const hasPageProperties = (value: object): boolean => {
    return pageProperties.every((prop) => prop in value);
  };

  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    hasPageProperties(value)
  );
}

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
