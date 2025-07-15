import type { Locator } from "k6/browser";

/**
 * Checks if the given value is a browser Locator.
 *
 * If it quacks like a duck, it's a duck.
 *
 * @param value The value to check.
 * @returns Whether the value is a Locator.
 */
export function isLocator(value: unknown): value is Locator {
  if (!value || typeof value !== "object") {
    return false;
  }

  const locatorProperties = [
    "clear",
    "isEnabled",
    "isHidden",
    "getAttribute",
    "selectOption",
    "press",
    "type",
    "dispatchEvent",
    "dblclick",
    "setChecked",
    "isDisabled",
    "focus",
    "innerText",
    "inputValue",
    "check",
    "isEditable",
    "fill",
    "textContent",
    "hover",
    "waitFor",
    "click",
    "uncheck",
    "isChecked",
    "isVisible",
    "innerHTML",
    "tap",
  ];

  const hasLocatorProperties = (value: object): boolean => {
    return locatorProperties.every((prop) => prop in value);
  };

  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    hasLocatorProperties(value)
  );
}
