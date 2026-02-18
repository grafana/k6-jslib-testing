import {
  isList,
  type List,
  printValue,
  type Value,
} from "../formatting/index.ts";
import type { NormalizedMessage, PrinterOptions } from "./types.ts";

function formatEntry(key: string, target: List | Value): string[] | string {
  if (isList(target)) {
    return target.items.flatMap((value) => formatEntry(key, value));
  }

  const value = printValue(target);

  // Escape any spaces or special characters in the value
  const escapedValue = value.includes(" ") ? `"${target}"` : target;

  // Convert label to lowercase and replace spaces with underscores
  const escapedLabel = key.toLowerCase().replace(/\s+/g, "_");

  return `${escapedLabel}=${escapedValue}`;
}

export function print(
  normalizedError: NormalizedMessage,
  _options: PrinterOptions,
): string {
  return normalizedError.flatMap((group) => Object.entries(group))
    .flatMap(([key, value]) => formatEntry(key, value)).join(" ");
}
