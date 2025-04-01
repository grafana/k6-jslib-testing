import { expect, fail, pass } from "../newExpect.ts";

declare module "../newExpect.ts" {
  export interface Matchers<Actual> {
    toBe: (actual: Actual, expected: unknown) => void;
  }
}

expect.register("toBe", (actual, expected) => {
  if (Object.is(actual, expected)) {
    return pass();
  }

  return fail({
    format() {
      return [];
    },
  });
});
