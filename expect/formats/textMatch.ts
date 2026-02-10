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

registerFormatter("text-match", ({ expected, received }) => {
  return {
    Expected: green(formatExpected(expected)),
    Received: red(received),
  };
});
