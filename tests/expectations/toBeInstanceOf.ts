import { describe, it } from "../../dist/index.js";
import { makeExpectWithSpy } from "../helpers.ts";
import { dedent } from "../utils.ts";

class TestClass {}

it("should pass when the object is an instance of the expected class", async ({ expect }) => {
  const [result, expectWithSpy] = makeExpectWithSpy();

  expectWithSpy(new TestClass()).toBeInstanceOf(TestClass);

  await expect(result.passed).toBe(true);
});

it("should fail when the object is not an instance of the expected class", async ({ expect }) => {
  const [result, expectWithSpy] = makeExpectWithSpy();

  expectWithSpy({}).toBeInstanceOf(TestClass);

  await expect(result.passed).toBe(false);
  await expect(result.message).toEqual(dedent`

                   Error: expect(received).toBeInstanceOf(expected)
                      At: ...

    Expected constructor: TestClass
    Received constructor: Object

                Filename: toBeInstanceOf.ts
                    Line: ...

  `);
});

describe("not", () => {
  it("should pass when the object is not an instance of the expected class", async ({ expect }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    expectWithSpy({}).not.toBeInstanceOf(TestClass);

    await expect(result.passed).toBe(true);
  });

  it("should fail when the object is an instance of the expected class", async ({ expect }) => {
    const [result, expectWithSpy] = makeExpectWithSpy();

    expectWithSpy(new TestClass()).not.toBeInstanceOf(TestClass);

    await expect(result.passed).toBe(false);
    await expect(result.message).toEqual(dedent`

                     Error: expect(received).toBeInstanceOf(expected)
                        At: ...

      Expected constructor: TestClass
      Received constructor: TestClass

                  Filename: toBeInstanceOf.ts
                      Line: ...

    `);
  });
});
