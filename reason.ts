import type { AnsiColor } from "./colors.ts";

/**
 * An array of objects where each item in the array represents a group of
 * key-value pairs and each key-value pair represents a label and its value.
 *
 * @example
 * ```ts
 * const message: FormattedMessage = [
 *   { File: "index.ts" },
 *   { Expected: "1", Actual: "456" },
 *   { Duration: "0.24s" },
 * ];
 *
 * // Would be formatted similar to:
 * //
 * // 1.     File  index.ts
 * // 2.
 * // 3. Expected  1
 * // 4.   Actual  456
 * // 5.
 * // 6. Duration  0.24s
 * ```
 */
export type FormattedMessage = Array<Record<string, string>>;

export interface FailureReason {
  format(
    colorize: (text: string, color: AnsiColor) => string,
  ): FormattedMessage;
}

export class NegatedAssertionReason implements FailureReason {
  format(
    _colorize: (text: string, color: AnsiColor) => string,
  ): FormattedMessage {
    return [];
  }
}

export class UncaughtErrorReason implements FailureReason {
  error: unknown;

  constructor(error: unknown) {
    this.error = error;
  }

  format(
    colorize: (text: string, color: AnsiColor) => string,
  ): FormattedMessage {
    const message = this.error instanceof Error
      ? this.error.message
      : String(this.error);

    const stack = this.error instanceof Error ? this.error.stack : "";

    return [
      {
        Error: colorize(message, "red"),
        Stack: colorize(stack ?? "", "red"),
      },
    ];
  }
}
