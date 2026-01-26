/**
 * The `ErrorFormats` interface is an extension point for defining new error formats.
 *
 * To add a new error format, extend this interface using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * and then register the format using the `expect.registerFormatter` function.
 *
 * @example
 * ```ts
 * import { expect } from "k6/expect";
 *
 * declare module "k6/expect" {
 *   interface ErrorFormats {
 *     myCustomFormat: {
 *       actual: unknown;
 *       expected: unknown;
 *       customField: string;
 *     };
 *   }
 * }
 *
 * expect.registerFormatter("myCustomFormat", (error) => {
 *   // Format the error into a FormattedMessage
 * })
 */
// deno-lint-ignore no-empty-interface
export interface ErrorFormats {
}

/**
 * A union type of all registered error formats.
 */
export type AnyError = {
  [Format in keyof ErrorFormats]: ErrorFormats[Format] & {
    format: Format;
    message?: string;
  };
}[keyof ErrorFormats];

/**
 * Indicates that an assertion has failed and should be thrown from the matcher.
 */
export class AssertionFailed<
  AssertionError extends AnyError = AnyError,
> extends Error {
  details: AssertionError;

  constructor(details: AssertionError) {
    super(details.message);

    this.details = details;
  }
}
