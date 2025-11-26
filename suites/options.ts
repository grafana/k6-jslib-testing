import type { Options, Scenario } from "k6/options";

const BROWSER_OPTIONS: Scenario["options"] = {
  browser: {
    type: "chromium",
  },
};

const DEFAULT_SCENARIO: Scenario = {
  executor: "per-vu-iterations",
  vus: 1,
  iterations: 1,
  exec: "default",
};

export interface TestSuiteOptions {
  /**
   * The name of the scenario the test suite will belong to. Defaults to 'default'.
   */
  name?: string;

  /**
   * An alternative scenario configuration for running the test suite. If not provided,
   * a 1 vu, 1 iteration per-vu-iterations executor will be used. Browser testing is enabled
   * if the `browser` option is set to true
   */
  scenario?: Scenario;

  /**
   * Whether to run the tests with k6/browser enabled. Defaults to true.
   */
  browser?: boolean;

  /**
   * Additional k6 options to use when running the test suite. If a colliding name
   * for the scenario is provided, the `name` and `executor` options will take precedence.
   */
  options?: Options;
}

export function createTestOptions(
  { name = "default", browser = true, scenario = DEFAULT_SCENARIO, options }:
    TestSuiteOptions,
): Options {
  return {
    ...options,
    scenarios: {
      ...options?.scenarios,
      [name]: {
        ...scenario,
        options: browser ? BROWSER_OPTIONS : scenario.options,
      },
    },
  };
}
