import { assertEquals } from "jsr:@std/assert";

import { expect } from "./expect.ts";
import { env } from "./environment.ts";

Deno.test("expect.configure", async (t) => {
    await t.step("NO_COLOR environment variable should have priority over colorize option", () => {
        withEnv("NO_COLOR", "true", () => {
            const ex = expect.configure({
                colorize: true,
            });

            assertEquals(ex.config.colorize, false);
        });
    })

    await t.step("When NO_COLOR is not set, colorize option should have priority over NO_COLOR environment variable", () => {
        // Assuming NO_COLOR is not set in the environment, the colorize option should be the source of truth
        const ex = expect.configure({
            colorize: true,
        });

        assertEquals(ex.config.colorize, true);
    })
})

// Helper function to set an environment variable for the duration of a test
function withEnv(key: string, value: string, fn: () => void) {
    const originalValue = env[key];
    env[key] = value;
    fn();
    env[key] = originalValue;
}