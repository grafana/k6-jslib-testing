import { expect } from "../newExpect.ts";

declare module "../newExpect.ts" {
  export interface Matchers<Actual> {
    toBe: MatcherFn<unknown, [unknown], void>;
  }
}

expect.register("toBe", (expectation, actual, expected) => {
  if (!Object.is(actual, expected)) {
    expectation.fail({
      format() {
        return [];
      },
    });
  }
});
