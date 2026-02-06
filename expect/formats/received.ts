import { green, red, registerFormatter } from "../formatting/index.ts";
import { printJsValue } from "./utils.ts";

declare module "../errors.ts" {
  interface ErrorFormats {
    "received": {
      received: unknown;
    };
  }
}

registerFormatter("received", ({ received }) => {
  return {
    Received: red(printJsValue(received)),
  };
});
