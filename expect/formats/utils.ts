export function printJsValue(value: unknown): string {
  if (value === undefined) {
    return "undefined";
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

  if (
    value instanceof Object &&
    value.constructor !== Object &&
    value.constructor !== Array &&
    value.constructor.name
  ) {
    return `${value.constructor.name} ${JSON.stringify(value, null, 2)}`;
  }

  return JSON.stringify(value, null, 2);
}
