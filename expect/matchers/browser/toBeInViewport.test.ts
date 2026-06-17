import { assertEquals } from "@std/assert";
import type { Locator } from "k6/browser";
import {
  createMatchersWithSpy,
  createMockLocator,
} from "../../../test_helpers.ts";

Deno.test("toBeInViewport passes ratio to locator.isInViewport", async () => {
  const [spy, expect] = createMatchersWithSpy();
  let receivedOptions: { ratio?: number } | undefined;

  const locator = createMockLocator({
    isInViewport: (options) => {
      receivedOptions = options;

      return Promise.resolve(true);
    },
  }) as Locator;

  await expect(locator).toBeInViewport({ ratio: 0.5, timeout: 1 });

  assertEquals(spy.called, false);
  assertEquals(receivedOptions, { ratio: 0.5 });
});
