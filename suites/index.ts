import type { ExpectConfig } from "../config.ts";
import { TestSuite } from "./suite.ts";
import { makeTestFunction } from "./test.ts";
import { expect as globalExpect } from "../expect.ts";
import { TestCaseError } from "./types.ts";

interface CreateTestSuiteOptions {
  /**
   * Configuration options for the `expect` function used in tests.
   */
  expect?: Partial<Omit<ExpectConfig, "assertFn">>;
}

/**
 * Creates a new test suite. The suite includes test functions (`test`, `it`, `describe`) that
 * can be used to define test cases and groups.
 *
 * @param options Configuration options for creating the test suite.
 * @returns A new test suite with associated test functions.
 */
export function createTestSuite(
  { expect: expectConfig }: CreateTestSuiteOptions = {},
) {
  const suite = new TestSuite();

  const { test, it, describe } = makeTestFunction({
    suite,
    options: {
      expect: expectConfig,
    },

    mergeOptions(prev, next) {
      return {
        ...prev,
        expect: {
          ...prev.expect,
          ...next.expect,
        },
      };
    },

    createContext(options) {
      const expect = globalExpect.configure({
        ...options.expect,
        assertFn(condition, message) {
          if (condition) {
            return;
          }

          throw new TestCaseError(message);
        },
      });

      return {
        context: {
          expect,
        },
      };
    },
  });

  return {
    suite,
    test,
    it,
    describe,
  };
}

export type { TestSuite };
