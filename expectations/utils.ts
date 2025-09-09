import type { Locator, Page } from "k6/browser";

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

/**
 * Checks if the given value is a browser Page.
 *
 * If it quacks like a duck, it's a duck.
 *
 * @param value The value to check.
 * @returns Whether the value is a Page.
 */
export function isPage(value: unknown): value is Page {
  if (!value || typeof value !== "object") {
    return false;
  }

  const pageProperties = [
    "title",
    "goto",
    "url",
    "close",
    "mainFrame",
    "waitForLoadState",
  ];

  const hasPageProperties = (value: object): boolean => {
    return pageProperties.every((prop) => prop in value);
  };

  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    hasPageProperties(value)
  );
}
