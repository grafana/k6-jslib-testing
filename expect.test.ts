import { assertEquals } from "jsr:@std/assert";

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

