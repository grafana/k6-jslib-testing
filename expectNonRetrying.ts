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

  /**
   * Ensures that value is an Array or Set and contains an item equal to the expected.
   *
   * For objects, this method recursively checks equality of all fields, rather than comparing objects by reference.
   * For primitive values, this method is equivalent to expect(value).toContain().
   *
   * @param expected The item to check for deep equality within the collection
   */
  toContainEqual(expected: unknown): void;

  /**
   * Ensures that property at provided `keyPath` exists on the object and optionally checks
   * that property is equal to the expected. Equality is checked recursively, similarly to expect(value).toEqual().
   *
   * @param keyPath Path to the property. Use dot notation a.b to check nested properties
   *                and indexed a[2] notation to check nested array items.
   * @param expected Optional expected value to compare the property to.
   */
  toHaveProperty(keyPath: string, expected?: unknown): void;
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
  MatcherErrorRendererRegistry.register(
    "toContainEqual",
    new ToContainEqualErrorRenderer(),
  );
  MatcherErrorRendererRegistry.register(
    "toHaveProperty",
    new ToHavePropertyErrorRenderer(),
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

    toContainEqual(expected: unknown): void {
      let receivedType = "";
      if (Array.isArray(received)) {
        receivedType = "array";
      } else if (received instanceof Set) {
        receivedType = "set";
      } else {
        throw new Error(
          "toContainEqual is only supported for arrays and sets",
        );
      }

      createMatcher(
        "toContainEqual",
        () => {
          if (Array.isArray(received)) {
            return received.some((item) => isDeepEqual(item, expected));
          } else if (received instanceof Set) {
            return Array.from(received).some((item) =>
              isDeepEqual(item, expected)
            );
          } else {
            throw new Error(
              "toContainEqual is only supported for arrays and sets",
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

    toHaveProperty(keyPath: string, expected?: unknown): void {
      if (typeof received !== "object" || received === null) {
        throw new Error(
          "toHaveProperty is only supported for objects",
        );
      }

      const hasProperty = () => {
        try {
          const value = getPropertyByPath(
            received as Record<string, unknown>,
            keyPath,
          );
          return expected !== undefined ? isDeepEqual(value, expected) : true;
        } catch (_) {
          return false;
        }
      };

      createMatcher(
        "toHaveProperty",
        hasProperty,
        expected !== undefined ? expected : keyPath,
        received,
        {
          ...matcherConfig,
          matcherSpecific: {
            keyPath,
            hasExpectedValue: expected !== undefined,
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

/**
 * A matcher error renderer for the `toContainEqual` matcher.
 */
export class ToContainEqualErrorRenderer
  extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toContainEqual";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    const isNegated = info.matcherSpecific?.isNegated as boolean;
    const receivedType = info.matcherSpecific?.receivedType as string;

    return [
      {
        label: isNegated
          ? "Expected not to contain equal"
          : "Expected to contain equal",
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

/**
 * A matcher error renderer for the `toHaveProperty` matcher.
 */
export class ToHavePropertyErrorRenderer
  extends ExpectedReceivedMatcherRenderer {
  protected getMatcherName(): string {
    return "toHaveProperty";
  }

  protected override getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    const isNegated = info.matcherSpecific?.isNegated as boolean;
    const keyPath = info.matcherSpecific?.keyPath as string;
    const hasExpectedValue = info.matcherSpecific?.hasExpectedValue as boolean;

    const lines: LineGroup[] = [
      {
        label: "Property path",
        value: maybeColorize(keyPath, "white"),
        group: 3,
      },
    ];

    if (hasExpectedValue) {
      lines.push(
        {
          label: isNegated
            ? "Expected property not to equal"
            : "Expected property to equal",
          value: maybeColorize(info.expected, "green"),
          group: 3,
        },
      );
    } else {
      lines.push(
        {
          label: isNegated
            ? "Expected property not to exist"
            : "Expected property to exist",
          value: "",
          group: 3,
        },
      );
    }

    lines.push(
      {
        label: "Received object",
        value: maybeColorize(info.received, "red"),
        group: 3,
      },
    );

    return lines;
  }

  protected override renderMatcherArgs(
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): string {
    return maybeColorize(`(`, "darkGrey") +
      maybeColorize(`keyPath`, "white") +
      maybeColorize(`, `, "darkGrey") +
      maybeColorize(`expected?`, "green") +
      maybeColorize(`)`, "darkGrey");
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

/**
 * Gets a property value from an object using a path string.
 * Supports dot notation (obj.prop) and array indexing (obj[0] or obj.array[0]).
 *
 * @param obj The object to get the property from
 * @param path The path to the property (e.g. "a.b[0].c")
 * @returns The value at the specified path
 * @throws Error if the property doesn't exist
 */
function getPropertyByPath(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  if (path === "") {
    throw new Error("Invalid path: empty string");
  }

  // Parse the path into segments
  const segments: string[] = [];
  let currentSegment = "";
  let inBrackets = false;

  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (char === "." && !inBrackets) {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = "";
      }
    } else if (char === "[") {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = "";
      }
      inBrackets = true;
    } else if (char === "]") {
      if (inBrackets) {
        segments.push(currentSegment);
        currentSegment = "";
        inBrackets = false;
      } else {
        throw new Error(`Invalid path: ${path}`);
      }
    } else {
      currentSegment += char;
    }
  }

  // Add the last segment if there is one
  if (currentSegment) {
    segments.push(currentSegment);
  }

  // Traverse the object using the segments
  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      throw new Error(`Property ${path} does not exist`);
    }

    if (typeof segment === "string" && !isNaN(Number(segment))) {
      // If segment is a numeric string, treat it as an array index
      const index = Number(segment);
      if (!Array.isArray(current)) {
        throw new Error(`Cannot access index ${segment} of non-array`);
      }
      if (index >= (current as unknown[]).length) {
        throw new Error(`Index ${segment} out of bounds`);
      }
      current = (current as unknown[])[index];
    } else {
      // Otherwise treat it as an object property
      if (typeof current !== "object") {
        throw new Error(`Cannot access property ${segment} of non-object`);
      }

      if (!Object.prototype.hasOwnProperty.call(current, segment)) {
        throw new Error(`Property ${segment} does not exist on object`);
      }

      current = (current as Record<string, unknown>)[segment];
    }
  }

  return current;
}
