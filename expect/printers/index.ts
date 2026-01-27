import type { NormalizedMessage, PrinterOptions } from "./types.ts";
import type { FormattedMessage } from "../index.ts";

import * as pretty from "./pretty.ts";
import * as logfmt from "./logfmt.ts";

function normalizeMessage(
  message: FormattedMessage,
): NormalizedMessage {
  return Array.of(message)
    .flat()
    .map((group) => {
      return Object.fromEntries(
        Object.entries(group).flatMap(([key, value]) => {
          if (!value && value !== "") {
            return [];
          }

          return [[key, value]];
        }),
      );
    });
}

/**
 * Prints a formatted value using the specified printer options.
 */
export function printError(options: PrinterOptions): string {
  const normalizedError = normalizeMessage(options.error);

  switch (options.printer) {
    case "pretty":
      return pretty.print(normalizedError, options);

    case "logfmt":
      return logfmt.print(normalizedError, options);

    default:
      return options.printer satisfies never;
  }
}
