import { printValue } from "../formatting/values.ts";
import type { NormalizedMessage, PrinterOptions } from "./types.ts";

export function print(
  error: NormalizedMessage,
  { colorize }: PrinterOptions,
): string {
  const indent = Math.max(
    ...error.flatMap((group) => Object.keys(group))
      .map((key) => key.length),
  );

  const groups = error.map((group) => {
    const lines = Object.entries(group).map(([key, value]) => {
      const paddedKey = key.padStart(indent, " ");

      const printedValue = printValue(value, colorize);
      const paddedValue = printedValue.split("\n")
        .map((line, index) => {
          // First line is already padded by the key
          if (index === 0) {
            return line;
          }

          return " ".repeat(indent + 2) + line;
        });

      return `${paddedKey}: ${paddedValue}`;
    });

    return lines.join("\n");
  });

  return "\n" + groups.join("\n\n") + "\n";
}
