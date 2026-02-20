import { extend } from "../extend.ts";
import { AssertionFailed } from "../errors.ts";
import { green, red } from "../formatting/index.ts";
import { printJsValue } from "../formats/utils.ts";

declare module "../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that value has a `.length` property equal to expected.
     * Useful for arrays and strings.
     *
     * @param expected
     */
    toHaveLength: Received extends { length: number }
      ? (expected: number) => void
      : never;
  }
}

function getLength(value: unknown): number | undefined {
  if (typeof value === "string") {
    return value.length;
  }

  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  if ("length" in value && typeof value.length === "number") {
    return value.length;
  }

  return undefined;
}

extend("toHaveLength", {
  match(received, expected) {
    const actualLength = getLength(received);

    if (actualLength === undefined) {
      throw new AssertionFailed({
        format: "type-mismatch",
        expected: ["string", "array", "object"],
        received,
      });
    }

    if (actualLength !== expected) {
      throw new AssertionFailed({
        format: "custom",
        content: {
          "Expected length": green(String(expected)),
          "Received length": red(String(actualLength)),
          "Received value": red(printJsValue(received)),
        },
      });
    }

    return {
      negate: {
        format: "custom",
        content: {
          "Expected length": green(String(expected)),
          "Received length": red(String(actualLength)),
          "Received value": red(printJsValue(received)),
        },
      },
    };
  },
});
