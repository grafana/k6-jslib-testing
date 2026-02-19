export function printJsValue(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "symbol") {
    return String(value);
  }

  if (typeof value === "bigint") {
    return `${value}n`;
  }

  if (typeof value === "function") {
    return `[Function: ${value.name || "anonymous"}]`;
  }

  if (value instanceof Date) {
    return `Date(${
      isNaN(value.getTime()) ? "<invalid date>" : value.toISOString()
    })`;
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  if (value instanceof Set) {
    // Format it like an array, but without the square brackets.
    const values = JSON.stringify(Array.from(value))
      .slice(1, -1);

    return `{${values}}`;
  }

  if (value instanceof Map) {
    const entries = Object.fromEntries(value.entries());

    return `Map ${JSON.stringify(entries)}`;
  }

  if (
    value instanceof Object &&
    value.constructor !== Object &&
    value.constructor !== Array &&
    value.constructor.name
  ) {
    return `${value.constructor.name} ${JSON.stringify(value)}`;
  }

  return JSON.stringify(value);
}
