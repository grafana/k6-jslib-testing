import type { Options } from "k6/options";
import { ConfigLoader, DEFAULT_CONFIG, type ExpectConfig } from "../config.ts";
import { expect, type ExpectFunction } from "../expect.ts";
import { rootTestSuite } from "./suite.ts";
import { makeTestFunction } from "./test.ts";
import { TestCaseError } from "./types.ts";
import exec from "../k6-execution-shim.ts";
import * as ansi from "../colors.ts";
import { parseStackTrace } from "../stacktrace.ts";
import { captureExecutionContext } from "../execution.ts";
import { dirname } from "../utils/path.ts";
import { formatSummary, formatTestName } from "./summary.ts";
import type { TestFunctions } from "./test.ts";
import { createTestOptions, type TestSuiteOptions } from "./options.ts";

type GlobalTestFunctions = TestFunctions<
  { expect: ExpectFunction },
  { expect: ExpectConfig }
>;

const fns: GlobalTestFunctions = makeTestFunction({
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

export const test = fns.test;
export const it = fns.it;
export const describe = fns.describe;

interface DefineTestSuiteOptions extends TestSuiteOptions {
  /**
   * Whether to colorize the output. Unless explicitly set to false, this options
   * will match the option of the `expect` function.
   */
  colorize?: boolean;
}

export interface TestSuiteDefinition {
  options: Options;
  runSuite: () => Promise<void>;
}

export function defineSuite(
  options: DefineTestSuiteOptions,
): TestSuiteDefinition {
  const stackTrace = parseStackTrace(new Error().stack);
  const executationContext = captureExecutionContext(stackTrace);

  if (!executationContext) {
    throw new Error("Could not capture execution context");
  }

  const config = ConfigLoader.load(options);

  const colorize = config.colorize
    ? ansi.colorize
    : (str: string | undefined) => str ?? "";

  const cwd = dirname(executationContext.filePath);

  async function runSuite() {
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
  }

  return {
    options: createTestOptions(options),
    runSuite,
  };
}
