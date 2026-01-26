import type {
  ColoredValue,
  FormattedMessage,
  Value,
} from "../formatting/values.ts";

/**
 * The available types of printers.
 *
 * The `inline` display format is mapped to `logfmt` printer type for
 * clarity in the printing logic.
 */
export type PrinterType = "pretty" | "logfmt";

export type NormalizedGroup = Record<string, Value>;
export type NormalizedMessage = NormalizedGroup[];

export interface PrinterOptions {
  printer: PrinterType;
  error: FormattedMessage;
  colorize: (value: ColoredValue<string>) => string;
}
