import type { AnyError, ErrorFormats } from "../errors.ts";
import type { FormattedMessage } from "./values.ts";

const formatters: {
  [Type in keyof ErrorFormats]?: (
    error: AnyError,
  ) => FormattedMessage;
} = {};

/**
 * Registers a formatter for the given error type.
 *
 * To add a new error format, extend the `ErrorFormats` interface using
 * [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * then register the format using this function.
 *
 * The formatter function will be called with the error object and should
 * return a `FormattedMessage` representing the formatted error.
 *
 * @param type The error format type to register the formatter for.
 * @param formatter A function that formats the error into a `FormattedMessage`.
 *
 * @example
 * ```ts
 * import { expect } from "k6/expect";
 *
 * declare module "k6/expect" {
 *   interface ErrorFormats {
 *     myCustomFormat: {
 *       actual: unknown;
 *       expected: unknown;
 *       customField: string;
 *     };
 *   }
 * }
 *
 * expect.registerFormatter("myCustomFormat", (error) => {
 *   return [
 *     { Expected: error.expected },
 *     { Received: error.actual },
 *     { Info: error.customField },
 *   ];
 * });
 * ```
 */
export function registerFormatter<Format extends keyof ErrorFormats>(
  type: Format,
  formatter: (error: Extract<AnyError, { format: Format }>) => FormattedMessage,
): void {
  formatters[type] = formatter as (error: AnyError) => FormattedMessage;
}

/**
 * Formats the given error using the registered formatter for its type.
 */
export function formatError<AssertionError extends AnyError>(
  error: AssertionError,
): FormattedMessage {
  const formatter = formatters[error.format];

  if (!formatter) {
    throw new Error(`No formatter registered for error type: ${error.format}`);
  }

  return formatter(error);
}
