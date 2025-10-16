import { assert } from "./assert.ts";
import { DEFAULT_RETRY_OPTIONS } from "./config.ts";
import { captureExecutionContext } from "./execution.ts";
import {
  ExpectedReceivedMatcherRenderer,
  MatcherErrorRendererRegistry,
  ReceivedOnlyMatcherRenderer,
} from "./render.ts";
import { parseStackTrace } from "./stacktrace.ts";
import { normalizeWhiteSpace } from "./utils/string.ts";
import { toHaveAttribute } from "./expectations/toHaveAttribute.ts";
import { isLocator, isPage } from "./expectations/utils.ts";
/**
 * createLocatorExpectation is a factory function that creates an expectation object for Locator values.
 *
 * Note that although the browser `is` prefixed methods are used, and return boolean values, we
 * throw errors if the condition is not met. This is to ensure that we align with playwright's
 * API, and have matchers return `Promise<void>`, as opposed to `Promise<boolean>`.
 *
 * @param locator the Locator to create an expectation for
 * @param config the configuration for the expectation
 * @param message the optional custom message for the expectation
 * @param isNegated whether the expectation is negated
 * @returns an expectation object over the locator exposing locator-specific methods
 */
export function createLocatorExpectation(
  locator,
  config,
  message,
  isNegated = false,
) {
  // In order to facilitate testing, we support passing in a custom assert function.
  // As a result, we need to make sure that the assert function is always available, and
  // if not, we need to use the default assert function.
  //
  // From this point forward, we will use the `usedAssert` variable to refer to the assert function.
  const usedAssert = config.assertFn ?? assert;
  const isSoft = config.soft ?? false;
  const retryConfig = {
    timeout: config.timeout,
    interval: config.interval,
  };
  // Configure the renderer with the colorize option.
  MatcherErrorRendererRegistry.configure({
    colorize: config.colorize,
    display: config.display,
  });
  // Register renderers specific to each matchers at initialization time.
  MatcherErrorRendererRegistry.register(
    "toBeChecked",
    new ToBeCheckedErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeDisabled",
    new ToBeDisabledErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeEditable",
    new ToBeEditableErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeEmpty",
    new ToBeEmptyErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeEnabled",
    new ToBeEnabledErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeHidden",
    new ToBeHiddenErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeVisible",
    new ToBeVisibleErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toHaveValue",
    new ToHaveValueErrorRenderer(),
  );
  const matcherConfig = {
    locator,
    retryConfig,
    usedAssert,
    isSoft,
    isNegated,
    message,
    softMode: config.softMode,
  };
  const matchText = async (matcherName, expected, options = {}, compareFn) => {
    const stacktrace = parseStackTrace(new Error().stack);
    const executionContext = captureExecutionContext(stacktrace);
    if (!executionContext) {
      throw new Error("k6 failed to capture execution context");
    }
    const checkRegExp = (expected, actual) => {
      // `ignoreCase` should take precedence over the `i` flag of the regex if it is defined.
      const regexp = options.ignoreCase !== undefined
        ? new RegExp(
          expected.source,
          expected.flags.replace("i", "") + (options.ignoreCase ? "i" : ""),
        )
        : expected;
      const info = {
        executionContext,
        matcherName,
        expected: regexp.toString(),
        received: actual,
        matcherSpecific: { isNegated },
        customMessage: message,
      };
      const result = regexp.test(actual);
      usedAssert(
        isNegated ? !result : result,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    };
    const checkText = (expected, actual) => {
      const normalizedExpected = normalizeWhiteSpace(expected);
      const normalizedActual = normalizeWhiteSpace(actual);
      const info = {
        executionContext,
        matcherName,
        expected: normalizedExpected,
        received: normalizedActual,
        matcherSpecific: { isNegated },
        customMessage: message,
      };
      const result = options.ignoreCase
        ? compareFn(
          normalizedActual.toLowerCase(),
          normalizedExpected.toLowerCase(),
        )
        : compareFn(normalizedActual, normalizedExpected);
      usedAssert(
        isNegated ? !result : result,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    };
    try {
      await withRetry(async () => {
        const actualText = options.useInnerText
          ? await locator.innerText()
          : await locator.textContent();
        if (actualText === null) {
          throw new Error("Element has no text content");
        }
        if (expected instanceof RegExp) {
          checkRegExp(expected, actualText);
          return;
        }
        checkText(expected, actualText);
      }, { ...retryConfig, ...options });
    } catch (_) {
      const info = {
        executionContext,
        matcherName,
        expected: expected.toString(),
        received: "unknown",
        matcherSpecific: { isNegated },
        customMessage: message,
      };
      usedAssert(
        false,
        MatcherErrorRendererRegistry.getRenderer("toHaveText").render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    }
  };
  const expectation = {
    get not() {
      return createLocatorExpectation(locator, config, message, !isNegated);
    },
    async toBeChecked(options = retryConfig) {
      await createMatcher(
        "toBeChecked",
        async () => await locator.isChecked(),
        "checked",
        "unchecked",
        { ...matcherConfig, options },
      );
    },
    async toBeDisabled(options = retryConfig) {
      await createMatcher(
        "toBeDisabled",
        async () => await locator.isDisabled(),
        "disabled",
        "enabled",
        { ...matcherConfig, options },
      );
    },
    async toBeEditable(options = retryConfig) {
      await createMatcher(
        "toBeEditable",
        async () => await locator.isEditable(),
        "editable",
        "uneditable",
        { ...matcherConfig, options },
      );
    },
    async toBeEmpty(options = retryConfig) {
      await createMatcher(
        "toBeEmpty",
        async () => {
          try {
            // First check if the element is an input, textarea or select.
            return await locator.inputValue().then((text) => text.length === 0);
          } catch (error) {
            let msg = "";
            if (error instanceof Error) {
              msg = error.toString();
            } else {
              // Errors from k6 are not instances of Error at the moment.
              msg = String(error);
            }
            // FIXME: This is brittle since it relies on the error message.
            //        We should consider moving the logic to the browser module
            //        in k6 itself.
            //        See https://github.com/grafana/k6-jslib-testing/issues/43
            //        for more details.
            if (
              !msg.includes(
                "Node is not an <input>, <textarea> or <select> element",
              )
            ) {
              throw error;
            }
            return await locator.textContent().then((text) => {
              if (text === null || text === undefined) {
                return true;
              }
              return text.trim().length === 0;
            });
          }
        },
        "empty",
        "not empty",
        { ...matcherConfig, options },
      );
    },
    async toBeEnabled(options = retryConfig) {
      await createMatcher(
        "toBeEnabled",
        async () => await locator.isEnabled(),
        "enabled",
        "disabled",
        { ...matcherConfig, options },
      );
    },
    async toBeHidden(options = retryConfig) {
      await createMatcher(
        "toBeHidden",
        async () => await locator.isHidden(),
        "hidden",
        "visible",
        { ...matcherConfig, options },
      );
    },
    async toBeVisible(options = retryConfig) {
      await createMatcher(
        "toBeVisible",
        async () => await locator.isVisible(),
        "visible",
        "hidden",
        { ...matcherConfig, options },
      );
    },
    toHaveText(expected, options = {}) {
      return matchText(
        "toHaveText",
        expected,
        options,
        (actual, expected) => actual === expected,
      );
    },
    toContainText(expected, options = {}) {
      return matchText(
        "toContainText",
        expected,
        options,
        (actual, expected) => actual.includes(expected),
      );
    },
    async toHaveAttribute(attribute, expectedValue) {
      const matcherName = "toHaveAttribute";
      const stacktrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stacktrace);
      if (!executionContext) {
        throw new Error("k6 failed to capture execution context");
      }
      const renderer = MatcherErrorRendererRegistry.getRenderer(matcherName);
      const renderConfig = MatcherErrorRendererRegistry.getConfig();
      try {
        await withRetry(async () => {
          const result = await toHaveAttribute(
            locator,
            attribute,
            expectedValue,
          );
          const finalResult = isNegated ? result.negate() : result;
          if (finalResult.passed) {
            return;
          }
          // Type narrowing: At this point, finalResult must be ExpectationFailed
          const failedResult = finalResult;
          const info = {
            executionContext,
            matcherName,
            expected: failedResult.detail.expected,
            received: failedResult.detail.received,
          };
          usedAssert(
            false,
            renderer.render(info, renderConfig),
            isSoft,
            config.softMode,
          );
        }, retryConfig);
      } catch {
        const info = {
          executionContext,
          matcherName,
          expected: "An element matching the locator.",
          received:
            `Timeout waiting for element matching locator (${retryConfig.timeout}ms)`,
        };
        usedAssert(
          false,
          MatcherErrorRendererRegistry.getRenderer(matcherName).render(
            info,
            MatcherErrorRendererRegistry.getConfig(),
          ),
          isSoft,
          config.softMode,
        );
      }
    },
    async toHaveValue(expectedValue, options = retryConfig) {
      const stacktrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stacktrace);
      if (!executionContext) {
        throw new Error("k6 failed to capture execution context");
      }
      const info = {
        executionContext,
        matcherName: "toHaveValue",
        expected: expectedValue,
        received: "unknown",
        matcherSpecific: { isNegated },
        customMessage: message,
      };
      try {
        await withRetry(async () => {
          const actualValue = await locator.inputValue();
          const result = expectedValue === actualValue;
          // If isNegated is true, we want to invert the result
          const finalResult = isNegated ? !result : result;
          usedAssert(
            finalResult,
            MatcherErrorRendererRegistry.getRenderer("toHaveValue").render(
              info,
              MatcherErrorRendererRegistry.getConfig(),
            ),
            isSoft,
            config.softMode,
          );
        }, { ...retryConfig, ...options });
      } catch (_) {
        usedAssert(
          false,
          MatcherErrorRendererRegistry.getRenderer("toHaveValue").render(
            info,
            MatcherErrorRendererRegistry.getConfig(),
          ),
          isSoft,
          config.softMode,
        );
      }
    },
  };
  return expectation;
}
/**
 * createPageExpectation is a factory function that creates an expectation object for Page values.
 *
 * @param page the Page to create an expectation for
 * @param config the configuration for the expectation
 * @param message the optional custom message for the expectation
 * @param isNegated whether the expectation is negated
 * @returns an expectation object over the page exposing page-specific methods
 */
export function createPageExpectation(
  page,
  config,
  message,
  isNegated = false,
) {
  // In order to facilitate testing, we support passing in a custom assert function.
  const usedAssert = config.assertFn ?? assert;
  const isSoft = config.soft ?? false;
  const retryConfig = {
    timeout: config.timeout,
    interval: config.interval,
  };
  // Configure the renderer with the colorize option.
  MatcherErrorRendererRegistry.configure({
    colorize: config.colorize,
    display: config.display,
  });
  // Register renderers specific to page matchers at initialization time.
  MatcherErrorRendererRegistry.register(
    "toHaveTitle",
    new PageExpectedReceivedMatcherRenderer(),
  );
  const matchPageText = async (
    matcherName,
    expected,
    options = {},
    compareFn,
  ) => {
    const stacktrace = parseStackTrace(new Error().stack);
    const executionContext = captureExecutionContext(stacktrace);
    if (!executionContext) {
      throw new Error("k6 failed to capture execution context");
    }
    const checkRegExp = (expected, actual) => {
      // `ignoreCase` should take precedence over the `i` flag of the regex if it is defined.
      const regexp = expected;
      const info = {
        executionContext,
        matcherName,
        expected: regexp.toString(),
        received: actual,
        matcherSpecific: { isNegated },
        customMessage: message,
      };
      const result = regexp.test(actual);
      usedAssert(
        isNegated ? !result : result,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    };
    const checkText = (expected, actual) => {
      const normalizedExpected = normalizeWhiteSpace(expected);
      const normalizedActual = normalizeWhiteSpace(actual);
      const info = {
        executionContext,
        matcherName,
        expected: normalizedExpected,
        received: normalizedActual,
        matcherSpecific: { isNegated },
        customMessage: message,
      };
      const result = compareFn(normalizedActual, normalizedExpected);
      usedAssert(
        isNegated ? !result : result,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    };
    try {
      await withRetry(async () => {
        const actualText = await page.title();
        if (expected instanceof RegExp) {
          checkRegExp(expected, actualText);
          return;
        }
        checkText(expected, actualText);
      }, { ...retryConfig, ...options });
    } catch (_) {
      const info = {
        executionContext,
        matcherName,
        expected: expected.toString(),
        received: "unknown",
        matcherSpecific: { isNegated },
        customMessage: message,
      };
      usedAssert(
        false,
        MatcherErrorRendererRegistry.getRenderer("toHaveTitle").render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        config.softMode,
      );
    }
  };
  const expectation = {
    get not() {
      return createPageExpectation(page, config, message, !isNegated);
    },
    toHaveTitle(expected, options = {}) {
      return matchPageText(
        "toHaveTitle",
        expected,
        options,
        (actual, expected) => actual === expected,
      );
    },
  };
  return expectation;
}
/**
 * createExpectation is a factory function that creates an expectation object for a given value.
 *
 * This function routes to the appropriate specialized factory based on the input type.
 *
 * @param target the value to create an expectation for (Locator or Page)
 * @param config the configuration for the expectation
 * @param message the optional custom message for the expectation
 * @param isNegated whether the expectation is negated
 * @returns an expectation object exposing the appropriate methods
 */
export function createExpectation(target, config, message, isNegated = false) {
  if (isPage(target)) {
    return createPageExpectation(target, config, message, isNegated);
  } else if (isLocator(target)) {
    return createLocatorExpectation(target, config, message, isNegated);
  } else {
    throw new Error(
      "Invalid target for retrying expectation. Expected Locator or Page object.",
    );
  }
}
// Helper function to create common matcher info
function createMatcherInfo(
  matcherName,
  expected,
  received,
  additionalInfo = {},
  customMessage,
) {
  const stacktrace = parseStackTrace(new Error().stack);
  const executionContext = captureExecutionContext(stacktrace);
  if (!executionContext) {
    throw new Error("k6 failed to capture execution context");
  }
  return {
    executionContext,
    matcherName,
    expected,
    received,
    customMessage,
    ...additionalInfo,
  };
}
// Helper function to handle common matcher logic
async function createMatcher(
  matcherName,
  checkFn,
  expected,
  received,
  {
    locator,
    retryConfig,
    usedAssert,
    isSoft,
    isNegated = false,
    options = {},
    message,
    softMode,
  },
) {
  const info = createMatcherInfo(matcherName, expected, received, {
    matcherSpecific: {
      locator,
      timeout: options.timeout,
      isNegated,
    },
  }, message);
  try {
    await withRetry(async () => {
      const result = await checkFn();
      // If isNegated is true, we want to invert the result
      const finalResult = isNegated ? !result : result;
      if (!finalResult) {
        throw new Error("matcher failed");
      }
      usedAssert(
        finalResult,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig(),
        ),
        isSoft,
        softMode,
      );
    }, { ...retryConfig, ...options });
  } catch (_) {
    usedAssert(
      false,
      MatcherErrorRendererRegistry.getRenderer(matcherName).render(
        info,
        MatcherErrorRendererRegistry.getConfig(),
      ),
      isSoft,
      softMode,
    );
  }
}
/**
 * Base class for boolean state matchers (checked, disabled, etc.)
 */
export class BooleanStateErrorRenderer extends ReceivedOnlyMatcherRenderer {
  getMatcherName() {
    return `toBe${this.state[0].toUpperCase()}${this.state.slice(1)}`;
  }
  getReceivedPlaceholder() {
    return "locator";
  }
  getSpecificLines(info, maybeColorize) {
    return [
      { label: "Expected", value: this.state, group: 3 },
      { label: "Received", value: this.oppositeState, group: 3 },
      { label: "Call log", value: "", group: 3 },
      {
        label: "",
        value: maybeColorize(
          `  - expect.toBe${this.state[0].toUpperCase()}${
            this.state.slice(1)
          } with timeout ${info.matcherSpecific?.timeout}ms`,
          "darkGrey",
        ),
        group: 3,
        raw: true,
      },
      {
        label: "",
        value: maybeColorize(`  - waiting for locator`, "darkGrey"),
        group: 3,
        raw: true,
      },
    ];
  }
}
export class ToBeCheckedErrorRenderer extends BooleanStateErrorRenderer {
  state = "checked";
  oppositeState = "unchecked";
}
/**
 * A matcher error renderer for the `toBeDisabled` matcher.
 */
export class ToBeDisabledErrorRenderer extends BooleanStateErrorRenderer {
  state = "disabled";
  oppositeState = "enabled";
}
export class ToBeEditableErrorRenderer extends BooleanStateErrorRenderer {
  state = "editable";
  oppositeState = "uneditable";
}
export class ToBeEmptyErrorRenderer extends BooleanStateErrorRenderer {
  state = "empty";
  oppositeState = "not empty";
}
export class ToBeEnabledErrorRenderer extends BooleanStateErrorRenderer {
  state = "enabled";
  oppositeState = "disabled";
}
export class ToBeHiddenErrorRenderer extends BooleanStateErrorRenderer {
  state = "hidden";
  oppositeState = "visible";
}
export class ToBeVisibleErrorRenderer extends BooleanStateErrorRenderer {
  state = "visible";
  oppositeState = "hidden";
}
export class ToHaveValueErrorRenderer extends ExpectedReceivedMatcherRenderer {
  getMatcherName() {
    return "toHaveValue";
  }
  getSpecificLines(info, maybeColorize) {
    return [
      // FIXME (@oleiade): When k6/#4210 is fixed, we can use the locator here.
      // { label: "Locator", value: maybeColorize(`locator('${info.matcherSpecific?.locator}')`, "white"), group: 3 },
      {
        label: "Expected",
        value: maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
      { label: "Call log", value: "", group: 3 },
      {
        label: "",
        value: maybeColorize(
          `  - expect.toHaveValue with timeout ${info.matcherSpecific?.timeout}ms`,
          "darkGrey",
        ),
        group: 3,
        raw: true,
      },
      // FIXME (@oleiade): When k6/#4210 is fixed, we can use the locator's selector here.
      {
        label: "",
        value: maybeColorize(`  - waiting for locator`, "darkGrey"),
        group: 3,
        raw: true,
      },
    ];
  }
}
export class PageExpectedReceivedMatcherRenderer
  extends ExpectedReceivedMatcherRenderer {
  getMatcherName() {
    return "pageExpectedReceived";
  }
  getSpecificLines(info, maybeColorize) {
    const matcherName = info.matcherName;
    return [
      {
        label: "Expected",
        value: maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
      { label: "Call log", value: "", group: 3 },
      {
        label: "",
        value: maybeColorize(`  - expect.${matcherName}`, "darkGrey"),
        group: 3,
        raw: true,
      },
      {
        label: "",
        value: maybeColorize(`  - waiting for page`, "darkGrey"),
        group: 3,
        raw: true,
      },
    ];
  }
}
/**
 * Implements retry logic for async assertions.
 *
 * @param assertion Function that performs the actual check
 * @param options Retry configuration
 * @returns Promise that resolves when assertion passes or rejects if timeout is reached
 */
export async function withRetry(assertion, options = {}) {
  const timeout = options.timeout ?? DEFAULT_RETRY_OPTIONS.timeout;
  const interval = options.interval ?? DEFAULT_RETRY_OPTIONS.interval;
  const getNow = options._now ?? (() => Date.now());
  const sleep = options._sleep ??
    ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const startTime = getNow();
  while (getNow() - startTime < timeout) {
    try {
      await assertion();
      return true;
    } catch (_error) {
      // Ignore error and continue retrying
    }
    await sleep(interval);
  }
  throw new RetryTimeoutError(
    `Expect condition not met within ${timeout}ms timeout`,
  );
}
/**
 * RetryTimeoutError is an error that is thrown when an expectation is not met within a provided timeout.
 */
export class RetryTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "RetryTimeoutError";
  }
}
