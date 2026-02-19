import { assert, type SoftMode } from "./assert.ts";
import type { ANSI_COLORS } from "./colors.ts";
import type { ExpectConfig } from "./config.ts";
import { captureExecutionContext } from "./execution.ts";
import { parseStackTrace } from "./stacktrace.ts";
import {
  DefaultMatcherErrorRenderer,
  ExpectedReceivedMatcherRenderer,
  type LineGroup,
  type MatcherErrorInfo,
  MatcherErrorRendererRegistry,
  ReceivedOnlyMatcherRenderer,
} from "./render.ts";

export interface NonRetryingExpectation {
  /**
   * Negates the expectation, causing the assertion to pass when it would normally fail, and vice versa.
   */
  not: NonRetryingExpectation;

}

/**
 * createExpectation is a factory function that creates an expectation object for a given value.
 *
 * It effectively implements the NonRetryingExpectation interface, and provides the actual
 * implementation of the matchers attached to the expectation object.
 *
 * @param received the value to create an expectation for
 * @param config the configuration for the expectation
 * @param message the optional custom message for the expectation
 * @param isNegated whether the expectation is negated
 * @returns an expectation object over the given value exposing the Expectation set of methods
 */
export function createExpectation(
  received: unknown,
  config: ExpectConfig,
  message?: string,
  isNegated: boolean = false,
): NonRetryingExpectation {
  // In order to facilitate testing, we support passing in a custom assert function.
  // As a result, we need to make sure that the assert function is always available, and
  // if not, we need to use the default assert function.
  //
  // From this point forward, we will use the `usedAssert` variable to refer to the assert function.
  const usedAssert = config.assertFn ?? assert;

  // Configure the renderer with the colorize option.
  MatcherErrorRendererRegistry.configure({
    colorize: config.colorize,
    display: config.display,
  });

  // Register renderers specific to each matchers at initialization time.
  MatcherErrorRendererRegistry.register(
    "toBe",
    new DefaultMatcherErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeCloseTo",
    new ToBeCloseToErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeDefined",
    new ToBeDefinedErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeFalsy",
    new ToBeFalsyErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register("toBeNaN", new ToBeNaNErrorRenderer());
  MatcherErrorRendererRegistry.register(
    "toBeNull",
    new ToBeNullErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeTruthy",
    new ToBeTruthyErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeUndefined",
    new ToBeUndefinedErrorRenderer(),
  );

  const matcherConfig = {
    usedAssert,
    isSoft: config.soft,
    isNegated,
    message,
    softMode: config.softMode,
  };

  const expectation: NonRetryingExpectation = {
    get not(): NonRetryingExpectation {
      return createExpectation(received, config, message, !isNegated);
    },

  };

  return expectation;
}

// Helper function to handle common matcher logic
function createMatcher(
  matcherName: string,
  checkFn: () => boolean,
  expected: unknown,
  received: unknown,
  {
    usedAssert,
    isSoft,
    isNegated = false,
    matcherSpecific = {},
    message,
    softMode,
  }: {
    usedAssert: typeof assert;
    isSoft: boolean;
    isNegated?: boolean;
    matcherSpecific?: Record<string, unknown>;
    message?: string;
    softMode?: SoftMode;
  },
): void {
  const info = createMatcherInfo(
    matcherName,
    expected,
    received,
    { ...matcherSpecific, isNegated },
    message,
  );

  const result = checkFn();
  // If isNegated is true, we want to invert the result
  const finalResult = isNegated ? !result : result;

  usedAssert(
    finalResult,
    MatcherErrorRendererRegistry.getRenderer(matcherName).render(
      info,
      MatcherErrorRendererRegistry.getConfig(),
    ),
    isSoft,
    softMode,
  );
}

function createMatcherInfo(
  matcherName: string,
  expected: string | unknown,
  received: unknown,
  matcherSpecific: Record<string, unknown> = {},
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
    expected: typeof expected === "string"
      ? expected
      : JSON.stringify(expected),
    received: typeof received === "string"
      ? received
      : JSON.stringify(received),
    matcherSpecific,
    customMessage,
  };
}

/**
 * A matcher error renderer for the `toBeCloseTo` matcher.
 */
export class ToBeCloseToErrorRenderer extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeCloseTo";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    const matcherInfo = info.matcherSpecific as {
      precision: number;
      difference: number;
      expectedDifference: number;
    };

    return [
      {
        label: "Expected precision",
        value: maybeColorize(matcherInfo.precision.toString(), "green"),
        group: 3,
      },
      {
        label: "Expected difference",
        value: "< " +
          maybeColorize(`${matcherInfo.expectedDifference}`, "green"),
        group: 3,
      },
      {
        label: "Received difference",
        value: maybeColorize(matcherInfo.difference.toString(), "red"),
        group: 3,
      },
    ];
  }

  protected override renderMatcherArgs(
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): string {
    return maybeColorize(`(`, "darkGrey") +
      maybeColorize(`expected`, "green") +
      maybeColorize(`, `, "darkGrey") +
      maybeColorize(`precision`, "white") +
      maybeColorize(`)`, "darkGrey");
  }
}

/**
 * A matcher error renderer for the `toBeDefined` matcher.
 */
export class ToBeDefinedErrorRenderer extends ReceivedOnlyMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeDefined";
  }
}

/**
 * A matcher error renderer for the `toBeFalsy` matcher.
 */
export class ToBeFalsyErrorRenderer extends ReceivedOnlyMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeFalsy";
  }
}

/**
 * A matcher error renderer for the `toBeNaN` matcher.
 */
export class ToBeNaNErrorRenderer extends ReceivedOnlyMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeNaN";
  }
}

/**
 * A matcher error renderer for the `toBeNull` matcher.
 */
export class ToBeNullErrorRenderer extends ReceivedOnlyMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeNull";
  }
}

/**
 * A matcher error renderer for the `toBeTruthy` matcher.
 */
export class ToBeTruthyErrorRenderer extends ReceivedOnlyMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeTruthy";
  }
}

/**
 * A matcher error renderer for the `toBeUndefined` matcher.
 */
export class ToBeUndefinedErrorRenderer extends ReceivedOnlyMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeUndefined";
  }
}

