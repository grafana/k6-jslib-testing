import { assert } from "./assert.ts";
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

  /**
   * Asserts that the value is equal to the expected value.
   *
   * @param expected the expected value
   */
  toBe(expected: unknown): void;

  /**
   * Asserts that the value is close to the expected value with a given precision.
   *
   * @param expected the expected value
   * @param precision the number of decimal places to consider
   */
  toBeCloseTo(expected: number, precision?: number): void;

  /**
   * Asserts that the value is not `undefined`.
   */
  toBeDefined(): void;

  /**
   * Asserts that the value is truthy.
   */
  toBeFalsy(): void;

  /**
   * Asserts that the value is greater than the expected value.
   *
   * @param expected the expected value
   */
  toBeGreaterThan(expected: number): void;

  /**
   * Asserts that the value is greater than or equal to the expected value.
   *
   * @param expected
   */
  toBeGreaterThanOrEqual(expected: number): void;

  /**
   * Ensures that value is an instance of a class. Uses instanceof operator.
   *
   * @param expected The class or constructor function.
   */
  // deno-lint-ignore ban-types
  toBeInstanceOf(expected: Function): void;

  /**
   * Asserts that the value is less than the expected value.
   *
   * @param expected the expected value
   */
  toBeLessThan(expected: number): void;

  /**
   * Ensures that value <= expected for number or big integer values.
   *
   * @param expected The value to compare to.
   */
  toBeLessThanOrEqual(expected: number | bigint): void;

  /**
   * Ensures that value is NaN.
   */
  toBeNaN(): void;

  /**
   * Ensures that value is null.
   */
  toBeNull(): void;

  /**
   * Ensures that value is true in a boolean context, anything but false, 0, '', null, undefined or NaN.
   * Use this method when you don't care about the specific value.
   */
  toBeTruthy(): void;

  /**
   * Ensures that value is `undefined`.
   */
  toBeUndefined(): void;

  /**
   * Asserts that the value is equal to the expected value.
   *
   * @param expected the expected value
   */
  toEqual(expected: unknown): void;

  /**
   * Ensures that value has a `.length` property equal to expected.
   * Useful for arrays and strings.
   *
   * @param expected
   */
  toHaveLength(expected: number): void;

  /**
   * Ensures that a string contains an expected substring using a case-sensitive comparison,
   * or that an Array or Set contains an expected item.
   *
   * @param expected The substring or item to check for
   */
  toContain(expected: unknown): void;
}

/**
 * createExpectation is a factory function that creates an expectation object for a given value.
 *
 * It effectively implements the NonRetryingExpectation interface, and provides the actual
 * implementation of the matchers attached to the expectation object.
 *
 * @param received the value to create an expectation for
 * @param config the configuration for the expectation
 * @param isNegated whether the expectation is negated
 * @returns an expectation object over the given value exposing the Expectation set of methods
 */
export function createExpectation(
  received: unknown,
  config: ExpectConfig,
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
  MatcherErrorRendererRegistry.register(
    "toBeGreaterThan",
    new ToBeGreaterThanErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeGreaterThanOrEqual",
    new ToBeGreaterThanOrEqualErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeInstanceOf",
    new ToBeInstanceOfErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeLessThan",
    new ToBeLessThanErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toBeLessThanOrEqual",
    new ToBeLessThanOrEqualErrorRenderer(),
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
  MatcherErrorRendererRegistry.register("toEqual", new ToEqualErrorRenderer());
  MatcherErrorRendererRegistry.register(
    "toHaveLength",
    new ToHaveLengthErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toContain",
    new ToContainErrorRenderer(),
  );

  const matcherConfig = {
    usedAssert,
    isSoft: config.soft,
    isNegated,
  };

  const expectation: NonRetryingExpectation = {
    get not(): NonRetryingExpectation {
      return createExpectation(received, config, !isNegated);
    },

    toBe(expected: unknown): void {
      createMatcher(
        "toBe",
        () => Object.is(received, expected),
        expected,
        received,
        matcherConfig,
      );
    },

    toBeCloseTo(expected: number, precision: number = 2): void {
      const tolerance = Math.pow(10, -precision) *
        Math.max(Math.abs(received as number), Math.abs(expected));
      const diff = Math.abs((received as number) - expected);

      createMatcher(
        "toBeCloseTo",
        () => diff < tolerance,
        expected,
        received,
        {
          ...matcherConfig,
          matcherSpecific: {
            precision,
            difference: diff,
            expectedDifference: tolerance,
          },
        },
      );
    },

    toBeDefined(): void {
      createMatcher(
        "toBeDefined",
        () => received !== undefined,
        "defined",
        JSON.stringify(received),
        matcherConfig,
      );
    },

    toBeFalsy(): void {
      createMatcher(
        "toBeFalsy",
        () => !received,
        "falsy",
        JSON.stringify(received),
        matcherConfig,
      );
    },

    toBeGreaterThan(expected: number | bigint): void {
      createMatcher(
        "toBeGreaterThan",
        () => (received as number) > expected,
        expected,
        received,
        matcherConfig,
      );
    },

    toBeGreaterThanOrEqual(expected: number | bigint): void {
      createMatcher(
        "toBeGreaterThanOrEqual",
        () => (received as number) >= expected,
        expected,
        received,
        matcherConfig,
      );
    },

    // deno-lint-ignore ban-types
    toBeInstanceOf(expected: Function): void {
      createMatcher(
        "toBeInstanceOf",
        () => received instanceof expected,
        expected.name,
        (received as { constructor: { name: string } }).constructor.name,
        matcherConfig,
      );
    },

    toBeLessThan(expected: number | bigint): void {
      createMatcher(
        "toBeLessThan",
        () => (received as number) < expected,
        expected,
        received,
        matcherConfig,
      );
    },

    toBeLessThanOrEqual(expected: number | bigint): void {
      createMatcher(
        "toBeLessThanOrEqual",
        () => (received as number) <= expected,
        expected,
        received,
        matcherConfig,
      );
    },

    toBeNaN(): void {
      createMatcher(
        "toBeNaN",
        () => isNaN(received as number),
        "NaN",
        JSON.stringify(received),
        matcherConfig,
      );
    },

    toBeNull(): void {
      createMatcher(
        "toBeNull",
        () => received === null,
        "null",
        JSON.stringify(received),
        matcherConfig,
      );
    },

    toBeTruthy(): void {
      createMatcher(
        "toBeTruthy",
        () => !!received,
        "truthy",
        JSON.stringify(received),
        matcherConfig,
      );
    },

    toBeUndefined(): void {
      createMatcher(
        "toBeUndefined",
        () => received === undefined,
        "undefined",
        JSON.stringify(received),
        matcherConfig,
      );
    },

    toEqual(expected: unknown): void {
      createMatcher(
        "toEqual",
        () => isDeepEqual(received, expected),
        JSON.stringify(expected),
        JSON.stringify(received),
        matcherConfig,
      );
    },

    toHaveLength(expected: number): void {
      createMatcher(
        "toHaveLength",
        () => (received as Array<unknown>).length === expected,
        expected.toString(),
        (received as Array<unknown>).length.toString(),
        matcherConfig,
      );
    },

    toContain(expected: unknown): void {
      let receivedType = "";
      if (typeof received === "string") {
        receivedType = "string";
      } else if (Array.isArray(received)) {
        receivedType = "array";
      } else if (received instanceof Set) {
        receivedType = "set";
      } else {
        throw new Error(
          "toContain is only supported for strings, arrays, and sets",
        );
      }
      createMatcher(
        "toContain",
        () => {
          if (typeof received === "string") {
            return received.includes(expected as string);
          } else if (Array.isArray(received)) {
            return received.includes(expected);
          } else if (received instanceof Set) {
            return Array.from(received).includes(expected);
          } else {
            throw new Error(
              "toContain is only supported for strings, arrays, and sets",
            );
          }
        },
        expected,
        received,
        {
          ...matcherConfig,
          matcherSpecific: {
            receivedType,
          },
        },
      );
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
  }: {
    usedAssert: typeof assert;
    isSoft: boolean;
    isNegated?: boolean;
    matcherSpecific?: Record<string, unknown>;
  },
): void {
  const info = createMatcherInfo(
    matcherName,
    expected,
    received,
    { ...matcherSpecific, isNegated },
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
  );
}

function createMatcherInfo(
  matcherName: string,
  expected: string | unknown,
  received: unknown,
  matcherSpecific: Record<string, unknown> = {},
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
    received: JSON.stringify(received),
    matcherSpecific,
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
 * A matcher error renderer for the `toBeGreaterThan` matcher.
 */
export class ToBeGreaterThanErrorRenderer
  extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeGreaterThan";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Expected",
        value: "> " + maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
    ];
  }
}

/**
 * A matcher error renderer for the `toBeGreaterThanOrEqual` matcher.
 */
export class ToBeGreaterThanOrEqualErrorRenderer
  extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeGreaterThanOrEqual";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Expected",
        value: ">= " + maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
    ];
  }
}

/**
 * A matcher error renderer for the `toBeInstanceOf` matcher.
 */
export class ToBeInstanceOfErrorRenderer
  extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeInstanceOf";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Expected constructor",
        value: maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received constructor",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
    ];
  }
}

/**
 * A matcher error renderer for the `toBeLessThan` matcher.
 */
export class ToBeLessThanErrorRenderer extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeLessThan";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Expected",
        value: "< " + maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
    ];
  }
}

/**
 * A matcher error renderer for the `toBeLessThanOrEqual` matcher.
 */
export class ToBeLessThanOrEqualErrorRenderer
  extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toBeLessThanOrEqual";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Expected",
        value: "<= " + maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
    ];
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

/**
 * A matcher error renderer for the `toEqual` matcher.
 */
export class ToEqualErrorRenderer extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toEqual";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
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
    ];
  }
}

/**
 * A matcher error renderer for the `toHaveLength` matcher.
 */
export class ToHaveLengthErrorRenderer extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toHaveLength";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Expected length",
        value: maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: "Received length",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
      {
        label: "Received array",
        value: maybeColorize(
          info.matcherSpecific?.receivedArray as string,
          "red",
        ),
        group: 3,
      },
    ];
  }
}

/**
 * A matcher error renderer for the `toContain` matcher.
 */
export class ToContainErrorRenderer extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toContain";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    const isNegated = info.matcherSpecific?.isNegated as boolean;
    const receivedType = typeof info.matcherSpecific?.receivedType === "string"
      ? info.matcherSpecific?.receivedType as string
      : Array.isArray(JSON.parse(info.received))
      ? "array"
      : "string";

    return [
      {
        label: isNegated ? "Expected not to contain" : "Expected to contain",
        value: maybeColorize(info.expected, "green"),
        group: 3,
      },
      {
        label: `Received ${receivedType}`,
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
    ];
  }
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    return keysB.includes(key) &&
      isDeepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      );
  });
}
