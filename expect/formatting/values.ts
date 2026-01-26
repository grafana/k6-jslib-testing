import type { AnsiColor } from "../../colors.ts";

/**
 * A value that has a color applied to it.
 */
export interface ColoredValue<T extends Value = Value> {
  value: T;
  color: AnsiColor;
}

/**
 * A value that can be rendered by the formatting system. It's a recursive
 * type that can be used to build formatted values with a complex structure,
 * such as nested colors.
 */
export type Value =
  | Value[]
  | ColoredValue
  | string;

/**
 * A group is a key-value mapping that will be rendered close together:
 *
 * ```
 *   Expected: 42
 *   Received: 43
 * ```
 */
export type Group = Record<string, Value | 0 | false | null | undefined>;

/**
 * A formatted message is a collection of groups that will be separated by
 * blank lines when printed. For convencience.
 *
 * ```
 *     Error: "hello"
 *        At: test.js:10:5
 *
 *  Expected: 42
 *  Received: 43
 *
 *  Filename: test.js
 *      Line: 10
 * ```
 */
export type FormattedMessage = Group[] | Group;

function createColorizer(color: AnsiColor) {
  return (value: Value): ColoredValue => ({ value, color });
}

export const reset = createColorizer("reset");
export const black = createColorizer("black");
export const red = createColorizer("red");
export const green = createColorizer("green");
export const yellow = createColorizer("yellow");
export const blue = createColorizer("blue");
export const magenta = createColorizer("magenta");
export const cyan = createColorizer("cyan");
export const white = createColorizer("white");
export const brightBlack = createColorizer("brightBlack");
export const brightRed = createColorizer("brightRed");
export const brightGreen = createColorizer("brightGreen");
export const brightYellow = createColorizer("brightYellow");
export const brightBlue = createColorizer("brightBlue");
export const brightMagenta = createColorizer("brightMagenta");
export const brightCyan = createColorizer("brightCyan");
export const brightWhite = createColorizer("brightWhite");
export const darkGrey = createColorizer("darkGrey");

/**
 * Template literal function for constructing `Value` instances. This lets
 * you write values in a more readable than if you were to use arrays directly.
 *
 * @example
 * ```ts
 * import { value, red, green } from "k6/expect/formatting/values.ts";
 *
 * const myValue = value`Expected ${green("foo")} but received ${red("bar")}`;
 * ```
 */
export function value(
  strings: TemplateStringsArray,
  ...values: Value[]
): Value {
  const result: Value[] = [];

  for (let i = 0; i < strings.length; i++) {
    result.push(strings[i]);

    const value = values[i];

    if (value !== undefined) {
      result.push(value);
    }
  }

  return result;
}

/**
 * Joins multiple `Value` instances using the given separator. It's similar to
 * `Array.prototype.join`, but for `Value` instances.
 */
export function join(values: Value[], separator: Value): Value {
  return values.flatMap((value, index) => {
    if (index === 0) {
      return [value];
    }

    return [separator, value];
  });
}

/**
 * This function flattens a `Value` instance and applies nested colors to
 * all string parts. The result is a flat array of strings, colored and non-colored,
 * that can be easily printed.
 */
function flattenValue(current: Value): Array<ColoredValue<string> | string> {
  if (typeof current === "string") {
    return [current];
  }

  if (Array.isArray(current)) {
    return current.flatMap(flattenValue);
  }

  return flattenValue(current.value).flatMap((value) => {
    if (typeof value !== "string") {
      return value;
    }

    return {
      ...current,
      value,
    };
  });
}

/**
 * Takes a `Value` instance and returns its string representation. Optionally,
 * a colorizing function can be provided to apply colors to the parts of the
 * value that are colored.
 */
export function printValue(
  value: Value,
  colorize = (value: ColoredValue<string>) => value.value,
): string {
  return flattenValue(value).map((part) => {
    if (typeof part === "string") {
      return part;
    }

    return colorize(part);
  }).join("");
}
