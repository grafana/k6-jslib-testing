import { describe, it, renderElement } from "../helpers/browser.ts";
import { dedent } from "../utils.ts";

describe("attribute", () => {
  it("should pass when attribute is present", async ({ expect, page, spy }) => {
    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "some value",
    });

    await spy.expect(page.locator("#my-elem"))
      .toHaveAttribute("data-attr");

    expect(spy.result.passed).toBe(true);
  });

  it("should fail when attribute is not present", async ({ expect, page, spy }) => {
    await renderElement(page, "div", {
      id: "my-elem",
    });

    await spy.expect(page.locator("#my-elem"))
      .toHaveAttribute("data-attr");

    expect(spy.result.passed).toBe(false);
    expect(spy.result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...

      Expected: Attribute 'data-attr' to be present
      Received: Attribute 'data-attr' was not present

      Filename: toHaveAttribute.ts
          Line: ...

    `);
  });

  describe("not", () => {
    it("should pass when the attribute is not present", async ({ expect, page, spy }) => {
      await renderElement(page, "div", {
        id: "my-elem",
      });

      await spy.expect(page.locator("#my-elem")).not
        .toHaveAttribute("data-attr");

      expect(spy.result.passed).toBe(true);
    });

    it("should fail when the attribute is present", async ({ expect, page, spy }) => {
      await renderElement(page, "div", {
        id: "my-elem",
        "data-attr": "some value",
      });

      await spy.expect(page.locator("#my-elem")).not
        .toHaveAttribute("data-attr");

      expect(spy.result.passed).toBe(false);
      expect(spy.result.message).toEqual(dedent`

           Error: expect(received).toHaveAttribute(expected)
              At: ...

        Expected: Attribute 'data-attr' to not be present
        Received: Attribute 'data-attr' was present

        Filename: toHaveAttribute.ts
            Line: ...

      `);
    });
  });
});

describe("expected value", () => {
  it("should pass if the attribute has the given value", async ({ expect, page, spy }) => {
    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "exact value",
    });

    await spy.expect(page.locator("#my-elem"))
      .toHaveAttribute("data-attr", "exact value");

    expect(spy.result.passed).toBe(true);
  });

  it("should fail if the attribute is not present", async ({ expect, page, spy }) => {
    await renderElement(page, "div", {
      id: "my-elem",
    });

    await spy.expect(page.locator("#my-elem"))
      .toHaveAttribute("data-attr", "exact value");

    expect(spy.result.passed).toBe(false);
    expect(spy.result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...

      Expected: Attribute 'data-attr' to have value 'exact value'
      Received: Attribute 'data-attr' was not present

      Filename: toHaveAttribute.ts
          Line: ...

    `);
  });

  it("should fail if the attribute is not equal to the expected value", async ({ expect, page, spy }) => {
    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "unexpected value",
    });

    await spy.expect(page.locator("#my-elem"))
      .toHaveAttribute("data-attr", "expected value");

    expect(spy.result.passed).toBe(false);
    expect(spy.result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...

      Expected: Attribute 'data-attr' to have value 'expected value'
      Received: Attribute 'data-attr' had value 'unexpected value'

      Filename: toHaveAttribute.ts
          Line: ...

    `);
  });

  describe("not", () => {
    it("should fail when the attribute has the expected value", async ({ expect, page, spy }) => {
      await renderElement(page, "div", {
        id: "my-elem",
        "data-attr": "unexpected value",
      });

      await spy.expect(page.locator("#my-elem")).not
        .toHaveAttribute("data-attr", "unexpected value");

      expect(spy.result.passed).toBe(false);
      expect(spy.result.message).toEqual(dedent`

           Error: expect(received).toHaveAttribute(expected)
              At: ...
  
        Expected: Attribute 'data-attr' to not have value 'unexpected value'
        Received: Attribute 'data-attr' had value 'unexpected value'

        Filename: toHaveAttribute.ts
            Line: ...

      `);
    });

    it("should pass when the attribute is not equal to the expected value", async ({ expect, page, spy }) => {
      await renderElement(page, "div", {
        id: "my-elem",
        "data-attr": "any other value",
      });

      await spy.expect(page.locator("#my-elem")).not
        .toHaveAttribute("data-attr", "unexpected value");

      expect(spy.result.passed).toBe(true);
    });

    it("should pass when the attribute is not present", async ({ expect, page, spy }) => {
      await renderElement(page, "div", {
        id: "my-elem",
      });

      await spy.expect(page.locator("#my-elem")).not
        .toHaveAttribute("data-attr", "unexpected value");

      expect(spy.result.passed).toBe(true);
    });
  });
});
