import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";
import { green, red } from "../formatting/index.ts";

function getConstructorName(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (value instanceof Object === false) {
    return typeof value;
  }

  return value.constructor?.name ?? "Object";
}

function createInstanceOfMessage(
  expectedName: string,
  receivedName: string,
) {
  return {
    "Expected constructor": green(expectedName),
    "Received constructor": red(receivedName),
  };
}

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that value is an instance of a class. Uses instanceof operator.
     *
     * @param expected The class or constructor function.
     */
    // deno-lint-ignore ban-types
    toBeInstanceOf(expected: Function): void;
  }
}

extend("toBeInstanceOf", {
  // deno-lint-ignore ban-types
  match(received, expected: Function) {
    const receivedName = getConstructorName(received);
    const expectedName = expected.name;

    if (!(received instanceof expected)) {
      throw new AssertionFailed({
        format: "custom",
        content: createInstanceOfMessage(expectedName, receivedName),
      });
    }

    return {
      negate: {
        format: "custom",
        content: createInstanceOfMessage(expectedName, receivedName),
      },
    };
  },
});
