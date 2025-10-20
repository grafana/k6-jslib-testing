import { assertEquals, assertThrows } from "@std/assert";

import { expect } from "./expect.ts";
import { withEnv } from "./test_helpers.ts";

Deno.test("expect.configure", async (t) => {
  await t.step(
    "K6_TESTING_COLORIZE environment variable should have priority over colorize option",
    () => {
      withEnv("K6_TESTING_COLORIZE", "false", () => {
        const ex = expect.configure({
          colorize: true,
        });

        assertEquals(ex.config.colorize, false);
      });
    },
  );

  await t.step(
    "K6_TESTING_COLORIZE not set, colorize option should be respected",
    () => {
      // Assuming K6_TESTING_COLORIZE is not set in the environment, the colorize option should be the source of truth
      const ex = expect.configure({
        colorize: true,
      });

      assertEquals(ex.config.colorize, true);
    },
  );

  await t.step(
    "K6_TESTING_DISPLAY environment variable should have priority over display option",
    () => {
      withEnv("K6_TESTING_DISPLAY", "inline", () => {
        const ex = expect.configure({
          display: "pretty",
        });

        assertEquals(ex.config.display, "inline");
      });
    },
  );

  await t.step(
    "K6_TESTING_DISPLAY not set, display option should be respected",
    () => {
      const ex = expect.configure({
        display: "pretty",
      });

      assertEquals(ex.config.display, "pretty");
    },
  );
});

Deno.test("expect.not", async (t) => {
  await t.step("should negate toBe matcher", () => {
    // This should pass
    expect(1).not.toBe(2);

    // This should throw
    assertThrows(
      () => expect(1).not.toBe(1),
      Error,
      "toBe",
    );
  });

  await t.step("should negate toEqual matcher", () => {
    // This should pass
    expect({ a: 1 }).not.toEqual({ a: 2 });

    // This should throw
    assertThrows(
      () => expect({ a: 1 }).not.toEqual({ a: 1 }),
      Error,
      "toEqual",
    );
  });

  await t.step("should negate toBeTruthy matcher", () => {
    // This should pass
    expect(false).not.toBeTruthy();

    // This should throw
    assertThrows(
      () => expect(true).not.toBeTruthy(),
      Error,
      "toBeTruthy",
    );
  });

  await t.step("should negate toBeFalsy matcher", () => {
    // This should pass
    expect(true).not.toBeFalsy();

    // This should throw
    assertThrows(
      () => expect(false).not.toBeFalsy(),
      Error,
      "toBeFalsy",
    );
  });

  await t.step("should work with soft assertions", () => {
    // Create a custom expect with a mock assert function to verify soft assertions
    let lastAssertSoft = false;
    const customAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      lastAssertSoft = soft ?? false;
      if (!condition) throw new Error(message);
    };

    const customExpect = expect.configure({ assertFn: customAssert });

    // Test soft assertion with negation
    customExpect.soft(1).not.toBe(2);
    assertEquals(lastAssertSoft, true, "Expected soft assertion to be true");
  });

  await t.step("should allow chaining .not multiple times", () => {
    // .not.not should be equivalent to no .not
    expect(1).not.not.toBe(1);

    assertThrows(
      () => expect(1).not.not.toBe(2),
      Error,
      "toBe",
    );
  });
});
