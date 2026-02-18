import { green, red, registerFormatter } from "../formatting/index.ts";
import { printJsValue } from "./utils.ts";

/**
 * Relational operators used in comparison matchers (e.g. toBeGreaterThan, toBeLessThan).
 */
export type RelationalOperator = ">" | ">=" | "<" | "<=";

declare module "../errors.ts" {
  interface ErrorFormats {
    "relational-comparison": {
      expected: number | bigint;
      received: number | bigint;
      operator: RelationalOperator;
    };
  }
}

registerFormatter(
  "relational-comparison",
  ({ expected, received, operator }) => {
    return {
      Expected: green(operator + " " + printJsValue(expected)),
      Received: red(printJsValue(received)),
    };
  },
);
