import {
  isList,
  type List,
  printValue,
  type Value,
} from "../formatting/index.ts";
import type { Colorizer, NormalizedMessage, PrinterOptions } from "./types.ts";

function printInlineValue(
  indent: number,
  value: Value,
  colorize: Colorizer,
) {
  const printedValue = printValue(value, colorize);
  const paddedValue = printedValue.split("\n")
    .map((line, index) => {
      // We assume that the first line is already padded by the caller
      if (index === 0) {
        return line;
      }

      return " ".repeat(indent + 2) + line;
    }).join("\n");

  return paddedValue;
}

function printBulletedList(
  indent: number,
  key: string,
  list: List,
  colorize: Colorizer,
) {
  // The indent of the bullet should be two spaces from the start of the (unpadded) key.
  const bulletIndent = Math.max(indent - key.length + 2);
  const bulletPoint = " ".repeat(bulletIndent) + "- ";

  const printedItems = list.items
    .map((value) => bulletPoint + printInlineValue(2, value, colorize));

  return "\n" + printedItems.join("\n");
}

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
      const printedValue = isList(value)
        ? printBulletedList(indent, key, value, colorize)
        : printInlineValue(indent, value, colorize);

      return `${paddedKey}: ${printedValue}`;
    });

    return lines.join("\n");
  });

  return "\n" + groups.join("\n\n") + "\n";
}
