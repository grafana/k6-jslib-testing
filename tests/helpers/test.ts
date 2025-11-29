// @ts-types="../../dist/index.d.ts"
import { expect as baseExpect, test as baseTest } from "../../dist/index.js";

function makeExpectWithSpy() {
  const result: { passed: boolean; message: string | null } = {
    passed: true,
    message: null,
  };

  const expectFn = baseExpect.configure({
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

const { describe, it, test } = baseTest.extend({
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
