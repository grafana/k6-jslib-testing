import { describe, it } from "../helpers/test.ts";
import { dedent } from "../utils.ts";

class TestClass {}

it("should pass when the object is an instance of the expected class", async ({ expect, spy }) => {
  spy.expect(new TestClass()).toBeInstanceOf(TestClass);

  await expect(spy.result.passed).toBe(true);
});

it("should fail when the object is not an instance of the expected class", async ({ expect, spy }) => {
  spy.expect({}).toBeInstanceOf(TestClass);

  await expect(spy.result.passed).toBe(false);
  await expect(spy.result.message).toEqual(dedent`
                   Error: expect(received).toBeInstanceOf(expected)
                      At: ...

    Expected constructor: TestClass
    Received constructor: Object

                Filename: toBeInstanceOf.ts
                    Line: ...
  `);
});

describe("not", () => {
  it("should pass when the object is not an instance of the expected class", async ({ expect, spy }) => {
    spy.expect({}).not.toBeInstanceOf(TestClass);

    await expect(spy.result.passed).toBe(true);
  });

  it("should fail when the object is an instance of the expected class", async ({ expect, spy }) => {
    spy.expect(new TestClass()).not.toBeInstanceOf(TestClass);

    await expect(spy.result.passed).toBe(false);
    await expect(spy.result.message).toEqual(dedent`
                     Error: expect(received).not.toBeInstanceOf(expected)
                        At: ...

      Expected constructor: TestClass
      Received constructor: TestClass

                  Filename: toBeInstanceOf.ts
                      Line: ...
    `);
  });
});
