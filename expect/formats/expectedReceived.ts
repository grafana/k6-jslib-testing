import { green, red, registerFormatter } from "../index.ts";
import { printJsValue } from "./utils.ts";

declare module "../errors.ts" {
  interface ErrorFormats {
    "expected-received": {
      expected: unknown;
      received: unknown;
    };
  }
}

registerFormatter("expected-received", ({ expected, received }) => {
  return {
    Expected: green(printJsValue(expected)),
    Received: red(printJsValue(received)),
  };
});
