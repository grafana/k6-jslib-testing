import type {
  ColoredValue,
  FormattedMessage,
  List,
  Value,
} from "../formatting/values.ts";

/**
 * The available types of printers.
 *
 * The `inline` display format is mapped to `logfmt` printer type for
 * clarity in the printing logic.
 */
export type PrinterType = "pretty" | "logfmt";

export type NormalizedGroup = Record<string, List | Value>;
export type NormalizedMessage = NormalizedGroup[];

export type Colorizer = (value: ColoredValue<string>) => string;

export interface PrinterOptions {
  printer: PrinterType;
  error: FormattedMessage;
  colorize: Colorizer;
}
