import { registerFormatter } from "../formatting/formatter.ts";
import type { FormattedMessage } from "../index.ts";

declare module "../errors.ts" {
  interface ErrorFormats {
    "custom": {
      content: FormattedMessage;
    };
  }
}

// This formatter is usable when the matcher has a very specific format
// that isn't really reusable elsewhere.
registerFormatter("custom", ({ content }) => {
  return content;
});
