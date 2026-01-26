import type { NormalizedMessage, PrinterOptions } from "./types.ts";

export function print(
  normalizedError: NormalizedMessage,
  _options: PrinterOptions,
): string {
  return normalizedError.flatMap((group) => Object.entries(group))
    .map(([key, value]) => {
      // Escape any spaces or special characters in the value
      const escapedValue = typeof value === "string"
        ? value.includes(" ") ? `"${value}"` : value
        : value;

      // Convert label to lowercase and replace spaces with underscores
      const escapedLabel = key.toLowerCase().replace(/\s+/g, "_");

      return `${escapedLabel}=${escapedValue}`;
    }).join(" ");
}
