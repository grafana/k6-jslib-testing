import { green, red, registerFormatter } from "../formatting/index.ts";

declare module "../errors.ts" {
  interface ErrorFormats {
    "text-match": {
      expected: string | RegExp;
      received: string;
    };
  }
}

function formatExpected(expected: string | RegExp): string {
  return expected instanceof RegExp ? expected.toString() : expected;
}

/**
 * Similar to the expected-received error, but it assumes that a text match
 * occurred. Unlike expected-received, this format will not wrap string values
 * in quotes.
 */
registerFormatter("text-match", ({ expected, received }) => {
  return {
    Expected: green(formatExpected(expected)),
    Received: red(received),
  };
});
