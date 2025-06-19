// k6-jslib-testing bundle for Sobek runtime
var k6Testing = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // mod.ts
  var mod_exports = {};
  __export(mod_exports, {
    colorize: () => colorize,
    expect: () => expect
  });

  // assert.ts
  var import_k6_execution_shim = __toESM(__require("k6/execution"));
  function assert(condition, message, soft, softMode = "throw") {
    if (condition) return;
    if (soft) {
      if (softMode === "fail") {
        import_k6_execution_shim.default.test.fail(message);
      } else {
        throw new AssertionFailedError(message);
      }
    } else {
      import_k6_execution_shim.default.test.abort(message);
    }
  }
  var AssertionFailedError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "AssertionFailedError";
    }
  };

  // environment.ts
  function getEnvironment() {
    if (typeof Deno !== "undefined") {
      return Deno.env.toObject();
    }
    return __ENV;
  }
  var env = getEnvironment();
  var envParser = {
    /**
     * Check if an environment variable is set
     */
    hasValue(key) {
      return env[key] !== void 0;
    },
    /**
     * Parse a boolean environment variable
     * "false" (case insensitive) -> false
     * anything else -> true
     * @throws if value is undefined
     */
    boolean(key) {
      var _a;
      const value = (_a = env[key]) == null ? void 0 : _a.toLowerCase();
      if (value === void 0) {
        throw new Error(`Environment variable ${key} is not set`);
      }
      return value !== "false";
    },
    /**
     * Parse an environment variable that should match specific values
     * @throws if value is undefined or doesn't match allowed values
     */
    enum(key, allowedValues) {
      var _a;
      const value = (_a = env[key]) == null ? void 0 : _a.toLowerCase();
      if (value === void 0) {
        throw new Error(`Environment variable ${key} is not set`);
      }
      if (!allowedValues.includes(value)) {
        throw new Error(
          `Invalid value for ${key}. Must be one of: ${allowedValues.join(", ")}`
        );
      }
      return value;
    },
    /**
     * Parses an environment variable as a non-negative number.
     * @param name The name of the environment variable
     * @throws Error if the value is not a valid non-negative number
     * @returns The parsed number value
     */
    number(name) {
      const value = env[name];
      if (!value) {
        throw new Error(`Environment variable ${name} is not set`);
      }
      const parsed = Number(value);
      if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
        throw new Error(
          `Environment variable ${name} must be a valid number, got: ${value}`
        );
      }
      if (parsed < 0) {
        throw new Error(
          `Environment variable ${name} must be a non-negative number, got: ${value}`
        );
      }
      return parsed;
    }
  };

  // config.ts
  var DEFAULT_RETRY_OPTIONS = {
    // 5 seconds default timeout
    timeout: 5e3,
    // 100ms between retries
    interval: 100
  };
  var DEFAULT_CONFIG = {
    ...DEFAULT_RETRY_OPTIONS,
    soft: false,
    softMode: "throw",
    colorize: true,
    display: "pretty",
    assertFn: assert
  };
  var ConfigLoader = class _ConfigLoader {
    /**
     * Loads configuration with the following precedence (highest to lowest):
     * 1. Environment variables
     * 2. Explicit configuration passed to the function
     * 3. Default values
     */
    static load(explicitConfig = {}) {
      const envConfig = _ConfigLoader.loadFromEnv();
      return {
        ...DEFAULT_CONFIG,
        ...explicitConfig,
        ...envConfig
      };
    }
    /**
     * Loads configuration from environment variables
     * Returns only the values that are explicitly set in the environment
     */
    static loadFromEnv() {
      const config = {};
      if (envParser.hasValue("K6_TESTING_COLORIZE")) {
        config.colorize = envParser.boolean("K6_TESTING_COLORIZE");
      }
      if (envParser.hasValue("K6_TESTING_DISPLAY")) {
        config.display = envParser.enum(
          "K6_TESTING_DISPLAY",
          ["inline", "pretty"]
        );
      }
      if (envParser.hasValue("K6_TESTING_TIMEOUT")) {
        config.timeout = envParser.number("K6_TESTING_TIMEOUT");
      }
      if (envParser.hasValue("K6_TESTING_INTERVAL")) {
        config.interval = envParser.number("K6_TESTING_INTERVAL");
      }
      if (envParser.hasValue("K6_TESTING_SOFT_MODE")) {
        config.softMode = envParser.enum(
          "K6_TESTING_SOFT_MODE",
          ["throw", "fail"]
        );
      }
      return config;
    }
  };

  // execution.ts
  function captureExecutionContext(st) {
    if (!st || st.length <= 1) {
      return void 0;
    }
    const stackFrame = st[st.length - 1];
    const filePath = stackFrame.filePath;
    const fileName = stackFrame.fileName;
    const lineNumber = stackFrame.lineNumber;
    const columnNumber = stackFrame.columnNumber;
    const at = `${filePath}:${lineNumber}:${columnNumber}`;
    return {
      filePath,
      fileName,
      lineNumber,
      columnNumber,
      at
    };
  }

  // stacktrace.ts
  function parseStackTrace(stack) {
    var _a;
    if (!stack) return [];
    const lines = stack.split("\n");
    const frames = [];
    for (let i = 0; i < lines.length; i++) {
      let lineStr = lines[i].trim();
      if (i === 0 && lineStr.startsWith("Error")) continue;
      if (!lineStr.startsWith("at ")) continue;
      lineStr = lineStr.slice(3).trim();
      let functionName = "<anonymous>";
      let fileInfo = lineStr;
      const firstParenIndex = lineStr.indexOf("(");
      const fileProtocolIndex = lineStr.indexOf("file://");
      if (fileProtocolIndex === 0) {
        functionName = "<anonymous>";
        fileInfo = lineStr.slice(fileProtocolIndex);
      } else if (firstParenIndex >= 0) {
        functionName = lineStr.slice(0, firstParenIndex).trim() || "<anonymous>";
        fileInfo = lineStr.slice(firstParenIndex + 1, lineStr.lastIndexOf(")")).trim();
      } else {
        fileInfo = lineStr;
      }
      const offsetParenIndex = fileInfo.lastIndexOf("(");
      if (offsetParenIndex >= 0) {
        fileInfo = fileInfo.slice(0, offsetParenIndex);
      }
      if (fileInfo.startsWith("file://")) {
        fileInfo = fileInfo.slice(7);
      }
      const lastColon = fileInfo.lastIndexOf(":");
      if (lastColon === -1) continue;
      const secondLastColon = fileInfo.lastIndexOf(":", lastColon - 1);
      if (secondLastColon === -1) continue;
      const filePath = fileInfo.slice(0, secondLastColon);
      const fileName = (_a = filePath.split("/").pop()) != null ? _a : "";
      const lineNumberStr = fileInfo.slice(secondLastColon + 1, lastColon);
      const columnNumberStr = fileInfo.slice(lastColon + 1);
      frames.push({
        functionName,
        filePath,
        fileName,
        lineNumber: parseInt(lineNumberStr, 10),
        columnNumber: parseInt(columnNumberStr, 10)
      });
    }
    return frames;
  }

  // colors.ts
  var ANSI_COLORS = {
    reset: "\x1B[0m",
    // Standard Colors
    black: "\x1B[30m",
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m",
    cyan: "\x1B[36m",
    white: "\x1B[37m",
    // Bright Colors
    brightBlack: "\x1B[90m",
    brightRed: "\x1B[91m",
    brightGreen: "\x1B[92m",
    brightYellow: "\x1B[93m",
    brightBlue: "\x1B[94m",
    brightMagenta: "\x1B[95m",
    brightCyan: "\x1B[96m",
    brightWhite: "\x1B[97m",
    // Dark Colors
    darkGrey: "\x1B[90m"
  };
  function colorize(text, color) {
    return `${ANSI_COLORS[color]}${text}${ANSI_COLORS.reset}`;
  }

  // render.ts
  var MatcherErrorRendererRegistry = class {
    static register(matcherName, renderer) {
      this.renderers.set(matcherName, renderer);
    }
    static getRenderer(matcherName) {
      return this.renderers.get(matcherName) || new DefaultMatcherErrorRenderer();
    }
    static configure(config) {
      this.config = { ...this.config, ...config };
    }
    static getConfig() {
      return this.config;
    }
  };
  __publicField(MatcherErrorRendererRegistry, "renderers", /* @__PURE__ */ new Map());
  __publicField(MatcherErrorRendererRegistry, "config", { colorize: true, display: "pretty" });
  var BaseMatcherErrorRenderer = class {
    getReceivedPlaceholder() {
      return "received";
    }
    getExpectedPlaceholder() {
      return "expected";
    }
    renderErrorLine(info, config) {
      const maybeColorize = (text, color) => config.colorize ? colorize(text, color) : text;
      if ("customMessage" in info && typeof info.customMessage === "string") {
        return maybeColorize(info.customMessage, "white");
      }
      return maybeColorize(`expect(`, "darkGrey") + maybeColorize(this.getReceivedPlaceholder(), "red") + maybeColorize(`).`, "darkGrey") + maybeColorize(this.getMatcherName(), "white") + this.renderMatcherArgs(maybeColorize);
    }
    renderMatcherArgs(maybeColorize) {
      return maybeColorize(`()`, "darkGrey");
    }
    render(info, config) {
      const maybeColorize = (text, color) => config.colorize ? colorize(text, color) : text;
      const lines = [
        { label: "Error", value: this.renderErrorLine(info, config), group: 1 },
        {
          label: "At",
          value: maybeColorize(
            info.executionContext.at || "unknown location",
            "darkGrey"
          ),
          group: 1
        },
        ...this.getSpecificLines(info, maybeColorize),
        {
          label: "Filename",
          value: maybeColorize(info.executionContext.fileName, "darkGrey"),
          group: 99
        },
        {
          label: "Line",
          value: maybeColorize(
            info.executionContext.lineNumber.toString(),
            "darkGrey"
          ),
          group: 99
        }
      ];
      return DisplayFormatRegistry.getFormatter(config.display).renderLines(
        lines
      );
    }
  };
  var ReceivedOnlyMatcherRenderer = class extends BaseMatcherErrorRenderer {
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 2
        }
      ];
    }
  };
  var ExpectedReceivedMatcherRenderer = class extends BaseMatcherErrorRenderer {
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Expected",
          value: maybeColorize(info.expected, "green"),
          group: 2
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 2
        }
      ];
    }
    renderMatcherArgs(maybeColorize) {
      return maybeColorize(`(`, "darkGrey") + maybeColorize(this.getExpectedPlaceholder(), "green") + maybeColorize(`)`, "darkGrey");
    }
  };
  var DefaultMatcherErrorRenderer = class {
    render(info, config) {
      const maybeColorize = (text, color) => config.colorize ? colorize(text, color) : text;
      const lines = [
        { label: "Error", value: this.renderErrorLine(info, config), group: 1 },
        {
          label: "At",
          value: maybeColorize(
            info.executionContext.at || "unknown location",
            "darkGrey"
          ),
          group: 1
        },
        {
          label: "Expected",
          value: maybeColorize(info.expected, "green"),
          group: 2
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 2
        },
        {
          label: "Filename",
          value: maybeColorize(info.executionContext.fileName, "darkGrey"),
          group: 3
        },
        {
          label: "Line",
          value: maybeColorize(
            info.executionContext.lineNumber.toString(),
            "darkGrey"
          ),
          group: 3
        }
      ];
      return DisplayFormatRegistry.getFormatter(config.display).renderLines(
        lines
      );
    }
    renderErrorLine(info, config) {
      const maybeColorize = (text, color) => config.colorize ? colorize(text, color) : text;
      return maybeColorize(`expect(`, "darkGrey") + maybeColorize(`received`, "red") + maybeColorize(`).`, "darkGrey") + maybeColorize(`${info.matcherName}`, "white") + maybeColorize(`(`, "darkGrey") + maybeColorize(`expected`, "green") + maybeColorize(`)`, "darkGrey");
    }
  };
  var PrettyFormatRenderer = class {
    renderLines(lines) {
      const maxLabelWidth = Math.max(
        ...lines.filter((line) => !line.raw).map(({ label }) => (label + ":").length)
      );
      return "\n\n" + lines.map(({ label, value, raw }, index) => {
        let line;
        if (raw) {
          line = value;
        } else {
          const labelWithColon = label + ":";
          const spaces = " ".repeat(maxLabelWidth - labelWithColon.length);
          line = spaces + labelWithColon + " " + value;
        }
        const nextLine = lines[index + 1];
        if (nextLine && lines[index].group !== nextLine.group) {
          return line + "\n";
        }
        return line;
      }).join("\n") + "\n\n";
    }
  };
  var InlineFormatRenderer = class {
    renderLines(lines) {
      return lines.map(({ label, value }) => {
        const escapedValue = typeof value === "string" ? value.includes(" ") ? `"${value}"` : value : value;
        const escapedLabel = label.toLowerCase().replace(/\s+/g, "_");
        return `${escapedLabel}=${escapedValue}`;
      }).join(" ");
    }
  };
  var DisplayFormatRegistry = class {
    static getFormatter(format) {
      const formatter = this.formatters.get(format);
      if (!formatter) {
        throw new Error(`Unknown display format: ${format}`);
      }
      return formatter;
    }
  };
  __publicField(DisplayFormatRegistry, "formatters", /* @__PURE__ */ new Map([
    ["pretty", new PrettyFormatRenderer()],
    ["inline", new InlineFormatRenderer()]
  ]));

  // expectNonRetrying.ts
  function createExpectation(received, config, message, isNegated = false) {
    var _a;
    const usedAssert = (_a = config.assertFn) != null ? _a : assert;
    MatcherErrorRendererRegistry.configure({
      colorize: config.colorize,
      display: config.display
    });
    MatcherErrorRendererRegistry.register(
      "toBe",
      new DefaultMatcherErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeCloseTo",
      new ToBeCloseToErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeDefined",
      new ToBeDefinedErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeFalsy",
      new ToBeFalsyErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeGreaterThan",
      new ToBeGreaterThanErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeGreaterThanOrEqual",
      new ToBeGreaterThanOrEqualErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeInstanceOf",
      new ToBeInstanceOfErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeLessThan",
      new ToBeLessThanErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeLessThanOrEqual",
      new ToBeLessThanOrEqualErrorRenderer()
    );
    MatcherErrorRendererRegistry.register("toBeNaN", new ToBeNaNErrorRenderer());
    MatcherErrorRendererRegistry.register(
      "toBeNull",
      new ToBeNullErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeTruthy",
      new ToBeTruthyErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeUndefined",
      new ToBeUndefinedErrorRenderer()
    );
    MatcherErrorRendererRegistry.register("toEqual", new ToEqualErrorRenderer());
    MatcherErrorRendererRegistry.register(
      "toHaveLength",
      new ToHaveLengthErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toContain",
      new ToContainErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toContainEqual",
      new ToContainEqualErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toHaveProperty",
      new ToHavePropertyErrorRenderer()
    );
    const matcherConfig = {
      usedAssert,
      isSoft: config.soft,
      isNegated,
      message,
      softMode: config.softMode
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
          matcherConfig
        );
      },
      toBeCloseTo(expected, precision = 2) {
        const tolerance = Math.pow(10, -precision) * Math.max(Math.abs(received), Math.abs(expected));
        const diff = Math.abs(received - expected);
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
              expectedDifference: tolerance
            }
          }
        );
      },
      toBeDefined() {
        createMatcher(
          "toBeDefined",
          () => received !== void 0,
          "defined",
          JSON.stringify(received),
          matcherConfig
        );
      },
      toBeFalsy() {
        createMatcher(
          "toBeFalsy",
          () => !received,
          "falsy",
          JSON.stringify(received),
          matcherConfig
        );
      },
      toBeGreaterThan(expected) {
        createMatcher(
          "toBeGreaterThan",
          () => received > expected,
          expected,
          received,
          matcherConfig
        );
      },
      toBeGreaterThanOrEqual(expected) {
        createMatcher(
          "toBeGreaterThanOrEqual",
          () => received >= expected,
          expected,
          received,
          matcherConfig
        );
      },
      // deno-lint-ignore ban-types
      toBeInstanceOf(expected) {
        createMatcher(
          "toBeInstanceOf",
          () => received instanceof expected,
          expected.name,
          received.constructor.name,
          matcherConfig
        );
      },
      toBeLessThan(expected) {
        createMatcher(
          "toBeLessThan",
          () => received < expected,
          expected,
          received,
          matcherConfig
        );
      },
      toBeLessThanOrEqual(expected) {
        createMatcher(
          "toBeLessThanOrEqual",
          () => received <= expected,
          expected,
          received,
          matcherConfig
        );
      },
      toBeNaN() {
        createMatcher(
          "toBeNaN",
          () => isNaN(received),
          "NaN",
          JSON.stringify(received),
          matcherConfig
        );
      },
      toBeNull() {
        createMatcher(
          "toBeNull",
          () => received === null,
          "null",
          JSON.stringify(received),
          matcherConfig
        );
      },
      toBeTruthy() {
        createMatcher(
          "toBeTruthy",
          () => !!received,
          "truthy",
          JSON.stringify(received),
          matcherConfig
        );
      },
      toBeUndefined() {
        createMatcher(
          "toBeUndefined",
          () => received === void 0,
          "undefined",
          JSON.stringify(received),
          matcherConfig
        );
      },
      toEqual(expected) {
        createMatcher(
          "toEqual",
          () => isDeepEqual(received, expected),
          JSON.stringify(expected),
          JSON.stringify(received),
          matcherConfig
        );
      },
      toHaveLength(expected) {
        createMatcher(
          "toHaveLength",
          () => received.length === expected,
          expected.toString(),
          received.length.toString(),
          matcherConfig
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
            "toContain is only supported for strings, arrays, and sets"
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
                "toContain is only supported for strings, arrays, and sets"
              );
            }
          },
          expected,
          received,
          {
            ...matcherConfig,
            matcherSpecific: {
              receivedType
            }
          }
        );
      },
      toContainEqual(expected) {
        let receivedType = "";
        if (Array.isArray(received)) {
          receivedType = "array";
        } else if (received instanceof Set) {
          receivedType = "set";
        } else {
          throw new Error(
            "toContainEqual is only supported for arrays and sets"
          );
        }
        createMatcher(
          "toContainEqual",
          () => {
            if (Array.isArray(received)) {
              return received.some((item) => isDeepEqual(item, expected));
            } else if (received instanceof Set) {
              return Array.from(received).some(
                (item) => isDeepEqual(item, expected)
              );
            } else {
              throw new Error(
                "toContainEqual is only supported for arrays and sets"
              );
            }
          },
          expected,
          received,
          {
            ...matcherConfig,
            matcherSpecific: {
              receivedType
            }
          }
        );
      },
      toHaveProperty(keyPath, expected) {
        if (typeof received !== "object" || received === null) {
          throw new Error(
            "toHaveProperty is only supported for objects"
          );
        }
        const hasProperty = () => {
          try {
            const value = getPropertyByPath(
              received,
              keyPath
            );
            return expected !== void 0 ? isDeepEqual(value, expected) : true;
          } catch (_) {
            return false;
          }
        };
        createMatcher(
          "toHaveProperty",
          hasProperty,
          expected !== void 0 ? expected : keyPath,
          received,
          {
            ...matcherConfig,
            matcherSpecific: {
              keyPath,
              hasExpectedValue: expected !== void 0
            }
          }
        );
      }
    };
    return expectation;
  }
  function createMatcher(matcherName, checkFn, expected, received, {
    usedAssert,
    isSoft,
    isNegated = false,
    matcherSpecific = {},
    message,
    softMode
  }) {
    const info = createMatcherInfo(
      matcherName,
      expected,
      received,
      { ...matcherSpecific, isNegated },
      message
    );
    const result = checkFn();
    const finalResult = isNegated ? !result : result;
    usedAssert(
      finalResult,
      MatcherErrorRendererRegistry.getRenderer(matcherName).render(
        info,
        MatcherErrorRendererRegistry.getConfig()
      ),
      isSoft,
      softMode
    );
  }
  function createMatcherInfo(matcherName, expected, received, matcherSpecific = {}, customMessage) {
    const stacktrace = parseStackTrace(new Error().stack);
    const executionContext = captureExecutionContext(stacktrace);
    if (!executionContext) {
      throw new Error("k6 failed to capture execution context");
    }
    return {
      executionContext,
      matcherName,
      expected: typeof expected === "string" ? expected : JSON.stringify(expected),
      received: JSON.stringify(received),
      matcherSpecific,
      customMessage
    };
  }
  var ToBeCloseToErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toBeCloseTo";
    }
    getSpecificLines(info, maybeColorize) {
      const matcherInfo = info.matcherSpecific;
      return [
        {
          label: "Expected precision",
          value: maybeColorize(matcherInfo.precision.toString(), "green"),
          group: 3
        },
        {
          label: "Expected difference",
          value: "< " + maybeColorize(`${matcherInfo.expectedDifference}`, "green"),
          group: 3
        },
        {
          label: "Received difference",
          value: maybeColorize(matcherInfo.difference.toString(), "red"),
          group: 3
        }
      ];
    }
    renderMatcherArgs(maybeColorize) {
      return maybeColorize(`(`, "darkGrey") + maybeColorize(`expected`, "green") + maybeColorize(`, `, "darkGrey") + maybeColorize(`precision`, "white") + maybeColorize(`)`, "darkGrey");
    }
  };
  var ToBeDefinedErrorRenderer = class extends ReceivedOnlyMatcherRenderer {
    getMatcherName() {
      return "toBeDefined";
    }
  };
  var ToBeFalsyErrorRenderer = class extends ReceivedOnlyMatcherRenderer {
    getMatcherName() {
      return "toBeFalsy";
    }
  };
  var ToBeGreaterThanErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toBeGreaterThan";
    }
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Expected",
          value: "> " + maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToBeGreaterThanOrEqualErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toBeGreaterThanOrEqual";
    }
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Expected",
          value: ">= " + maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToBeInstanceOfErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toBeInstanceOf";
    }
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Expected constructor",
          value: maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received constructor",
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToBeLessThanErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toBeLessThan";
    }
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Expected",
          value: "< " + maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToBeLessThanOrEqualErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toBeLessThanOrEqual";
    }
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Expected",
          value: "<= " + maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToBeNaNErrorRenderer = class extends ReceivedOnlyMatcherRenderer {
    getMatcherName() {
      return "toBeNaN";
    }
  };
  var ToBeNullErrorRenderer = class extends ReceivedOnlyMatcherRenderer {
    getMatcherName() {
      return "toBeNull";
    }
  };
  var ToBeTruthyErrorRenderer = class extends ReceivedOnlyMatcherRenderer {
    getMatcherName() {
      return "toBeTruthy";
    }
  };
  var ToBeUndefinedErrorRenderer = class extends ReceivedOnlyMatcherRenderer {
    getMatcherName() {
      return "toBeUndefined";
    }
  };
  var ToEqualErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toEqual";
    }
    getSpecificLines(info, maybeColorize) {
      return [
        {
          label: "Expected",
          value: maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToHaveLengthErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toHaveLength";
    }
    getSpecificLines(info, maybeColorize) {
      var _a;
      return [
        {
          label: "Expected length",
          value: maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received length",
          value: maybeColorize(info.received, "red"),
          group: 3
        },
        {
          label: "Received array",
          value: maybeColorize(
            (_a = info.matcherSpecific) == null ? void 0 : _a.receivedArray,
            "red"
          ),
          group: 3
        }
      ];
    }
  };
  var ToContainErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toContain";
    }
    getSpecificLines(info, maybeColorize) {
      var _a, _b, _c;
      const isNegated = (_a = info.matcherSpecific) == null ? void 0 : _a.isNegated;
      const receivedType = typeof ((_b = info.matcherSpecific) == null ? void 0 : _b.receivedType) === "string" ? (_c = info.matcherSpecific) == null ? void 0 : _c.receivedType : Array.isArray(JSON.parse(info.received)) ? "array" : "string";
      return [
        {
          label: isNegated ? "Expected not to contain" : "Expected to contain",
          value: maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: `Received ${receivedType}`,
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToContainEqualErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toContainEqual";
    }
    getSpecificLines(info, maybeColorize) {
      var _a, _b;
      const isNegated = (_a = info.matcherSpecific) == null ? void 0 : _a.isNegated;
      const receivedType = (_b = info.matcherSpecific) == null ? void 0 : _b.receivedType;
      return [
        {
          label: isNegated ? "Expected not to contain equal" : "Expected to contain equal",
          value: maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: `Received ${receivedType}`,
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      ];
    }
  };
  var ToHavePropertyErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toHaveProperty";
    }
    getSpecificLines(info, maybeColorize) {
      var _a, _b, _c;
      const isNegated = (_a = info.matcherSpecific) == null ? void 0 : _a.isNegated;
      const keyPath = (_b = info.matcherSpecific) == null ? void 0 : _b.keyPath;
      const hasExpectedValue = (_c = info.matcherSpecific) == null ? void 0 : _c.hasExpectedValue;
      const lines = [
        {
          label: "Property path",
          value: maybeColorize(keyPath, "white"),
          group: 3
        }
      ];
      if (hasExpectedValue) {
        lines.push(
          {
            label: isNegated ? "Expected property not to equal" : "Expected property to equal",
            value: maybeColorize(info.expected, "green"),
            group: 3
          }
        );
      } else {
        lines.push(
          {
            label: isNegated ? "Expected property not to exist" : "Expected property to exist",
            value: "",
            group: 3
          }
        );
      }
      lines.push(
        {
          label: "Received object",
          value: maybeColorize(info.received, "red"),
          group: 3
        }
      );
      return lines;
    }
    renderMatcherArgs(maybeColorize) {
      return maybeColorize(`(`, "darkGrey") + maybeColorize(`keyPath`, "white") + maybeColorize(`, `, "darkGrey") + maybeColorize(`expected?`, "green") + maybeColorize(`)`, "darkGrey");
    }
  };
  function isDeepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== "object" || typeof b !== "object") return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => {
      return keysB.includes(key) && isDeepEqual(
        a[key],
        b[key]
      );
    });
  }
  function getPropertyByPath(obj, path) {
    if (path === "") {
      throw new Error("Invalid path: empty string");
    }
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
    if (currentSegment) {
      segments.push(currentSegment);
    }
    let current = obj;
    for (const segment of segments) {
      if (current === null || current === void 0) {
        throw new Error(`Property ${path} does not exist`);
      }
      if (typeof segment === "string" && !isNaN(Number(segment))) {
        const index = Number(segment);
        if (!Array.isArray(current)) {
          throw new Error(`Cannot access index ${segment} of non-array`);
        }
        if (index >= current.length) {
          throw new Error(`Index ${segment} out of bounds`);
        }
        current = current[index];
      } else {
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

  // utils/string.ts
  function normalizeWhiteSpace(value) {
    return value.replace(/[\u200B\u00AD]/g, "").replace(/\s+/g, " ").trim();
  }

  // expectRetrying.ts
  function createExpectation2(locator, config, message, isNegated = false) {
    var _a, _b;
    const usedAssert = (_a = config.assertFn) != null ? _a : assert;
    const isSoft = (_b = config.soft) != null ? _b : false;
    const retryConfig = {
      timeout: config.timeout,
      interval: config.interval
    };
    MatcherErrorRendererRegistry.configure({
      colorize: config.colorize,
      display: config.display
    });
    MatcherErrorRendererRegistry.register(
      "toBeChecked",
      new ToBeCheckedErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeDisabled",
      new ToBeDisabledErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeEditable",
      new ToBeEditableErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeEnabled",
      new ToBeEnabledErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeHidden",
      new ToBeHiddenErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toBeVisible",
      new ToBeVisibleErrorRenderer()
    );
    MatcherErrorRendererRegistry.register(
      "toHaveValue",
      new ToHaveValueErrorRenderer()
    );
    const matcherConfig = {
      locator,
      retryConfig,
      usedAssert,
      isSoft,
      isNegated,
      message,
      softMode: config.softMode
    };
    const matchText = async (matcherName, expected, options = {}, compareFn) => {
      const stacktrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stacktrace);
      if (!executionContext) {
        throw new Error("k6 failed to capture execution context");
      }
      const checkRegExp = (expected2, actual) => {
        const regexp = options.ignoreCase !== void 0 ? new RegExp(
          expected2.source,
          expected2.flags.replace("i", "") + (options.ignoreCase ? "i" : "")
        ) : expected2;
        const info = {
          executionContext,
          matcherName,
          expected: regexp.toString(),
          received: actual,
          matcherSpecific: { isNegated },
          customMessage: message
        };
        const result = regexp.test(actual);
        usedAssert(
          isNegated ? !result : result,
          MatcherErrorRendererRegistry.getRenderer(matcherName).render(
            info,
            MatcherErrorRendererRegistry.getConfig()
          ),
          isSoft,
          config.softMode
        );
      };
      const checkText = (expected2, actual) => {
        const normalizedExpected = normalizeWhiteSpace(expected2);
        const normalizedActual = normalizeWhiteSpace(actual);
        const info = {
          executionContext,
          matcherName,
          expected: normalizedExpected,
          received: normalizedActual,
          matcherSpecific: { isNegated },
          customMessage: message
        };
        const result = options.ignoreCase ? compareFn(
          normalizedActual.toLowerCase(),
          normalizedExpected.toLowerCase()
        ) : compareFn(normalizedActual, normalizedExpected);
        usedAssert(
          isNegated ? !result : result,
          MatcherErrorRendererRegistry.getRenderer(matcherName).render(
            info,
            MatcherErrorRendererRegistry.getConfig()
          ),
          isSoft,
          config.softMode
        );
      };
      try {
        await withRetry(
          async () => {
            const actualText = options.useInnerText ? await locator.innerText() : await locator.textContent();
            if (actualText === null) {
              throw new Error("Element has no text content");
            }
            if (expected instanceof RegExp) {
              checkRegExp(expected, actualText);
              return;
            }
            checkText(expected, actualText);
          },
          { ...retryConfig, ...options }
        );
      } catch (_) {
        const info = {
          executionContext,
          matcherName,
          expected: expected.toString(),
          received: "unknown",
          matcherSpecific: { isNegated },
          customMessage: message
        };
        usedAssert(
          false,
          MatcherErrorRendererRegistry.getRenderer("toHaveText").render(
            info,
            MatcherErrorRendererRegistry.getConfig()
          ),
          isSoft,
          config.softMode
        );
      }
    };
    const expectation = {
      get not() {
        return createExpectation2(locator, config, message, !isNegated);
      },
      async toBeChecked(options = retryConfig) {
        await createMatcher2(
          "toBeChecked",
          async () => await locator.isChecked(),
          "checked",
          "unchecked",
          { ...matcherConfig, options }
        );
      },
      async toBeDisabled(options = retryConfig) {
        await createMatcher2(
          "toBeDisabled",
          async () => await locator.isDisabled(),
          "disabled",
          "enabled",
          { ...matcherConfig, options }
        );
      },
      async toBeEditable(options = retryConfig) {
        await createMatcher2(
          "toBeEditable",
          async () => await locator.isEditable(),
          "editable",
          "uneditable",
          { ...matcherConfig, options }
        );
      },
      async toBeEnabled(options = retryConfig) {
        await createMatcher2(
          "toBeEnabled",
          async () => await locator.isEnabled(),
          "enabled",
          "disabled",
          { ...matcherConfig, options }
        );
      },
      async toBeHidden(options = retryConfig) {
        await createMatcher2(
          "toBeHidden",
          async () => await locator.isHidden(),
          "hidden",
          "visible",
          { ...matcherConfig, options }
        );
      },
      async toBeVisible(options = retryConfig) {
        await createMatcher2(
          "toBeVisible",
          async () => await locator.isVisible(),
          "visible",
          "hidden",
          { ...matcherConfig, options }
        );
      },
      toHaveText(expected, options = {}) {
        return matchText(
          "toHaveText",
          expected,
          options,
          (actual, expected2) => actual === expected2
        );
      },
      toContainText(expected, options = {}) {
        return matchText(
          "toContainText",
          expected,
          options,
          (actual, expected2) => actual.includes(expected2)
        );
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
          customMessage: message
        };
        try {
          await withRetry(async () => {
            const actualValue = await locator.inputValue();
            const result = expectedValue === actualValue;
            const finalResult = isNegated ? !result : result;
            usedAssert(
              finalResult,
              MatcherErrorRendererRegistry.getRenderer("toHaveValue").render(
                info,
                MatcherErrorRendererRegistry.getConfig()
              ),
              isSoft,
              config.softMode
            );
          }, { ...retryConfig, ...options });
        } catch (_) {
          usedAssert(
            false,
            MatcherErrorRendererRegistry.getRenderer("toHaveValue").render(
              info,
              MatcherErrorRendererRegistry.getConfig()
            ),
            isSoft,
            config.softMode
          );
        }
      }
    };
    return expectation;
  }
  function createMatcherInfo2(matcherName, expected, received, additionalInfo = {}, customMessage) {
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
      ...additionalInfo
    };
  }
  async function createMatcher2(matcherName, checkFn, expected, received, {
    locator,
    retryConfig,
    usedAssert,
    isSoft,
    isNegated = false,
    options = {},
    message,
    softMode
  }) {
    const info = createMatcherInfo2(matcherName, expected, received, {
      matcherSpecific: {
        locator,
        timeout: options.timeout,
        isNegated
      }
    }, message);
    try {
      await withRetry(async () => {
        const result = await checkFn();
        const finalResult = isNegated ? !result : result;
        if (!finalResult) {
          throw new Error("matcher failed");
        }
        usedAssert(
          finalResult,
          MatcherErrorRendererRegistry.getRenderer(matcherName).render(
            info,
            MatcherErrorRendererRegistry.getConfig()
          ),
          isSoft,
          softMode
        );
      }, { ...retryConfig, ...options });
    } catch (_) {
      usedAssert(
        false,
        MatcherErrorRendererRegistry.getRenderer(matcherName).render(
          info,
          MatcherErrorRendererRegistry.getConfig()
        ),
        isSoft,
        softMode
      );
    }
  }
  var BooleanStateErrorRenderer = class extends ReceivedOnlyMatcherRenderer {
    getMatcherName() {
      return `toBe${this.state[0].toUpperCase()}${this.state.slice(1)}`;
    }
    getReceivedPlaceholder() {
      return "locator";
    }
    getSpecificLines(info, maybeColorize) {
      var _a;
      return [
        { label: "Expected", value: this.state, group: 3 },
        { label: "Received", value: this.oppositeState, group: 3 },
        { label: "Call log", value: "", group: 3 },
        {
          label: "",
          value: maybeColorize(
            `  - expect.toBe${this.state[0].toUpperCase()}${this.state.slice(1)} with timeout ${(_a = info.matcherSpecific) == null ? void 0 : _a.timeout}ms`,
            "darkGrey"
          ),
          group: 3,
          raw: true
        },
        {
          label: "",
          value: maybeColorize(`  - waiting for locator`, "darkGrey"),
          group: 3,
          raw: true
        }
      ];
    }
  };
  var ToBeCheckedErrorRenderer = class extends BooleanStateErrorRenderer {
    constructor() {
      super(...arguments);
      __publicField(this, "state", "checked");
      __publicField(this, "oppositeState", "unchecked");
    }
  };
  var ToBeDisabledErrorRenderer = class extends BooleanStateErrorRenderer {
    constructor() {
      super(...arguments);
      __publicField(this, "state", "disabled");
      __publicField(this, "oppositeState", "enabled");
    }
  };
  var ToBeEditableErrorRenderer = class extends BooleanStateErrorRenderer {
    constructor() {
      super(...arguments);
      __publicField(this, "state", "editable");
      __publicField(this, "oppositeState", "uneditable");
    }
  };
  var ToBeEnabledErrorRenderer = class extends BooleanStateErrorRenderer {
    constructor() {
      super(...arguments);
      __publicField(this, "state", "enabled");
      __publicField(this, "oppositeState", "disabled");
    }
  };
  var ToBeHiddenErrorRenderer = class extends BooleanStateErrorRenderer {
    constructor() {
      super(...arguments);
      __publicField(this, "state", "hidden");
      __publicField(this, "oppositeState", "visible");
    }
  };
  var ToBeVisibleErrorRenderer = class extends BooleanStateErrorRenderer {
    constructor() {
      super(...arguments);
      __publicField(this, "state", "visible");
      __publicField(this, "oppositeState", "hidden");
    }
  };
  var ToHaveValueErrorRenderer = class extends ExpectedReceivedMatcherRenderer {
    getMatcherName() {
      return "toHaveValue";
    }
    getSpecificLines(info, maybeColorize) {
      var _a;
      return [
        // FIXME (@oleiade): When k6/#4210 is fixed, we can use the locator here.
        // { label: "Locator", value: maybeColorize(`locator('${info.matcherSpecific?.locator}')`, "white"), group: 3 },
        {
          label: "Expected",
          value: maybeColorize(info.expected, "green"),
          group: 3
        },
        {
          label: "Received",
          value: maybeColorize(info.received, "red"),
          group: 3
        },
        { label: "Call log", value: "", group: 3 },
        {
          label: "",
          value: maybeColorize(
            `  - expect.toHaveValue with timeout ${(_a = info.matcherSpecific) == null ? void 0 : _a.timeout}ms`,
            "darkGrey"
          ),
          group: 3,
          raw: true
        },
        // FIXME (@oleiade): When k6/#4210 is fixed, we can use the locator's selector here.
        {
          label: "",
          value: maybeColorize(`  - waiting for locator`, "darkGrey"),
          group: 3,
          raw: true
        }
      ];
    }
  };
  async function withRetry(assertion, options = {}) {
    var _a, _b, _c, _d;
    const timeout = (_a = options.timeout) != null ? _a : DEFAULT_RETRY_OPTIONS.timeout;
    const interval = (_b = options.interval) != null ? _b : DEFAULT_RETRY_OPTIONS.interval;
    const getNow = (_c = options._now) != null ? _c : () => Date.now();
    const sleep = (_d = options._sleep) != null ? _d : (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const startTime = getNow();
    while (getNow() - startTime < timeout) {
      try {
        await assertion();
        return true;
      } catch (_error) {
      }
      await sleep(interval);
    }
    throw new RetryTimeoutError(
      `Expect condition not met within ${timeout}ms timeout`
    );
  }
  var RetryTimeoutError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "RetryTimeoutError";
    }
  };

  // expect.ts
  var expect = makeExpect();
  function makeExpect(baseConfig) {
    const config = ConfigLoader.load(baseConfig);
    return Object.assign(
      function(value, message) {
        if (isLocator(value)) {
          return createExpectation2(
            value,
            config,
            message
          );
        } else {
          return createExpectation(
            value,
            config,
            message
          );
        }
      },
      {
        soft(value, message) {
          if (isLocator(value)) {
            return createExpectation2(
              value,
              { ...config, soft: true },
              message
            );
          } else {
            return createExpectation(
              value,
              { ...config, soft: true },
              message
            );
          }
        },
        configure(newConfig) {
          return makeExpect(newConfig);
        },
        get config() {
          return { ...config };
        }
      }
    );
  }
  function isLocator(value) {
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
      "tap"
    ];
    const hasLocatorProperties = (value2) => {
      return locatorProperties.every((prop) => prop in value2);
    };
    return value !== null && value !== void 0 && typeof value === "object" && hasLocatorProperties(value);
  }
  return __toCommonJS(mod_exports);
})();

    // Make expect available globally for k6
    if (typeof globalThis !== 'undefined') {
      globalThis.expect = k6Testing.expect;
    }
    // Return for module loading compatibility
    k6Testing;
    
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbW9kLnRzIiwgIi4uL2Fzc2VydC50cyIsICIuLi9lbnZpcm9ubWVudC50cyIsICIuLi9jb25maWcudHMiLCAiLi4vZXhlY3V0aW9uLnRzIiwgIi4uL3N0YWNrdHJhY2UudHMiLCAiLi4vY29sb3JzLnRzIiwgIi4uL3JlbmRlci50cyIsICIuLi9leHBlY3ROb25SZXRyeWluZy50cyIsICIuLi91dGlscy9zdHJpbmcudHMiLCAiLi4vZXhwZWN0UmV0cnlpbmcudHMiLCAiLi4vZXhwZWN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgeyBleHBlY3QgfSBmcm9tIFwiLi9leHBlY3QudHNcIjtcbmV4cG9ydCB7IGNvbG9yaXplIH0gZnJvbSBcIi4vY29sb3JzLnRzXCI7XG4iLCAiLy8gTk9URSAoQG9sZWlhZGUpOiBUaGlzIGlzIGEgc2hpbSBmb3IgdGhlIGs2L2V4ZWN1dGlvbiBtb2R1bGUsIG1lYW5pbmcgdGhhdFxuLy8gaW1wb3J0cyBvZiBrNi1leGVjdXRpb24tc2hpbSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggazYvZXhlY3V0aW9uIGluIHRoZVxuLy8gb3V0cHV0IGJ1bmRsZSBmaWxlLlxuLy9cbi8vIFRoaXMgYWxsb3dzIHVzIHRvIGF2b2lkIHJlbHlpbmcgb24gdGhlIGs2L2V4ZWN1dGlvbiBtb2R1bGUgaW4gdGhlIERlbm8gcnVudGltZSxcbi8vIHdoaWNoIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIGs2IHJ1bnRpbWUuIEluc3RlYWQgcmVwbGFjaW5nIGl0IHdpdGggYSBtb2NrXG4vLyBpbXBsZW1lbnRhdGlvbiB0aGF0IGRvZXMgbm90IGFib3J0IHRoZSB0ZXN0LiBXaGlsZSBtYWtpbmcgc3VyZSB0aGF0IHdlIGRvIHJlcGxhY2Vcbi8vIGl0IHdpdGggdGhlIHJlYWwgazYvZXhlY3V0aW9uIG1vZHVsZSB3aGVuIGJ1bmRsaW5nIGZvciB0aGUgazYgcnVudGltZS5cbi8vXG4vLyBJdCBhbGxvd3MgdXMgdG8gdXNlIHRoZSBgZGVubyB0ZXN0YCBjb21tYW5kIGFuZCB1bml0IHRlc3RzIGluIHRoZSBEZW5vIHJ1bnRpbWUuIFdoaWxlXG4vLyBzdGlsbCBiZWluZyBhYmxlIHRvIHVzZSB0aGUgYGs2IHJ1bmAgY29tbWFuZCBhbmQgdGVzdHMgaW4gdGhlIGs2IHJ1bnRpbWUuXG5pbXBvcnQgZXhlYyBmcm9tIFwiazYtZXhlY3V0aW9uLXNoaW1cIjtcblxuLyoqXG4gKiBTb2Z0TW9kZSBkZWZpbmVzIGhvdyBzb2Z0IGFzc2VydGlvbnMgc2hvdWxkIGJlIGhhbmRsZWQgd2hlbiB0aGV5IGZhaWwuXG4gKlxuICogLSAndGhyb3cnOiBUaGUgYXNzZXJ0aW9uIHdpbGwgdGhyb3cgYW4gQXNzZXJ0aW9uRmFpbGVkRXJyb3IsIHdoaWNoIHdpbGwgZmFpbCB0aGUgaXRlcmF0aW9uIGJ1dCBjb250aW51ZSB0aGUgdGVzdC5cbiAqIC0gJ2ZhaWwnOiBUaGUgYXNzZXJ0aW9uIHdpbGwgbWFyayB0aGUgdGVzdCBhcyBmYWlsZWQgdXNpbmcgZXhlYy50ZXN0LmZhaWwsIGJ1dCB3aWxsIGNvbnRpbnVlIGV4ZWN1dGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgU29mdE1vZGUgPSBcInRocm93XCIgfCBcImZhaWxcIjtcblxuLyoqXG4gKiBhc3NlcnQgaXMgYSBmdW5jdGlvbiB0aGF0IGNoZWNrcyBhIGNvbmRpdGlvbiBhbmQgZmFpbHMgdGhlIHRlc3QgaWYgdGhlIGNvbmRpdGlvbiBpcyBmYWxzZS5cbiAqXG4gKiBBcyBhIGRlZmF1bHQsIGEgZmFpbGluZyBhc3NlcnRpb24gd2lsbCBpbW1lZGlhdGVseSBhYm9ydCB0aGUgd2hvbGUgdGVzdCwgZXhpdCB3aXRoIGNvZGUgMTA4LCBhbmRcbiAqIGRpc3BsYXkgYW4gZXJyb3IgbWVzc2FnZS4gSWYgeW91IHdhbnQgdG8gY29udGludWUgdGhlIHRlc3QgYWZ0ZXIgYSBmYWlsaW5nIGFzc2VydGlvbiwgeW91IGNhbiBwYXNzXG4gKiBgdHJ1ZWAgYXMgdGhlIHRoaXJkIGFyZ3VtZW50IHRvIGBhc3NlcnRgLlxuICpcbiAqIEBwYXJhbSBjb25kaXRpb24gY29uZGl0aW9uIHRvIGFzc2VydCB0aGUgdHJ1dGh5bmVzcyBvZlxuICogQHBhcmFtIG1lc3NhZ2UgdGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGUgY29uZGl0aW9uIGlzIGZhbHNlXG4gKiBAcGFyYW0gc29mdCBpZiB0cnVlLCB0aGUgYXNzZXJ0aW9uIHdpbGwgbWFyayB0aGUgdGVzdCBhcyBmYWlsZWQgd2l0aG91dCBpbnRlcnJ1cHRpbmcgdGhlIGV4ZWN1dGlvblxuICogQHBhcmFtIHNvZnRNb2RlIGRlZmluZXMgaG93IHNvZnQgYXNzZXJ0aW9ucyBzaG91bGQgYmUgaGFuZGxlZCB3aGVuIHRoZXkgZmFpbCAoZGVmYXVsdHMgdG8gJ3Rocm93JylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChcbiAgY29uZGl0aW9uOiBib29sZWFuLFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHNvZnQ/OiBib29sZWFuLFxuICBzb2Z0TW9kZTogU29mdE1vZGUgPSBcInRocm93XCIsXG4pIHtcbiAgaWYgKGNvbmRpdGlvbikgcmV0dXJuO1xuXG4gIGlmIChzb2Z0KSB7XG4gICAgaWYgKHNvZnRNb2RlID09PSBcImZhaWxcIikge1xuICAgICAgLy8gTWFyayB0aGUgdGVzdCBhcyBmYWlsZWQgYnV0IGNvbnRpbnVlIGV4ZWN1dGlvblxuICAgICAgZXhlYy50ZXN0LmZhaWwobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZmF1bHQgYmVoYXZpb3I6IHRocm93IGFuIGVycm9yIHRvIGZhaWwgdGhlIGN1cnJlbnQgaXRlcmF0aW9uXG4gICAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRmFpbGVkRXJyb3IobWVzc2FnZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFRoaXMgd2lsbCB0aGUgazYtZXhlY3V0aW9uLXNoaW0gbW9kdWxlJ3MgYWJvcnQgbWV0aG9kIGluIHRoZSBEZW5vIHJ1bnRpbWUuXG4gICAgLy8gSXQgd2lsbCBpbnN0ZWFkIGJlIHJlcGxhY2VkIHdpdGggdGhlIGs2L2V4ZWN1dGlvbiBtb2R1bGUncyBhYm9ydCBtZXRob2RcbiAgICAvLyBpbiB0aGUgb3V0cHV0IGJ1bmRsZSBmaWxlIHByb2R1Y2VkIGJ5IGVzYnVpbGQgc3BlY2lmaWNhbGx5IGZvciB0aGUgazYgcnVudGltZS5cbiAgICBleGVjLnRlc3QuYWJvcnQobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIGluZGljYXRlcyB0aGF0IGFuIGFzc2VydGlvbiBmYWlsZWQuXG4gKlxuICogSXQgaXMgdXNlZCB0byBleHByZXNzIGEgc29mdCBhc3NlcnRpb24ncyBmYWlsdXJlLCBhcyB0aHJvd2luZyB3aWxsIG5vdCBhYm9ydCB0aGVcbiAqIHRlc3QsIGFuZCB3aWxsIGluc3RlYWQgZmFpbCB0aGUgaXRlcmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQXNzZXJ0aW9uRmFpbGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiQXNzZXJ0aW9uRmFpbGVkRXJyb3JcIjtcbiAgfVxufVxuIiwgIi8vIEluIHRoZSBrNiBydW50aW1lLCB0aGUgX19FTlYgb2JqZWN0IGlzIGF2YWlsYWJsZSBhbmQgY29udGFpbnMgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmV4cG9ydCBkZWNsYXJlIGNvbnN0IF9fRU5WOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+O1xuXG4vKipcbiAqIEVudmlyb25tZW50IGludGVyZmFjZSB0aGF0IG1hdGNoZXMgdGhlIHNoYXBlIG9mIGs2J3MgX19FTlYgb2JqZWN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVudmlyb25tZW50IHtcbiAgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRFbnZpcm9ubWVudCgpOiBFbnZpcm9ubWVudCB7XG4gIC8vIFdoZW4gcnVubmluZyBpbiBEZW5vXG4gIGlmICh0eXBlb2YgRGVubyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiBEZW5vLmVudi50b09iamVjdCgpO1xuICB9XG5cbiAgLy8gV2hlbiBydW5uaW5nIGluIGs2XG4gIHJldHVybiBfX0VOVjtcbn1cblxuLy8gRXhwb3J0IGEgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBlbnZpcm9ubWVudCBvYmplY3RcbmV4cG9ydCBjb25zdCBlbnY6IEVudmlyb25tZW50ID0gZ2V0RW52aXJvbm1lbnQoKTtcblxuLyoqXG4gKiBFbnZpcm9ubWVudCB2YXJpYWJsZSBwYXJzZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGVudlBhcnNlciA9IHtcbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHNldFxuICAgKi9cbiAgaGFzVmFsdWUoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZW52W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgfSxcblxuICAvKipcbiAgICogUGFyc2UgYSBib29sZWFuIGVudmlyb25tZW50IHZhcmlhYmxlXG4gICAqIFwiZmFsc2VcIiAoY2FzZSBpbnNlbnNpdGl2ZSkgLT4gZmFsc2VcbiAgICogYW55dGhpbmcgZWxzZSAtPiB0cnVlXG4gICAqIEB0aHJvd3MgaWYgdmFsdWUgaXMgdW5kZWZpbmVkXG4gICAqL1xuICBib29sZWFuKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWUgPSBlbnZba2V5XT8udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnZpcm9ubWVudCB2YXJpYWJsZSAke2tleX0gaXMgbm90IHNldGApO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgIT09IFwiZmFsc2VcIjtcbiAgfSxcblxuICAvKipcbiAgICogUGFyc2UgYW4gZW52aXJvbm1lbnQgdmFyaWFibGUgdGhhdCBzaG91bGQgbWF0Y2ggc3BlY2lmaWMgdmFsdWVzXG4gICAqIEB0aHJvd3MgaWYgdmFsdWUgaXMgdW5kZWZpbmVkIG9yIGRvZXNuJ3QgbWF0Y2ggYWxsb3dlZCB2YWx1ZXNcbiAgICovXG4gIGVudW08VCBleHRlbmRzIHN0cmluZz4oa2V5OiBzdHJpbmcsIGFsbG93ZWRWYWx1ZXM6IFRbXSk6IFQge1xuICAgIGNvbnN0IHZhbHVlID0gZW52W2tleV0/LnRvTG93ZXJDYXNlKCkgYXMgVDtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnZpcm9ubWVudCB2YXJpYWJsZSAke2tleX0gaXMgbm90IHNldGApO1xuICAgIH1cbiAgICBpZiAoIWFsbG93ZWRWYWx1ZXMuaW5jbHVkZXModmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHZhbHVlIGZvciAke2tleX0uIE11c3QgYmUgb25lIG9mOiAke2FsbG93ZWRWYWx1ZXMuam9pbihcIiwgXCIpfWAsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbiBlbnZpcm9ubWVudCB2YXJpYWJsZSBhcyBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZVxuICAgKiBAdGhyb3dzIEVycm9yIGlmIHRoZSB2YWx1ZSBpcyBub3QgYSB2YWxpZCBub24tbmVnYXRpdmUgbnVtYmVyXG4gICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgbnVtYmVyIHZhbHVlXG4gICAqL1xuICBudW1iZXIobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCB2YWx1ZSA9IGVudltuYW1lXTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVudmlyb25tZW50IHZhcmlhYmxlICR7bmFtZX0gaXMgbm90IHNldGApO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKE51bWJlci5pc05hTihwYXJzZWQpIHx8ICFOdW1iZXIuaXNGaW5pdGUocGFyc2VkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRW52aXJvbm1lbnQgdmFyaWFibGUgJHtuYW1lfSBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyLCBnb3Q6ICR7dmFsdWV9YCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlZCA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEVudmlyb25tZW50IHZhcmlhYmxlICR7bmFtZX0gbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIsIGdvdDogJHt2YWx1ZX1gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VkO1xuICB9LFxufTtcbiIsICJpbXBvcnQgeyBhc3NlcnQsIHR5cGUgU29mdE1vZGUgfSBmcm9tIFwiLi9hc3NlcnQudHNcIjtcbmltcG9ydCB7IGVudlBhcnNlciB9IGZyb20gXCIuL2Vudmlyb25tZW50LnRzXCI7XG5cbi8qKlxuICogT3B0aW9ucyB0aGF0IGNhbiBiZSBzZXQgZm9yIHRoZSBleHBlY3QgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwZWN0Q29uZmlnIGV4dGVuZHMgUmVuZGVyQ29uZmlnLCBSZXRyeUNvbmZpZyB7XG4gIC8qKlxuICAgKiBTZXR0aW5nIHRoaXMgb3B0aW9uIHRvIHRydWUgd2lsbCBtYWtlIHRoZSBhc3NlcnRpb25zIHBlcmZvcm1lZCBieSBleHBlY3RcbiAgICogdG8gYmUgYWx3YXlzIHNvZnQsIG1lYW5pbmcgdGhhdCB0aGV5IHdpbGwgbm90IGZhaWwgdGhlIHRlc3QgaWYgdGhlIGFzc2VydGlvblxuICAgKiBpcyBub3QgbWV0LlxuICAgKi9cbiAgc29mdDogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ29udHJvbHMgaG93IHNvZnQgYXNzZXJ0aW9ucyBiZWhhdmUgd2hlbiB0aGV5IGZhaWwuXG4gICAqXG4gICAqIC0gJ3Rocm93JzogVGhlIGFzc2VydGlvbiB3aWxsIHRocm93IGFuIEFzc2VydGlvbkZhaWxlZEVycm9yIHdoaWNoIHdpbGwgZmFpbCB0aGUgaXRlcmF0aW9uIGJ1dCBjb250aW51ZSB0aGUgdGVzdC5cbiAgICogLSAnZmFpbCc6IFRoZSBhc3NlcnRpb24gd2lsbCBtYXJrIHRoZSB0ZXN0IGFzIGZhaWxlZCB1c2luZyBleGVjLnRlc3QuZmFpbCBidXQgd2lsbCBjb250aW51ZSBleGVjdXRpb24uXG4gICAqXG4gICAqIEBkZWZhdWx0ICd0aHJvdydcbiAgICovXG4gIHNvZnRNb2RlOiBTb2Z0TW9kZTtcblxuICAvKipcbiAgICogT3B0aW9uYWwgY3VzdG9tIGFzc2VydGlvbiBmdW5jdGlvbiB0byBiZSB1c2VkIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgYXNzZXJ0IGZ1bmN0aW9uLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBoYXZlIHRoZSBzYW1lIHNpZ25hdHVyZSBhcyB0aGUgYXNzZXJ0IGZ1bmN0aW9uLlxuICAgKi9cbiAgYXNzZXJ0Rm4/OiAoLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaW1wb3J0KFwiLi9hc3NlcnQudHNcIikuYXNzZXJ0PikgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHJldHJ5IGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJldHJ5Q29uZmlnIHtcbiAgLyoqXG4gICAqIE1heGltdW0gYW1vdW50IG9mIHRpbWUgdG8gcmV0cnkgaW4gbWlsbGlzZWNvbmRzLlxuICAgKiBAZGVmYXVsdCA1MDAwXG4gICAqL1xuICB0aW1lb3V0PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaW1lIGJldHdlZW4gcmV0cmllcyBpbiBtaWxsaXNlY29uZHMuXG4gICAqIEBkZWZhdWx0IDEwMFxuICAgKi9cbiAgaW50ZXJ2YWw/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JFVFJZX09QVElPTlM6IFJlcXVpcmVkPFJldHJ5Q29uZmlnPiA9IHtcbiAgLy8gNSBzZWNvbmRzIGRlZmF1bHQgdGltZW91dFxuICB0aW1lb3V0OiA1MDAwLFxuICAvLyAxMDBtcyBiZXR3ZWVuIHJldHJpZXNcbiAgaW50ZXJ2YWw6IDEwMCxcbn07XG5cbi8qKlxuICogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSByZW5kZXJlci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJDb25maWcge1xuICAvKipcbiAgICogU2V0dGluZyB0aGlzIG9wdGlvbiB0byBmYWxzZSB3aWxsIGRpc2FibGUgdGhlIGNvbG9yaXphdGlvbiBvZiB0aGUgb3V0cHV0IG9mIHRoZVxuICAgKiBleHBlY3QgZnVuY3Rpb24uIFRoZSBkZWZhdWx0IGlzIHRydWUuXG4gICAqL1xuICBjb2xvcml6ZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogRXhwZWN0YXRpb25zIGNhbiBiZSBkaXNwbGF5ZWQgaW4gdHdvIGRpZmZlcmVudCB3YXlzOiBpbmxpbmUgb3IgcHJldHR5LlxuICAgKiBUaGUgZGVmYXVsdCBpcyBwcmV0dHkuXG4gICAqXG4gICAqIFdoZW4gZGlzcGxheWVkIGlubGluZSwgdGhlIGV4cGVjdGF0aW9uIHdpbGwgYmUgZGlzcGxheWVkIGluIGEgc2luZ2xlIGxpbmUsIHRvXG4gICAqIG1ha2UgaXQgZWFzaWVyIHRvIGludGVycHJldCB0aGUgb3V0cHV0IHdoZW4gd3JpdHRlbiB0byBsb2dzLlxuICAgKlxuICAgKiBXaGVuIGRpc3BsYXllZCBwcmV0dHksIHRoZSBleHBlY3RhdGlvbiB3aWxsIGJlIGRpc3BsYXllZCBpbiBhIG1vcmUgaHVtYW4tcmVhZGFibGVcbiAgICogZm9ybWF0LCB3aXRoIGVhY2ggcGFydCBvZiB0aGUgZXhwZWN0YXRpb24gaW4gYSBzZXBhcmF0ZSBsaW5lLlxuICAgKi9cbiAgZGlzcGxheTogRGlzcGxheUZvcm1hdDtcbn1cblxuLyoqXG4gKiBUaGUgZGlzcGxheSBmb3JtYXQgdG8gdXNlLlxuICpcbiAqIFwicHJldHR5XCIgaXMgdGhlIGRlZmF1bHQgZm9ybWF0IGFuZCBvdXRwdXRzIGluIGEgaHVtYW4gcmVhZGFibGUgZm9ybWF0IHdpdGggYWxpZ25lZCBjb2x1bW5zLlxuICogXCJpbmxpbmVcIiBpcyBhIGxvZ2ZtdCBzdHlsZSBmb3JtYXQgdGhhdCBvdXRwdXRzIGluIGEgc2luZ2xlIGxpbmUuXG4gKi9cbmV4cG9ydCB0eXBlIERpc3BsYXlGb3JtYXQgPSBcImlubGluZVwiIHwgXCJwcmV0dHlcIjtcblxuLyoqXG4gKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb24gdmFsdWVzLCB3aXRob3V0IGFueSBlbnZpcm9ubWVudCBvdmVycmlkZXNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09ORklHOiBFeHBlY3RDb25maWcgPSB7XG4gIC4uLkRFRkFVTFRfUkVUUllfT1BUSU9OUyxcbiAgc29mdDogZmFsc2UsXG4gIHNvZnRNb2RlOiBcInRocm93XCIsXG4gIGNvbG9yaXplOiB0cnVlLFxuICBkaXNwbGF5OiBcInByZXR0eVwiLFxuICBhc3NlcnRGbjogYXNzZXJ0LFxufTtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGxvYWRlciB0aGF0IGhhbmRsZXMgZGlmZmVyZW50IHNvdXJjZXMgb2YgY29uZmlndXJhdGlvblxuICogd2l0aCBjbGVhciBwcmVjZWRlbmNlIHJ1bGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25maWdMb2FkZXIge1xuICAvKipcbiAgICogTG9hZHMgY29uZmlndXJhdGlvbiB3aXRoIHRoZSBmb2xsb3dpbmcgcHJlY2VkZW5jZSAoaGlnaGVzdCB0byBsb3dlc3QpOlxuICAgKiAxLiBFbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICogMi4gRXhwbGljaXQgY29uZmlndXJhdGlvbiBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uXG4gICAqIDMuIERlZmF1bHQgdmFsdWVzXG4gICAqL1xuICBzdGF0aWMgbG9hZChleHBsaWNpdENvbmZpZzogUGFydGlhbDxFeHBlY3RDb25maWc+ID0ge30pOiBFeHBlY3RDb25maWcge1xuICAgIGNvbnN0IGVudkNvbmZpZyA9IENvbmZpZ0xvYWRlci5sb2FkRnJvbUVudigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLkRFRkFVTFRfQ09ORklHLFxuICAgICAgLi4uZXhwbGljaXRDb25maWcsXG4gICAgICAuLi5lbnZDb25maWcsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyBjb25maWd1cmF0aW9uIGZyb20gZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAqIFJldHVybnMgb25seSB0aGUgdmFsdWVzIHRoYXQgYXJlIGV4cGxpY2l0bHkgc2V0IGluIHRoZSBlbnZpcm9ubWVudFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgbG9hZEZyb21FbnYoKTogUGFydGlhbDxFeHBlY3RDb25maWc+IHtcbiAgICBjb25zdCBjb25maWc6IFBhcnRpYWw8RXhwZWN0Q29uZmlnPiA9IHt9O1xuXG4gICAgLy8gTG9hZCBjb2xvcml6ZSBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlXG4gICAgaWYgKGVudlBhcnNlci5oYXNWYWx1ZShcIks2X1RFU1RJTkdfQ09MT1JJWkVcIikpIHtcbiAgICAgIGNvbmZpZy5jb2xvcml6ZSA9IGVudlBhcnNlci5ib29sZWFuKFwiSzZfVEVTVElOR19DT0xPUklaRVwiKTtcbiAgICB9XG5cbiAgICAvLyBMb2FkIGRpc3BsYXkgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZVxuICAgIGlmIChlbnZQYXJzZXIuaGFzVmFsdWUoXCJLNl9URVNUSU5HX0RJU1BMQVlcIikpIHtcbiAgICAgIGNvbmZpZy5kaXNwbGF5ID0gZW52UGFyc2VyLmVudW08RGlzcGxheUZvcm1hdD4oXG4gICAgICAgIFwiSzZfVEVTVElOR19ESVNQTEFZXCIsXG4gICAgICAgIFtcImlubGluZVwiLCBcInByZXR0eVwiXSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gTG9hZCB0aW1lb3V0IGZyb20gZW52aXJvbm1lbnQgdmFyaWFibGVcbiAgICBpZiAoZW52UGFyc2VyLmhhc1ZhbHVlKFwiSzZfVEVTVElOR19USU1FT1VUXCIpKSB7XG4gICAgICBjb25maWcudGltZW91dCA9IGVudlBhcnNlci5udW1iZXIoXCJLNl9URVNUSU5HX1RJTUVPVVRcIik7XG4gICAgfVxuXG4gICAgLy8gTG9hZCBpbnRlcnZhbCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlXG4gICAgaWYgKGVudlBhcnNlci5oYXNWYWx1ZShcIks2X1RFU1RJTkdfSU5URVJWQUxcIikpIHtcbiAgICAgIGNvbmZpZy5pbnRlcnZhbCA9IGVudlBhcnNlci5udW1iZXIoXCJLNl9URVNUSU5HX0lOVEVSVkFMXCIpO1xuICAgIH1cblxuICAgIC8vIExvYWQgc29mdE1vZGUgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZVxuICAgIGlmIChlbnZQYXJzZXIuaGFzVmFsdWUoXCJLNl9URVNUSU5HX1NPRlRfTU9ERVwiKSkge1xuICAgICAgY29uZmlnLnNvZnRNb2RlID0gZW52UGFyc2VyLmVudW08U29mdE1vZGU+KFxuICAgICAgICBcIks2X1RFU1RJTkdfU09GVF9NT0RFXCIsXG4gICAgICAgIFtcInRocm93XCIsIFwiZmFpbFwiXSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhY2tGcmFtZSwgU3RhY2t0cmFjZSB9IGZyb20gXCIuL3N0YWNrdHJhY2UudHNcIjtcblxuLyoqXG4gKiBIb2xkcyB0aGUgZXhlY3V0aW9uIGNvbnRleHQgZm9yIGEgZ2l2ZW4gYXNzZXJ0aW9uLCBhbmQgaXMgdXNlZCB0byByZW5kZXIgdGhlIGVycm9yIG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0aW9uQ29udGV4dCB7XG4gIC8qKlxuICAgKiBUaGUgZmlsZSBwYXRoIHdoZXJlIHRoZSBhc3NlcnRpb24gd2FzIGNhbGxlZC4gZS5nLiBcIi9zb21lL3BhdGgudHNcIi5cbiAgICovXG4gIGZpbGVQYXRoOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBmaWxlIG5hbWUgd2hlcmUgdGhlIGFzc2VydGlvbiB3YXMgY2FsbGVkLiBlLmcuIFwicGF0aC50c1wiLlxuICAgKi9cbiAgZmlsZU5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGxpbmUgbnVtYmVyIHdpdGhpbiBgZmlsZW5hbWVgIHdoZXJlIHRoZSBhc3NlcnRpb24gd2FzIGNhbGxlZC4gZS5nLiA0Mi5cbiAgICovXG4gIGxpbmVOdW1iZXI6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGNvbHVtbiBudW1iZXIgd2l0aGluIGBmaWxlbmFtZWAgd2hlcmUgdGhlIGFzc2VydGlvbiB3YXMgY2FsbGVkLiBlLmcuIDI0LlxuICAgKi9cbiAgY29sdW1uTnVtYmVyOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBsb2NhdGlvbiBvZiB0aGUgYXNzZXJ0aW9uLiBlLmcuIFwiL3NvbWUvcGF0aC50czoxMjQ6MTJcIi5cbiAgICovXG4gIGF0OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBzdGFja3RyYWNlIHRoaXMgZXhlY3V0aW9uIGNvbnRleHQgd2FzIGNhcHR1cmVkIGZyb20uXG4gICAqL1xuICBzdGFja3RyYWNlPzogU3RhY2t0cmFjZTtcbn1cblxuLyoqXG4gKiBDYXB0dXJlcyB0aGUgZXhlY3V0aW9uIGNvbnRleHQgZnJvbSB0aGUgcHJvdmlkZWQgc3RhY2t0cmFjZS5cbiAqXG4gKiBJZiBubyBzdGFja3RyYWNlIGlzIHByb3ZpZGVkLCB0aGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgbm90IGNhcHR1cmVkIGFuZCB0aGUgZnVuY3Rpb24gcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAcGFyYW0gc3RhY2t0cmFjZSAtIFRoZSBzdGFja3RyYWNlIHRvIGNhcHR1cmUgdGhlIGV4ZWN1dGlvbiBjb250ZXh0IGZyb20sIGFzIHJldHVybmVkIGJ5IGBuZXcgRXJyb3IoKS5zdGFja2AuXG4gKiBAcmV0dXJucyB0aGUgZXhlY3V0aW9uIGNvbnRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVFeGVjdXRpb25Db250ZXh0KFxuICBzdDogU3RhY2t0cmFjZSxcbik6IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWQge1xuICBpZiAoIXN0IHx8IHN0Lmxlbmd0aCA8PSAxKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IHN0YWNrRnJhbWU6IFN0YWNrRnJhbWUgPSBzdFtzdC5sZW5ndGggLSAxXTtcblxuICBjb25zdCBmaWxlUGF0aCA9IHN0YWNrRnJhbWUuZmlsZVBhdGg7XG4gIGNvbnN0IGZpbGVOYW1lID0gc3RhY2tGcmFtZS5maWxlTmFtZTtcbiAgY29uc3QgbGluZU51bWJlciA9IHN0YWNrRnJhbWUubGluZU51bWJlcjtcbiAgY29uc3QgY29sdW1uTnVtYmVyID0gc3RhY2tGcmFtZS5jb2x1bW5OdW1iZXI7XG4gIGNvbnN0IGF0ID0gYCR7ZmlsZVBhdGh9OiR7bGluZU51bWJlcn06JHtjb2x1bW5OdW1iZXJ9YDtcblxuICByZXR1cm4ge1xuICAgIGZpbGVQYXRoLFxuICAgIGZpbGVOYW1lLFxuICAgIGxpbmVOdW1iZXIsXG4gICAgY29sdW1uTnVtYmVyLFxuICAgIGF0LFxuICB9O1xufVxuIiwgIi8qKlxuICogQSBzdGFja3RyYWNlLCByZXByZXNlbnRlZCBhcyBhbiBhcnJheSBvZiBzdGFjayBmcmFtZXMuXG4gKi9cbmV4cG9ydCB0eXBlIFN0YWNrdHJhY2UgPSBTdGFja0ZyYW1lW107XG5cbi8qKlxuICogQSBzaW5nbGUgZnJhbWUgaW4gYSBzdGFja3RyYWNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrRnJhbWUge1xuICAvLyBOYW1lIG9mIHRoZSBmdW5jdGlvbiwgaWYgYW55LlxuICBmdW5jdGlvbk5hbWU6IHN0cmluZztcblxuICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBmaWxlLCBpZiBhbnkuXG4gIGZpbGVQYXRoOiBzdHJpbmc7XG5cbiAgLy8gTmFtZSBvZiB0aGUgZmlsZSwgaWYgYW55LlxuICBmaWxlTmFtZTogc3RyaW5nO1xuXG4gIC8vIExpbmUgbnVtYmVyIGluIHRoZSBmaWxlLCBpZiBhbnkuXG4gIGxpbmVOdW1iZXI6IG51bWJlcjtcblxuICAvLyBDb2x1bW4gbnVtYmVyIGluIHRoZSBmaWxlLCBpZiBhbnkuXG4gIGNvbHVtbk51bWJlcjogbnVtYmVyO1xufVxuXG4vKipcbiAqIFBhcnNlcyBhIHN0YWNrdHJhY2UgZnJvbSBhIHN0cmluZy5cbiAqXG4gKiBJZiBubyBzdGFja3RyYWNlIGlzIHByb3ZpZGVkLCByZXR1cm5zIGFuIGVtcHR5IGFycmF5LlxuICpcbiAqIEBwYXJhbSBzdGFjayB0aGUgc3RhY2t0cmFjZSB0byBwYXJzZSwgYXMgcmV0dXJuZWQgYnkgYG5ldyBFcnJvcigpLnN0YWNrYFxuICogQHJldHVybnMgdGhlIHBhcnNlZCBzdGFja3RyYWNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN0YWNrVHJhY2Uoc3RhY2s/OiBzdHJpbmcpOiBTdGFja3RyYWNlIHtcbiAgLy8gSWYgbm8gc3RhY2t0cmFjZSBpcyBwcm92aWRlZCwgcmV0dXJuIGFuIGVtcHR5IGFycmF5LlxuICBpZiAoIXN0YWNrKSByZXR1cm4gW107XG5cbiAgY29uc3QgbGluZXMgPSBzdGFjay5zcGxpdChcIlxcblwiKTtcbiAgY29uc3QgZnJhbWVzOiBTdGFja0ZyYW1lW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGxpbmVTdHIgPSBsaW5lc1tpXS50cmltKCk7XG5cbiAgICAvLyBTa2lwIHRoZSBmaXJzdCBsaW5lIGlmIGl0J3MgXCJFcnJvclwiIG9yIGFueSBsaW5lIHRoYXQgZG9lc24ndCBzdGFydCB3aXRoIFwiYXQgXCJcbiAgICBpZiAoaSA9PT0gMCAmJiBsaW5lU3RyLnN0YXJ0c1dpdGgoXCJFcnJvclwiKSkgY29udGludWU7XG4gICAgaWYgKCFsaW5lU3RyLnN0YXJ0c1dpdGgoXCJhdCBcIikpIGNvbnRpbnVlO1xuXG4gICAgLy8gUmVtb3ZlIFwiYXQgXCJcbiAgICBsaW5lU3RyID0gbGluZVN0ci5zbGljZSgzKS50cmltKCk7XG5cbiAgICAvLyAxLiBTZXBhcmF0ZSB0aGUgZnVuY3Rpb24gbmFtZSBmcm9tIGZpbGUgaW5mb1xuICAgIGxldCBmdW5jdGlvbk5hbWUgPSBcIjxhbm9ueW1vdXM+XCI7XG4gICAgbGV0IGZpbGVJbmZvID0gbGluZVN0cjtcbiAgICBjb25zdCBmaXJzdFBhcmVuSW5kZXggPSBsaW5lU3RyLmluZGV4T2YoXCIoXCIpO1xuICAgIGNvbnN0IGZpbGVQcm90b2NvbEluZGV4ID0gbGluZVN0ci5pbmRleE9mKFwiZmlsZTovL1wiKTtcblxuICAgIGlmIChmaWxlUHJvdG9jb2xJbmRleCA9PT0gMCkge1xuICAgICAgZnVuY3Rpb25OYW1lID0gXCI8YW5vbnltb3VzPlwiO1xuICAgICAgZmlsZUluZm8gPSBsaW5lU3RyLnNsaWNlKGZpbGVQcm90b2NvbEluZGV4KTtcbiAgICB9IGVsc2UgaWYgKGZpcnN0UGFyZW5JbmRleCA+PSAwKSB7XG4gICAgICBmdW5jdGlvbk5hbWUgPSBsaW5lU3RyLnNsaWNlKDAsIGZpcnN0UGFyZW5JbmRleCkudHJpbSgpIHx8IFwiPGFub255bW91cz5cIjtcbiAgICAgIGZpbGVJbmZvID0gbGluZVN0clxuICAgICAgICAuc2xpY2UoZmlyc3RQYXJlbkluZGV4ICsgMSwgbGluZVN0ci5sYXN0SW5kZXhPZihcIilcIikpXG4gICAgICAgIC50cmltKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVJbmZvID0gbGluZVN0cjtcbiAgICB9XG5cbiAgICAvLyAyLiBSZW1vdmUgYW55IHRyYWlsaW5nIFwiKFgpXCIgb2Zmc2V0XG4gICAgY29uc3Qgb2Zmc2V0UGFyZW5JbmRleCA9IGZpbGVJbmZvLmxhc3RJbmRleE9mKFwiKFwiKTtcbiAgICBpZiAob2Zmc2V0UGFyZW5JbmRleCA+PSAwKSB7XG4gICAgICBmaWxlSW5mbyA9IGZpbGVJbmZvLnNsaWNlKDAsIG9mZnNldFBhcmVuSW5kZXgpO1xuICAgIH1cblxuICAgIC8vIDMuIEhhbmRsZSBmaWxlOi8vIHByb3RvY29sXG4gICAgaWYgKGZpbGVJbmZvLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKSB7XG4gICAgICBmaWxlSW5mbyA9IGZpbGVJbmZvLnNsaWNlKDcpO1xuICAgIH1cblxuICAgIC8vIDQuIFNlcGFyYXRlIGZpbGUsIGxpbmUsIGFuZCBjb2x1bW5cbiAgICBjb25zdCBsYXN0Q29sb24gPSBmaWxlSW5mby5sYXN0SW5kZXhPZihcIjpcIik7XG4gICAgaWYgKGxhc3RDb2xvbiA9PT0gLTEpIGNvbnRpbnVlOyAvLyBNYWxmb3JtZWRcbiAgICBjb25zdCBzZWNvbmRMYXN0Q29sb24gPSBmaWxlSW5mby5sYXN0SW5kZXhPZihcIjpcIiwgbGFzdENvbG9uIC0gMSk7XG4gICAgaWYgKHNlY29uZExhc3RDb2xvbiA9PT0gLTEpIGNvbnRpbnVlOyAvLyBNYWxmb3JtZWRcblxuICAgIGNvbnN0IGZpbGVQYXRoID0gZmlsZUluZm8uc2xpY2UoMCwgc2Vjb25kTGFzdENvbG9uKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVQYXRoLnNwbGl0KFwiL1wiKS5wb3AoKSA/PyBcIlwiO1xuICAgIGNvbnN0IGxpbmVOdW1iZXJTdHIgPSBmaWxlSW5mby5zbGljZShzZWNvbmRMYXN0Q29sb24gKyAxLCBsYXN0Q29sb24pO1xuICAgIGNvbnN0IGNvbHVtbk51bWJlclN0ciA9IGZpbGVJbmZvLnNsaWNlKGxhc3RDb2xvbiArIDEpO1xuXG4gICAgZnJhbWVzLnB1c2goe1xuICAgICAgZnVuY3Rpb25OYW1lLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBmaWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHBhcnNlSW50KGxpbmVOdW1iZXJTdHIsIDEwKSxcbiAgICAgIGNvbHVtbk51bWJlcjogcGFyc2VJbnQoY29sdW1uTnVtYmVyU3RyLCAxMCksXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZnJhbWVzO1xufVxuIiwgImV4cG9ydCBjb25zdCBBTlNJX0NPTE9SUyA9IHtcbiAgcmVzZXQ6IFwiXFx4MWJbMG1cIixcblxuICAvLyBTdGFuZGFyZCBDb2xvcnNcbiAgYmxhY2s6IFwiXFx4MWJbMzBtXCIsXG4gIHJlZDogXCJcXHgxYlszMW1cIixcbiAgZ3JlZW46IFwiXFx4MWJbMzJtXCIsXG4gIHllbGxvdzogXCJcXHgxYlszM21cIixcbiAgYmx1ZTogXCJcXHgxYlszNG1cIixcbiAgbWFnZW50YTogXCJcXHgxYlszNW1cIixcbiAgY3lhbjogXCJcXHgxYlszNm1cIixcbiAgd2hpdGU6IFwiXFx4MWJbMzdtXCIsXG5cbiAgLy8gQnJpZ2h0IENvbG9yc1xuICBicmlnaHRCbGFjazogXCJcXHgxYls5MG1cIixcbiAgYnJpZ2h0UmVkOiBcIlxceDFiWzkxbVwiLFxuICBicmlnaHRHcmVlbjogXCJcXHgxYls5Mm1cIixcbiAgYnJpZ2h0WWVsbG93OiBcIlxceDFiWzkzbVwiLFxuICBicmlnaHRCbHVlOiBcIlxceDFiWzk0bVwiLFxuICBicmlnaHRNYWdlbnRhOiBcIlxceDFiWzk1bVwiLFxuICBicmlnaHRDeWFuOiBcIlxceDFiWzk2bVwiLFxuICBicmlnaHRXaGl0ZTogXCJcXHgxYls5N21cIixcblxuICAvLyBEYXJrIENvbG9yc1xuICBkYXJrR3JleTogXCJcXHgxYls5MG1cIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xvcml6ZShcbiAgdGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICBjb2xvcjoga2V5b2YgdHlwZW9mIEFOU0lfQ09MT1JTLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke0FOU0lfQ09MT1JTW2NvbG9yXX0ke3RleHR9JHtBTlNJX0NPTE9SUy5yZXNldH1gO1xufVxuIiwgImltcG9ydCB0eXBlIHsgRXhlY3V0aW9uQ29udGV4dCB9IGZyb20gXCIuL2V4ZWN1dGlvbi50c1wiO1xuaW1wb3J0IHsgdHlwZSBBTlNJX0NPTE9SUywgY29sb3JpemUgfSBmcm9tIFwiLi9jb2xvcnMudHNcIjtcbmltcG9ydCB0eXBlIHsgRGlzcGxheUZvcm1hdCwgUmVuZGVyQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnLnRzXCI7XG5cbi8qKlxuICogVGhlIGludGVyZmFjZSB0aGF0IGFsbCBtYXRjaGVycyBlcnJvciByZW5kZXJlcnMgbXVzdCBpbXBsZW1lbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0Y2hlckVycm9yUmVuZGVyZXIge1xuICByZW5kZXIoaW5mbzogUmVuZGVyZWRFcnJvckluZm8sIGNvbmZpZzogUmVuZGVyQ29uZmlnKTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRoZSBkYXRhIHN0cnVjdHVyZSBob2xkaW5nIGFsbCBpbmZvIHRvIGJlIHJlbmRlcmVkIHdoZW4gYSBtYXRjaGVyIGZhaWxzLlxuICpcbiAqIEJlY2F1c2Ugc29tZSBtYXRjaGVycyByZXF1aXJlIGFkZGl0aW9uYWwgaW5mbyB0byBiZSByZW5kZXJlZCwgd2UgdXNlIGEgZ2VuZXJpYyB0eXBlXG4gKiB0byBhbGxvdyBmb3IgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHRoZSBpbmZvIHN0cnVjdHVyZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRjaGVyRXJyb3JJbmZvIGV4dGVuZHMgUmVuZGVyZWRFcnJvckluZm8ge1xuICBtYXRjaGVyU3BlY2lmaWM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgY3VzdG9tTWVzc2FnZT86IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaGUgZGF0YSBzdHJ1Y3R1cmUgaG9sZGluZyBhbGwgaW5mbyB0byBiZSByZW5kZXJlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJlZEVycm9ySW5mbyB7XG4gIC8vIFRoZSBleGVjdXRpb24gY29udGV4dCBvZiB0aGUgYXNzZXJ0aW9uLCBob2xkaW5nIHRoZSBmaWxlIG5hbWUsIGxpbmUgbnVtYmVyLCBhbmQgY29sdW1uIG51bWJlclxuICAvLyB3aGVyZSB0aGUgYXNzZXJ0aW9uIHdhcyBjYWxsZWQuXG4gIGV4ZWN1dGlvbkNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQ7XG5cbiAgLy8gVGhpcyB3b3VsZCBiZSBzb21ldGhpbmcgbGlrZTogXCJleHBlY3QocmVjZWl2ZWQpLnRvQmUoZXhwZWN0ZWQpXCJcbiAgLy8gcGx1cyBjb2xvciBpbmZvIG9yIHRleHQgYXBwZW5kZWQgZm9yIGV4dHJhIGNvbnRleHQuXG4gIG1hdGNoZXJOYW1lOiBzdHJpbmc7XG5cbiAgLy8gVGhlIHVuZGVybHlpbmcgb3BlcmF0aW9uIHRoYXQgd2FzIHVzZWQgdG8gbWFrZSB0aGUgYXNzZXJ0aW9uLiBlLmcuIFwiT2JqZWN0LmlzXCIuXG4gIG1hdGNoZXJPcGVyYXRpb24/OiBzdHJpbmc7XG5cbiAgLy8gVGhlIGV4cGVjdGVkIHZhbHVlLiBlLmcuIFwiZmFsc2VcIi5cbiAgZXhwZWN0ZWQ6IHN0cmluZztcblxuICAvLyBUaGUgcmVjZWl2ZWQgdmFsdWUuIGUuZy4gXCJ0cnVlXCIuXG4gIHJlY2VpdmVkOiBzdHJpbmc7XG5cbiAgLy8gVGhlIHN0YWNrdHJhY2Ugb2YgdGhlIGFzc2VydGlvbi4gZS5nLiBcIkVycm9yXCIuXG4gIHN0YWNrdHJhY2U/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSByZWdpc3RyeSBvZiBtYXRjaGVycyBlcnJvciByZW5kZXJlcnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyZXJzOiBNYXA8c3RyaW5nLCBNYXRjaGVyRXJyb3JSZW5kZXJlcj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgc3RhdGljIGNvbmZpZzogUmVuZGVyQ29uZmlnID0geyBjb2xvcml6ZTogdHJ1ZSwgZGlzcGxheTogXCJwcmV0dHlcIiB9O1xuXG4gIHN0YXRpYyByZWdpc3RlcihtYXRjaGVyTmFtZTogc3RyaW5nLCByZW5kZXJlcjogTWF0Y2hlckVycm9yUmVuZGVyZXIpIHtcbiAgICB0aGlzLnJlbmRlcmVycy5zZXQobWF0Y2hlck5hbWUsIHJlbmRlcmVyKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRSZW5kZXJlcihtYXRjaGVyTmFtZTogc3RyaW5nKTogTWF0Y2hlckVycm9yUmVuZGVyZXIge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcmVycy5nZXQobWF0Y2hlck5hbWUpIHx8IG5ldyBEZWZhdWx0TWF0Y2hlckVycm9yUmVuZGVyZXIoKTtcbiAgfVxuXG4gIHN0YXRpYyBjb25maWd1cmUoY29uZmlnOiBSZW5kZXJDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLmNvbmZpZyB9O1xuICB9XG5cbiAgc3RhdGljIGdldENvbmZpZygpOiBSZW5kZXJDb25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCBtYXRjaGVyIGVycm9yIHJlbmRlcmVycyB0aGF0IGltcGxlbWVudHMgY29tbW9uIGZ1bmN0aW9uYWxpdHlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VNYXRjaGVyRXJyb3JSZW5kZXJlciBpbXBsZW1lbnRzIE1hdGNoZXJFcnJvclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldFJlY2VpdmVkUGxhY2Vob2xkZXIoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gXCJyZWNlaXZlZFwiO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldEV4cGVjdGVkUGxhY2Vob2xkZXIoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gXCJleHBlY3RlZFwiO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldFNwZWNpZmljTGluZXMoXG4gICAgaW5mbzogTWF0Y2hlckVycm9ySW5mbyxcbiAgICBtYXliZUNvbG9yaXplOiAodGV4dDogc3RyaW5nLCBjb2xvcjoga2V5b2YgdHlwZW9mIEFOU0lfQ09MT1JTKSA9PiBzdHJpbmcsXG4gICk6IExpbmVHcm91cFtdO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmc7XG5cbiAgcHJvdGVjdGVkIHJlbmRlckVycm9yTGluZShcbiAgICBpbmZvOiBSZW5kZXJlZEVycm9ySW5mbyxcbiAgICBjb25maWc6IFJlbmRlckNvbmZpZyxcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXliZUNvbG9yaXplID0gKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT5cbiAgICAgIGNvbmZpZy5jb2xvcml6ZSA/IGNvbG9yaXplKHRleHQsIGNvbG9yKSA6IHRleHQ7XG5cbiAgICBpZiAoXCJjdXN0b21NZXNzYWdlXCIgaW4gaW5mbyAmJiB0eXBlb2YgaW5mby5jdXN0b21NZXNzYWdlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gbWF5YmVDb2xvcml6ZShpbmZvLmN1c3RvbU1lc3NhZ2UsIFwid2hpdGVcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1heWJlQ29sb3JpemUoYGV4cGVjdChgLCBcImRhcmtHcmV5XCIpICtcbiAgICAgIG1heWJlQ29sb3JpemUodGhpcy5nZXRSZWNlaXZlZFBsYWNlaG9sZGVyKCksIFwicmVkXCIpICtcbiAgICAgIG1heWJlQ29sb3JpemUoYCkuYCwgXCJkYXJrR3JleVwiKSArXG4gICAgICBtYXliZUNvbG9yaXplKHRoaXMuZ2V0TWF0Y2hlck5hbWUoKSwgXCJ3aGl0ZVwiKSArXG4gICAgICB0aGlzLnJlbmRlck1hdGNoZXJBcmdzKG1heWJlQ29sb3JpemUpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlbmRlck1hdGNoZXJBcmdzKFxuICAgIG1heWJlQ29sb3JpemU6ICh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBrZXlvZiB0eXBlb2YgQU5TSV9DT0xPUlMpID0+IHN0cmluZyxcbiAgKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbWF5YmVDb2xvcml6ZShgKClgLCBcImRhcmtHcmV5XCIpO1xuICB9XG5cbiAgcmVuZGVyKGluZm86IE1hdGNoZXJFcnJvckluZm8sIGNvbmZpZzogUmVuZGVyQ29uZmlnKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXliZUNvbG9yaXplID0gKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT5cbiAgICAgIGNvbmZpZy5jb2xvcml6ZSA/IGNvbG9yaXplKHRleHQsIGNvbG9yKSA6IHRleHQ7XG5cbiAgICBjb25zdCBsaW5lczogTGluZUdyb3VwW10gPSBbXG4gICAgICB7IGxhYmVsOiBcIkVycm9yXCIsIHZhbHVlOiB0aGlzLnJlbmRlckVycm9yTGluZShpbmZvLCBjb25maWcpLCBncm91cDogMSB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJBdFwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShcbiAgICAgICAgICBpbmZvLmV4ZWN1dGlvbkNvbnRleHQuYXQgfHwgXCJ1bmtub3duIGxvY2F0aW9uXCIsXG4gICAgICAgICAgXCJkYXJrR3JleVwiLFxuICAgICAgICApLFxuICAgICAgICBncm91cDogMSxcbiAgICAgIH0sXG5cbiAgICAgIC4uLnRoaXMuZ2V0U3BlY2lmaWNMaW5lcyhpbmZvLCBtYXliZUNvbG9yaXplKSxcblxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJGaWxlbmFtZVwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLmV4ZWN1dGlvbkNvbnRleHQuZmlsZU5hbWUsIFwiZGFya0dyZXlcIiksXG4gICAgICAgIGdyb3VwOiA5OSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIkxpbmVcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoXG4gICAgICAgICAgaW5mby5leGVjdXRpb25Db250ZXh0LmxpbmVOdW1iZXIudG9TdHJpbmcoKSxcbiAgICAgICAgICBcImRhcmtHcmV5XCIsXG4gICAgICAgICksXG4gICAgICAgIGdyb3VwOiA5OSxcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIHJldHVybiBEaXNwbGF5Rm9ybWF0UmVnaXN0cnkuZ2V0Rm9ybWF0dGVyKGNvbmZpZy5kaXNwbGF5KS5yZW5kZXJMaW5lcyhcbiAgICAgIGxpbmVzLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBtYXRjaGVycyB0aGF0IG9ubHkgc2hvdyB0aGUgcmVjZWl2ZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlY2VpdmVkT25seU1hdGNoZXJSZW5kZXJlclxuICBleHRlbmRzIEJhc2VNYXRjaGVyRXJyb3JSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRTcGVjaWZpY0xpbmVzKFxuICAgIGluZm86IE1hdGNoZXJFcnJvckluZm8sXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBMaW5lR3JvdXBbXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiUmVjZWl2ZWRcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5yZWNlaXZlZCwgXCJyZWRcIiksXG4gICAgICAgIGdyb3VwOiAyLFxuICAgICAgfSxcbiAgICBdO1xuICB9XG59XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgbWF0Y2hlcnMgdGhhdCBzaG93IGJvdGggZXhwZWN0ZWQgYW5kIHJlY2VpdmVkIHZhbHVlc1xuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRXhwZWN0ZWRSZWNlaXZlZE1hdGNoZXJSZW5kZXJlclxuICBleHRlbmRzIEJhc2VNYXRjaGVyRXJyb3JSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRTcGVjaWZpY0xpbmVzKFxuICAgIGluZm86IE1hdGNoZXJFcnJvckluZm8sXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBMaW5lR3JvdXBbXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiRXhwZWN0ZWRcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5leHBlY3RlZCwgXCJncmVlblwiKSxcbiAgICAgICAgZ3JvdXA6IDIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJSZWNlaXZlZFwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLnJlY2VpdmVkLCBcInJlZFwiKSxcbiAgICAgICAgZ3JvdXA6IDIsXG4gICAgICB9LFxuICAgIF07XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgcmVuZGVyTWF0Y2hlckFyZ3MoXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBzdHJpbmcge1xuICAgIHJldHVybiBtYXliZUNvbG9yaXplKGAoYCwgXCJkYXJrR3JleVwiKSArXG4gICAgICBtYXliZUNvbG9yaXplKHRoaXMuZ2V0RXhwZWN0ZWRQbGFjZWhvbGRlcigpLCBcImdyZWVuXCIpICtcbiAgICAgIG1heWJlQ29sb3JpemUoYClgLCBcImRhcmtHcmV5XCIpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgbWF0Y2hlciBlcnJvciByZW5kZXJlci5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRNYXRjaGVyRXJyb3JSZW5kZXJlciBpbXBsZW1lbnRzIE1hdGNoZXJFcnJvclJlbmRlcmVyIHtcbiAgcmVuZGVyKGluZm86IFJlbmRlcmVkRXJyb3JJbmZvLCBjb25maWc6IFJlbmRlckNvbmZpZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWF5YmVDb2xvcml6ZSA9ICh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBrZXlvZiB0eXBlb2YgQU5TSV9DT0xPUlMpID0+XG4gICAgICBjb25maWcuY29sb3JpemUgPyBjb2xvcml6ZSh0ZXh0LCBjb2xvcikgOiB0ZXh0O1xuICAgIGNvbnN0IGxpbmVzOiBMaW5lR3JvdXBbXSA9IFtcbiAgICAgIHsgbGFiZWw6IFwiRXJyb3JcIiwgdmFsdWU6IHRoaXMucmVuZGVyRXJyb3JMaW5lKGluZm8sIGNvbmZpZyksIGdyb3VwOiAxIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIkF0XCIsXG4gICAgICAgIHZhbHVlOiBtYXliZUNvbG9yaXplKFxuICAgICAgICAgIGluZm8uZXhlY3V0aW9uQ29udGV4dC5hdCB8fCBcInVua25vd24gbG9jYXRpb25cIixcbiAgICAgICAgICBcImRhcmtHcmV5XCIsXG4gICAgICAgICksXG4gICAgICAgIGdyb3VwOiAxLFxuICAgICAgfSxcblxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJFeHBlY3RlZFwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLmV4cGVjdGVkLCBcImdyZWVuXCIpLFxuICAgICAgICBncm91cDogMixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIlJlY2VpdmVkXCIsXG4gICAgICAgIHZhbHVlOiBtYXliZUNvbG9yaXplKGluZm8ucmVjZWl2ZWQsIFwicmVkXCIpLFxuICAgICAgICBncm91cDogMixcbiAgICAgIH0sXG5cbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiRmlsZW5hbWVcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5leGVjdXRpb25Db250ZXh0LmZpbGVOYW1lLCBcImRhcmtHcmV5XCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIkxpbmVcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoXG4gICAgICAgICAgaW5mby5leGVjdXRpb25Db250ZXh0LmxpbmVOdW1iZXIudG9TdHJpbmcoKSxcbiAgICAgICAgICBcImRhcmtHcmV5XCIsXG4gICAgICAgICksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIERpc3BsYXlGb3JtYXRSZWdpc3RyeS5nZXRGb3JtYXR0ZXIoY29uZmlnLmRpc3BsYXkpLnJlbmRlckxpbmVzKFxuICAgICAgbGluZXMsXG4gICAgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZW5kZXJFcnJvckxpbmUoXG4gICAgaW5mbzogUmVuZGVyZWRFcnJvckluZm8sXG4gICAgY29uZmlnOiBSZW5kZXJDb25maWcsXG4gICk6IHN0cmluZyB7XG4gICAgY29uc3QgbWF5YmVDb2xvcml6ZSA9ICh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBrZXlvZiB0eXBlb2YgQU5TSV9DT0xPUlMpID0+XG4gICAgICBjb25maWcuY29sb3JpemUgPyBjb2xvcml6ZSh0ZXh0LCBjb2xvcikgOiB0ZXh0O1xuICAgIHJldHVybiBtYXliZUNvbG9yaXplKGBleHBlY3QoYCwgXCJkYXJrR3JleVwiKSArXG4gICAgICBtYXliZUNvbG9yaXplKGByZWNlaXZlZGAsIFwicmVkXCIpICtcbiAgICAgIG1heWJlQ29sb3JpemUoYCkuYCwgXCJkYXJrR3JleVwiKSArXG4gICAgICBtYXliZUNvbG9yaXplKGAke2luZm8ubWF0Y2hlck5hbWV9YCwgXCJ3aGl0ZVwiKSArXG4gICAgICBtYXliZUNvbG9yaXplKGAoYCwgXCJkYXJrR3JleVwiKSArXG4gICAgICBtYXliZUNvbG9yaXplKGBleHBlY3RlZGAsIFwiZ3JlZW5cIikgK1xuICAgICAgbWF5YmVDb2xvcml6ZShgKWAsIFwiZGFya0dyZXlcIik7XG4gIH1cbn1cblxuaW50ZXJmYWNlIERpc3BsYXlGb3JtYXRSZW5kZXJlciB7XG4gIHJlbmRlckxpbmVzKGxpbmVzOiBMaW5lR3JvdXBbXSk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcmV0dHkgZm9ybWF0IHJlbmRlcmVyIHRoYXQgZ3JvdXBzIGFuZCBhbGlnbnMgb3V0cHV0XG4gKlxuICogTm90ZSB0aGF0IGFueSBzdHlsaXphdGlvbiBvZiB0aGUgbGluZXMsIHN1Y2ggYXMgY29sb3JpemF0aW9uIGlzIGV4cGVjdGVkIHRvXG4gKiBiZSBkb25lIGJ5IHRoZSBjYWxsZXIuXG4gKi9cbmNsYXNzIFByZXR0eUZvcm1hdFJlbmRlcmVyIGltcGxlbWVudHMgRGlzcGxheUZvcm1hdFJlbmRlcmVyIHtcbiAgcmVuZGVyTGluZXMobGluZXM6IExpbmVHcm91cFtdKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXhMYWJlbFdpZHRoID0gTWF0aC5tYXgoXG4gICAgICAuLi5saW5lc1xuICAgICAgICAuZmlsdGVyKChsaW5lKSA9PiAhbGluZS5yYXcpXG4gICAgICAgIC5tYXAoKHsgbGFiZWwgfTogeyBsYWJlbDogc3RyaW5nIH0pID0+IChsYWJlbCArIFwiOlwiKS5sZW5ndGgpLFxuICAgICk7XG5cbiAgICByZXR1cm4gXCJcXG5cXG5cIiArIGxpbmVzXG4gICAgICAubWFwKCh7IGxhYmVsLCB2YWx1ZSwgcmF3IH0sIGluZGV4KSA9PiB7XG4gICAgICAgIGxldCBsaW5lOiBzdHJpbmc7XG4gICAgICAgIGlmIChyYXcpIHtcbiAgICAgICAgICBsaW5lID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbGFiZWxXaXRoQ29sb24gPSBsYWJlbCArIFwiOlwiO1xuICAgICAgICAgIGNvbnN0IHNwYWNlcyA9IFwiIFwiLnJlcGVhdChtYXhMYWJlbFdpZHRoIC0gbGFiZWxXaXRoQ29sb24ubGVuZ3RoKTtcbiAgICAgICAgICBsaW5lID0gc3BhY2VzICsgbGFiZWxXaXRoQ29sb24gKyBcIiBcIiArIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG5ld2xpbmVzIGJlZm9yZSBhIG5ldyBncm91cCBvZiBsaW5lcyAoZXhjZXB0IGZvciB0aGUgZmlyc3QgZ3JvdXApXG4gICAgICAgIGNvbnN0IG5leHRMaW5lID0gbGluZXNbaW5kZXggKyAxXTtcbiAgICAgICAgaWYgKG5leHRMaW5lICYmIGxpbmVzW2luZGV4XS5ncm91cCAhPT0gbmV4dExpbmUuZ3JvdXApIHtcbiAgICAgICAgICByZXR1cm4gbGluZSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICB9KVxuICAgICAgLmpvaW4oXCJcXG5cIikgK1xuICAgICAgXCJcXG5cXG5cIjtcbiAgfVxufVxuXG4vKipcbiAqIElubGluZSBmb3JtYXQgcmVuZGVyZXIgdGhhdCBvdXRwdXRzIGluIGxvZ2ZtdCBzdHlsZVxuICovXG5jbGFzcyBJbmxpbmVGb3JtYXRSZW5kZXJlciBpbXBsZW1lbnRzIERpc3BsYXlGb3JtYXRSZW5kZXJlciB7XG4gIHJlbmRlckxpbmVzKGxpbmVzOiBMaW5lR3JvdXBbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGxpbmVzXG4gICAgICAubWFwKCh7IGxhYmVsLCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgIC8vIEVzY2FwZSBhbnkgc3BhY2VzIG9yIHNwZWNpYWwgY2hhcmFjdGVycyBpbiB0aGUgdmFsdWVcbiAgICAgICAgY29uc3QgZXNjYXBlZFZhbHVlID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiXG4gICAgICAgICAgPyB2YWx1ZS5pbmNsdWRlcyhcIiBcIikgPyBgXCIke3ZhbHVlfVwiYCA6IHZhbHVlXG4gICAgICAgICAgOiB2YWx1ZTtcbiAgICAgICAgLy8gQ29udmVydCBsYWJlbCB0byBsb3dlcmNhc2UgYW5kIHJlcGxhY2Ugc3BhY2VzIHdpdGggdW5kZXJzY29yZXNcbiAgICAgICAgY29uc3QgZXNjYXBlZExhYmVsID0gbGFiZWwudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csIFwiX1wiKTtcbiAgICAgICAgcmV0dXJuIGAke2VzY2FwZWRMYWJlbH09JHtlc2NhcGVkVmFsdWV9YDtcbiAgICAgIH0pXG4gICAgICAuam9pbihcIiBcIik7XG4gIH1cbn1cblxuY2xhc3MgRGlzcGxheUZvcm1hdFJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBzdGF0aWMgZm9ybWF0dGVyczogTWFwPERpc3BsYXlGb3JtYXQsIERpc3BsYXlGb3JtYXRSZW5kZXJlcj4gPVxuICAgIG5ldyBNYXAoW1xuICAgICAgW1wicHJldHR5XCIsIG5ldyBQcmV0dHlGb3JtYXRSZW5kZXJlcigpXSxcbiAgICAgIFtcImlubGluZVwiLCBuZXcgSW5saW5lRm9ybWF0UmVuZGVyZXIoKV0sXG4gICAgXSk7XG5cbiAgc3RhdGljIGdldEZvcm1hdHRlcihmb3JtYXQ6IERpc3BsYXlGb3JtYXQpOiBEaXNwbGF5Rm9ybWF0UmVuZGVyZXIge1xuICAgIGNvbnN0IGZvcm1hdHRlciA9IHRoaXMuZm9ybWF0dGVycy5nZXQoZm9ybWF0KTtcbiAgICBpZiAoIWZvcm1hdHRlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGRpc3BsYXkgZm9ybWF0OiAke2Zvcm1hdH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlcjtcbiAgfVxufVxuXG4vKipcbiAqIEEgbGluZSB3aXRoIGEgbGFiZWwgYW5kIGEgdmFsdWUuXG4gKlxuICogVGhlIGxhYmVsIGlzIHRoZSB0ZXh0IGJlZm9yZSB0aGUgY29sb24sIGFuZCB0aGUgdmFsdWUgaXMgdGhlIHRleHQgYWZ0ZXIgdGhlIGNvbG9uLlxuICpcbiAqIFRoZSBncm91cCBudW1iZXIgaXMgdXNlZCB0byBhbGlnbiB0aGUgbGluZXMgYXQgdGhlIHNhbWUgY29sdW1uIGFuZCBncm91cCB0aGVtIGludG9cbiAqIG5ld2xpbmUgc2VwYXJhdGVkIHNlY3Rpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExpbmVHcm91cCB7XG4gIC8vIFRoZSBsYWJlbCBvZiB0aGUgbGluZS5cbiAgbGFiZWw6IHN0cmluZztcblxuICAvLyBUaGUgdmFsdWUgb2YgdGhlIGxpbmUuXG4gIHZhbHVlOiBzdHJpbmc7XG5cbiAgLy8gVGhlIGdyb3VwIG51bWJlciBvZiB0aGUgbGluZS4gTGluZXMgd2l0aCB0aGUgc2FtZSBncm91cCBudW1iZXIgYXJlIGFsaWduZWQgYXQgdGhlIHNhbWUgY29sdW1uLlxuICBncm91cD86IG51bWJlcjtcblxuICAvLyBJZiB0cnVlLCB0aGUgbGluZSBpcyBub3QgZm9ybWF0dGVkIGFuZCBpcyBvdXRwdXQgYXMgcmF3IHRleHQuXG4gIHJhdz86IGJvb2xlYW47XG59XG4iLCAiaW1wb3J0IHsgYXNzZXJ0LCB0eXBlIFNvZnRNb2RlIH0gZnJvbSBcIi4vYXNzZXJ0LnRzXCI7XG5pbXBvcnQgdHlwZSB7IEFOU0lfQ09MT1JTIH0gZnJvbSBcIi4vY29sb3JzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEV4cGVjdENvbmZpZyB9IGZyb20gXCIuL2NvbmZpZy50c1wiO1xuaW1wb3J0IHsgY2FwdHVyZUV4ZWN1dGlvbkNvbnRleHQgfSBmcm9tIFwiLi9leGVjdXRpb24udHNcIjtcbmltcG9ydCB7IHBhcnNlU3RhY2tUcmFjZSB9IGZyb20gXCIuL3N0YWNrdHJhY2UudHNcIjtcbmltcG9ydCB7XG4gIERlZmF1bHRNYXRjaGVyRXJyb3JSZW5kZXJlcixcbiAgRXhwZWN0ZWRSZWNlaXZlZE1hdGNoZXJSZW5kZXJlcixcbiAgdHlwZSBMaW5lR3JvdXAsXG4gIHR5cGUgTWF0Y2hlckVycm9ySW5mbyxcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeSxcbiAgUmVjZWl2ZWRPbmx5TWF0Y2hlclJlbmRlcmVyLFxufSBmcm9tIFwiLi9yZW5kZXIudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBOb25SZXRyeWluZ0V4cGVjdGF0aW9uIHtcbiAgLyoqXG4gICAqIE5lZ2F0ZXMgdGhlIGV4cGVjdGF0aW9uLCBjYXVzaW5nIHRoZSBhc3NlcnRpb24gdG8gcGFzcyB3aGVuIGl0IHdvdWxkIG5vcm1hbGx5IGZhaWwsIGFuZCB2aWNlIHZlcnNhLlxuICAgKi9cbiAgbm90OiBOb25SZXRyeWluZ0V4cGVjdGF0aW9uO1xuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHZhbHVlIGlzIGVxdWFsIHRvIHRoZSBleHBlY3RlZCB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIGV4cGVjdGVkIHRoZSBleHBlY3RlZCB2YWx1ZVxuICAgKi9cbiAgdG9CZShleHBlY3RlZDogdW5rbm93bik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdmFsdWUgaXMgY2xvc2UgdG8gdGhlIGV4cGVjdGVkIHZhbHVlIHdpdGggYSBnaXZlbiBwcmVjaXNpb24uXG4gICAqXG4gICAqIEBwYXJhbSBleHBlY3RlZCB0aGUgZXhwZWN0ZWQgdmFsdWVcbiAgICogQHBhcmFtIHByZWNpc2lvbiB0aGUgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIGNvbnNpZGVyXG4gICAqL1xuICB0b0JlQ2xvc2VUbyhleHBlY3RlZDogbnVtYmVyLCBwcmVjaXNpb24/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHZhbHVlIGlzIG5vdCBgdW5kZWZpbmVkYC5cbiAgICovXG4gIHRvQmVEZWZpbmVkKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdmFsdWUgaXMgdHJ1dGh5LlxuICAgKi9cbiAgdG9CZUZhbHN5KCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBleHBlY3RlZCB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIGV4cGVjdGVkIHRoZSBleHBlY3RlZCB2YWx1ZVxuICAgKi9cbiAgdG9CZUdyZWF0ZXJUaGFuKGV4cGVjdGVkOiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgZXhwZWN0ZWQgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSBleHBlY3RlZFxuICAgKi9cbiAgdG9CZUdyZWF0ZXJUaGFuT3JFcXVhbChleHBlY3RlZDogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHZhbHVlIGlzIGFuIGluc3RhbmNlIG9mIGEgY2xhc3MuIFVzZXMgaW5zdGFuY2VvZiBvcGVyYXRvci5cbiAgICpcbiAgICogQHBhcmFtIGV4cGVjdGVkIFRoZSBjbGFzcyBvciBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAgICovXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgYmFuLXR5cGVzXG4gIHRvQmVJbnN0YW5jZU9mKGV4cGVjdGVkOiBGdW5jdGlvbik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBleHBlY3RlZCB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIGV4cGVjdGVkIHRoZSBleHBlY3RlZCB2YWx1ZVxuICAgKi9cbiAgdG9CZUxlc3NUaGFuKGV4cGVjdGVkOiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoYXQgdmFsdWUgPD0gZXhwZWN0ZWQgZm9yIG51bWJlciBvciBiaWcgaW50ZWdlciB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBleHBlY3RlZCBUaGUgdmFsdWUgdG8gY29tcGFyZSB0by5cbiAgICovXG4gIHRvQmVMZXNzVGhhbk9yRXF1YWwoZXhwZWN0ZWQ6IG51bWJlciB8IGJpZ2ludCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCB2YWx1ZSBpcyBOYU4uXG4gICAqL1xuICB0b0JlTmFOKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCB2YWx1ZSBpcyBudWxsLlxuICAgKi9cbiAgdG9CZU51bGwoKTogdm9pZDtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHZhbHVlIGlzIHRydWUgaW4gYSBib29sZWFuIGNvbnRleHQsIGFueXRoaW5nIGJ1dCBmYWxzZSwgMCwgJycsIG51bGwsIHVuZGVmaW5lZCBvciBOYU4uXG4gICAqIFVzZSB0aGlzIG1ldGhvZCB3aGVuIHlvdSBkb24ndCBjYXJlIGFib3V0IHRoZSBzcGVjaWZpYyB2YWx1ZS5cbiAgICovXG4gIHRvQmVUcnV0aHkoKTogdm9pZDtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHZhbHVlIGlzIGB1bmRlZmluZWRgLlxuICAgKi9cbiAgdG9CZVVuZGVmaW5lZCgpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHZhbHVlIGlzIGVxdWFsIHRvIHRoZSBleHBlY3RlZCB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIGV4cGVjdGVkIHRoZSBleHBlY3RlZCB2YWx1ZVxuICAgKi9cbiAgdG9FcXVhbChleHBlY3RlZDogdW5rbm93bik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCB2YWx1ZSBoYXMgYSBgLmxlbmd0aGAgcHJvcGVydHkgZXF1YWwgdG8gZXhwZWN0ZWQuXG4gICAqIFVzZWZ1bCBmb3IgYXJyYXlzIGFuZCBzdHJpbmdzLlxuICAgKlxuICAgKiBAcGFyYW0gZXhwZWN0ZWRcbiAgICovXG4gIHRvSGF2ZUxlbmd0aChleHBlY3RlZDogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IGEgc3RyaW5nIGNvbnRhaW5zIGFuIGV4cGVjdGVkIHN1YnN0cmluZyB1c2luZyBhIGNhc2Utc2Vuc2l0aXZlIGNvbXBhcmlzb24sXG4gICAqIG9yIHRoYXQgYW4gQXJyYXkgb3IgU2V0IGNvbnRhaW5zIGFuIGV4cGVjdGVkIGl0ZW0uXG4gICAqXG4gICAqIEBwYXJhbSBleHBlY3RlZCBUaGUgc3Vic3RyaW5nIG9yIGl0ZW0gdG8gY2hlY2sgZm9yXG4gICAqL1xuICB0b0NvbnRhaW4oZXhwZWN0ZWQ6IHVua25vd24pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoYXQgdmFsdWUgaXMgYW4gQXJyYXkgb3IgU2V0IGFuZCBjb250YWlucyBhbiBpdGVtIGVxdWFsIHRvIHRoZSBleHBlY3RlZC5cbiAgICpcbiAgICogRm9yIG9iamVjdHMsIHRoaXMgbWV0aG9kIHJlY3Vyc2l2ZWx5IGNoZWNrcyBlcXVhbGl0eSBvZiBhbGwgZmllbGRzLCByYXRoZXIgdGhhbiBjb21wYXJpbmcgb2JqZWN0cyBieSByZWZlcmVuY2UuXG4gICAqIEZvciBwcmltaXRpdmUgdmFsdWVzLCB0aGlzIG1ldGhvZCBpcyBlcXVpdmFsZW50IHRvIGV4cGVjdCh2YWx1ZSkudG9Db250YWluKCkuXG4gICAqXG4gICAqIEBwYXJhbSBleHBlY3RlZCBUaGUgaXRlbSB0byBjaGVjayBmb3IgZGVlcCBlcXVhbGl0eSB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cbiAgICovXG4gIHRvQ29udGFpbkVxdWFsKGV4cGVjdGVkOiB1bmtub3duKTogdm9pZDtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHByb3BlcnR5IGF0IHByb3ZpZGVkIGBrZXlQYXRoYCBleGlzdHMgb24gdGhlIG9iamVjdCBhbmQgb3B0aW9uYWxseSBjaGVja3NcbiAgICogdGhhdCBwcm9wZXJ0eSBpcyBlcXVhbCB0byB0aGUgZXhwZWN0ZWQuIEVxdWFsaXR5IGlzIGNoZWNrZWQgcmVjdXJzaXZlbHksIHNpbWlsYXJseSB0byBleHBlY3QodmFsdWUpLnRvRXF1YWwoKS5cbiAgICpcbiAgICogQHBhcmFtIGtleVBhdGggUGF0aCB0byB0aGUgcHJvcGVydHkuIFVzZSBkb3Qgbm90YXRpb24gYS5iIHRvIGNoZWNrIG5lc3RlZCBwcm9wZXJ0aWVzXG4gICAqICAgICAgICAgICAgICAgIGFuZCBpbmRleGVkIGFbMl0gbm90YXRpb24gdG8gY2hlY2sgbmVzdGVkIGFycmF5IGl0ZW1zLlxuICAgKiBAcGFyYW0gZXhwZWN0ZWQgT3B0aW9uYWwgZXhwZWN0ZWQgdmFsdWUgdG8gY29tcGFyZSB0aGUgcHJvcGVydHkgdG8uXG4gICAqL1xuICB0b0hhdmVQcm9wZXJ0eShrZXlQYXRoOiBzdHJpbmcsIGV4cGVjdGVkPzogdW5rbm93bik6IHZvaWQ7XG59XG5cbi8qKlxuICogY3JlYXRlRXhwZWN0YXRpb24gaXMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhbiBleHBlY3RhdGlvbiBvYmplY3QgZm9yIGEgZ2l2ZW4gdmFsdWUuXG4gKlxuICogSXQgZWZmZWN0aXZlbHkgaW1wbGVtZW50cyB0aGUgTm9uUmV0cnlpbmdFeHBlY3RhdGlvbiBpbnRlcmZhY2UsIGFuZCBwcm92aWRlcyB0aGUgYWN0dWFsXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgbWF0Y2hlcnMgYXR0YWNoZWQgdG8gdGhlIGV4cGVjdGF0aW9uIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gcmVjZWl2ZWQgdGhlIHZhbHVlIHRvIGNyZWF0ZSBhbiBleHBlY3RhdGlvbiBmb3JcbiAqIEBwYXJhbSBjb25maWcgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBleHBlY3RhdGlvblxuICogQHBhcmFtIG1lc3NhZ2UgdGhlIG9wdGlvbmFsIGN1c3RvbSBtZXNzYWdlIGZvciB0aGUgZXhwZWN0YXRpb25cbiAqIEBwYXJhbSBpc05lZ2F0ZWQgd2hldGhlciB0aGUgZXhwZWN0YXRpb24gaXMgbmVnYXRlZFxuICogQHJldHVybnMgYW4gZXhwZWN0YXRpb24gb2JqZWN0IG92ZXIgdGhlIGdpdmVuIHZhbHVlIGV4cG9zaW5nIHRoZSBFeHBlY3RhdGlvbiBzZXQgb2YgbWV0aG9kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXhwZWN0YXRpb24oXG4gIHJlY2VpdmVkOiB1bmtub3duLFxuICBjb25maWc6IEV4cGVjdENvbmZpZyxcbiAgbWVzc2FnZT86IHN0cmluZyxcbiAgaXNOZWdhdGVkOiBib29sZWFuID0gZmFsc2UsXG4pOiBOb25SZXRyeWluZ0V4cGVjdGF0aW9uIHtcbiAgLy8gSW4gb3JkZXIgdG8gZmFjaWxpdGF0ZSB0ZXN0aW5nLCB3ZSBzdXBwb3J0IHBhc3NpbmcgaW4gYSBjdXN0b20gYXNzZXJ0IGZ1bmN0aW9uLlxuICAvLyBBcyBhIHJlc3VsdCwgd2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYXNzZXJ0IGZ1bmN0aW9uIGlzIGFsd2F5cyBhdmFpbGFibGUsIGFuZFxuICAvLyBpZiBub3QsIHdlIG5lZWQgdG8gdXNlIHRoZSBkZWZhdWx0IGFzc2VydCBmdW5jdGlvbi5cbiAgLy9cbiAgLy8gRnJvbSB0aGlzIHBvaW50IGZvcndhcmQsIHdlIHdpbGwgdXNlIHRoZSBgdXNlZEFzc2VydGAgdmFyaWFibGUgdG8gcmVmZXIgdG8gdGhlIGFzc2VydCBmdW5jdGlvbi5cbiAgY29uc3QgdXNlZEFzc2VydCA9IGNvbmZpZy5hc3NlcnRGbiA/PyBhc3NlcnQ7XG5cbiAgLy8gQ29uZmlndXJlIHRoZSByZW5kZXJlciB3aXRoIHRoZSBjb2xvcml6ZSBvcHRpb24uXG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkuY29uZmlndXJlKHtcbiAgICBjb2xvcml6ZTogY29uZmlnLmNvbG9yaXplLFxuICAgIGRpc3BsYXk6IGNvbmZpZy5kaXNwbGF5LFxuICB9KTtcblxuICAvLyBSZWdpc3RlciByZW5kZXJlcnMgc3BlY2lmaWMgdG8gZWFjaCBtYXRjaGVycyBhdCBpbml0aWFsaXphdGlvbiB0aW1lLlxuICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LnJlZ2lzdGVyKFxuICAgIFwidG9CZVwiLFxuICAgIG5ldyBEZWZhdWx0TWF0Y2hlckVycm9yUmVuZGVyZXIoKSxcbiAgKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcbiAgICBcInRvQmVDbG9zZVRvXCIsXG4gICAgbmV3IFRvQmVDbG9zZVRvRXJyb3JSZW5kZXJlcigpLFxuICApO1xuICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LnJlZ2lzdGVyKFxuICAgIFwidG9CZURlZmluZWRcIixcbiAgICBuZXcgVG9CZURlZmluZWRFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0JlRmFsc3lcIixcbiAgICBuZXcgVG9CZUZhbHN5RXJyb3JSZW5kZXJlcigpLFxuICApO1xuICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LnJlZ2lzdGVyKFxuICAgIFwidG9CZUdyZWF0ZXJUaGFuXCIsXG4gICAgbmV3IFRvQmVHcmVhdGVyVGhhbkVycm9yUmVuZGVyZXIoKSxcbiAgKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcbiAgICBcInRvQmVHcmVhdGVyVGhhbk9yRXF1YWxcIixcbiAgICBuZXcgVG9CZUdyZWF0ZXJUaGFuT3JFcXVhbEVycm9yUmVuZGVyZXIoKSxcbiAgKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcbiAgICBcInRvQmVJbnN0YW5jZU9mXCIsXG4gICAgbmV3IFRvQmVJbnN0YW5jZU9mRXJyb3JSZW5kZXJlcigpLFxuICApO1xuICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LnJlZ2lzdGVyKFxuICAgIFwidG9CZUxlc3NUaGFuXCIsXG4gICAgbmV3IFRvQmVMZXNzVGhhbkVycm9yUmVuZGVyZXIoKSxcbiAgKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcbiAgICBcInRvQmVMZXNzVGhhbk9yRXF1YWxcIixcbiAgICBuZXcgVG9CZUxlc3NUaGFuT3JFcXVhbEVycm9yUmVuZGVyZXIoKSxcbiAgKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcInRvQmVOYU5cIiwgbmV3IFRvQmVOYU5FcnJvclJlbmRlcmVyKCkpO1xuICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LnJlZ2lzdGVyKFxuICAgIFwidG9CZU51bGxcIixcbiAgICBuZXcgVG9CZU51bGxFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0JlVHJ1dGh5XCIsXG4gICAgbmV3IFRvQmVUcnV0aHlFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0JlVW5kZWZpbmVkXCIsXG4gICAgbmV3IFRvQmVVbmRlZmluZWRFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXCJ0b0VxdWFsXCIsIG5ldyBUb0VxdWFsRXJyb3JSZW5kZXJlcigpKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcbiAgICBcInRvSGF2ZUxlbmd0aFwiLFxuICAgIG5ldyBUb0hhdmVMZW5ndGhFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0NvbnRhaW5cIixcbiAgICBuZXcgVG9Db250YWluRXJyb3JSZW5kZXJlcigpLFxuICApO1xuICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LnJlZ2lzdGVyKFxuICAgIFwidG9Db250YWluRXF1YWxcIixcbiAgICBuZXcgVG9Db250YWluRXF1YWxFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0hhdmVQcm9wZXJ0eVwiLFxuICAgIG5ldyBUb0hhdmVQcm9wZXJ0eUVycm9yUmVuZGVyZXIoKSxcbiAgKTtcblxuICBjb25zdCBtYXRjaGVyQ29uZmlnID0ge1xuICAgIHVzZWRBc3NlcnQsXG4gICAgaXNTb2Z0OiBjb25maWcuc29mdCxcbiAgICBpc05lZ2F0ZWQsXG4gICAgbWVzc2FnZSxcbiAgICBzb2Z0TW9kZTogY29uZmlnLnNvZnRNb2RlLFxuICB9O1xuXG4gIGNvbnN0IGV4cGVjdGF0aW9uOiBOb25SZXRyeWluZ0V4cGVjdGF0aW9uID0ge1xuICAgIGdldCBub3QoKTogTm9uUmV0cnlpbmdFeHBlY3RhdGlvbiB7XG4gICAgICByZXR1cm4gY3JlYXRlRXhwZWN0YXRpb24ocmVjZWl2ZWQsIGNvbmZpZywgbWVzc2FnZSwgIWlzTmVnYXRlZCk7XG4gICAgfSxcblxuICAgIHRvQmUoZXhwZWN0ZWQ6IHVua25vd24pOiB2b2lkIHtcbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZVwiLFxuICAgICAgICAoKSA9PiBPYmplY3QuaXMocmVjZWl2ZWQsIGV4cGVjdGVkKSxcbiAgICAgICAgZXhwZWN0ZWQsXG4gICAgICAgIHJlY2VpdmVkLFxuICAgICAgICBtYXRjaGVyQ29uZmlnLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdG9CZUNsb3NlVG8oZXhwZWN0ZWQ6IG51bWJlciwgcHJlY2lzaW9uOiBudW1iZXIgPSAyKTogdm9pZCB7XG4gICAgICBjb25zdCB0b2xlcmFuY2UgPSBNYXRoLnBvdygxMCwgLXByZWNpc2lvbikgKlxuICAgICAgICBNYXRoLm1heChNYXRoLmFicyhyZWNlaXZlZCBhcyBudW1iZXIpLCBNYXRoLmFicyhleHBlY3RlZCkpO1xuICAgICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKChyZWNlaXZlZCBhcyBudW1iZXIpIC0gZXhwZWN0ZWQpO1xuXG4gICAgICBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVDbG9zZVRvXCIsXG4gICAgICAgICgpID0+IGRpZmYgPCB0b2xlcmFuY2UsXG4gICAgICAgIGV4cGVjdGVkLFxuICAgICAgICByZWNlaXZlZCxcbiAgICAgICAge1xuICAgICAgICAgIC4uLm1hdGNoZXJDb25maWcsXG4gICAgICAgICAgbWF0Y2hlclNwZWNpZmljOiB7XG4gICAgICAgICAgICBwcmVjaXNpb24sXG4gICAgICAgICAgICBkaWZmZXJlbmNlOiBkaWZmLFxuICAgICAgICAgICAgZXhwZWN0ZWREaWZmZXJlbmNlOiB0b2xlcmFuY2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRvQmVEZWZpbmVkKCk6IHZvaWQge1xuICAgICAgY3JlYXRlTWF0Y2hlcihcbiAgICAgICAgXCJ0b0JlRGVmaW5lZFwiLFxuICAgICAgICAoKSA9PiByZWNlaXZlZCAhPT0gdW5kZWZpbmVkLFxuICAgICAgICBcImRlZmluZWRcIixcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkocmVjZWl2ZWQpLFxuICAgICAgICBtYXRjaGVyQ29uZmlnLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdG9CZUZhbHN5KCk6IHZvaWQge1xuICAgICAgY3JlYXRlTWF0Y2hlcihcbiAgICAgICAgXCJ0b0JlRmFsc3lcIixcbiAgICAgICAgKCkgPT4gIXJlY2VpdmVkLFxuICAgICAgICBcImZhbHN5XCIsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHJlY2VpdmVkKSxcbiAgICAgICAgbWF0Y2hlckNvbmZpZyxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRvQmVHcmVhdGVyVGhhbihleHBlY3RlZDogbnVtYmVyIHwgYmlnaW50KTogdm9pZCB7XG4gICAgICBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVHcmVhdGVyVGhhblwiLFxuICAgICAgICAoKSA9PiAocmVjZWl2ZWQgYXMgbnVtYmVyKSA+IGV4cGVjdGVkLFxuICAgICAgICBleHBlY3RlZCxcbiAgICAgICAgcmVjZWl2ZWQsXG4gICAgICAgIG1hdGNoZXJDb25maWcsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0b0JlR3JlYXRlclRoYW5PckVxdWFsKGV4cGVjdGVkOiBudW1iZXIgfCBiaWdpbnQpOiB2b2lkIHtcbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZUdyZWF0ZXJUaGFuT3JFcXVhbFwiLFxuICAgICAgICAoKSA9PiAocmVjZWl2ZWQgYXMgbnVtYmVyKSA+PSBleHBlY3RlZCxcbiAgICAgICAgZXhwZWN0ZWQsXG4gICAgICAgIHJlY2VpdmVkLFxuICAgICAgICBtYXRjaGVyQ29uZmlnLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBiYW4tdHlwZXNcbiAgICB0b0JlSW5zdGFuY2VPZihleHBlY3RlZDogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZUluc3RhbmNlT2ZcIixcbiAgICAgICAgKCkgPT4gcmVjZWl2ZWQgaW5zdGFuY2VvZiBleHBlY3RlZCxcbiAgICAgICAgZXhwZWN0ZWQubmFtZSxcbiAgICAgICAgKHJlY2VpdmVkIGFzIHsgY29uc3RydWN0b3I6IHsgbmFtZTogc3RyaW5nIH0gfSkuY29uc3RydWN0b3IubmFtZSxcbiAgICAgICAgbWF0Y2hlckNvbmZpZyxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRvQmVMZXNzVGhhbihleHBlY3RlZDogbnVtYmVyIHwgYmlnaW50KTogdm9pZCB7XG4gICAgICBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVMZXNzVGhhblwiLFxuICAgICAgICAoKSA9PiAocmVjZWl2ZWQgYXMgbnVtYmVyKSA8IGV4cGVjdGVkLFxuICAgICAgICBleHBlY3RlZCxcbiAgICAgICAgcmVjZWl2ZWQsXG4gICAgICAgIG1hdGNoZXJDb25maWcsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0b0JlTGVzc1RoYW5PckVxdWFsKGV4cGVjdGVkOiBudW1iZXIgfCBiaWdpbnQpOiB2b2lkIHtcbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZUxlc3NUaGFuT3JFcXVhbFwiLFxuICAgICAgICAoKSA9PiAocmVjZWl2ZWQgYXMgbnVtYmVyKSA8PSBleHBlY3RlZCxcbiAgICAgICAgZXhwZWN0ZWQsXG4gICAgICAgIHJlY2VpdmVkLFxuICAgICAgICBtYXRjaGVyQ29uZmlnLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdG9CZU5hTigpOiB2b2lkIHtcbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZU5hTlwiLFxuICAgICAgICAoKSA9PiBpc05hTihyZWNlaXZlZCBhcyBudW1iZXIpLFxuICAgICAgICBcIk5hTlwiLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShyZWNlaXZlZCksXG4gICAgICAgIG1hdGNoZXJDb25maWcsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0b0JlTnVsbCgpOiB2b2lkIHtcbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZU51bGxcIixcbiAgICAgICAgKCkgPT4gcmVjZWl2ZWQgPT09IG51bGwsXG4gICAgICAgIFwibnVsbFwiLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShyZWNlaXZlZCksXG4gICAgICAgIG1hdGNoZXJDb25maWcsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0b0JlVHJ1dGh5KCk6IHZvaWQge1xuICAgICAgY3JlYXRlTWF0Y2hlcihcbiAgICAgICAgXCJ0b0JlVHJ1dGh5XCIsXG4gICAgICAgICgpID0+ICEhcmVjZWl2ZWQsXG4gICAgICAgIFwidHJ1dGh5XCIsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHJlY2VpdmVkKSxcbiAgICAgICAgbWF0Y2hlckNvbmZpZyxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRvQmVVbmRlZmluZWQoKTogdm9pZCB7XG4gICAgICBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVVbmRlZmluZWRcIixcbiAgICAgICAgKCkgPT4gcmVjZWl2ZWQgPT09IHVuZGVmaW5lZCxcbiAgICAgICAgXCJ1bmRlZmluZWRcIixcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkocmVjZWl2ZWQpLFxuICAgICAgICBtYXRjaGVyQ29uZmlnLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdG9FcXVhbChleHBlY3RlZDogdW5rbm93bik6IHZvaWQge1xuICAgICAgY3JlYXRlTWF0Y2hlcihcbiAgICAgICAgXCJ0b0VxdWFsXCIsXG4gICAgICAgICgpID0+IGlzRGVlcEVxdWFsKHJlY2VpdmVkLCBleHBlY3RlZCksXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KGV4cGVjdGVkKSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkocmVjZWl2ZWQpLFxuICAgICAgICBtYXRjaGVyQ29uZmlnLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdG9IYXZlTGVuZ3RoKGV4cGVjdGVkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9IYXZlTGVuZ3RoXCIsXG4gICAgICAgICgpID0+IChyZWNlaXZlZCBhcyBBcnJheTx1bmtub3duPikubGVuZ3RoID09PSBleHBlY3RlZCxcbiAgICAgICAgZXhwZWN0ZWQudG9TdHJpbmcoKSxcbiAgICAgICAgKHJlY2VpdmVkIGFzIEFycmF5PHVua25vd24+KS5sZW5ndGgudG9TdHJpbmcoKSxcbiAgICAgICAgbWF0Y2hlckNvbmZpZyxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRvQ29udGFpbihleHBlY3RlZDogdW5rbm93bik6IHZvaWQge1xuICAgICAgbGV0IHJlY2VpdmVkVHlwZSA9IFwiXCI7XG4gICAgICBpZiAodHlwZW9mIHJlY2VpdmVkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJlY2VpdmVkVHlwZSA9IFwic3RyaW5nXCI7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVjZWl2ZWQpKSB7XG4gICAgICAgIHJlY2VpdmVkVHlwZSA9IFwiYXJyYXlcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjZWl2ZWQgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgcmVjZWl2ZWRUeXBlID0gXCJzZXRcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcInRvQ29udGFpbiBpcyBvbmx5IHN1cHBvcnRlZCBmb3Igc3RyaW5ncywgYXJyYXlzLCBhbmQgc2V0c1wiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY3JlYXRlTWF0Y2hlcihcbiAgICAgICAgXCJ0b0NvbnRhaW5cIixcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgcmVjZWl2ZWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWNlaXZlZC5pbmNsdWRlcyhleHBlY3RlZCBhcyBzdHJpbmcpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZWNlaXZlZCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZWNlaXZlZC5pbmNsdWRlcyhleHBlY3RlZCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZWNlaXZlZCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20ocmVjZWl2ZWQpLmluY2x1ZGVzKGV4cGVjdGVkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcInRvQ29udGFpbiBpcyBvbmx5IHN1cHBvcnRlZCBmb3Igc3RyaW5ncywgYXJyYXlzLCBhbmQgc2V0c1wiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGV4cGVjdGVkLFxuICAgICAgICByZWNlaXZlZCxcbiAgICAgICAge1xuICAgICAgICAgIC4uLm1hdGNoZXJDb25maWcsXG4gICAgICAgICAgbWF0Y2hlclNwZWNpZmljOiB7XG4gICAgICAgICAgICByZWNlaXZlZFR5cGUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRvQ29udGFpbkVxdWFsKGV4cGVjdGVkOiB1bmtub3duKTogdm9pZCB7XG4gICAgICBsZXQgcmVjZWl2ZWRUeXBlID0gXCJcIjtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlY2VpdmVkKSkge1xuICAgICAgICByZWNlaXZlZFR5cGUgPSBcImFycmF5XCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY2VpdmVkIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgIHJlY2VpdmVkVHlwZSA9IFwic2V0XCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJ0b0NvbnRhaW5FcXVhbCBpcyBvbmx5IHN1cHBvcnRlZCBmb3IgYXJyYXlzIGFuZCBzZXRzXCIsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9Db250YWluRXF1YWxcIixcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlY2VpdmVkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVkLnNvbWUoKGl0ZW0pID0+IGlzRGVlcEVxdWFsKGl0ZW0sIGV4cGVjdGVkKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZWNlaXZlZCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20ocmVjZWl2ZWQpLnNvbWUoKGl0ZW0pID0+XG4gICAgICAgICAgICAgIGlzRGVlcEVxdWFsKGl0ZW0sIGV4cGVjdGVkKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcInRvQ29udGFpbkVxdWFsIGlzIG9ubHkgc3VwcG9ydGVkIGZvciBhcnJheXMgYW5kIHNldHNcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBleHBlY3RlZCxcbiAgICAgICAgcmVjZWl2ZWQsXG4gICAgICAgIHtcbiAgICAgICAgICAuLi5tYXRjaGVyQ29uZmlnLFxuICAgICAgICAgIG1hdGNoZXJTcGVjaWZpYzoge1xuICAgICAgICAgICAgcmVjZWl2ZWRUeXBlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0b0hhdmVQcm9wZXJ0eShrZXlQYXRoOiBzdHJpbmcsIGV4cGVjdGVkPzogdW5rbm93bik6IHZvaWQge1xuICAgICAgaWYgKHR5cGVvZiByZWNlaXZlZCAhPT0gXCJvYmplY3RcIiB8fCByZWNlaXZlZCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJ0b0hhdmVQcm9wZXJ0eSBpcyBvbmx5IHN1cHBvcnRlZCBmb3Igb2JqZWN0c1wiLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNQcm9wZXJ0eSA9ICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFByb3BlcnR5QnlQYXRoKFxuICAgICAgICAgICAgcmVjZWl2ZWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gICAgICAgICAgICBrZXlQYXRoLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV4cGVjdGVkICE9PSB1bmRlZmluZWQgPyBpc0RlZXBFcXVhbCh2YWx1ZSwgZXhwZWN0ZWQpIDogdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY3JlYXRlTWF0Y2hlcihcbiAgICAgICAgXCJ0b0hhdmVQcm9wZXJ0eVwiLFxuICAgICAgICBoYXNQcm9wZXJ0eSxcbiAgICAgICAgZXhwZWN0ZWQgIT09IHVuZGVmaW5lZCA/IGV4cGVjdGVkIDoga2V5UGF0aCxcbiAgICAgICAgcmVjZWl2ZWQsXG4gICAgICAgIHtcbiAgICAgICAgICAuLi5tYXRjaGVyQ29uZmlnLFxuICAgICAgICAgIG1hdGNoZXJTcGVjaWZpYzoge1xuICAgICAgICAgICAga2V5UGF0aCxcbiAgICAgICAgICAgIGhhc0V4cGVjdGVkVmFsdWU6IGV4cGVjdGVkICE9PSB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gZXhwZWN0YXRpb247XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBoYW5kbGUgY29tbW9uIG1hdGNoZXIgbG9naWNcbmZ1bmN0aW9uIGNyZWF0ZU1hdGNoZXIoXG4gIG1hdGNoZXJOYW1lOiBzdHJpbmcsXG4gIGNoZWNrRm46ICgpID0+IGJvb2xlYW4sXG4gIGV4cGVjdGVkOiB1bmtub3duLFxuICByZWNlaXZlZDogdW5rbm93bixcbiAge1xuICAgIHVzZWRBc3NlcnQsXG4gICAgaXNTb2Z0LFxuICAgIGlzTmVnYXRlZCA9IGZhbHNlLFxuICAgIG1hdGNoZXJTcGVjaWZpYyA9IHt9LFxuICAgIG1lc3NhZ2UsXG4gICAgc29mdE1vZGUsXG4gIH06IHtcbiAgICB1c2VkQXNzZXJ0OiB0eXBlb2YgYXNzZXJ0O1xuICAgIGlzU29mdDogYm9vbGVhbjtcbiAgICBpc05lZ2F0ZWQ/OiBib29sZWFuO1xuICAgIG1hdGNoZXJTcGVjaWZpYz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIG1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgc29mdE1vZGU/OiBTb2Z0TW9kZTtcbiAgfSxcbik6IHZvaWQge1xuICBjb25zdCBpbmZvID0gY3JlYXRlTWF0Y2hlckluZm8oXG4gICAgbWF0Y2hlck5hbWUsXG4gICAgZXhwZWN0ZWQsXG4gICAgcmVjZWl2ZWQsXG4gICAgeyAuLi5tYXRjaGVyU3BlY2lmaWMsIGlzTmVnYXRlZCB9LFxuICAgIG1lc3NhZ2UsXG4gICk7XG5cbiAgY29uc3QgcmVzdWx0ID0gY2hlY2tGbigpO1xuICAvLyBJZiBpc05lZ2F0ZWQgaXMgdHJ1ZSwgd2Ugd2FudCB0byBpbnZlcnQgdGhlIHJlc3VsdFxuICBjb25zdCBmaW5hbFJlc3VsdCA9IGlzTmVnYXRlZCA/ICFyZXN1bHQgOiByZXN1bHQ7XG5cbiAgdXNlZEFzc2VydChcbiAgICBmaW5hbFJlc3VsdCxcbiAgICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LmdldFJlbmRlcmVyKG1hdGNoZXJOYW1lKS5yZW5kZXIoXG4gICAgICBpbmZvLFxuICAgICAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5nZXRDb25maWcoKSxcbiAgICApLFxuICAgIGlzU29mdCxcbiAgICBzb2Z0TW9kZSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWF0Y2hlckluZm8oXG4gIG1hdGNoZXJOYW1lOiBzdHJpbmcsXG4gIGV4cGVjdGVkOiBzdHJpbmcgfCB1bmtub3duLFxuICByZWNlaXZlZDogdW5rbm93bixcbiAgbWF0Y2hlclNwZWNpZmljOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9LFxuICBjdXN0b21NZXNzYWdlPzogc3RyaW5nLFxuKTogTWF0Y2hlckVycm9ySW5mbyB7XG4gIGNvbnN0IHN0YWNrdHJhY2UgPSBwYXJzZVN0YWNrVHJhY2UobmV3IEVycm9yKCkuc3RhY2spO1xuICBjb25zdCBleGVjdXRpb25Db250ZXh0ID0gY2FwdHVyZUV4ZWN1dGlvbkNvbnRleHQoc3RhY2t0cmFjZSk7XG5cbiAgaWYgKCFleGVjdXRpb25Db250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiazYgZmFpbGVkIHRvIGNhcHR1cmUgZXhlY3V0aW9uIGNvbnRleHRcIik7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGV4ZWN1dGlvbkNvbnRleHQsXG4gICAgbWF0Y2hlck5hbWUsXG4gICAgZXhwZWN0ZWQ6IHR5cGVvZiBleHBlY3RlZCA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBleHBlY3RlZFxuICAgICAgOiBKU09OLnN0cmluZ2lmeShleHBlY3RlZCksXG4gICAgcmVjZWl2ZWQ6IEpTT04uc3RyaW5naWZ5KHJlY2VpdmVkKSxcbiAgICBtYXRjaGVyU3BlY2lmaWMsXG4gICAgY3VzdG9tTWVzc2FnZSxcbiAgfTtcbn1cblxuLyoqXG4gKiBBIG1hdGNoZXIgZXJyb3IgcmVuZGVyZXIgZm9yIHRoZSBgdG9CZUNsb3NlVG9gIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0JlQ2xvc2VUb0Vycm9yUmVuZGVyZXIgZXh0ZW5kcyBFeHBlY3RlZFJlY2VpdmVkTWF0Y2hlclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwidG9CZUNsb3NlVG9cIjtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRTcGVjaWZpY0xpbmVzKFxuICAgIGluZm86IE1hdGNoZXJFcnJvckluZm8sXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBMaW5lR3JvdXBbXSB7XG4gICAgY29uc3QgbWF0Y2hlckluZm8gPSBpbmZvLm1hdGNoZXJTcGVjaWZpYyBhcyB7XG4gICAgICBwcmVjaXNpb246IG51bWJlcjtcbiAgICAgIGRpZmZlcmVuY2U6IG51bWJlcjtcbiAgICAgIGV4cGVjdGVkRGlmZmVyZW5jZTogbnVtYmVyO1xuICAgIH07XG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogXCJFeHBlY3RlZCBwcmVjaXNpb25cIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUobWF0Y2hlckluZm8ucHJlY2lzaW9uLnRvU3RyaW5nKCksIFwiZ3JlZW5cIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiRXhwZWN0ZWQgZGlmZmVyZW5jZVwiLFxuICAgICAgICB2YWx1ZTogXCI8IFwiICtcbiAgICAgICAgICBtYXliZUNvbG9yaXplKGAke21hdGNoZXJJbmZvLmV4cGVjdGVkRGlmZmVyZW5jZX1gLCBcImdyZWVuXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIlJlY2VpdmVkIGRpZmZlcmVuY2VcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUobWF0Y2hlckluZm8uZGlmZmVyZW5jZS50b1N0cmluZygpLCBcInJlZFwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgIF07XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgcmVuZGVyTWF0Y2hlckFyZ3MoXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBzdHJpbmcge1xuICAgIHJldHVybiBtYXliZUNvbG9yaXplKGAoYCwgXCJkYXJrR3JleVwiKSArXG4gICAgICBtYXliZUNvbG9yaXplKGBleHBlY3RlZGAsIFwiZ3JlZW5cIikgK1xuICAgICAgbWF5YmVDb2xvcml6ZShgLCBgLCBcImRhcmtHcmV5XCIpICtcbiAgICAgIG1heWJlQ29sb3JpemUoYHByZWNpc2lvbmAsIFwid2hpdGVcIikgK1xuICAgICAgbWF5YmVDb2xvcml6ZShgKWAsIFwiZGFya0dyZXlcIik7XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1hdGNoZXIgZXJyb3IgcmVuZGVyZXIgZm9yIHRoZSBgdG9CZURlZmluZWRgIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0JlRGVmaW5lZEVycm9yUmVuZGVyZXIgZXh0ZW5kcyBSZWNlaXZlZE9ubHlNYXRjaGVyUmVuZGVyZXIge1xuICBwcm90ZWN0ZWQgZ2V0TWF0Y2hlck5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gXCJ0b0JlRGVmaW5lZFwiO1xuICB9XG59XG5cbi8qKlxuICogQSBtYXRjaGVyIGVycm9yIHJlbmRlcmVyIGZvciB0aGUgYHRvQmVGYWxzeWAgbWF0Y2hlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvQmVGYWxzeUVycm9yUmVuZGVyZXIgZXh0ZW5kcyBSZWNlaXZlZE9ubHlNYXRjaGVyUmVuZGVyZXIge1xuICBwcm90ZWN0ZWQgZ2V0TWF0Y2hlck5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gXCJ0b0JlRmFsc3lcIjtcbiAgfVxufVxuXG4vKipcbiAqIEEgbWF0Y2hlciBlcnJvciByZW5kZXJlciBmb3IgdGhlIGB0b0JlR3JlYXRlclRoYW5gIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0JlR3JlYXRlclRoYW5FcnJvclJlbmRlcmVyXG4gIGV4dGVuZHMgRXhwZWN0ZWRSZWNlaXZlZE1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvQmVHcmVhdGVyVGhhblwiO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGdldFNwZWNpZmljTGluZXMoXG4gICAgaW5mbzogTWF0Y2hlckVycm9ySW5mbyxcbiAgICBtYXliZUNvbG9yaXplOiAodGV4dDogc3RyaW5nLCBjb2xvcjoga2V5b2YgdHlwZW9mIEFOU0lfQ09MT1JTKSA9PiBzdHJpbmcsXG4gICk6IExpbmVHcm91cFtdIHtcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogXCJFeHBlY3RlZFwiLFxuICAgICAgICB2YWx1ZTogXCI+IFwiICsgbWF5YmVDb2xvcml6ZShpbmZvLmV4cGVjdGVkLCBcImdyZWVuXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIlJlY2VpdmVkXCIsXG4gICAgICAgIHZhbHVlOiBtYXliZUNvbG9yaXplKGluZm8ucmVjZWl2ZWQsIFwicmVkXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgXTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbWF0Y2hlciBlcnJvciByZW5kZXJlciBmb3IgdGhlIGB0b0JlR3JlYXRlclRoYW5PckVxdWFsYCBtYXRjaGVyLlxuICovXG5leHBvcnQgY2xhc3MgVG9CZUdyZWF0ZXJUaGFuT3JFcXVhbEVycm9yUmVuZGVyZXJcbiAgZXh0ZW5kcyBFeHBlY3RlZFJlY2VpdmVkTWF0Y2hlclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwidG9CZUdyZWF0ZXJUaGFuT3JFcXVhbFwiO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGdldFNwZWNpZmljTGluZXMoXG4gICAgaW5mbzogTWF0Y2hlckVycm9ySW5mbyxcbiAgICBtYXliZUNvbG9yaXplOiAodGV4dDogc3RyaW5nLCBjb2xvcjoga2V5b2YgdHlwZW9mIEFOU0lfQ09MT1JTKSA9PiBzdHJpbmcsXG4gICk6IExpbmVHcm91cFtdIHtcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogXCJFeHBlY3RlZFwiLFxuICAgICAgICB2YWx1ZTogXCI+PSBcIiArIG1heWJlQ29sb3JpemUoaW5mby5leHBlY3RlZCwgXCJncmVlblwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJSZWNlaXZlZFwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLnJlY2VpdmVkLCBcInJlZFwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgIF07XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1hdGNoZXIgZXJyb3IgcmVuZGVyZXIgZm9yIHRoZSBgdG9CZUluc3RhbmNlT2ZgIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0JlSW5zdGFuY2VPZkVycm9yUmVuZGVyZXJcbiAgZXh0ZW5kcyBFeHBlY3RlZFJlY2VpdmVkTWF0Y2hlclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwidG9CZUluc3RhbmNlT2ZcIjtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRTcGVjaWZpY0xpbmVzKFxuICAgIGluZm86IE1hdGNoZXJFcnJvckluZm8sXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBMaW5lR3JvdXBbXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiRXhwZWN0ZWQgY29uc3RydWN0b3JcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5leHBlY3RlZCwgXCJncmVlblwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJSZWNlaXZlZCBjb25zdHJ1Y3RvclwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLnJlY2VpdmVkLCBcInJlZFwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgIF07XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1hdGNoZXIgZXJyb3IgcmVuZGVyZXIgZm9yIHRoZSBgdG9CZUxlc3NUaGFuYCBtYXRjaGVyLlxuICovXG5leHBvcnQgY2xhc3MgVG9CZUxlc3NUaGFuRXJyb3JSZW5kZXJlciBleHRlbmRzIEV4cGVjdGVkUmVjZWl2ZWRNYXRjaGVyUmVuZGVyZXIge1xuICBwcm90ZWN0ZWQgZ2V0TWF0Y2hlck5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gXCJ0b0JlTGVzc1RoYW5cIjtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRTcGVjaWZpY0xpbmVzKFxuICAgIGluZm86IE1hdGNoZXJFcnJvckluZm8sXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBMaW5lR3JvdXBbXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiRXhwZWN0ZWRcIixcbiAgICAgICAgdmFsdWU6IFwiPCBcIiArIG1heWJlQ29sb3JpemUoaW5mby5leHBlY3RlZCwgXCJncmVlblwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJSZWNlaXZlZFwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLnJlY2VpdmVkLCBcInJlZFwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgIF07XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1hdGNoZXIgZXJyb3IgcmVuZGVyZXIgZm9yIHRoZSBgdG9CZUxlc3NUaGFuT3JFcXVhbGAgbWF0Y2hlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvQmVMZXNzVGhhbk9yRXF1YWxFcnJvclJlbmRlcmVyXG4gIGV4dGVuZHMgRXhwZWN0ZWRSZWNlaXZlZE1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvQmVMZXNzVGhhbk9yRXF1YWxcIjtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRTcGVjaWZpY0xpbmVzKFxuICAgIGluZm86IE1hdGNoZXJFcnJvckluZm8sXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBMaW5lR3JvdXBbXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiRXhwZWN0ZWRcIixcbiAgICAgICAgdmFsdWU6IFwiPD0gXCIgKyBtYXliZUNvbG9yaXplKGluZm8uZXhwZWN0ZWQsIFwiZ3JlZW5cIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiUmVjZWl2ZWRcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5yZWNlaXZlZCwgXCJyZWRcIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICBdO1xuICB9XG59XG5cbi8qKlxuICogQSBtYXRjaGVyIGVycm9yIHJlbmRlcmVyIGZvciB0aGUgYHRvQmVOYU5gIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0JlTmFORXJyb3JSZW5kZXJlciBleHRlbmRzIFJlY2VpdmVkT25seU1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvQmVOYU5cIjtcbiAgfVxufVxuXG4vKipcbiAqIEEgbWF0Y2hlciBlcnJvciByZW5kZXJlciBmb3IgdGhlIGB0b0JlTnVsbGAgbWF0Y2hlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvQmVOdWxsRXJyb3JSZW5kZXJlciBleHRlbmRzIFJlY2VpdmVkT25seU1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvQmVOdWxsXCI7XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1hdGNoZXIgZXJyb3IgcmVuZGVyZXIgZm9yIHRoZSBgdG9CZVRydXRoeWAgbWF0Y2hlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvQmVUcnV0aHlFcnJvclJlbmRlcmVyIGV4dGVuZHMgUmVjZWl2ZWRPbmx5TWF0Y2hlclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwidG9CZVRydXRoeVwiO1xuICB9XG59XG5cbi8qKlxuICogQSBtYXRjaGVyIGVycm9yIHJlbmRlcmVyIGZvciB0aGUgYHRvQmVVbmRlZmluZWRgIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0JlVW5kZWZpbmVkRXJyb3JSZW5kZXJlciBleHRlbmRzIFJlY2VpdmVkT25seU1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvQmVVbmRlZmluZWRcIjtcbiAgfVxufVxuXG4vKipcbiAqIEEgbWF0Y2hlciBlcnJvciByZW5kZXJlciBmb3IgdGhlIGB0b0VxdWFsYCBtYXRjaGVyLlxuICovXG5leHBvcnQgY2xhc3MgVG9FcXVhbEVycm9yUmVuZGVyZXIgZXh0ZW5kcyBFeHBlY3RlZFJlY2VpdmVkTWF0Y2hlclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwidG9FcXVhbFwiO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGdldFNwZWNpZmljTGluZXMoXG4gICAgaW5mbzogTWF0Y2hlckVycm9ySW5mbyxcbiAgICBtYXliZUNvbG9yaXplOiAodGV4dDogc3RyaW5nLCBjb2xvcjoga2V5b2YgdHlwZW9mIEFOU0lfQ09MT1JTKSA9PiBzdHJpbmcsXG4gICk6IExpbmVHcm91cFtdIHtcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogXCJFeHBlY3RlZFwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLmV4cGVjdGVkLCBcImdyZWVuXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIlJlY2VpdmVkXCIsXG4gICAgICAgIHZhbHVlOiBtYXliZUNvbG9yaXplKGluZm8ucmVjZWl2ZWQsIFwicmVkXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgXTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbWF0Y2hlciBlcnJvciByZW5kZXJlciBmb3IgdGhlIGB0b0hhdmVMZW5ndGhgIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0hhdmVMZW5ndGhFcnJvclJlbmRlcmVyIGV4dGVuZHMgRXhwZWN0ZWRSZWNlaXZlZE1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvSGF2ZUxlbmd0aFwiO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGdldFNwZWNpZmljTGluZXMoXG4gICAgaW5mbzogTWF0Y2hlckVycm9ySW5mbyxcbiAgICBtYXliZUNvbG9yaXplOiAodGV4dDogc3RyaW5nLCBjb2xvcjoga2V5b2YgdHlwZW9mIEFOU0lfQ09MT1JTKSA9PiBzdHJpbmcsXG4gICk6IExpbmVHcm91cFtdIHtcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogXCJFeHBlY3RlZCBsZW5ndGhcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5leHBlY3RlZCwgXCJncmVlblwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJSZWNlaXZlZCBsZW5ndGhcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5yZWNlaXZlZCwgXCJyZWRcIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiUmVjZWl2ZWQgYXJyYXlcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoXG4gICAgICAgICAgaW5mby5tYXRjaGVyU3BlY2lmaWM/LnJlY2VpdmVkQXJyYXkgYXMgc3RyaW5nLFxuICAgICAgICAgIFwicmVkXCIsXG4gICAgICAgICksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICBdO1xuICB9XG59XG5cbi8qKlxuICogQSBtYXRjaGVyIGVycm9yIHJlbmRlcmVyIGZvciB0aGUgYHRvQ29udGFpbmAgbWF0Y2hlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvQ29udGFpbkVycm9yUmVuZGVyZXIgZXh0ZW5kcyBFeHBlY3RlZFJlY2VpdmVkTWF0Y2hlclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwidG9Db250YWluXCI7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgZ2V0U3BlY2lmaWNMaW5lcyhcbiAgICBpbmZvOiBNYXRjaGVyRXJyb3JJbmZvLFxuICAgIG1heWJlQ29sb3JpemU6ICh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBrZXlvZiB0eXBlb2YgQU5TSV9DT0xPUlMpID0+IHN0cmluZyxcbiAgKTogTGluZUdyb3VwW10ge1xuICAgIGNvbnN0IGlzTmVnYXRlZCA9IGluZm8ubWF0Y2hlclNwZWNpZmljPy5pc05lZ2F0ZWQgYXMgYm9vbGVhbjtcbiAgICBjb25zdCByZWNlaXZlZFR5cGUgPSB0eXBlb2YgaW5mby5tYXRjaGVyU3BlY2lmaWM/LnJlY2VpdmVkVHlwZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBpbmZvLm1hdGNoZXJTcGVjaWZpYz8ucmVjZWl2ZWRUeXBlIGFzIHN0cmluZ1xuICAgICAgOiBBcnJheS5pc0FycmF5KEpTT04ucGFyc2UoaW5mby5yZWNlaXZlZCkpXG4gICAgICA/IFwiYXJyYXlcIlxuICAgICAgOiBcInN0cmluZ1wiO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IGlzTmVnYXRlZCA/IFwiRXhwZWN0ZWQgbm90IHRvIGNvbnRhaW5cIiA6IFwiRXhwZWN0ZWQgdG8gY29udGFpblwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLmV4cGVjdGVkLCBcImdyZWVuXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBgUmVjZWl2ZWQgJHtyZWNlaXZlZFR5cGV9YCxcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5yZWNlaXZlZCwgXCJyZWRcIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICBdO1xuICB9XG59XG5cbi8qKlxuICogQSBtYXRjaGVyIGVycm9yIHJlbmRlcmVyIGZvciB0aGUgYHRvQ29udGFpbkVxdWFsYCBtYXRjaGVyLlxuICovXG5leHBvcnQgY2xhc3MgVG9Db250YWluRXF1YWxFcnJvclJlbmRlcmVyXG4gIGV4dGVuZHMgRXhwZWN0ZWRSZWNlaXZlZE1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvQ29udGFpbkVxdWFsXCI7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgZ2V0U3BlY2lmaWNMaW5lcyhcbiAgICBpbmZvOiBNYXRjaGVyRXJyb3JJbmZvLFxuICAgIG1heWJlQ29sb3JpemU6ICh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBrZXlvZiB0eXBlb2YgQU5TSV9DT0xPUlMpID0+IHN0cmluZyxcbiAgKTogTGluZUdyb3VwW10ge1xuICAgIGNvbnN0IGlzTmVnYXRlZCA9IGluZm8ubWF0Y2hlclNwZWNpZmljPy5pc05lZ2F0ZWQgYXMgYm9vbGVhbjtcbiAgICBjb25zdCByZWNlaXZlZFR5cGUgPSBpbmZvLm1hdGNoZXJTcGVjaWZpYz8ucmVjZWl2ZWRUeXBlIGFzIHN0cmluZztcblxuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBpc05lZ2F0ZWRcbiAgICAgICAgICA/IFwiRXhwZWN0ZWQgbm90IHRvIGNvbnRhaW4gZXF1YWxcIlxuICAgICAgICAgIDogXCJFeHBlY3RlZCB0byBjb250YWluIGVxdWFsXCIsXG4gICAgICAgIHZhbHVlOiBtYXliZUNvbG9yaXplKGluZm8uZXhwZWN0ZWQsIFwiZ3JlZW5cIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IGBSZWNlaXZlZCAke3JlY2VpdmVkVHlwZX1gLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLnJlY2VpdmVkLCBcInJlZFwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgIF07XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1hdGNoZXIgZXJyb3IgcmVuZGVyZXIgZm9yIHRoZSBgdG9IYXZlUHJvcGVydHlgIG1hdGNoZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb0hhdmVQcm9wZXJ0eUVycm9yUmVuZGVyZXJcbiAgZXh0ZW5kcyBFeHBlY3RlZFJlY2VpdmVkTWF0Y2hlclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwidG9IYXZlUHJvcGVydHlcIjtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRTcGVjaWZpY0xpbmVzKFxuICAgIGluZm86IE1hdGNoZXJFcnJvckluZm8sXG4gICAgbWF5YmVDb2xvcml6ZTogKHRleHQ6IHN0cmluZywgY29sb3I6IGtleW9mIHR5cGVvZiBBTlNJX0NPTE9SUykgPT4gc3RyaW5nLFxuICApOiBMaW5lR3JvdXBbXSB7XG4gICAgY29uc3QgaXNOZWdhdGVkID0gaW5mby5tYXRjaGVyU3BlY2lmaWM/LmlzTmVnYXRlZCBhcyBib29sZWFuO1xuICAgIGNvbnN0IGtleVBhdGggPSBpbmZvLm1hdGNoZXJTcGVjaWZpYz8ua2V5UGF0aCBhcyBzdHJpbmc7XG4gICAgY29uc3QgaGFzRXhwZWN0ZWRWYWx1ZSA9IGluZm8ubWF0Y2hlclNwZWNpZmljPy5oYXNFeHBlY3RlZFZhbHVlIGFzIGJvb2xlYW47XG5cbiAgICBjb25zdCBsaW5lczogTGluZUdyb3VwW10gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIlByb3BlcnR5IHBhdGhcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoa2V5UGF0aCwgXCJ3aGl0ZVwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBpZiAoaGFzRXhwZWN0ZWRWYWx1ZSkge1xuICAgICAgbGluZXMucHVzaChcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiBpc05lZ2F0ZWRcbiAgICAgICAgICAgID8gXCJFeHBlY3RlZCBwcm9wZXJ0eSBub3QgdG8gZXF1YWxcIlxuICAgICAgICAgICAgOiBcIkV4cGVjdGVkIHByb3BlcnR5IHRvIGVxdWFsXCIsXG4gICAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5leHBlY3RlZCwgXCJncmVlblwiKSxcbiAgICAgICAgICBncm91cDogMyxcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogaXNOZWdhdGVkXG4gICAgICAgICAgICA/IFwiRXhwZWN0ZWQgcHJvcGVydHkgbm90IHRvIGV4aXN0XCJcbiAgICAgICAgICAgIDogXCJFeHBlY3RlZCBwcm9wZXJ0eSB0byBleGlzdFwiLFxuICAgICAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgICAgIGdyb3VwOiAzLFxuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsaW5lcy5wdXNoKFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJSZWNlaXZlZCBvYmplY3RcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoaW5mby5yZWNlaXZlZCwgXCJyZWRcIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgfSxcbiAgICApO1xuXG4gICAgcmV0dXJuIGxpbmVzO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHJlbmRlck1hdGNoZXJBcmdzKFxuICAgIG1heWJlQ29sb3JpemU6ICh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBrZXlvZiB0eXBlb2YgQU5TSV9DT0xPUlMpID0+IHN0cmluZyxcbiAgKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbWF5YmVDb2xvcml6ZShgKGAsIFwiZGFya0dyZXlcIikgK1xuICAgICAgbWF5YmVDb2xvcml6ZShga2V5UGF0aGAsIFwid2hpdGVcIikgK1xuICAgICAgbWF5YmVDb2xvcml6ZShgLCBgLCBcImRhcmtHcmV5XCIpICtcbiAgICAgIG1heWJlQ29sb3JpemUoYGV4cGVjdGVkP2AsIFwiZ3JlZW5cIikgK1xuICAgICAgbWF5YmVDb2xvcml6ZShgKWAsIFwiZGFya0dyZXlcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNEZWVwRXF1YWwoYTogdW5rbm93biwgYjogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAoYSA9PT0gYikgcmV0dXJuIHRydWU7XG5cbiAgaWYgKGEgPT09IG51bGwgfHwgYiA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIGEgIT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGIgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBrZXlzQSA9IE9iamVjdC5rZXlzKGEgYXMgb2JqZWN0KTtcbiAgY29uc3Qga2V5c0IgPSBPYmplY3Qua2V5cyhiIGFzIG9iamVjdCk7XG5cbiAgaWYgKGtleXNBLmxlbmd0aCAhPT0ga2V5c0IubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIGtleXNBLmV2ZXJ5KChrZXkpID0+IHtcbiAgICByZXR1cm4ga2V5c0IuaW5jbHVkZXMoa2V5KSAmJlxuICAgICAgaXNEZWVwRXF1YWwoXG4gICAgICAgIChhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtrZXldLFxuICAgICAgICAoYiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilba2V5XSxcbiAgICAgICk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEdldHMgYSBwcm9wZXJ0eSB2YWx1ZSBmcm9tIGFuIG9iamVjdCB1c2luZyBhIHBhdGggc3RyaW5nLlxuICogU3VwcG9ydHMgZG90IG5vdGF0aW9uIChvYmoucHJvcCkgYW5kIGFycmF5IGluZGV4aW5nIChvYmpbMF0gb3Igb2JqLmFycmF5WzBdKS5cbiAqXG4gKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gZ2V0IHRoZSBwcm9wZXJ0eSBmcm9tXG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byB0aGUgcHJvcGVydHkgKGUuZy4gXCJhLmJbMF0uY1wiKVxuICogQHJldHVybnMgVGhlIHZhbHVlIGF0IHRoZSBzcGVjaWZpZWQgcGF0aFxuICogQHRocm93cyBFcnJvciBpZiB0aGUgcHJvcGVydHkgZG9lc24ndCBleGlzdFxuICovXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eUJ5UGF0aChcbiAgb2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgcGF0aDogc3RyaW5nLFxuKTogdW5rbm93biB7XG4gIGlmIChwYXRoID09PSBcIlwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXRoOiBlbXB0eSBzdHJpbmdcIik7XG4gIH1cblxuICAvLyBQYXJzZSB0aGUgcGF0aCBpbnRvIHNlZ21lbnRzXG4gIGNvbnN0IHNlZ21lbnRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgY3VycmVudFNlZ21lbnQgPSBcIlwiO1xuICBsZXQgaW5CcmFja2V0cyA9IGZhbHNlO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXIgPSBwYXRoW2ldO1xuXG4gICAgaWYgKGNoYXIgPT09IFwiLlwiICYmICFpbkJyYWNrZXRzKSB7XG4gICAgICBpZiAoY3VycmVudFNlZ21lbnQpIHtcbiAgICAgICAgc2VnbWVudHMucHVzaChjdXJyZW50U2VnbWVudCk7XG4gICAgICAgIGN1cnJlbnRTZWdtZW50ID0gXCJcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiW1wiKSB7XG4gICAgICBpZiAoY3VycmVudFNlZ21lbnQpIHtcbiAgICAgICAgc2VnbWVudHMucHVzaChjdXJyZW50U2VnbWVudCk7XG4gICAgICAgIGN1cnJlbnRTZWdtZW50ID0gXCJcIjtcbiAgICAgIH1cbiAgICAgIGluQnJhY2tldHMgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCJdXCIpIHtcbiAgICAgIGlmIChpbkJyYWNrZXRzKSB7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goY3VycmVudFNlZ21lbnQpO1xuICAgICAgICBjdXJyZW50U2VnbWVudCA9IFwiXCI7XG4gICAgICAgIGluQnJhY2tldHMgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXRoOiAke3BhdGh9YCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnRTZWdtZW50ICs9IGNoYXI7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIHRoZSBsYXN0IHNlZ21lbnQgaWYgdGhlcmUgaXMgb25lXG4gIGlmIChjdXJyZW50U2VnbWVudCkge1xuICAgIHNlZ21lbnRzLnB1c2goY3VycmVudFNlZ21lbnQpO1xuICB9XG5cbiAgLy8gVHJhdmVyc2UgdGhlIG9iamVjdCB1c2luZyB0aGUgc2VnbWVudHNcbiAgbGV0IGN1cnJlbnQ6IHVua25vd24gPSBvYmo7XG5cbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgaWYgKGN1cnJlbnQgPT09IG51bGwgfHwgY3VycmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3BlcnR5ICR7cGF0aH0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNlZ21lbnQgPT09IFwic3RyaW5nXCIgJiYgIWlzTmFOKE51bWJlcihzZWdtZW50KSkpIHtcbiAgICAgIC8vIElmIHNlZ21lbnQgaXMgYSBudW1lcmljIHN0cmluZywgdHJlYXQgaXQgYXMgYW4gYXJyYXkgaW5kZXhcbiAgICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyKHNlZ21lbnQpO1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGN1cnJlbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGFjY2VzcyBpbmRleCAke3NlZ21lbnR9IG9mIG5vbi1hcnJheWApO1xuICAgICAgfVxuICAgICAgaWYgKGluZGV4ID49IChjdXJyZW50IGFzIHVua25vd25bXSkubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW5kZXggJHtzZWdtZW50fSBvdXQgb2YgYm91bmRzYCk7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gKGN1cnJlbnQgYXMgdW5rbm93bltdKVtpbmRleF07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE90aGVyd2lzZSB0cmVhdCBpdCBhcyBhbiBvYmplY3QgcHJvcGVydHlcbiAgICAgIGlmICh0eXBlb2YgY3VycmVudCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBhY2Nlc3MgcHJvcGVydHkgJHtzZWdtZW50fSBvZiBub24tb2JqZWN0YCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGN1cnJlbnQsIHNlZ21lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtzZWdtZW50fSBkb2VzIG5vdCBleGlzdCBvbiBvYmplY3RgKTtcbiAgICAgIH1cblxuICAgICAgY3VycmVudCA9IChjdXJyZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtzZWdtZW50XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3VycmVudDtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplV2hpdGVTcGFjZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlXG4gICAgLnJlcGxhY2UoL1tcXHUyMDBCXFx1MDBBRF0vZywgXCJcIikgLy8gUmVtb3ZlIHplcm8td2lkdGggc3BhY2UgYW5kIHNvZnQgaHlwaGVuXG4gICAgLnJlcGxhY2UoL1xccysvZywgXCIgXCIpLnRyaW0oKTtcbn1cbiIsICJpbXBvcnQgeyBhc3NlcnQsIHR5cGUgU29mdE1vZGUgfSBmcm9tIFwiLi9hc3NlcnQudHNcIjtcbmltcG9ydCB0eXBlIHsgQU5TSV9DT0xPUlMgfSBmcm9tIFwiLi9jb2xvcnMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVUUllfT1BUSU9OUyxcbiAgdHlwZSBFeHBlY3RDb25maWcsXG4gIHR5cGUgUmV0cnlDb25maWcsXG59IGZyb20gXCIuL2NvbmZpZy50c1wiO1xuaW1wb3J0IHsgY2FwdHVyZUV4ZWN1dGlvbkNvbnRleHQgfSBmcm9tIFwiLi9leGVjdXRpb24udHNcIjtcbmltcG9ydCB7XG4gIEV4cGVjdGVkUmVjZWl2ZWRNYXRjaGVyUmVuZGVyZXIsXG4gIHR5cGUgTGluZUdyb3VwLFxuICB0eXBlIE1hdGNoZXJFcnJvckluZm8sXG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnksXG4gIFJlY2VpdmVkT25seU1hdGNoZXJSZW5kZXJlcixcbn0gZnJvbSBcIi4vcmVuZGVyLnRzXCI7XG5pbXBvcnQgeyBwYXJzZVN0YWNrVHJhY2UgfSBmcm9tIFwiLi9zdGFja3RyYWNlLnRzXCI7XG5pbXBvcnQgdHlwZSB7IExvY2F0b3IgfSBmcm9tIFwiazYvYnJvd3NlclwiO1xuaW1wb3J0IHsgbm9ybWFsaXplV2hpdGVTcGFjZSB9IGZyb20gXCIuL3V0aWxzL3N0cmluZy50c1wiO1xuXG5pbnRlcmZhY2UgVG9IYXZlVGV4dE9wdGlvbnMgZXh0ZW5kcyBSZXRyeUNvbmZpZyB7XG4gIC8qKlxuICAgKiBJZiB0cnVlLCBjb21wYXJpc29uIHdpbGwgYmUgY2FzZS1pbnNlbnNpdGl2ZS4gSWYgZGVmaW5lZCwgdGhpcyBvcHRpb24gd2lsbCBvdmVycmlkZSB0aGUgYGlgIGZsYWcgb2ZcbiAgICogcmVndWxhciBleHByZXNzaW9ucy4gRGVmYXVsdHMgdG8gYHVuZGVmaW5lZGAuXG4gICAqL1xuICBpZ25vcmVDYXNlPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgdHJ1ZSwgdGhlIHRleHQgd2lsbCBiZSBjb21wYXJlZCB1c2luZyBgaW5uZXJUZXh0KClgIGluc3RlYWQgb2YgYHRleHRDb250ZW50KClgLiBEZWZhdWx0cyB0byBgZmFsc2VgLlxuICAgKi9cbiAgdXNlSW5uZXJUZXh0PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBSZXRyeWluZ0V4cGVjdGF0aW9uIGlzIGFuIGludGVyZmFjZSB0aGF0IGRlZmluZXMgdGhlIG1ldGhvZHMgdGhhdCBjYW4gYmUgdXNlZCB0byBjcmVhdGUgYSByZXRyeWluZyBleHBlY3RhdGlvbi5cbiAqXG4gKiBSZXRyeWluZyBleHBlY3RhdGlvbnMgYXJlIHVzZWQgdG8gYXNzZXJ0IHRoYXQgYSBjb25kaXRpb24gaXMgbWV0IHdpdGhpbiBhIGdpdmVuIHRpbWVvdXQuXG4gKiBUaGUgcHJvdmlkZWQgYXNzZXJ0aW9uIGZ1bmN0aW9uIGlzIGNhbGxlZCByZXBlYXRlZGx5IHVudGlsIHRoZSBjb25kaXRpb24gaXMgbWV0IG9yIHRoZSB0aW1lb3V0IGlzIHJlYWNoZWQuXG4gKlxuICogVGhlIFJldHJ5aW5nRXhwZWN0YXRpb24gaW50ZXJmYWNlIGlzIGltcGxlbWVudGVkIGJ5IHRoZSBjcmVhdGVFeHBlY3RhdGlvbiBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXRyeWluZ0V4cGVjdGF0aW9uIHtcbiAgLyoqXG4gICAqIE5lZ2F0ZXMgdGhlIGV4cGVjdGF0aW9uLCBjYXVzaW5nIHRoZSBhc3NlcnRpb24gdG8gcGFzcyB3aGVuIGl0IHdvdWxkIG5vcm1hbGx5IGZhaWwsIGFuZCB2aWNlIHZlcnNhLlxuICAgKi9cbiAgbm90OiBSZXRyeWluZ0V4cGVjdGF0aW9uO1xuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoZSBMb2NhdG9yIHBvaW50cyB0byBhIGNoZWNrZWQgaW5wdXQuXG4gICAqL1xuICB0b0JlQ2hlY2tlZChvcHRpb25zPzogUGFydGlhbDxSZXRyeUNvbmZpZz4pOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoZSBMb2NhdG9yIHBvaW50cyB0byBhIGRpc2FibGVkIGVsZW1lbnQuXG4gICAqIEVsZW1lbnQgaXMgZGlzYWJsZWQgaWYgaXQgaGFzIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGUgb3IgaXMgZGlzYWJsZWQgdmlhICdhcmlhLWRpc2FibGVkJy5cbiAgICpcbiAgICogTm90ZSB0aGF0IG9ubHkgbmF0aXZlIGNvbnRyb2wgZWxlbWVudHMgc3VjaCBhcyBIVE1MIGJ1dHRvbiwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIG9wdGlvbiwgb3B0Z3JvdXAgY2FuIGJlIGRpc2FibGVkIGJ5IHNldHRpbmcgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZS5cbiAgICogXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZSBvbiBvdGhlciBlbGVtZW50cyBpcyBpZ25vcmVkIGJ5IHRoZSBicm93c2VyLlxuICAgKi9cbiAgdG9CZURpc2FibGVkKG9wdGlvbnM/OiBQYXJ0aWFsPFJldHJ5Q29uZmlnPik6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhlIExvY2F0b3IgcG9pbnRzIHRvIGFuIGVkaXRhYmxlIGVsZW1lbnQuXG4gICAqL1xuICB0b0JlRWRpdGFibGUob3B0aW9ucz86IFBhcnRpYWw8UmV0cnlDb25maWc+KTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGUgTG9jYXRvciBwb2ludHMgdG8gYW4gZW5hYmxlZCBlbGVtZW50LlxuICAgKi9cbiAgdG9CZUVuYWJsZWQob3B0aW9ucz86IFBhcnRpYWw8UmV0cnlDb25maWc+KTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IExvY2F0b3IgZWl0aGVyIGRvZXMgbm90IHJlc29sdmUgdG8gYW55IERPTSBub2RlLCBvciByZXNvbHZlcyB0byBhIG5vbi12aXNpYmxlIG9uZS5cbiAgICovXG4gIHRvQmVIaWRkZW4ob3B0aW9ucz86IFBhcnRpYWw8UmV0cnlDb25maWc+KTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IExvY2F0b3IgcG9pbnRzIHRvIGFuIGF0dGFjaGVkIGFuZCB2aXNpYmxlIERPTSBub2RlLlxuICAgKi9cbiAgdG9CZVZpc2libGUob3B0aW9ucz86IFBhcnRpYWw8UmV0cnlDb25maWc+KTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBMb2NhdG9yIHBvaW50cyB0byBhbiBlbGVtZW50IHdpdGggdGhlIGdpdmVuIHRleHQuXG4gICAqXG4gICAqIElmIHRoZSB0eXBlIG9mIGBleHBlY3RlZGAgaXMgYSBzdHJpbmcsIGJvdGggdGhlIGV4cGVjdGVkIGFuZCBhY3R1YWwgdGV4dCB3aWxsIGhhdmUgYW55IHplcm8td2lkdGhcbiAgICogY2hhcmFjdGVycyByZW1vdmVkIGFuZCB3aGl0ZXNwYWNlIGNoYXJhY3RlcnMgY29sbGFwc2VkIHRvIGEgc2luZ2xlIHNwYWNlLiBJZiB0aGUgdHlwZSBvZiBgZXhwZWN0ZWRgXG4gICAqIGlzIGEgcmVndWxhciBleHByZXNzaW9uLCB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudCB3aWxsIGJlIG1hdGNoZWQgYWdhaW5zdCB0aGUgcmVndWxhciBleHByZXNzaW9uIGFzLWlzLlxuICAgKi9cbiAgdG9IYXZlVGV4dChcbiAgICBleHBlY3RlZDogUmVnRXhwIHwgc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBQYXJ0aWFsPFRvSGF2ZVRleHRPcHRpb25zPixcbiAgKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBMb2NhdG9yIHBvaW50cyB0byBhbiBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGdpdmVuIHRleHQuXG4gICAqXG4gICAqIElmIHRoZSB0eXBlIG9mIGBleHBlY3RlZGAgaXMgYSBzdHJpbmcsIGJvdGggdGhlIGV4cGVjdGVkIGFuZCBhY3R1YWwgdGV4dCB3aWxsIGhhdmUgYW55IHplcm8td2lkdGhcbiAgICogY2hhcmFjdGVycyByZW1vdmVkIGFuZCB3aGl0ZXNwYWNlIGNoYXJhY3RlcnMgY29sbGFwc2VkIHRvIGEgc2luZ2xlIHNwYWNlLiBJZiB0aGUgdHlwZSBvZiBgZXhwZWN0ZWRgXG4gICAqIGlzIGEgcmVndWxhciBleHByZXNzaW9uLCB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudCB3aWxsIGJlIG1hdGNoZWQgYWdhaW5zdCB0aGUgcmVndWxhciBleHByZXNzaW9uIGFzLWlzLlxuICAgKi9cbiAgdG9Db250YWluVGV4dChcbiAgICBleHBlY3RlZDogUmVnRXhwIHwgc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBQYXJ0aWFsPFRvSGF2ZVRleHRPcHRpb25zPixcbiAgKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGUgTG9jYXRvciBwb2ludHMgdG8gYW4gZWxlbWVudCB3aXRoIHRoZSBnaXZlbiBpbnB1dCB2YWx1ZS4gWW91IGNhbiB1c2UgcmVndWxhciBleHByZXNzaW9ucyBmb3IgdGhlIHZhbHVlIGFzIHdlbGwuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSB0aGUgZXhwZWN0ZWQgdmFsdWUgb2YgdGhlIGlucHV0XG4gICAqL1xuICB0b0hhdmVWYWx1ZSh2YWx1ZTogc3RyaW5nLCBvcHRpb25zPzogUGFydGlhbDxSZXRyeUNvbmZpZz4pOiBQcm9taXNlPHZvaWQ+O1xufVxuXG4vKipcbiAqIGNyZWF0ZUV4cGVjdGF0aW9uIGlzIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYW4gZXhwZWN0YXRpb24gb2JqZWN0IGZvciBhIGdpdmVuIHZhbHVlLlxuICpcbiAqIE5vdGUgdGhhdCBhbHRob3VnaCB0aGUgYnJvd3NlciBgaXNgIHByZWZpeGVkIG1ldGhvZHMgYXJlIHVzZWQsIGFuZCByZXR1cm4gYm9vbGVhbiB2YWx1ZXMsIHdlXG4gKiB0aHJvdyBlcnJvcnMgaWYgdGhlIGNvbmRpdGlvbiBpcyBub3QgbWV0LiBUaGlzIGlzIHRvIGVuc3VyZSB0aGF0IHdlIGFsaWduIHdpdGggcGxheXdyaWdodCdzXG4gKiBBUEksIGFuZCBoYXZlIG1hdGNoZXJzIHJldHVybiBgUHJvbWlzZTx2b2lkPmAsIGFzIG9wcG9zZWQgdG8gYFByb21pc2U8Ym9vbGVhbj5gLlxuICpcbiAqIEBwYXJhbSBsb2NhdG9yIHRoZSB2YWx1ZSB0byBjcmVhdGUgYW4gZXhwZWN0YXRpb24gZm9yXG4gKiBAcGFyYW0gY29uZmlnIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgZXhwZWN0YXRpb25cbiAqIEBwYXJhbSBtZXNzYWdlIHRoZSBvcHRpb25hbCBjdXN0b20gbWVzc2FnZSBmb3IgdGhlIGV4cGVjdGF0aW9uXG4gKiBAcGFyYW0gaXNOZWdhdGVkIHdoZXRoZXIgdGhlIGV4cGVjdGF0aW9uIGlzIG5lZ2F0ZWRcbiAqIEByZXR1cm5zIGFuIGV4cGVjdGF0aW9uIG9iamVjdCBvdmVyIHRoZSBnaXZlbiB2YWx1ZSBleHBvc2luZyB0aGUgRXhwZWN0YXRpb24gc2V0IG9mIG1ldGhvZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV4cGVjdGF0aW9uKFxuICBsb2NhdG9yOiBMb2NhdG9yLFxuICBjb25maWc6IEV4cGVjdENvbmZpZyxcbiAgbWVzc2FnZT86IHN0cmluZyxcbiAgaXNOZWdhdGVkOiBib29sZWFuID0gZmFsc2UsXG4pOiBSZXRyeWluZ0V4cGVjdGF0aW9uIHtcbiAgLy8gSW4gb3JkZXIgdG8gZmFjaWxpdGF0ZSB0ZXN0aW5nLCB3ZSBzdXBwb3J0IHBhc3NpbmcgaW4gYSBjdXN0b20gYXNzZXJ0IGZ1bmN0aW9uLlxuICAvLyBBcyBhIHJlc3VsdCwgd2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYXNzZXJ0IGZ1bmN0aW9uIGlzIGFsd2F5cyBhdmFpbGFibGUsIGFuZFxuICAvLyBpZiBub3QsIHdlIG5lZWQgdG8gdXNlIHRoZSBkZWZhdWx0IGFzc2VydCBmdW5jdGlvbi5cbiAgLy9cbiAgLy8gRnJvbSB0aGlzIHBvaW50IGZvcndhcmQsIHdlIHdpbGwgdXNlIHRoZSBgdXNlZEFzc2VydGAgdmFyaWFibGUgdG8gcmVmZXIgdG8gdGhlIGFzc2VydCBmdW5jdGlvbi5cbiAgY29uc3QgdXNlZEFzc2VydCA9IGNvbmZpZy5hc3NlcnRGbiA/PyBhc3NlcnQ7XG4gIGNvbnN0IGlzU29mdCA9IGNvbmZpZy5zb2Z0ID8/IGZhbHNlO1xuICBjb25zdCByZXRyeUNvbmZpZzogUmV0cnlDb25maWcgPSB7XG4gICAgdGltZW91dDogY29uZmlnLnRpbWVvdXQsXG4gICAgaW50ZXJ2YWw6IGNvbmZpZy5pbnRlcnZhbCxcbiAgfTtcblxuICAvLyBDb25maWd1cmUgdGhlIHJlbmRlcmVyIHdpdGggdGhlIGNvbG9yaXplIG9wdGlvbi5cbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5jb25maWd1cmUoe1xuICAgIGNvbG9yaXplOiBjb25maWcuY29sb3JpemUsXG4gICAgZGlzcGxheTogY29uZmlnLmRpc3BsYXksXG4gIH0pO1xuXG4gIC8vIFJlZ2lzdGVyIHJlbmRlcmVycyBzcGVjaWZpYyB0byBlYWNoIG1hdGNoZXJzIGF0IGluaXRpYWxpemF0aW9uIHRpbWUuXG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0JlQ2hlY2tlZFwiLFxuICAgIG5ldyBUb0JlQ2hlY2tlZEVycm9yUmVuZGVyZXIoKSxcbiAgKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcbiAgICBcInRvQmVEaXNhYmxlZFwiLFxuICAgIG5ldyBUb0JlRGlzYWJsZWRFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0JlRWRpdGFibGVcIixcbiAgICBuZXcgVG9CZUVkaXRhYmxlRXJyb3JSZW5kZXJlcigpLFxuICApO1xuICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LnJlZ2lzdGVyKFxuICAgIFwidG9CZUVuYWJsZWRcIixcbiAgICBuZXcgVG9CZUVuYWJsZWRFcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0JlSGlkZGVuXCIsXG4gICAgbmV3IFRvQmVIaWRkZW5FcnJvclJlbmRlcmVyKCksXG4gICk7XG4gIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkucmVnaXN0ZXIoXG4gICAgXCJ0b0JlVmlzaWJsZVwiLFxuICAgIG5ldyBUb0JlVmlzaWJsZUVycm9yUmVuZGVyZXIoKSxcbiAgKTtcbiAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5yZWdpc3RlcihcbiAgICBcInRvSGF2ZVZhbHVlXCIsXG4gICAgbmV3IFRvSGF2ZVZhbHVlRXJyb3JSZW5kZXJlcigpLFxuICApO1xuXG4gIGNvbnN0IG1hdGNoZXJDb25maWcgPSB7XG4gICAgbG9jYXRvcixcbiAgICByZXRyeUNvbmZpZyxcbiAgICB1c2VkQXNzZXJ0LFxuICAgIGlzU29mdCxcbiAgICBpc05lZ2F0ZWQsXG4gICAgbWVzc2FnZSxcbiAgICBzb2Z0TW9kZTogY29uZmlnLnNvZnRNb2RlLFxuICB9O1xuXG4gIGNvbnN0IG1hdGNoVGV4dCA9IGFzeW5jIChcbiAgICBtYXRjaGVyTmFtZTogc3RyaW5nLFxuICAgIGV4cGVjdGVkOiBSZWdFeHAgfCBzdHJpbmcsXG4gICAgb3B0aW9uczogUGFydGlhbDxUb0hhdmVUZXh0T3B0aW9ucz4gPSB7fSxcbiAgICBjb21wYXJlRm46IChhY3R1YWw6IHN0cmluZywgZXhwZWN0ZWQ6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgKSA9PiB7XG4gICAgY29uc3Qgc3RhY2t0cmFjZSA9IHBhcnNlU3RhY2tUcmFjZShuZXcgRXJyb3IoKS5zdGFjayk7XG4gICAgY29uc3QgZXhlY3V0aW9uQ29udGV4dCA9IGNhcHR1cmVFeGVjdXRpb25Db250ZXh0KHN0YWNrdHJhY2UpO1xuXG4gICAgaWYgKCFleGVjdXRpb25Db250ZXh0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJrNiBmYWlsZWQgdG8gY2FwdHVyZSBleGVjdXRpb24gY29udGV4dFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGVja1JlZ0V4cCA9IChleHBlY3RlZDogUmVnRXhwLCBhY3R1YWw6IHN0cmluZykgPT4ge1xuICAgICAgLy8gYGlnbm9yZUNhc2VgIHNob3VsZCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGUgYGlgIGZsYWcgb2YgdGhlIHJlZ2V4IGlmIGl0IGlzIGRlZmluZWQuXG4gICAgICBjb25zdCByZWdleHAgPSBvcHRpb25zLmlnbm9yZUNhc2UgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IG5ldyBSZWdFeHAoXG4gICAgICAgICAgZXhwZWN0ZWQuc291cmNlLFxuICAgICAgICAgIGV4cGVjdGVkLmZsYWdzLnJlcGxhY2UoXCJpXCIsIFwiXCIpICsgKG9wdGlvbnMuaWdub3JlQ2FzZSA/IFwiaVwiIDogXCJcIiksXG4gICAgICAgIClcbiAgICAgICAgOiBleHBlY3RlZDtcblxuICAgICAgY29uc3QgaW5mbzogTWF0Y2hlckVycm9ySW5mbyA9IHtcbiAgICAgICAgZXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgbWF0Y2hlck5hbWUsXG4gICAgICAgIGV4cGVjdGVkOiByZWdleHAudG9TdHJpbmcoKSxcbiAgICAgICAgcmVjZWl2ZWQ6IGFjdHVhbCxcbiAgICAgICAgbWF0Y2hlclNwZWNpZmljOiB7IGlzTmVnYXRlZCB9LFxuICAgICAgICBjdXN0b21NZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gcmVnZXhwLnRlc3QoYWN0dWFsKTtcblxuICAgICAgdXNlZEFzc2VydChcbiAgICAgICAgaXNOZWdhdGVkID8gIXJlc3VsdCA6IHJlc3VsdCxcbiAgICAgICAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5nZXRSZW5kZXJlcihtYXRjaGVyTmFtZSkucmVuZGVyKFxuICAgICAgICAgIGluZm8sXG4gICAgICAgICAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5nZXRDb25maWcoKSxcbiAgICAgICAgKSxcbiAgICAgICAgaXNTb2Z0LFxuICAgICAgICBjb25maWcuc29mdE1vZGUsXG4gICAgICApO1xuICAgIH07XG5cbiAgICBjb25zdCBjaGVja1RleHQgPSAoZXhwZWN0ZWQ6IHN0cmluZywgYWN0dWFsOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRFeHBlY3RlZCA9IG5vcm1hbGl6ZVdoaXRlU3BhY2UoZXhwZWN0ZWQpO1xuICAgICAgY29uc3Qgbm9ybWFsaXplZEFjdHVhbCA9IG5vcm1hbGl6ZVdoaXRlU3BhY2UoYWN0dWFsKTtcblxuICAgICAgY29uc3QgaW5mbzogTWF0Y2hlckVycm9ySW5mbyA9IHtcbiAgICAgICAgZXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgbWF0Y2hlck5hbWUsXG4gICAgICAgIGV4cGVjdGVkOiBub3JtYWxpemVkRXhwZWN0ZWQsXG4gICAgICAgIHJlY2VpdmVkOiBub3JtYWxpemVkQWN0dWFsLFxuICAgICAgICBtYXRjaGVyU3BlY2lmaWM6IHsgaXNOZWdhdGVkIH0sXG4gICAgICAgIGN1c3RvbU1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBvcHRpb25zLmlnbm9yZUNhc2VcbiAgICAgICAgPyBjb21wYXJlRm4oXG4gICAgICAgICAgbm9ybWFsaXplZEFjdHVhbC50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgIG5vcm1hbGl6ZWRFeHBlY3RlZC50b0xvd2VyQ2FzZSgpLFxuICAgICAgICApXG4gICAgICAgIDogY29tcGFyZUZuKG5vcm1hbGl6ZWRBY3R1YWwsIG5vcm1hbGl6ZWRFeHBlY3RlZCk7XG5cbiAgICAgIHVzZWRBc3NlcnQoXG4gICAgICAgIGlzTmVnYXRlZCA/ICFyZXN1bHQgOiByZXN1bHQsXG4gICAgICAgIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkuZ2V0UmVuZGVyZXIobWF0Y2hlck5hbWUpLnJlbmRlcihcbiAgICAgICAgICBpbmZvLFxuICAgICAgICAgIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkuZ2V0Q29uZmlnKCksXG4gICAgICAgICksXG4gICAgICAgIGlzU29mdCxcbiAgICAgICAgY29uZmlnLnNvZnRNb2RlLFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHdpdGhSZXRyeShcbiAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFjdHVhbFRleHQgPSBvcHRpb25zLnVzZUlubmVyVGV4dFxuICAgICAgICAgICAgPyBhd2FpdCBsb2NhdG9yLmlubmVyVGV4dCgpXG4gICAgICAgICAgICA6IGF3YWl0IGxvY2F0b3IudGV4dENvbnRlbnQoKTtcblxuICAgICAgICAgIGlmIChhY3R1YWxUZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IGhhcyBubyB0ZXh0IGNvbnRlbnRcIik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGV4cGVjdGVkIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgICBjaGVja1JlZ0V4cChleHBlY3RlZCwgYWN0dWFsVGV4dCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjaGVja1RleHQoZXhwZWN0ZWQsIGFjdHVhbFRleHQpO1xuICAgICAgICB9LFxuICAgICAgICB7IC4uLnJldHJ5Q29uZmlnLCAuLi5vcHRpb25zIH0sXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIGNvbnN0IGluZm86IE1hdGNoZXJFcnJvckluZm8gPSB7XG4gICAgICAgIGV4ZWN1dGlvbkNvbnRleHQsXG4gICAgICAgIG1hdGNoZXJOYW1lLFxuICAgICAgICBleHBlY3RlZDogZXhwZWN0ZWQudG9TdHJpbmcoKSxcbiAgICAgICAgcmVjZWl2ZWQ6IFwidW5rbm93blwiLFxuICAgICAgICBtYXRjaGVyU3BlY2lmaWM6IHsgaXNOZWdhdGVkIH0sXG4gICAgICAgIGN1c3RvbU1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICB9O1xuXG4gICAgICB1c2VkQXNzZXJ0KFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5nZXRSZW5kZXJlcihcInRvSGF2ZVRleHRcIikucmVuZGVyKFxuICAgICAgICAgIGluZm8sXG4gICAgICAgICAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5nZXRDb25maWcoKSxcbiAgICAgICAgKSxcbiAgICAgICAgaXNTb2Z0LFxuICAgICAgICBjb25maWcuc29mdE1vZGUsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBleHBlY3RhdGlvbjogUmV0cnlpbmdFeHBlY3RhdGlvbiA9IHtcbiAgICBnZXQgbm90KCk6IFJldHJ5aW5nRXhwZWN0YXRpb24ge1xuICAgICAgcmV0dXJuIGNyZWF0ZUV4cGVjdGF0aW9uKGxvY2F0b3IsIGNvbmZpZywgbWVzc2FnZSwgIWlzTmVnYXRlZCk7XG4gICAgfSxcblxuICAgIGFzeW5jIHRvQmVDaGVja2VkKFxuICAgICAgb3B0aW9uczogUGFydGlhbDxSZXRyeUNvbmZpZz4gPSByZXRyeUNvbmZpZyxcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIGF3YWl0IGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZUNoZWNrZWRcIixcbiAgICAgICAgYXN5bmMgKCkgPT4gYXdhaXQgbG9jYXRvci5pc0NoZWNrZWQoKSxcbiAgICAgICAgXCJjaGVja2VkXCIsXG4gICAgICAgIFwidW5jaGVja2VkXCIsXG4gICAgICAgIHsgLi4ubWF0Y2hlckNvbmZpZywgb3B0aW9ucyB9LFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgdG9CZURpc2FibGVkKFxuICAgICAgb3B0aW9uczogUGFydGlhbDxSZXRyeUNvbmZpZz4gPSByZXRyeUNvbmZpZyxcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIGF3YWl0IGNyZWF0ZU1hdGNoZXIoXG4gICAgICAgIFwidG9CZURpc2FibGVkXCIsXG4gICAgICAgIGFzeW5jICgpID0+IGF3YWl0IGxvY2F0b3IuaXNEaXNhYmxlZCgpLFxuICAgICAgICBcImRpc2FibGVkXCIsXG4gICAgICAgIFwiZW5hYmxlZFwiLFxuICAgICAgICB7IC4uLm1hdGNoZXJDb25maWcsIG9wdGlvbnMgfSxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGFzeW5jIHRvQmVFZGl0YWJsZShcbiAgICAgIG9wdGlvbnM6IFBhcnRpYWw8UmV0cnlDb25maWc+ID0gcmV0cnlDb25maWcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICBhd2FpdCBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVFZGl0YWJsZVwiLFxuICAgICAgICBhc3luYyAoKSA9PiBhd2FpdCBsb2NhdG9yLmlzRWRpdGFibGUoKSxcbiAgICAgICAgXCJlZGl0YWJsZVwiLFxuICAgICAgICBcInVuZWRpdGFibGVcIixcbiAgICAgICAgeyAuLi5tYXRjaGVyQ29uZmlnLCBvcHRpb25zIH0sXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBhc3luYyB0b0JlRW5hYmxlZChcbiAgICAgIG9wdGlvbnM6IFBhcnRpYWw8UmV0cnlDb25maWc+ID0gcmV0cnlDb25maWcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICBhd2FpdCBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVFbmFibGVkXCIsXG4gICAgICAgIGFzeW5jICgpID0+IGF3YWl0IGxvY2F0b3IuaXNFbmFibGVkKCksXG4gICAgICAgIFwiZW5hYmxlZFwiLFxuICAgICAgICBcImRpc2FibGVkXCIsXG4gICAgICAgIHsgLi4ubWF0Y2hlckNvbmZpZywgb3B0aW9ucyB9LFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgdG9CZUhpZGRlbihcbiAgICAgIG9wdGlvbnM6IFBhcnRpYWw8UmV0cnlDb25maWc+ID0gcmV0cnlDb25maWcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICBhd2FpdCBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVIaWRkZW5cIixcbiAgICAgICAgYXN5bmMgKCkgPT4gYXdhaXQgbG9jYXRvci5pc0hpZGRlbigpLFxuICAgICAgICBcImhpZGRlblwiLFxuICAgICAgICBcInZpc2libGVcIixcbiAgICAgICAgeyAuLi5tYXRjaGVyQ29uZmlnLCBvcHRpb25zIH0sXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBhc3luYyB0b0JlVmlzaWJsZShcbiAgICAgIG9wdGlvbnM6IFBhcnRpYWw8UmV0cnlDb25maWc+ID0gcmV0cnlDb25maWcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICBhd2FpdCBjcmVhdGVNYXRjaGVyKFxuICAgICAgICBcInRvQmVWaXNpYmxlXCIsXG4gICAgICAgIGFzeW5jICgpID0+IGF3YWl0IGxvY2F0b3IuaXNWaXNpYmxlKCksXG4gICAgICAgIFwidmlzaWJsZVwiLFxuICAgICAgICBcImhpZGRlblwiLFxuICAgICAgICB7IC4uLm1hdGNoZXJDb25maWcsIG9wdGlvbnMgfSxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRvSGF2ZVRleHQoXG4gICAgICBleHBlY3RlZDogUmVnRXhwIHwgc3RyaW5nLFxuICAgICAgb3B0aW9uczogUGFydGlhbDxUb0hhdmVUZXh0T3B0aW9ucz4gPSB7fSxcbiAgICApIHtcbiAgICAgIHJldHVybiBtYXRjaFRleHQoXG4gICAgICAgIFwidG9IYXZlVGV4dFwiLFxuICAgICAgICBleHBlY3RlZCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKGFjdHVhbCwgZXhwZWN0ZWQpID0+IGFjdHVhbCA9PT0gZXhwZWN0ZWQsXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0b0NvbnRhaW5UZXh0KFxuICAgICAgZXhwZWN0ZWQ6IFJlZ0V4cCB8IHN0cmluZyxcbiAgICAgIG9wdGlvbnM6IFBhcnRpYWw8VG9IYXZlVGV4dE9wdGlvbnM+ID0ge30sXG4gICAgKSB7XG4gICAgICByZXR1cm4gbWF0Y2hUZXh0KFxuICAgICAgICBcInRvQ29udGFpblRleHRcIixcbiAgICAgICAgZXhwZWN0ZWQsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIChhY3R1YWwsIGV4cGVjdGVkKSA9PiBhY3R1YWwuaW5jbHVkZXMoZXhwZWN0ZWQpLFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgdG9IYXZlVmFsdWUoXG4gICAgICBleHBlY3RlZFZhbHVlOiBzdHJpbmcsXG4gICAgICBvcHRpb25zOiBQYXJ0aWFsPFJldHJ5Q29uZmlnPiA9IHJldHJ5Q29uZmlnLFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgY29uc3Qgc3RhY2t0cmFjZSA9IHBhcnNlU3RhY2tUcmFjZShuZXcgRXJyb3IoKS5zdGFjayk7XG4gICAgICBjb25zdCBleGVjdXRpb25Db250ZXh0ID0gY2FwdHVyZUV4ZWN1dGlvbkNvbnRleHQoc3RhY2t0cmFjZSk7XG4gICAgICBpZiAoIWV4ZWN1dGlvbkNvbnRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiazYgZmFpbGVkIHRvIGNhcHR1cmUgZXhlY3V0aW9uIGNvbnRleHRcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZm86IE1hdGNoZXJFcnJvckluZm8gPSB7XG4gICAgICAgIGV4ZWN1dGlvbkNvbnRleHQsXG4gICAgICAgIG1hdGNoZXJOYW1lOiBcInRvSGF2ZVZhbHVlXCIsXG4gICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZFZhbHVlLFxuICAgICAgICByZWNlaXZlZDogXCJ1bmtub3duXCIsXG4gICAgICAgIG1hdGNoZXJTcGVjaWZpYzogeyBpc05lZ2F0ZWQgfSxcbiAgICAgICAgY3VzdG9tTWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHdpdGhSZXRyeShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYWN0dWFsVmFsdWUgPSBhd2FpdCBsb2NhdG9yLmlucHV0VmFsdWUoKTtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBleHBlY3RlZFZhbHVlID09PSBhY3R1YWxWYWx1ZTtcbiAgICAgICAgICAvLyBJZiBpc05lZ2F0ZWQgaXMgdHJ1ZSwgd2Ugd2FudCB0byBpbnZlcnQgdGhlIHJlc3VsdFxuICAgICAgICAgIGNvbnN0IGZpbmFsUmVzdWx0ID0gaXNOZWdhdGVkID8gIXJlc3VsdCA6IHJlc3VsdDtcblxuICAgICAgICAgIHVzZWRBc3NlcnQoXG4gICAgICAgICAgICBmaW5hbFJlc3VsdCxcbiAgICAgICAgICAgIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkuZ2V0UmVuZGVyZXIoXCJ0b0hhdmVWYWx1ZVwiKS5yZW5kZXIoXG4gICAgICAgICAgICAgIGluZm8sXG4gICAgICAgICAgICAgIE1hdGNoZXJFcnJvclJlbmRlcmVyUmVnaXN0cnkuZ2V0Q29uZmlnKCksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgaXNTb2Z0LFxuICAgICAgICAgICAgY29uZmlnLnNvZnRNb2RlLFxuICAgICAgICAgICk7XG4gICAgICAgIH0sIHsgLi4ucmV0cnlDb25maWcsIC4uLm9wdGlvbnMgfSk7XG4gICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHVzZWRBc3NlcnQoXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5nZXRSZW5kZXJlcihcInRvSGF2ZVZhbHVlXCIpLnJlbmRlcihcbiAgICAgICAgICAgIGluZm8sXG4gICAgICAgICAgICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LmdldENvbmZpZygpLFxuICAgICAgICAgICksXG4gICAgICAgICAgaXNTb2Z0LFxuICAgICAgICAgIGNvbmZpZy5zb2Z0TW9kZSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBleHBlY3RhdGlvbjtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBjb21tb24gbWF0Y2hlciBpbmZvXG5mdW5jdGlvbiBjcmVhdGVNYXRjaGVySW5mbyhcbiAgbWF0Y2hlck5hbWU6IHN0cmluZyxcbiAgZXhwZWN0ZWQ6IHN0cmluZyxcbiAgcmVjZWl2ZWQ6IHN0cmluZyxcbiAgYWRkaXRpb25hbEluZm8gPSB7fSxcbiAgY3VzdG9tTWVzc2FnZT86IHN0cmluZyxcbik6IE1hdGNoZXJFcnJvckluZm8ge1xuICBjb25zdCBzdGFja3RyYWNlID0gcGFyc2VTdGFja1RyYWNlKG5ldyBFcnJvcigpLnN0YWNrKTtcbiAgY29uc3QgZXhlY3V0aW9uQ29udGV4dCA9IGNhcHR1cmVFeGVjdXRpb25Db250ZXh0KHN0YWNrdHJhY2UpO1xuXG4gIGlmICghZXhlY3V0aW9uQ29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIms2IGZhaWxlZCB0byBjYXB0dXJlIGV4ZWN1dGlvbiBjb250ZXh0XCIpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBleGVjdXRpb25Db250ZXh0LFxuICAgIG1hdGNoZXJOYW1lLFxuICAgIGV4cGVjdGVkLFxuICAgIHJlY2VpdmVkLFxuICAgIGN1c3RvbU1lc3NhZ2UsXG4gICAgLi4uYWRkaXRpb25hbEluZm8sXG4gIH07XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBoYW5kbGUgY29tbW9uIG1hdGNoZXIgbG9naWNcbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU1hdGNoZXIoXG4gIG1hdGNoZXJOYW1lOiBzdHJpbmcsXG4gIGNoZWNrRm46ICgpID0+IFByb21pc2U8Ym9vbGVhbj4sXG4gIGV4cGVjdGVkOiBzdHJpbmcsXG4gIHJlY2VpdmVkOiBzdHJpbmcsXG4gIHtcbiAgICBsb2NhdG9yLFxuICAgIHJldHJ5Q29uZmlnLFxuICAgIHVzZWRBc3NlcnQsXG4gICAgaXNTb2Z0LFxuICAgIGlzTmVnYXRlZCA9IGZhbHNlLFxuICAgIG9wdGlvbnMgPSB7fSxcbiAgICBtZXNzYWdlLFxuICAgIHNvZnRNb2RlLFxuICB9OiB7XG4gICAgbG9jYXRvcjogTG9jYXRvcjtcbiAgICByZXRyeUNvbmZpZzogUmV0cnlDb25maWc7XG4gICAgdXNlZEFzc2VydDogdHlwZW9mIGFzc2VydDtcbiAgICBpc1NvZnQ6IGJvb2xlYW47XG4gICAgaXNOZWdhdGVkPzogYm9vbGVhbjtcbiAgICBvcHRpb25zPzogUGFydGlhbDxSZXRyeUNvbmZpZz47XG4gICAgbWVzc2FnZT86IHN0cmluZztcbiAgICBzb2Z0TW9kZT86IFNvZnRNb2RlO1xuICB9LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGluZm8gPSBjcmVhdGVNYXRjaGVySW5mbyhtYXRjaGVyTmFtZSwgZXhwZWN0ZWQsIHJlY2VpdmVkLCB7XG4gICAgbWF0Y2hlclNwZWNpZmljOiB7XG4gICAgICBsb2NhdG9yLFxuICAgICAgdGltZW91dDogb3B0aW9ucy50aW1lb3V0LFxuICAgICAgaXNOZWdhdGVkLFxuICAgIH0sXG4gIH0sIG1lc3NhZ2UpO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgd2l0aFJldHJ5KGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNoZWNrRm4oKTtcbiAgICAgIC8vIElmIGlzTmVnYXRlZCBpcyB0cnVlLCB3ZSB3YW50IHRvIGludmVydCB0aGUgcmVzdWx0XG4gICAgICBjb25zdCBmaW5hbFJlc3VsdCA9IGlzTmVnYXRlZCA/ICFyZXN1bHQgOiByZXN1bHQ7XG5cbiAgICAgIGlmICghZmluYWxSZXN1bHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibWF0Y2hlciBmYWlsZWRcIik7XG4gICAgICB9XG5cbiAgICAgIHVzZWRBc3NlcnQoXG4gICAgICAgIGZpbmFsUmVzdWx0LFxuICAgICAgICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LmdldFJlbmRlcmVyKG1hdGNoZXJOYW1lKS5yZW5kZXIoXG4gICAgICAgICAgaW5mbyxcbiAgICAgICAgICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LmdldENvbmZpZygpLFxuICAgICAgICApLFxuICAgICAgICBpc1NvZnQsXG4gICAgICAgIHNvZnRNb2RlLFxuICAgICAgKTtcbiAgICB9LCB7IC4uLnJldHJ5Q29uZmlnLCAuLi5vcHRpb25zIH0pO1xuICB9IGNhdGNoIChfKSB7XG4gICAgdXNlZEFzc2VydChcbiAgICAgIGZhbHNlLFxuICAgICAgTWF0Y2hlckVycm9yUmVuZGVyZXJSZWdpc3RyeS5nZXRSZW5kZXJlcihtYXRjaGVyTmFtZSkucmVuZGVyKFxuICAgICAgICBpbmZvLFxuICAgICAgICBNYXRjaGVyRXJyb3JSZW5kZXJlclJlZ2lzdHJ5LmdldENvbmZpZygpLFxuICAgICAgKSxcbiAgICAgIGlzU29mdCxcbiAgICAgIHNvZnRNb2RlLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBib29sZWFuIHN0YXRlIG1hdGNoZXJzIChjaGVja2VkLCBkaXNhYmxlZCwgZXRjLilcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJvb2xlYW5TdGF0ZUVycm9yUmVuZGVyZXJcbiAgZXh0ZW5kcyBSZWNlaXZlZE9ubHlNYXRjaGVyUmVuZGVyZXIge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc3RhdGU6IHN0cmluZztcbiAgcHJvdGVjdGVkIGFic3RyYWN0IG9wcG9zaXRlU3RhdGU6IHN0cmluZztcblxuICBwcm90ZWN0ZWQgZ2V0TWF0Y2hlck5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHRvQmUke3RoaXMuc3RhdGVbMF0udG9VcHBlckNhc2UoKX0ke3RoaXMuc3RhdGUuc2xpY2UoMSl9YDtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRSZWNlaXZlZFBsYWNlaG9sZGVyKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwibG9jYXRvclwiO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGdldFNwZWNpZmljTGluZXMoXG4gICAgaW5mbzogTWF0Y2hlckVycm9ySW5mbyxcbiAgICBtYXliZUNvbG9yaXplOiAodGV4dDogc3RyaW5nLCBjb2xvcjoga2V5b2YgdHlwZW9mIEFOU0lfQ09MT1JTKSA9PiBzdHJpbmcsXG4gICk6IExpbmVHcm91cFtdIHtcbiAgICByZXR1cm4gW1xuICAgICAgeyBsYWJlbDogXCJFeHBlY3RlZFwiLCB2YWx1ZTogdGhpcy5zdGF0ZSwgZ3JvdXA6IDMgfSxcbiAgICAgIHsgbGFiZWw6IFwiUmVjZWl2ZWRcIiwgdmFsdWU6IHRoaXMub3Bwb3NpdGVTdGF0ZSwgZ3JvdXA6IDMgfSxcbiAgICAgIHsgbGFiZWw6IFwiQ2FsbCBsb2dcIiwgdmFsdWU6IFwiXCIsIGdyb3VwOiAzIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIlwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShcbiAgICAgICAgICBgICAtIGV4cGVjdC50b0JlJHt0aGlzLnN0YXRlWzBdLnRvVXBwZXJDYXNlKCl9JHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc2xpY2UoMSlcbiAgICAgICAgICB9IHdpdGggdGltZW91dCAke2luZm8ubWF0Y2hlclNwZWNpZmljPy50aW1lb3V0fW1zYCxcbiAgICAgICAgICBcImRhcmtHcmV5XCIsXG4gICAgICAgICksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgICByYXc6IHRydWUsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoYCAgLSB3YWl0aW5nIGZvciBsb2NhdG9yYCwgXCJkYXJrR3JleVwiKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICAgIHJhdzogdHJ1ZSxcbiAgICAgIH0sXG4gICAgXTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVG9CZUNoZWNrZWRFcnJvclJlbmRlcmVyIGV4dGVuZHMgQm9vbGVhblN0YXRlRXJyb3JSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBzdGF0ZSA9IFwiY2hlY2tlZFwiO1xuICBwcm90ZWN0ZWQgb3Bwb3NpdGVTdGF0ZSA9IFwidW5jaGVja2VkXCI7XG59XG5cbi8qKlxuICogQSBtYXRjaGVyIGVycm9yIHJlbmRlcmVyIGZvciB0aGUgYHRvQmVEaXNhYmxlZGAgbWF0Y2hlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvQmVEaXNhYmxlZEVycm9yUmVuZGVyZXIgZXh0ZW5kcyBCb29sZWFuU3RhdGVFcnJvclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIHN0YXRlID0gXCJkaXNhYmxlZFwiO1xuICBwcm90ZWN0ZWQgb3Bwb3NpdGVTdGF0ZSA9IFwiZW5hYmxlZFwiO1xufVxuXG5leHBvcnQgY2xhc3MgVG9CZUVkaXRhYmxlRXJyb3JSZW5kZXJlciBleHRlbmRzIEJvb2xlYW5TdGF0ZUVycm9yUmVuZGVyZXIge1xuICBwcm90ZWN0ZWQgc3RhdGUgPSBcImVkaXRhYmxlXCI7XG4gIHByb3RlY3RlZCBvcHBvc2l0ZVN0YXRlID0gXCJ1bmVkaXRhYmxlXCI7XG59XG5cbmV4cG9ydCBjbGFzcyBUb0JlRW5hYmxlZEVycm9yUmVuZGVyZXIgZXh0ZW5kcyBCb29sZWFuU3RhdGVFcnJvclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIHN0YXRlID0gXCJlbmFibGVkXCI7XG4gIHByb3RlY3RlZCBvcHBvc2l0ZVN0YXRlID0gXCJkaXNhYmxlZFwiO1xufVxuXG5leHBvcnQgY2xhc3MgVG9CZUhpZGRlbkVycm9yUmVuZGVyZXIgZXh0ZW5kcyBCb29sZWFuU3RhdGVFcnJvclJlbmRlcmVyIHtcbiAgcHJvdGVjdGVkIHN0YXRlID0gXCJoaWRkZW5cIjtcbiAgcHJvdGVjdGVkIG9wcG9zaXRlU3RhdGUgPSBcInZpc2libGVcIjtcbn1cblxuZXhwb3J0IGNsYXNzIFRvQmVWaXNpYmxlRXJyb3JSZW5kZXJlciBleHRlbmRzIEJvb2xlYW5TdGF0ZUVycm9yUmVuZGVyZXIge1xuICBwcm90ZWN0ZWQgc3RhdGUgPSBcInZpc2libGVcIjtcbiAgcHJvdGVjdGVkIG9wcG9zaXRlU3RhdGUgPSBcImhpZGRlblwiO1xufVxuXG5leHBvcnQgY2xhc3MgVG9IYXZlVmFsdWVFcnJvclJlbmRlcmVyIGV4dGVuZHMgRXhwZWN0ZWRSZWNlaXZlZE1hdGNoZXJSZW5kZXJlciB7XG4gIHByb3RlY3RlZCBnZXRNYXRjaGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcInRvSGF2ZVZhbHVlXCI7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgZ2V0U3BlY2lmaWNMaW5lcyhcbiAgICBpbmZvOiBNYXRjaGVyRXJyb3JJbmZvLFxuICAgIG1heWJlQ29sb3JpemU6ICh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBrZXlvZiB0eXBlb2YgQU5TSV9DT0xPUlMpID0+IHN0cmluZyxcbiAgKTogTGluZUdyb3VwW10ge1xuICAgIHJldHVybiBbXG4gICAgICAvLyBGSVhNRSAoQG9sZWlhZGUpOiBXaGVuIGs2LyM0MjEwIGlzIGZpeGVkLCB3ZSBjYW4gdXNlIHRoZSBsb2NhdG9yIGhlcmUuXG4gICAgICAvLyB7IGxhYmVsOiBcIkxvY2F0b3JcIiwgdmFsdWU6IG1heWJlQ29sb3JpemUoYGxvY2F0b3IoJyR7aW5mby5tYXRjaGVyU3BlY2lmaWM/LmxvY2F0b3J9JylgLCBcIndoaXRlXCIpLCBncm91cDogMyB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJFeHBlY3RlZFwiLFxuICAgICAgICB2YWx1ZTogbWF5YmVDb2xvcml6ZShpbmZvLmV4cGVjdGVkLCBcImdyZWVuXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIlJlY2VpdmVkXCIsXG4gICAgICAgIHZhbHVlOiBtYXliZUNvbG9yaXplKGluZm8ucmVjZWl2ZWQsIFwicmVkXCIpLFxuICAgICAgICBncm91cDogMyxcbiAgICAgIH0sXG4gICAgICB7IGxhYmVsOiBcIkNhbGwgbG9nXCIsIHZhbHVlOiBcIlwiLCBncm91cDogMyB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJcIixcbiAgICAgICAgdmFsdWU6IG1heWJlQ29sb3JpemUoXG4gICAgICAgICAgYCAgLSBleHBlY3QudG9IYXZlVmFsdWUgd2l0aCB0aW1lb3V0ICR7aW5mby5tYXRjaGVyU3BlY2lmaWM/LnRpbWVvdXR9bXNgLFxuICAgICAgICAgIFwiZGFya0dyZXlcIixcbiAgICAgICAgKSxcbiAgICAgICAgZ3JvdXA6IDMsXG4gICAgICAgIHJhdzogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICAvLyBGSVhNRSAoQG9sZWlhZGUpOiBXaGVuIGs2LyM0MjEwIGlzIGZpeGVkLCB3ZSBjYW4gdXNlIHRoZSBsb2NhdG9yJ3Mgc2VsZWN0b3IgaGVyZS5cbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiXCIsXG4gICAgICAgIHZhbHVlOiBtYXliZUNvbG9yaXplKGAgIC0gd2FpdGluZyBmb3IgbG9jYXRvcmAsIFwiZGFya0dyZXlcIiksXG4gICAgICAgIGdyb3VwOiAzLFxuICAgICAgICByYXc6IHRydWUsXG4gICAgICB9LFxuICAgIF07XG4gIH1cbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIHJldHJ5IGxvZ2ljIGZvciBhc3luYyBhc3NlcnRpb25zLlxuICpcbiAqIEBwYXJhbSBhc3NlcnRpb24gRnVuY3Rpb24gdGhhdCBwZXJmb3JtcyB0aGUgYWN0dWFsIGNoZWNrXG4gKiBAcGFyYW0gb3B0aW9ucyBSZXRyeSBjb25maWd1cmF0aW9uXG4gKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhc3NlcnRpb24gcGFzc2VzIG9yIHJlamVjdHMgaWYgdGltZW91dCBpcyByZWFjaGVkXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoUmV0cnkoXG4gIGFzc2VydGlvbjogKCkgPT4gUHJvbWlzZTx2b2lkPixcbiAgb3B0aW9uczogUmV0cnlDb25maWcgJiB7XG4gICAgLy8gT3B0aW9uYWwgdGVzdCBob29rcyAtIG9ubHkgdXNlZCBpbiB0ZXN0aW5nXG4gICAgX25vdz86ICgpID0+IG51bWJlcjtcbiAgICBfc2xlZXA/OiAobXM6IG51bWJlcikgPT4gUHJvbWlzZTx2b2lkPjtcbiAgfSA9IHt9LFxuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHRpbWVvdXQ6IG51bWJlciA9IG9wdGlvbnMudGltZW91dCA/PyBERUZBVUxUX1JFVFJZX09QVElPTlMudGltZW91dDtcbiAgY29uc3QgaW50ZXJ2YWw6IG51bWJlciA9IG9wdGlvbnMuaW50ZXJ2YWwgPz8gREVGQVVMVF9SRVRSWV9PUFRJT05TLmludGVydmFsO1xuICBjb25zdCBnZXROb3cgPSBvcHRpb25zLl9ub3cgPz8gKCgpID0+IERhdGUubm93KCkpO1xuICBjb25zdCBzbGVlcCA9IG9wdGlvbnMuX3NsZWVwID8/XG4gICAgKChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpKTtcblxuICBjb25zdCBzdGFydFRpbWU6IG51bWJlciA9IGdldE5vdygpO1xuXG4gIHdoaWxlIChnZXROb3coKSAtIHN0YXJ0VGltZSA8IHRpbWVvdXQpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXNzZXJ0aW9uKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIC8vIElnbm9yZSBlcnJvciBhbmQgY29udGludWUgcmV0cnlpbmdcbiAgICB9XG5cbiAgICBhd2FpdCBzbGVlcChpbnRlcnZhbCk7XG4gIH1cblxuICB0aHJvdyBuZXcgUmV0cnlUaW1lb3V0RXJyb3IoXG4gICAgYEV4cGVjdCBjb25kaXRpb24gbm90IG1ldCB3aXRoaW4gJHt0aW1lb3V0fW1zIHRpbWVvdXRgLFxuICApO1xufVxuXG4vKipcbiAqIFJldHJ5VGltZW91dEVycm9yIGlzIGFuIGVycm9yIHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gZXhwZWN0YXRpb24gaXMgbm90IG1ldCB3aXRoaW4gYSBwcm92aWRlZCB0aW1lb3V0LlxuICovXG5leHBvcnQgY2xhc3MgUmV0cnlUaW1lb3V0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiUmV0cnlUaW1lb3V0RXJyb3JcIjtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgTG9jYXRvciB9IGZyb20gXCJrNi9icm93c2VyXCI7XG5pbXBvcnQgeyBDb25maWdMb2FkZXIsIHR5cGUgRXhwZWN0Q29uZmlnIH0gZnJvbSBcIi4vY29uZmlnLnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVFeHBlY3RhdGlvbiBhcyBjcmVhdGVOb25SZXRyeWluZ0V4cGVjdGF0aW9uLFxuICB0eXBlIE5vblJldHJ5aW5nRXhwZWN0YXRpb24sXG59IGZyb20gXCIuL2V4cGVjdE5vblJldHJ5aW5nLnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVFeHBlY3RhdGlvbiBhcyBjcmVhdGVSZXRyeWluZ0V4cGVjdGF0aW9uLFxuICB0eXBlIFJldHJ5aW5nRXhwZWN0YXRpb24sXG59IGZyb20gXCIuL2V4cGVjdFJldHJ5aW5nLnRzXCI7XG5cbi8qKlxuICogVGhlIGV4cGVjdCBmdW5jdGlvbiBpcyB1c2VkIHRvIGFzc2VydCB0aGF0IGEgdmFsdWUgbWVldHMgY2VydGFpbiBjb25kaXRpb25zLlxuICpcbiAqIFRoZSBleHBlY3QgZnVuY3Rpb24gY2FuIGJlIHVzZWQgaW4gdHdvIHdheXM6XG4gKlxuICogMS4gTm9uLXJldHJ5aW5nOiBUaGUgZXhwZWN0IGZ1bmN0aW9uIHdpbGwgcGVyZm9ybSB0aGUgYXNzZXJ0aW9uIG9ubHkgb25jZS4gSWYgdGhlIGFzc2VydGlvblxuICogaXMgbm90IG1ldCwgdGhlIHRlc3Qgd2lsbCBmYWlsLlxuICogMi4gUmV0cnlpbmc6IFRoZSBleHBlY3QgZnVuY3Rpb24gd2lsbCBwZXJmb3JtIHRoZSBhc3NlcnRpb24gbXVsdGlwbGUgdGltZXMsIHVudGlsIHRoZSBhc3NlcnRpb25cbiAqIGlzIG1ldCBvciB0aGUgdGltZW91dCBpcyByZWFjaGVkLiBJZiB0aGUgYXNzZXJ0aW9uIGlzIG5vdCBtZXQsIHRoZSB0ZXN0IHdpbGwgZmFpbC5cbiAqXG4gKiBAcGFyYW0ge3Vua25vd24gfCBMb2NhdG9yfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzZXJ0LlxuICovXG5leHBvcnQgY29uc3QgZXhwZWN0OiBFeHBlY3RGdW5jdGlvbiA9IG1ha2VFeHBlY3QoKTtcblxuZXhwb3J0IGludGVyZmFjZSBFeHBlY3RGdW5jdGlvbiB7XG4gIC8qKlxuICAgKiBUaGUgZXhwZWN0IGZ1bmN0aW9uIGNhbiBiZSB1c2VkIGRpcmVjdGx5IHRvIGFzc2VydCB0aGF0IGEgdmFsdWUgbWVldHMgY2VydGFpbiBjb25kaXRpb25zLlxuICAgKlxuICAgKiBJZiB0aGUgdmFsdWUgYXJndW1lbnQgcHJvdmlkZWQgdG8gaXQgaXMgYSBMb2NhdG9yLCB0aGUgZXhwZWN0IGZ1bmN0aW9uIHdpbGxcbiAgICogcmV0dXJuIGEgKGFzeW5jaHJvbm91cykgUmV0cnlpbmdFeHBlY3RhdGlvbiwgb3RoZXJ3aXNlIGl0IHdpbGwgcmV0dXJuIGEgTm9uUmV0cnlpbmdFeHBlY3RhdGlvbi5cbiAgICovXG4gIDxUPih2YWx1ZTogVCwgbWVzc2FnZT86IHN0cmluZyk6IFQgZXh0ZW5kcyBMb2NhdG9yID8gUmV0cnlpbmdFeHBlY3RhdGlvblxuICAgIDogTm9uUmV0cnlpbmdFeHBlY3RhdGlvbjtcblxuICAvKipcbiAgICogVGhlIHNvZnQgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gYXNzZXJ0IHRoYXQgYSB2YWx1ZSBtZWV0cyBjZXJ0YWluIGNvbmRpdGlvbnMsIGJ1dFxuICAgKiB3aXRob3V0IHRlcm1pbmF0aW5nIHRoZSB0ZXN0IGlmIHRoZSBhc3NlcnRpb24gaXMgbm90IG1ldC5cbiAgICovXG4gIHNvZnQ8VD4oXG4gICAgdmFsdWU6IFQsXG4gICAgbWVzc2FnZT86IHN0cmluZyxcbiAgKTogVCBleHRlbmRzIExvY2F0b3IgPyBSZXRyeWluZ0V4cGVjdGF0aW9uIDogTm9uUmV0cnlpbmdFeHBlY3RhdGlvbjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBleHBlY3QgaW5zdGFuY2Ugd2l0aCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cbiAgICovXG4gIGNvbmZpZ3VyZShuZXdDb25maWc6IFBhcnRpYWw8RXhwZWN0Q29uZmlnPik6IEV4cGVjdEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBUaGUgY29uZmlndXJhdGlvbiB1c2VkIGJ5IHRoZSBleHBlY3QgZnVuY3Rpb24uXG4gICAqL1xuICByZWFkb25seSBjb25maWc6IEV4cGVjdENvbmZpZztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGV4cGVjdCBmdW5jdGlvbiB3aXRoIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uLlxuICpcbiAqIFRoaXMgYWxsb3dzIHVzXG4gKlxuICogQHBhcmFtIGJhc2VDb25maWcgVGhlIGJhc2UgY29uZmlndXJhdGlvbiBmb3IgdGhlIGV4cGVjdCBmdW5jdGlvbi5cbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIG1ha2VFeHBlY3QoYmFzZUNvbmZpZz86IFBhcnRpYWw8RXhwZWN0Q29uZmlnPik6IEV4cGVjdEZ1bmN0aW9uIHtcbiAgLyoqXG4gICAqIExvYWRzIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgZXhwZWN0IGZ1bmN0aW9uLlxuICAgKi9cbiAgY29uc3QgY29uZmlnID0gQ29uZmlnTG9hZGVyLmxvYWQoYmFzZUNvbmZpZyk7XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAgZnVuY3Rpb24gPFQ+KFxuICAgICAgdmFsdWU6IFQsXG4gICAgICBtZXNzYWdlPzogc3RyaW5nLFxuICAgICk6IFQgZXh0ZW5kcyBMb2NhdG9yID8gUmV0cnlpbmdFeHBlY3RhdGlvbiA6IE5vblJldHJ5aW5nRXhwZWN0YXRpb24ge1xuICAgICAgaWYgKGlzTG9jYXRvcih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVJldHJ5aW5nRXhwZWN0YXRpb24oXG4gICAgICAgICAgdmFsdWUgYXMgTG9jYXRvcixcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgKSBhcyBUIGV4dGVuZHMgTG9jYXRvciA/IFJldHJ5aW5nRXhwZWN0YXRpb24gOiBOb25SZXRyeWluZ0V4cGVjdGF0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU5vblJldHJ5aW5nRXhwZWN0YXRpb24oXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICkgYXMgVCBleHRlbmRzIExvY2F0b3IgPyBSZXRyeWluZ0V4cGVjdGF0aW9uIDogTm9uUmV0cnlpbmdFeHBlY3RhdGlvbjtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIHNvZnQ8VD4oXG4gICAgICAgIHZhbHVlOiBULFxuICAgICAgICBtZXNzYWdlPzogc3RyaW5nLFxuICAgICAgKTogVCBleHRlbmRzIExvY2F0b3IgPyBSZXRyeWluZ0V4cGVjdGF0aW9uIDogTm9uUmV0cnlpbmdFeHBlY3RhdGlvbiB7XG4gICAgICAgIGlmIChpc0xvY2F0b3IodmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZVJldHJ5aW5nRXhwZWN0YXRpb24oXG4gICAgICAgICAgICB2YWx1ZSBhcyBMb2NhdG9yLFxuICAgICAgICAgICAgeyAuLi5jb25maWcsIHNvZnQ6IHRydWUgfSxcbiAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgKSBhcyBUIGV4dGVuZHMgTG9jYXRvciA/IFJldHJ5aW5nRXhwZWN0YXRpb24gOiBOb25SZXRyeWluZ0V4cGVjdGF0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjcmVhdGVOb25SZXRyeWluZ0V4cGVjdGF0aW9uKFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICB7IC4uLmNvbmZpZywgc29mdDogdHJ1ZSB9LFxuICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICApIGFzIFQgZXh0ZW5kcyBMb2NhdG9yID8gUmV0cnlpbmdFeHBlY3RhdGlvbiA6IE5vblJldHJ5aW5nRXhwZWN0YXRpb247XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb25maWd1cmUobmV3Q29uZmlnOiBQYXJ0aWFsPEV4cGVjdENvbmZpZz4pOiBFeHBlY3RGdW5jdGlvbiB7XG4gICAgICAgIHJldHVybiBtYWtlRXhwZWN0KG5ld0NvbmZpZyk7XG4gICAgICB9LFxuICAgICAgZ2V0IGNvbmZpZygpOiBFeHBlY3RDb25maWcge1xuICAgICAgICByZXR1cm4geyAuLi5jb25maWcgfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIGEgYnJvd3NlciBMb2NhdG9yLlxuICpcbiAqIElmIGl0IHF1YWNrcyBsaWtlIGEgZHVjaywgaXQncyBhIGR1Y2suXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHZhbHVlIGlzIGEgTG9jYXRvci5cbiAqL1xuZnVuY3Rpb24gaXNMb2NhdG9yKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgTG9jYXRvciB7XG4gIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgbG9jYXRvclByb3BlcnRpZXMgPSBbXG4gICAgXCJjbGVhclwiLFxuICAgIFwiaXNFbmFibGVkXCIsXG4gICAgXCJpc0hpZGRlblwiLFxuICAgIFwiZ2V0QXR0cmlidXRlXCIsXG4gICAgXCJzZWxlY3RPcHRpb25cIixcbiAgICBcInByZXNzXCIsXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJkaXNwYXRjaEV2ZW50XCIsXG4gICAgXCJkYmxjbGlja1wiLFxuICAgIFwic2V0Q2hlY2tlZFwiLFxuICAgIFwiaXNEaXNhYmxlZFwiLFxuICAgIFwiZm9jdXNcIixcbiAgICBcImlubmVyVGV4dFwiLFxuICAgIFwiaW5wdXRWYWx1ZVwiLFxuICAgIFwiY2hlY2tcIixcbiAgICBcImlzRWRpdGFibGVcIixcbiAgICBcImZpbGxcIixcbiAgICBcInRleHRDb250ZW50XCIsXG4gICAgXCJob3ZlclwiLFxuICAgIFwid2FpdEZvclwiLFxuICAgIFwiY2xpY2tcIixcbiAgICBcInVuY2hlY2tcIixcbiAgICBcImlzQ2hlY2tlZFwiLFxuICAgIFwiaXNWaXNpYmxlXCIsXG4gICAgXCJpbm5lckhUTUxcIixcbiAgICBcInRhcFwiLFxuICBdO1xuXG4gIGNvbnN0IGhhc0xvY2F0b3JQcm9wZXJ0aWVzID0gKHZhbHVlOiBvYmplY3QpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gbG9jYXRvclByb3BlcnRpZXMuZXZlcnkoKHByb3ApID0+IHByb3AgaW4gdmFsdWUpO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgdmFsdWUgIT09IG51bGwgJiZcbiAgICB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgaGFzTG9jYXRvclByb3BlcnRpZXModmFsdWUpXG4gICk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNXQSxpQ0FBaUI7QUFzQlYsV0FBUyxPQUNkLFdBQ0EsU0FDQSxNQUNBLFdBQXFCLFNBQ3JCO0FBQ0EsUUFBSSxVQUFXO0FBRWYsUUFBSSxNQUFNO0FBQ1IsVUFBSSxhQUFhLFFBQVE7QUFFdkIsaUNBQUFBLFFBQUssS0FBSyxLQUFLLE9BQU87QUFBQSxNQUN4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
