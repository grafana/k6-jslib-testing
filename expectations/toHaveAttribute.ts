import { type ExpectationResult, fail, pass } from "./result.ts";
import { isLocator } from "./utils.ts";

function toHaveSomeValue(attribute: string, actualValue: string | null) {
  if (actualValue === null) {
    return fail({
      type: "expected-received",
      expected: `Attribute '${attribute}' to be present`,
      received: `Attribute '${attribute}' was not present`,
    });
  }

  return pass({
    negate() {
      return {
        type: "expected-received",
        expected: `Attribute '${attribute}' to not be present`,
        received: `Attribute '${attribute}' was present`,
      };
    },
  });
}

function toHaveExactValue(
  attribute: string,
  actualValue: string | null,
  expectedValue: string,
) {
  if (actualValue === null) {
    return fail({
      type: "expected-received",
      expected: `Attribute '${attribute}' to have value '${expectedValue}'`,
      received: `Attribute '${attribute}' was not present`,
    });
  }

  if (actualValue !== expectedValue) {
    return fail({
      type: "expected-received",
      expected: `Attribute '${attribute}' to have value '${expectedValue}'`,
      received: `Attribute '${attribute}' had value '${actualValue}'`,
    });
  }

  return pass({
    negate() {
      return {
        type: "expected-received",
        expected:
          `Attribute '${attribute}' to not have value '${expectedValue}'`,
        received: `Attribute '${attribute}' had value '${actualValue}'`,
      };
    },
  });
}

export async function toHaveAttribute(
  actual: unknown,
  attribute: string,
  expectedValue: string | undefined,
): Promise<ExpectationResult> {
  if (typeof attribute !== "string" || attribute.trim() === "") {
    throw new TypeError("Attribute name must be a non-empty string");
  }

  if (expectedValue !== undefined && typeof expectedValue !== "string") {
    throw new TypeError("Expected attribute value must be a string");
  }

  if (!isLocator(actual)) {
    return fail({
      type: "expected-received",
      expected: "Locator",
      received: actual === null
        ? "null"
        : Array.isArray(actual)
        ? "any[]"
        : typeof actual,
    });
  }

  const actualValue = await actual.getAttribute(attribute);

  if (expectedValue === undefined) {
    return toHaveSomeValue(attribute, actualValue);
  }

  return toHaveExactValue(attribute, actualValue, expectedValue);
}
