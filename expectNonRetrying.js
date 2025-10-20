import { assert } from "./assert.ts";
import { captureExecutionContext } from "./execution.ts";
import { parseStackTrace } from "./stacktrace.ts";
import {
  DefaultMatcherErrorRenderer,
  ExpectedReceivedMatcherRenderer,
  MatcherErrorRendererRegistry,
  ReceivedOnlyMatcherRenderer,
} from "./render.ts";
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
  received,
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
  const expectation = {
    get not() {
      return createExpectation(received, config, message, !isNegated);
    },
    toBe(expected) {
      createMatcher(
        "toBe",
        () => Object.is(received, expected),
        expected,
        received,
        matcherConfig,
      );
    },
    toBeCloseTo(expected, precision = 2) {
      const tolerance = Math.pow(10, -precision) *
        Math.max(Math.abs(received), Math.abs(expected));
      const diff = Math.abs(received - expected);
      createMatcher("toBeCloseTo", () => diff < tolerance, expected, received, {
        ...matcherConfig,
        matcherSpecific: {
          precision,
          difference: diff,
          expectedDifference: tolerance,
        },
      });
    },
    toBeDefined() {
      createMatcher(
        "toBeDefined",
        () => received !== undefined,
        "defined",
        JSON.stringify(received),
        matcherConfig,
      );
    },
    toBeFalsy() {
      createMatcher(
        "toBeFalsy",
        () => !received,
        "falsy",
        JSON.stringify(received),
        matcherConfig,
      );
    },
    toBeGreaterThan(expected) {
      createMatcher(
        "toBeGreaterThan",
        () => received > expected,
        expected,
        received,
        matcherConfig,
      );
    },
    toBeGreaterThanOrEqual(expected) {
      createMatcher(
        "toBeGreaterThanOrEqual",
        () => received >= expected,
        expected,
        received,
        matcherConfig,
      );
    },
    toBeInstanceOf(expected) {
      createMatcher(
        "toBeInstanceOf",
        () => received instanceof expected,
        expected.name,
        received.constructor.name,
        matcherConfig,
      );
    },
    toBeLessThan(expected) {
      createMatcher(
        "toBeLessThan",
        () => received < expected,
        expected,
        received,
        matcherConfig,
      );
    },
    toBeLessThanOrEqual(expected) {
      createMatcher(
        "toBeLessThanOrEqual",
        () => received <= expected,
        expected,
        received,
        matcherConfig,
      );
    },
    toBeNaN() {
      createMatcher(
        "toBeNaN",
        () => isNaN(received),
        "NaN",
        JSON.stringify(received),
        matcherConfig,
      );
    },
    toBeNull() {
      createMatcher(
        "toBeNull",
        () => received === null,
        "null",
        JSON.stringify(received),
        matcherConfig,
      );
    },
    toBeTruthy() {
      createMatcher(
        "toBeTruthy",
        () => !!received,
        "truthy",
        JSON.stringify(received),
        matcherConfig,
      );
    },
    toBeUndefined() {
      createMatcher(
        "toBeUndefined",
        () => received === undefined,
        "undefined",
        JSON.stringify(received),
        matcherConfig,
      );
    },
    toEqual(expected) {
      createMatcher(
        "toEqual",
        () => isDeepEqual(received, expected),
        JSON.stringify(expected),
        JSON.stringify(received),
        matcherConfig,
      );
    },
    toHaveLength(expected) {
      createMatcher(
        "toHaveLength",
        () => received.length === expected,
        expected.toString(),
        received.length.toString(),
        matcherConfig,
      );
    },
    toContain(expected) {
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
            return received.includes(expected);
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
    toContainEqual(expected) {
      let receivedType = "";
      if (Array.isArray(received)) {
        receivedType = "array";
      } else if (received instanceof Set) {
        receivedType = "set";
      } else {
        throw new Error("toContainEqual is only supported for arrays and sets");
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
    toHaveProperty(keyPath, expected) {
      if (typeof received !== "object" || received === null) {
        throw new Error("toHaveProperty is only supported for objects");
      }
      const hasProperty = () => {
        try {
          const value = getPropertyByPath(received, keyPath);
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
  matcherName,
  checkFn,
  expected,
  received,
  {
    usedAssert,
    isSoft,
    isNegated = false,
    matcherSpecific = {},
    message,
    softMode,
  },
) {
  const info = createMatcherInfo(matcherName, expected, received, {
    ...matcherSpecific,
    isNegated,
  }, message);
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
  matcherName,
  expected,
  received,
  matcherSpecific = {},
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
  getMatcherName() {
    return "toBeCloseTo";
  }
  getSpecificLines(info, maybeColorize) {
    const matcherInfo = info.matcherSpecific;
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
  renderMatcherArgs(maybeColorize) {
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
  getMatcherName() {
    return "toBeDefined";
  }
}
/**
 * A matcher error renderer for the `toBeFalsy` matcher.
 */
export class ToBeFalsyErrorRenderer extends ReceivedOnlyMatcherRenderer {
  getMatcherName() {
    return "toBeFalsy";
  }
}
/**
 * A matcher error renderer for the `toBeGreaterThan` matcher.
 */
export class ToBeGreaterThanErrorRenderer
  extends ExpectedReceivedMatcherRenderer {
  getMatcherName() {
    return "toBeGreaterThan";
  }
  getSpecificLines(info, maybeColorize) {
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
  getMatcherName() {
    return "toBeGreaterThanOrEqual";
  }
  getSpecificLines(info, maybeColorize) {
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
  getMatcherName() {
    return "toBeInstanceOf";
  }
  getSpecificLines(info, maybeColorize) {
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
  getMatcherName() {
    return "toBeLessThan";
  }
  getSpecificLines(info, maybeColorize) {
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
  getMatcherName() {
    return "toBeLessThanOrEqual";
  }
  getSpecificLines(info, maybeColorize) {
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
  getMatcherName() {
    return "toBeNaN";
  }
}
/**
 * A matcher error renderer for the `toBeNull` matcher.
 */
export class ToBeNullErrorRenderer extends ReceivedOnlyMatcherRenderer {
  getMatcherName() {
    return "toBeNull";
  }
}
/**
 * A matcher error renderer for the `toBeTruthy` matcher.
 */
export class ToBeTruthyErrorRenderer extends ReceivedOnlyMatcherRenderer {
  getMatcherName() {
    return "toBeTruthy";
  }
}
/**
 * A matcher error renderer for the `toBeUndefined` matcher.
 */
export class ToBeUndefinedErrorRenderer extends ReceivedOnlyMatcherRenderer {
  getMatcherName() {
    return "toBeUndefined";
  }
}
/**
 * A matcher error renderer for the `toEqual` matcher.
 */
export class ToEqualErrorRenderer extends ExpectedReceivedMatcherRenderer {
  getMatcherName() {
    return "toEqual";
  }
  getSpecificLines(info, maybeColorize) {
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
  getMatcherName() {
    return "toHaveLength";
  }
  getSpecificLines(info, maybeColorize) {
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
        value: maybeColorize(info.matcherSpecific?.receivedArray, "red"),
        group: 3,
      },
    ];
  }
}
/**
 * A matcher error renderer for the `toContain` matcher.
 */
export class ToContainErrorRenderer extends ExpectedReceivedMatcherRenderer {
  getMatcherName() {
    return "toContain";
  }
  getSpecificLines(info, maybeColorize) {
    const isNegated = info.matcherSpecific?.isNegated;
    const receivedType = typeof info.matcherSpecific?.receivedType === "string"
      ? info.matcherSpecific?.receivedType
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
  getMatcherName() {
    return "toContainEqual";
  }
  getSpecificLines(info, maybeColorize) {
    const isNegated = info.matcherSpecific?.isNegated;
    const receivedType = info.matcherSpecific?.receivedType;
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
  getMatcherName() {
    return "toHaveProperty";
  }
  getSpecificLines(info, maybeColorize) {
    const isNegated = info.matcherSpecific?.isNegated;
    const keyPath = info.matcherSpecific?.keyPath;
    const hasExpectedValue = info.matcherSpecific?.hasExpectedValue;
    const lines = [
      {
        label: "Property path",
        value: maybeColorize(keyPath, "white"),
        group: 3,
      },
    ];
    if (hasExpectedValue) {
      lines.push({
        label: isNegated
          ? "Expected property not to equal"
          : "Expected property to equal",
        value: maybeColorize(info.expected, "green"),
        group: 3,
      });
    } else {
      lines.push({
        label: isNegated
          ? "Expected property not to exist"
          : "Expected property to exist",
        value: "",
        group: 3,
      });
    }
    lines.push({
      label: "Received object",
      value: maybeColorize(info.received, "red"),
      group: 3,
    });
    return lines;
  }
  renderMatcherArgs(maybeColorize) {
    return maybeColorize(`(`, "darkGrey") +
      maybeColorize(`keyPath`, "white") +
      maybeColorize(`, `, "darkGrey") +
      maybeColorize(`expected?`, "green") +
      maybeColorize(`)`, "darkGrey");
  }
}
function isDeepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  if (typeof a !== "object" || typeof b !== "object") {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((key) => {
    return keysB.includes(key) &&
      isDeepEqual(a[key], b[key]);
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
function getPropertyByPath(obj, path) {
  if (path === "") {
    throw new Error("Invalid path: empty string");
  }
  // Parse the path into segments
  const segments = [];
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
  let current = obj;
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
      if (index >= current.length) {
        throw new Error(`Index ${segment} out of bounds`);
      }
      current = current[index];
    } else {
      // Otherwise treat it as an object property
      if (typeof current !== "object") {
        throw new Error(`Cannot access property ${segment} of non-object`);
      }
      if (!Object.prototype.hasOwnProperty.call(current, segment)) {
        throw new Error(`Property ${segment} does not exist on object`);
      }
      current = current[segment];
    }
  }
  return current;
}
