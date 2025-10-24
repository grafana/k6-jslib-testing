import {
  describe,
  expect,
  it,
  makeExpectWithSpy,
  renderElement,
} from "../testing.js";
import { dedent } from "../utils.js";

describe("toHaveAttribute(attribute)", () => {
  it("should pass when attribute is present", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "some value",
    });

    await expectWithSpy(page.locator("#my-elem"))
      .toHaveAttribute("data-attr");

    expect(result.passed).toBe(true);
  });

  it("should fail when attribute is not present", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
    });

    await expectWithSpy(page.locator("#my-elem"))
      .toHaveAttribute("data-attr");

    expect(result.passed).toBe(false);
    expect(result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...

      Expected: Attribute 'data-attr' to be present
      Received: Attribute 'data-attr' was not present

      Filename: expect-retrying.js
          Line: ...

    `);
  });
});

describe("toHaveAttribute(attribute, expectedValue)", () => {
  it("should pass if the attribute has the given value", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "exact value",
    });

    await expectWithSpy(page.locator("#my-elem"))
      .toHaveAttribute("data-attr", "exact value");

    expect(result.passed).toBe(true);
  });

  it("should fail if the attribute is not present", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
    });

    await expectWithSpy(page.locator("#my-elem"))
      .toHaveAttribute("data-attr", "exact value");

    expect(result.passed).toBe(false);
    expect(result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...

      Expected: Attribute 'data-attr' to have value 'exact value'
      Received: Attribute 'data-attr' was not present

      Filename: expect-retrying.js
          Line: ...

    `);
  });

  it("should fail if the attribute is not equal to the expected value", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "unexpected value",
    });

    await expectWithSpy(page.locator("#my-elem"))
      .toHaveAttribute("data-attr", "expected value");

    expect(result.passed).toBe(false);
    expect(result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...

      Expected: Attribute 'data-attr' to have value 'expected value'
      Received: Attribute 'data-attr' had value 'unexpected value'

      Filename: expect-retrying.js
          Line: ...

    `);
  });
});

describe("not.toHaveAttribute(attribute)", () => {
  it("should pass when the attribute is not present", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
    });

    await expectWithSpy(page.locator("#my-elem")).not
      .toHaveAttribute("data-attr");

    expect(result.passed).toBe(true);
  });

  it("should fail when the attribute is present", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "some value",
    });

    await expectWithSpy(page.locator("#my-elem")).not
      .toHaveAttribute("data-attr");

    expect(result.passed).toBe(false);
    expect(result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...

      Expected: Attribute 'data-attr' to not be present
      Received: Attribute 'data-attr' was present

      Filename: expect-retrying.js
          Line: ...

    `);
  });
});

describe("not.toHaveAttribute(attribute, expectedValue)", () => {
  it("should fail when the attribute has the expected value", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "unexpected value",
    });

    await expectWithSpy(page.locator("#my-elem")).not
      .toHaveAttribute("data-attr", "unexpected value");

    expect(result.passed).toBe(false);
    expect(result.message).toEqual(dedent`

         Error: expect(received).toHaveAttribute(expected)
            At: ...
 
      Expected: Attribute 'data-attr' to not have value 'unexpected value'
      Received: Attribute 'data-attr' had value 'unexpected value'

      Filename: expect-retrying.js
          Line: ...

    `);
  });

  it("should pass when the attribute is not equal to the expected value", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
      "data-attr": "any other value",
    });

    await expectWithSpy(page.locator("#my-elem")).not
      .toHaveAttribute("data-attr", "unexpected value");

    expect(result.passed).toBe(true);
  });

  it("should pass when the attribute is not present", async ({ page }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    await renderElement(page, "div", {
      id: "my-elem",
    });

    await expectWithSpy(page.locator("#my-elem")).not
      .toHaveAttribute("data-attr", "unexpected value");

    expect(result.passed).toBe(true);
  });
});
