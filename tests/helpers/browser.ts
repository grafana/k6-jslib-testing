import { browser } from "k6/browser";
import { test as baseTest } from "./test.ts";

/**
 * Extend the base test with helpers for browser testing.
 */
const { describe, it, test } = baseTest.extend({
  defaultOptions: {},

  mergeOptions: (baseOptions) => baseOptions,

  createContext: async () => {
    const browserContext = await browser.newContext();
    const page = await browserContext.newPage();

    return {
      context: {
        page,
      },
      async dispose() {
        await page.close();
        await browserContext.close();
      },
    };
  },
});

export { describe, it, test };

/**
 * Render an element into the body of the given page.
 */
export function renderElement(page, tagName, attrs) {
  return page.evaluate(([tagName, attrs]) => {
    const el = document.createElement(tagName);

    Object.entries(attrs).forEach(([name, value]) => {
      el.setAttribute(name, value);
    });

    document.body.appendChild(el);
  }, [tagName, attrs]);
}
