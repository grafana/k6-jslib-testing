import type { ExecutionContext } from "../../execution.ts";
import type { AnyError } from "../errors.ts";
import { formatError } from "./formatter.ts";
import {
  darkGrey,
  type FormattedMessage,
  green,
  join,
  red,
  type Value,
  value,
  white,
} from "./values.ts";

interface FormatErrorWithContextOptions {
  error: AnyError;
  executionContext: ExecutionContext;
  matcher: {
    name: string;
    // deno-lint-ignore no-explicit-any
    fn: (...args: any[]) => any;
    args: unknown[];
  };
  negated: boolean;
  message?: string;
}

/**
 * Naively parses the function arguments from the matcher function source, ignoring
 * default values, rest parameters, destructuring, etc. This should be sufficient for
 * most use cases and if not, we can always improve it later.
 */
function parseArgs(
  fn: (received: unknown, ...args: unknown[]) => unknown,
): string[] {
  const source = fn.toString();

  const startIndex = source.indexOf("(") + 1;

  let parens = 1;
  let endIndex = startIndex;

  while (endIndex < source.length && parens > 0) {
    const char = source[endIndex];

    if (char === "(") {
      parens++;
    } else if (char === ")") {
      parens--;
    }

    endIndex++;
  }

  return source.slice(startIndex, endIndex - 1).split(",")
    .map((arg) => arg.split("=")[0] ?? arg)
    .map((arg) => arg.trim())
    .slice(1); // Skip `received` argument
}

function formatErrorLine(
  options: FormatErrorWithContextOptions,
): Value {
  if (options.message !== undefined) {
    return options.message;
  }

  const args = join(
    parseArgs(options.matcher.fn)
      // Only show as many args as were actually passed
      .slice(0, options.matcher.args.length)
      .map(green),
    ", ",
  );

  const method = white(
    options.negated ? `not.${options.matcher.name}` : options.matcher.name,
  );

  return darkGrey(value`expect(${red("received")}).${method}(${args})`);
}

function formatHeader(
  options: FormatErrorWithContextOptions,
): FormattedMessage {
  // If the matcher provided a message, add a `Message` field to the header
  const message = options.error.message !== undefined
    ? [{ Message: red(options.error.message) }]
    : [];

  return [{
    Error: formatErrorLine(options),
    At: options.executionContext.at,
  }, ...message];
}

function formatFooter(
  options: FormatErrorWithContextOptions,
): FormattedMessage {
  return [
    {
      Filename: options.executionContext.fileName,
      Line: options.executionContext.lineNumber.toString(),
    },
  ];
}

/**
 * Formats the given error and adds additional context, such as the custom
 * error message passed to the expect function and the location in the source.
 */
export function formatErrorWithContext(
  options: FormatErrorWithContextOptions,
): FormattedMessage {
  const header = Array.of(formatHeader(options)).flat();
  const error = Array.of(formatError(options.error)).flat();
  const footer = Array.of(formatFooter(options)).flat();

  return [
    ...header,
    ...error,
    ...footer,
  ];
}
