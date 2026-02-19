import { green, red, registerFormatter } from "../formatting/index.ts";

// TODO: Pretty print things like object constructors.
type PrimitiveTypes =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "null";

declare module "../errors.ts" {
  interface ErrorFormats {
    "type-mismatch": {
      expected: PrimitiveTypes[] | PrimitiveTypes;
      received: PrimitiveTypes;
    };
  }
}

registerFormatter("type-mismatch", ({ expected, received }) => {
  return {
    Expected: green(Array.isArray(expected) ? expected.join(" | ") : expected),
    Received: red(received),
  };
});
