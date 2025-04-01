import { assert } from "./assert.ts";
import type { ANSI_COLORS } from "./colors.ts";
import {
  DEFAULT_RETRY_OPTIONS,
  type ExpectConfig,
  type RetryConfig,
} from "./config.ts";
import { captureExecutionContext } from "./execution.ts";
import {
  ExpectedReceivedMatcherRenderer,
  type LineGroup,
  type MatcherErrorInfo,
  MatcherErrorRendererRegistry,
  ReceivedOnlyMatcherRenderer,
} from "./render.ts";
import { parseStackTrace } from "./stacktrace.ts";
import type { Locator } from "k6/browser";
import { normalizeWhiteSpace } from "./utils/string.ts";

interface ToHaveTextOptions extends RetryConfig {
  /**
   * If true, comparison will be case-insensitive. If defined, this option will override the `i` flag of
   * regular expressions. Defaults to `undefined`.
   */
  ignoreCase?: boolean;

  /**
   * If true, the text will be compared using `innerText()` instead of `textContent()`. Defaults to `false`.
   */
  useInnerText?: boolean;
}

/**
 * RetryingExpectation is an interface that defines the methods that can be used to create a retrying expectation.
 *
 * Retrying expectations are used to assert that a condition is met within a given timeout.
 * The provided assertion function is called repeatedly until the condition is met or the timeout is reached.
 *
 * The RetryingExpectation interface is implemented by the createExpectation function.
 */
export interface RetryingExpectation {
  /**
   * Negates the expectation, causing the assertion to pass when it would normally fail, and vice versa.
   */
  not: RetryingExpectation;

  /**
   * Ensures the Locator points to a checked input.
   */
  toBeChecked(options?: Partial<RetryConfig>): Promise<void>;

  /**
   * Ensures the Locator points to a disabled element.
   * Element is disabled if it has "disabled" attribute or is disabled via 'aria-disabled'.
   *
   * Note that only native control elements such as HTML button, input, select, textarea, option, optgroup can be disabled by setting "disabled" attribute.
   * "disabled" attribute on other elements is ignored by the browser.
   */
  toBeDisabled(options?: Partial<RetryConfig>): Promise<void>;

  /**
   * Ensures the Locator points to an editable element.
   */
  toBeEditable(options?: Partial<RetryConfig>): Promise<void>;

  /**
   * Ensures the Locator points to an enabled element.
   */
  toBeEnabled(options?: Partial<RetryConfig>): Promise<void>;

  /**
   * Ensures that Locator either does not resolve to any DOM node, or resolves to a non-visible one.
   */
  toBeHidden(options?: Partial<RetryConfig>): Promise<void>;

  /**
   * Ensures that Locator points to an attached and visible DOM node.
   */
  toBeVisible(options?: Partial<RetryConfig>): Promise<void>;

  /**
   * Ensures that the Locator points to an element with the given text.
   *
   * If the type of `expected` is a string, both the expected and actual text will have any zero-width
   * characters removed and whitespace characters collapsed to a single space. If the type of `expected`
   * is a regular expression, the content of the element will be matched against the regular expression as-is.
   */
  toHaveText(
    expected: RegExp | string,
    options?: Partial<ToHaveTextOptions>,
  ): Promise<void>;

  /**
   * Ensures that the Locator points to an element that contains the given text.
   *
   * If the type of `expected` is a string, both the expected and actual text will have any zero-width
   * characters removed and whitespace characters collapsed to a single space. If the type of `expected`
   * is a regular expression, the content of the element will be matched against the regular expression as-is.
   */
  toContainText(
    expected: RegExp | string,
    options?: Partial<ToHaveTextOptions>,
  ): Promise<void>;

  /**
   * Ensures the Locator points to an element with the given input value. You can use regular expressions for the value as well.
   *
   * @param value {string} the expected value of the input
   */
  toHaveValue(value: string, options?: Partial<RetryConfig>): Promise<void>;
}

/**
 * createExpectation is a factory function that creates an expectation object for a given value.
 *
 * Note that although the browser `is` prefixed methods are used, and return boolean values, we
 * throw errors if the condition is not met. This is to ensure that we align with playwright's
 * API, and have matchers return `Promise<void>`, as opposed to `Promise<boolean>`.
 *
 * @param locator the value to create an expectation for
 * @param config the configuration for the expectation
 * @param message the optional custom message for the expectation
 * @param isNegated whether the expectation is negated
 * @returns an expectation object over the given value exposing the Expectation set of methods
 */
export function createExpectation(
  locator: Locator,
  config: ExpectConfig,
  message?: string,
  isNegated: boolean = false,
): RetryingExpectation {
  // In order to facilitate testing, we support passing in a custom assert function.
  // As a result, we need to make sure that the assert function is always available, and
  // if not, we need to use the default assert function.
  //
  // From this point forward, we will use the `usedAssert` variable to refer to the assert function.
  const usedAssert = config.assertFn ?? assert;
  const isSoft = config.soft ?? false;
  const retryConfig: RetryConfig = {
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
  };

  const createTextMatcher = (
    matcherName: string,
    compareFn: (actual: string, expected: string) => boolean,
  ) => {
    return async function toHaveText(
      expected: RegExp | string,
      options: Partial<ToHaveTextOptions> = {},
    ): Promise<void> {
      const stacktrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stacktrace);

      if (!executionContext) {
        throw new Error("k6 failed to capture execution context");
      }

      const checkRegExp = (expected: RegExp, actual: string) => {
        // `ignoreCase` should take precedence over the `i` flag of the regex if it is defined.
        const regexp = options.ignoreCase !== undefined
          ? new RegExp(expected, options.ignoreCase ? "i" : "")
          : expected;

        const info: MatcherErrorInfo = {
          executionContext,
          matcherName,
          expected: expected.toString(),
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
        );
      };

      const checkText = (expected: string, actual: string) => {
        const normalizedExpected = normalizeWhiteSpace(expected);
        const normalizedActual = normalizeWhiteSpace(actual);

        const info: MatcherErrorInfo = {
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
        );
      };

      try {
        await withRetry(
          async () => {
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
          },
          { ...retryConfig, ...options },
        );
      } catch (_) {
        const info: MatcherErrorInfo = {
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
        );
      }
    };
  };

  const expectation: RetryingExpectation = {
    get not(): RetryingExpectation {
      return createExpectation(locator, config, message, !isNegated);
    },

    async toBeChecked(
      options: Partial<RetryConfig> = retryConfig,
    ): Promise<void> {
      await createMatcher(
        "toBeChecked",
        async () => await locator.isChecked(),
        "checked",
        "unchecked",
        { ...matcherConfig, options },
      );
    },

    async toBeDisabled(
      options: Partial<RetryConfig> = retryConfig,
    ): Promise<void> {
      await createMatcher(
        "toBeDisabled",
        async () => await locator.isDisabled(),
        "disabled",
        "enabled",
        { ...matcherConfig, options },
      );
    },

    async toBeEditable(
      options: Partial<RetryConfig> = retryConfig,
    ): Promise<void> {
      await createMatcher(
        "toBeEditable",
        async () => await locator.isEditable(),
        "editable",
        "uneditable",
        { ...matcherConfig, options },
      );
    },

    async toBeEnabled(
      options: Partial<RetryConfig> = retryConfig,
    ): Promise<void> {
      await createMatcher(
        "toBeEnabled",
        async () => await locator.isEnabled(),
        "enabled",
        "disabled",
        { ...matcherConfig, options },
      );
    },

    async toBeHidden(
      options: Partial<RetryConfig> = retryConfig,
    ): Promise<void> {
      await createMatcher(
        "toBeHidden",
        async () => await locator.isHidden(),
        "hidden",
        "visible",
        { ...matcherConfig, options },
      );
    },

    async toBeVisible(
      options: Partial<RetryConfig> = retryConfig,
    ): Promise<void> {
      await createMatcher(
        "toBeVisible",
        async () => await locator.isVisible(),
        "visible",
        "hidden",
        { ...matcherConfig, options },
      );
    },

    toHaveText: createTextMatcher(
      "toHaveText",
      (actual, expected) => actual === expected,
    ),

    toContainText: createTextMatcher(
      "toContainText",
      (actual, expected) => actual.includes(expected),
    ),

    async toHaveValue(
      expectedValue: string,
      options: Partial<RetryConfig> = retryConfig,
    ): Promise<void> {
      const stacktrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stacktrace);
      if (!executionContext) {
        throw new Error("k6 failed to capture execution context");
      }

      const info: MatcherErrorInfo = {
        executionContext,
        matcherName: "toHaveValue",
        expected: expectedValue,
        received: "unknown",
        matcherSpecific: { isNegated },
        customMessage: message,
      };

      try {
        await withRetry(
          async () => {
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
            );
          },
          { ...retryConfig, ...options },
        );
      } catch (_) {
        usedAssert(
          false,
          MatcherErrorRendererRegistry.getRenderer("toHaveValue").render(
            info,
            MatcherErrorRendererRegistry.getConfig(),
          ),
          isSoft,
        );
      }
    },
  };

  return expectation;
}

// Helper function to create common matcher info
function createMatcherInfo(
  matcherName: string,
  expected: string,
  received: string,
  additionalInfo = {},
  customMessage?: string,
): MatcherErrorInfo {
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
  matcherName: string,
  checkFn: () => Promise<boolean>,
  expected: string,
  received: string,
  {
    locator,
    retryConfig,
    usedAssert,
    isSoft,
    isNegated = false,
    options = {},
    message,
  }: {
    locator: Locator;
    retryConfig: RetryConfig;
    usedAssert: typeof assert;
    isSoft: boolean;
    isNegated?: boolean;
    options?: Partial<RetryConfig>;
    message?: string;
  },
): Promise<void> {
  const info = createMatcherInfo(
    matcherName,
    expected,
    received,
    {
      matcherSpecific: {
        locator,
        timeout: options.timeout,
        isNegated,
      },
    },
    message,
  );

  try {
    await withRetry(
      async () => {
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
        );
      },
      { ...retryConfig, ...options },
    );
  } catch (_) {
    usedAssert(
      false,
      MatcherErrorRendererRegistry.getRenderer(matcherName).render(
        info,
        MatcherErrorRendererRegistry.getConfig(),
      ),
      isSoft,
    );
  }
}

/**
 * Base class for boolean state matchers (checked, disabled, etc.)
 */
export abstract class BooleanStateErrorRenderer
  extends ReceivedOnlyMatcherRenderer {
  protected abstract state: string;
  protected abstract oppositeState: string;

  protected getMatcherName(): string {
    return `toBe${this.state[0].toUpperCase()}${this.state.slice(1)}`;
  }

  protected override getReceivedPlaceholder(): string {
    return "locator";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      { label: "Expected", value: this.state, group: 3 },
      { label: "Received", value: this.oppositeState, group: 3 },
      { label: "Call log", value: "", group: 3 },
      {
        label: "",
        value: maybeColorize(
          `  - expect.toBe${this.state[0].toUpperCase()}${
            this.state.slice(
              1,
            )
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
  protected state = "checked";
  protected oppositeState = "unchecked";
}

/**
 * A matcher error renderer for the `toBeDisabled` matcher.
 */
export class ToBeDisabledErrorRenderer extends BooleanStateErrorRenderer {
  protected state = "disabled";
  protected oppositeState = "enabled";
}

export class ToBeEditableErrorRenderer extends BooleanStateErrorRenderer {
  protected state = "editable";
  protected oppositeState = "uneditable";
}

export class ToBeEnabledErrorRenderer extends BooleanStateErrorRenderer {
  protected state = "enabled";
  protected oppositeState = "disabled";
}

export class ToBeHiddenErrorRenderer extends BooleanStateErrorRenderer {
  protected state = "hidden";
  protected oppositeState = "visible";
}

export class ToBeVisibleErrorRenderer extends BooleanStateErrorRenderer {
  protected state = "visible";
  protected oppositeState = "hidden";
}

export class ToHaveValueErrorRenderer extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toHaveValue";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
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

/**
 * Implements retry logic for async assertions.
 *
 * @param assertion Function that performs the actual check
 * @param options Retry configuration
 * @returns Promise that resolves when assertion passes or rejects if timeout is reached
 */
export async function withRetry(
  assertion: () => Promise<void>,
  options: RetryConfig & {
    // Optional test hooks - only used in testing
    _now?: () => number;
    _sleep?: (ms: number) => Promise<void>;
  } = {},
): Promise<boolean> {
  const timeout: number = options.timeout ?? DEFAULT_RETRY_OPTIONS.timeout;
  const interval: number = options.interval ?? DEFAULT_RETRY_OPTIONS.interval;
  const getNow = options._now ?? (() => Date.now());
  const sleep = options._sleep ??
    ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));

  const startTime: number = getNow();

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
  constructor(message: string) {
    super(message);
    this.name = "RetryTimeoutError";
  }
}
