import type { Locator } from "k6/browser";
import { DEFAULT_RETRY_OPTIONS, type RetryConfig } from "../../../config.ts";
import { AssertionFailed } from "../../errors.ts";
import { extend } from "../../extend.ts";
import { green, red } from "../../formatting/index.ts";
import { isLocator, withRetry } from "./utils.ts";
import type { AnyError } from "../../index.ts";

declare module "../../extend.ts" {
  export interface Matchers<Received> {
    /**
     * Ensures that the Locator points to an element that has the given attribute and, optionally, the given value.
     */
    toHaveAttribute: Received extends Locator
      ? (attribute: string, expectedValue?: string) => Promise<void>
      : never;
  }
}

function attrMessage(expected: string, received: string): AnyError {
  return {
    format: "custom",
    content: {
      Expected: green(expected),
      Received: red(received),
    },
  };
}

extend("toHaveAttribute", {
  match(received, attribute: string, expectedValue?: string) {
    if (typeof attribute !== "string" || attribute.trim() === "") {
      throw new AssertionFailed({
        format: "custom",
        content: {
          Message: red("Attribute name must be a non-empty string"),
        },
      });
    }

    if (
      expectedValue !== undefined &&
      typeof expectedValue !== "string"
    ) {
      throw new AssertionFailed({
        format: "custom",
        content: {
          Message: red("Expected attribute value must be a string"),
        },
      });
    }

    if (!isLocator(received)) {
      throw new AssertionFailed({
        format: "received",
        received: "unknown",
      });
    }

    const locator = received as Locator;
    const retryOptions: Required<RetryConfig> = {
      ...DEFAULT_RETRY_OPTIONS,
      ...this.config,
    };

    return withRetry(this, retryOptions, async () => {
      const actualValue = await locator.getAttribute(attribute);

      if (expectedValue === undefined) {
        if (actualValue === null) {
          throw new AssertionFailed(
            attrMessage(
              `Attribute '${attribute}' to be present`,
              `Attribute '${attribute}' was not present`,
            ),
          );
        }

        return {
          negate: attrMessage(
            `Attribute '${attribute}' to not be present`,
            `Attribute '${attribute}' was present`,
          ),
        };
      }

      if (actualValue === null) {
        throw new AssertionFailed(
          attrMessage(
            `Attribute '${attribute}' to have value '${expectedValue}'`,
            `Attribute '${attribute}' was not present`,
          ),
        );
      }

      if (actualValue !== expectedValue) {
        throw new AssertionFailed(
          attrMessage(
            `Attribute '${attribute}' to have value '${expectedValue}'`,
            `Attribute '${attribute}' had value '${actualValue}'`,
          ),
        );
      }

      return {
        negate: attrMessage(
          `Attribute '${attribute}' to not have value '${expectedValue}'`,
          `Attribute '${attribute}' had value '${actualValue}'`,
        ),
      };
    });
  },
});
