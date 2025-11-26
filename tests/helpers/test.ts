import type { expect as globalExpect, test as globalTest } from "../../mod.ts";
import { expect, test as baseTest } from "../../dist/index.js";

// Hacky way to get correct typing for the test and expect functions in dist/index.js
const typedTest = baseTest as unknown as typeof globalTest;
const typedExpect = expect as unknown as typeof globalExpect;

function makeExpectWithSpy() {
  const result: { passed: boolean; message: string | null } = {
    passed: true,
    message: null,
  };

  const expectFn = typedExpect.configure({
    colorize: false,
    assertFn(condition: boolean, message: string) {
      result.passed = condition;

      // Remove file/line info for snapshot consistency
      result.message = message.replace(/At: .*$/mg, "At: ...").replace(
        /Line: \d+$/mg,
        "Line: ...",
      );
    },
  });

  return [result, expectFn] as const;
}

const { describe, it, test } = typedTest.extend({
  defaultOptions: {},

  mergeOptions: (baseOptions) => baseOptions,

  createContext() {
    const [result, expect] = makeExpectWithSpy();

    return {
      context: {
        spy: {
          result,
          expect,
        },
      },
    };
  },
});

export { describe, it, test };
