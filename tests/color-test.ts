// @ts-types="../dist/index.d.ts"
import { expect as baseExpect } from "../dist/index.js";
import { suite, test as baseTest } from "./helpers/browser.ts";

/**
 * Expect instance configured to log colorized error messages to stdout instead of
 * aborting. Used to inspect the colorized output of each matcher.
 */
const expect = baseExpect.configure({
  colorize: true,
  assertFn(condition: boolean, message: string) {
    if (!condition) {
      console.log(message);
    }
  },
});

const { describe, it } = baseTest.extend({
  defaultOptions: {},
  mergeOptions: (opts) => opts,
  createContext: () => ({
    context: { expect: expect },
  }),
});

const baseUrl = __ENV.TEST_SERVER_BASE_URL ?? "http://localhost:8000";

describe("color output", () => {
  describe("standard matchers", () => {
    it("toBe", ({ expect }) => {
      expect(1).toBe(2);
    });

    it("toBeCloseTo", ({ expect }) => {
      expect(1.234).toBeCloseTo(1.5);
    });

    it("toBeDefined", ({ expect: expect }) => {
      expect(undefined).toBeDefined();
    });

    it("toBeFalsy", ({ expect: expect }) => {
      expect(true).toBeFalsy();
    });

    it("toBeGreaterThan", ({ expect: expect }) => {
      expect(5).toBeGreaterThan(10);
    });

    it("toBeGreaterThanOrEqual", ({ expect: expect }) => {
      expect(5).toBeGreaterThanOrEqual(10);
    });

    it("toBeLessThan", ({ expect: expect }) => {
      expect(10).toBeLessThan(5);
    });

    it("toBeLessThanOrEqual", ({ expect: expect }) => {
      expect(10).toBeLessThanOrEqual(5);
    });

    it("toBeNaN", ({ expect: expect }) => {
      expect(42).toBeNaN();
    });

    it("toBeNull", ({ expect: expect }) => {
      expect("not null").toBeNull();
    });

    it("toBeTruthy", ({ expect: expect }) => {
      expect(false).toBeTruthy();
    });

    it("toBeUndefined", ({ expect: expect }) => {
      expect("defined").toBeUndefined();
    });

    it("toEqual", ({ expect: expect }) => {
      expect({ a: 1 }).toEqual({ a: 2 });
    });

    it("toContain (string)", ({ expect: expect }) => {
      expect("hello").toContain("xyz");
    });

    it("toContain (array)", ({ expect: expect }) => {
      expect([1, 2, 3]).toContain(99);
    });

    it("toContainEqual", ({ expect: expect }) => {
      expect([{ a: 1 }]).toContainEqual({ a: 2 });
    });

    it("toHaveLength", ({ expect: expect }) => {
      expect([1, 2, 3]).toHaveLength(5);
    });

    it("toHaveProperty", ({ expect: expect }) => {
      expect({ a: 1 }).toHaveProperty("b");
    });

    it("toBeInstanceOf", ({ expect: expect }) => {
      expect({}).toBeInstanceOf(Array);
    });
  });

  describe("browser matchers", () => {
    it("toBeChecked", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#notToBeCheckedCheckbox")).toBeChecked();
    });

    it("toBeDisabled", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toBeEnabledInput")).toBeDisabled();
    });

    it("toBeEditable", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toBeEditableInput")).toBeEditable();
    });

    it("toBeEmpty (input)", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#notToBeEmptyInput")).toBeEmpty();
    });

    it("toBeEmpty (element)", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#notToBeEmptyText")).toBeEmpty();
    });

    it("toBeEnabled", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toBeDisabledInput")).toBeEnabled();
    });

    it("toBeHidden", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toBeVisibleText")).toBeHidden();
    });

    it("toBeVisible", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toBeHiddenText")).toBeVisible();
    });

    it("toHaveValue", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toHaveValueInput")).toHaveValue("wrong");
    });

    it("toHaveAttribute", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toBeCheckedCheckbox")).toHaveAttribute(
        "data-missing",
      );
    });

    it("toHaveText", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toHaveText")).toHaveText("Wrong text");
    });

    it("toContainText", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page.locator("#toContainText")).toContainText(
        "does not exist",
      );
    });

    it("toHaveTitle", async ({ expect: expect, page }) => {
      await page.goto(`${baseUrl}/test.html`);
      await expect(page).toHaveTitle("Wrong Title");
    });
  });
});

export const options = {
  scenarios: {
    default: {
      executor: "per-vu-iterations",
      iterations: 1,
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

export default async function () {
  await suite.run({
    include: __ENV.K6_TESTING_PATTERN || undefined,
  });
}
