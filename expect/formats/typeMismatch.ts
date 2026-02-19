import { green, red, registerFormatter } from "../formatting/index.ts";
import { printJsValue } from "./utils.ts";

function typeOf(value: unknown): PrimitiveType {
  if (value instanceof Object && value.constructor !== Object) {
    return { name: value.constructor.name };
  }

  return value === null ? "null" : typeof value;
}

function printType(type: PrimitiveType): string {
  if (type === "array") {
    return "array";
  }

  if (type instanceof Object) {
    return type.name || "Object";
  }

  return type;
}

type PrimitiveType =
  | { name: string } // Object constructor name
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "array"
  | "function"
  | "null";

declare module "../errors.ts" {
  interface ErrorFormats {
    "type-mismatch": {
      expected: PrimitiveType[];
      received: unknown;
    };
  }
}

registerFormatter("type-mismatch", ({ expected, received }) => {
  const expectedType = expected.map(printType).join(" | ");
  const receivedType = printType(typeOf(received));

  return {
    "Expected type": green(expectedType),
    "Received type": red(receivedType),
    "Received value": red(printJsValue(received)),
  };
});
