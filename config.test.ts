import { assertEquals } from "@std/assert";

import { ConfigLoader } from "./config.ts";
import { withEnv } from "./test_helpers.ts";

Deno.test("ConfigLoader.load", async (t) => {
  await t.step("colorize defaults to true", () => {
    const config = ConfigLoader.load();
    assertEquals(config.colorize, true);
  });

  await t.step(
    "colorize can be enforced by setting the K6_TESTING_COLORIZE environment variable to true",
    () => {
      withEnv("K6_TESTING_COLORIZE", "true", () => {
        const config = ConfigLoader.load();
        assertEquals(config.colorize, true);
      });
    },
  );

  await t.step(
    "colorize can be enforced by setting the K6_TESTING_COLORIZE environment variable",
    () => {
      withEnv("K6_TESTING_COLORIZE", "", () => {
        const config = ConfigLoader.load();
        assertEquals(config.colorize, true);
      });
    },
  );

  await t.step(
    "colorize can be disabled by setting the K6_TESTING_COLORIZE environment variable to false",
    () => {
      withEnv("K6_TESTING_COLORIZE", "false", () => {
        const config = ConfigLoader.load();
        assertEquals(config.colorize, false);
      });
    },
  );

  await t.step(
    "colorize is enabled if K6_TESTING_COLORIZE is set to any other value than false",
    () => {
      withEnv("K6_TESTING_COLORIZE", "foo", () => {
        const config = ConfigLoader.load();
        assertEquals(config.colorize, true);
      });
    },
  );

  await t.step("display defaults to pretty", () => {
    const config = ConfigLoader.load();
    assertEquals(config.display, "pretty");
  });

  await t.step(
    "display can be set to inline by setting the K6_TESTING_DISPLAY environment variable to inline",
    () => {
      withEnv("K6_TESTING_DISPLAY", "inline", () => {
        const config = ConfigLoader.load();
        assertEquals(config.display, "inline");
      });
    },
  );

  await t.step("timeout defaults to 5000", () => {
    const config = ConfigLoader.load();
    assertEquals(config.timeout, 5000);
  });

  await t.step(
    "timeout can be set by setting the K6_TESTING_TIMEOUT environment variable",
    () => {
      withEnv("K6_TESTING_TIMEOUT", "10000", () => {
        const config = ConfigLoader.load();
        assertEquals(config.timeout, 10000);
      });
    },
  );

  await t.step("interval defaults to 100", () => {
    const config = ConfigLoader.load();
    assertEquals(config.interval, 100);
  });

  await t.step(
    "interval can be set by setting the K6_TESTING_INTERVAL environment variable",
    () => {
      withEnv("K6_TESTING_INTERVAL", "200", () => {
        const config = ConfigLoader.load();
        assertEquals(config.interval, 200);
      });
    },
  );
});
