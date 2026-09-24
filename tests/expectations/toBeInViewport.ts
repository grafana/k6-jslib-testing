import type { Page } from "k6/browser";
import { describe, it } from "../helpers/browser.ts";
import { dedent } from "../utils.ts";

async function renderCtaButton(page: Page, style: string) {
  await page.evaluate((style) => {
    document.body.innerHTML = "";
    document.body.style.margin = "0";
    document.body.style.minHeight = "2200px";

    const button = document.createElement("button");
    button.id = "cta-button";
    button.textContent = "Call to action";
    button.setAttribute("style", style);

    document.body.appendChild(button);
  }, style);
}

describe("toBeInViewport", () => {
  it("should pass when the element is in the viewport", async ({ expect, page, spy }) => {
    await renderCtaButton(page, "position: fixed; top: 20px; left: 20px;");

    await spy.expect(page.locator("#cta-button")).toBeInViewport();

    expect(spy.result.passed).toBe(true);
  });

  it("should support ratio option", async ({ expect, page, spy }) => {
    await renderCtaButton(page, "position: fixed; top: 20px; left: 20px;");

    await spy.expect(page.locator("#cta-button")).toBeInViewport({
      ratio: 0.5,
    });

    expect(spy.result.passed).toBe(true);
  });

  it("should fail when the element is outside the viewport", async ({ expect, page, spy }) => {
    await renderCtaButton(
      page,
      "position: absolute; top: 2000px; left: 20px;",
    );

    await spy.expect(page.locator("#cta-button")).toBeInViewport({
      timeout: 20,
      interval: 10,
    });

    expect(spy.result.passed).toBe(false);
    expect(spy.result.message).toEqual(dedent`
         Error: expect(received).toBeInViewport(options)
            At: ...

      Expected: in viewport
      Received: outside viewport

      Call log:${" "}
        - expect.toBeInViewport with timeout 20ms
        - assertion toBeInViewport failed (xN)

      Filename: toBeInViewport.ts
          Line: ...
    `);
  });

  describe("not", () => {
    it("should pass when the element is outside the viewport", async ({ expect, page, spy }) => {
      await renderCtaButton(
        page,
        "position: absolute; top: 2000px; left: 20px;",
      );

      await spy.expect(page.locator("#cta-button")).not.toBeInViewport();

      expect(spy.result.passed).toBe(true);
    });

    it("should fail when the element is in the viewport", async ({ expect, page, spy }) => {
      await renderCtaButton(page, "position: fixed; top: 20px; left: 20px;");

      await spy.expect(page.locator("#cta-button")).not.toBeInViewport();

      expect(spy.result.passed).toBe(false);
      expect(spy.result.message).toEqual(dedent`
           Error: expect(received).not.toBeInViewport()
              At: ...

        Expected: outside viewport
        Received: in viewport

        Call log:${" "}
          - expect.toBeInViewport with timeout 5000ms

        Filename: toBeInViewport.ts
            Line: ...
      `);
    });
  });
});
