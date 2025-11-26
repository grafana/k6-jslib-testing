import type { Options } from "k6/options";
import { ConfigLoader, DEFAULT_CONFIG } from "../config.ts";
import { expect } from "../expect.ts";
import { rootTestSuite } from "./suite.ts";
import { makeTestFunction } from "./test.ts";
import { TestCaseError } from "./types.ts";
import exec from "../k6-execution-shim.ts";
import * as ansi from "../colors.ts";
import { parseStackTrace } from "../stacktrace.ts";
import { captureExecutionContext } from "../execution.ts";
import { dirname } from "../utils/path.ts";
import { formatSummary, formatTestName } from "./summary.ts";

const { test, it, describe } = makeTestFunction({
  suite: rootTestSuite,

  options: {
    expect: {
      ...DEFAULT_CONFIG,
      assertFn: (condition: boolean, message: string) => {
        if (!condition) {
          throw new TestCaseError(message);
        }
      },
    },
  },

  createContext: (options) => {
    return {
      context: {
        expect: expect.configure(options.expect),
      },
    };
  },

  mergeOptions: (baseOptions, newOptions) => {
    return {
      ...baseOptions,
      expect: {
        ...baseOptions.expect,
        ...newOptions.expect,
      },
    };
  },
});

export { describe, it, test };

export const options: Options = {
  scenarios: {
    default: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
      exec: "default",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

interface RunOptions {
  colorize?: boolean;
}

export function runSuite(options: RunOptions) {
  const config = ConfigLoader.load(options);
  const colorize = config.colorize ? ansi.colorize : (str: string) => str;

  const stackTrace = parseStackTrace(new Error().stack);
  const executationContext = captureExecutionContext(stackTrace);

  if (!executationContext) {
    throw new Error("Could not capture execution context");
  }

  const cwd = dirname(executationContext.filePath);

  return async function () {
    const results = await rootTestSuite.run({
      cwd,
      onTestCase(result) {
        const color = result.type === "pass" ? "green" : "red";
        const icon = result.type === "pass" ? "✔" : "✖";

        const name = formatTestName(result);

        console.log(
          colorize(`${icon} ${name} (${result.meta.duration}ms)`, color),
        );
      },
    });

    const summary = formatSummary(results, colorize);

    console.log(summary);

    if (results.some((result) => result.type === "fail")) {
      exec.test.fail(`One or more test case(s) failed`);
    }
  };
}
