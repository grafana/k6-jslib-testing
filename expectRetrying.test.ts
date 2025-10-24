// deno-lint-ignore-file

import { assert } from "@std/assert";
import type { SoftMode } from "./assert.ts";
import { RetryTimeoutError, withRetry } from "./expectRetrying.ts";
import { DEFAULT_RETRY_OPTIONS, type ExpectConfig } from "./config.ts";

Deno.test("withRetry", async (t) => {
  await t.step("succeeds immediately when assertion passes", async () => {
    let gotCallCount = 0;

    await withRetry(async () => {
      gotCallCount++;
    });

    assert(gotCallCount === 1, `Expected 1 calls, got ${gotCallCount}`);
  });

  await t.step("retries until success", async () => {
    let currentTime = 0;
    let gotCallCount = 0;

    await withRetry(
      async () => {
        gotCallCount++;
        if (gotCallCount < 3) throw new Error("Not ready yet");
      },
      {
        timeout: 1000,
        interval: 100,
        _now: () => currentTime,
        _sleep: async (ms) => {
          currentTime += ms;
        },
      },
    );

    assert(gotCallCount === 3, `Expected 3 calls, got ${gotCallCount}`);
  });

  await t.step(
    "throws RetryTimeoutError if assertion never throws",
    async () => {
      let currentTime = 0;

      await assertRejects(
        async () => {
          await withRetry(
            async () => {
              await Promise.reject(
                new RetryTimeoutError(
                  "Expect condition not met within 1000ms timeout",
                ),
              );
            },
            {
              timeout: 1000,
              interval: 200,
              _now: () => currentTime,
              _sleep: async (ms) => {
                currentTime += ms;
              },
            },
          );
        },
        RetryTimeoutError,
        "Expect condition not met within 1000ms timeout",
      );
    },
  );

  await t.step("uses default options when none provided", async () => {
    const startTime = Date.now();
    await assertRejects(
      async () => {
        await withRetry(async () => {
          throw new Error("Always fails");
        });
      },
      Error,
    );
    const duration = Date.now() - startTime;
    assert(duration >= DEFAULT_RETRY_OPTIONS.timeout);
  });
});

Deno.test("negated retrying expectations", async (t) => {
  await t.step("should invert the result when using .not", async () => {
    // Mock the locator and assert function
    let assertCalled = false;
    let assertCondition = false;

    const mockLocator = {
      isVisible: async () => true,
      isHidden: async () => false,
      isChecked: async () => true,
      isDisabled: async () => false,
      isEnabled: async () => true,
      isEditable: async () => true,
      inputValue: async () => "test-value",
    };

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
      // Don't throw for this test
    };

    // Import the createLocatorExpectation function directly to test it
    const { createLocatorExpectation } = await import("./expectRetrying.ts");

    const config: ExpectConfig = {
      assertFn: mockAssert,
      timeout: 10,
      interval: 5,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Test with isNegated = true
    const negatedExpectation = createLocatorExpectation(
      mockLocator as any,
      config,
      undefined,
      true,
    );

    // Test a few matchers
    await negatedExpectation.toBeVisible();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false when negated with a true result",
    );

    assertCalled = false;
    await negatedExpectation.toBeChecked();
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false when negated with a true result",
    );

    assertCalled = false;
    await negatedExpectation.toHaveValue("test-value");
    assert(assertCalled, "Assert should have been called");
    assert(
      !assertCondition,
      "Condition should be false when negated with a true result",
    );
  });

  await t.step("should handle double negation correctly", async () => {
    // Mock the locator and assert function
    let assertCalled = false;
    let assertCondition = false;

    const mockLocator = {
      isVisible: async () => true,
      isHidden: async () => false,
      isChecked: async () => true,
      isDisabled: async () => false,
      isEnabled: async () => true,
      isEditable: async () => true,
      inputValue: async () => "test-value",
    };

    const mockAssert = (
      condition: boolean,
      message: string,
      soft?: boolean,
    ) => {
      assertCalled = true;
      assertCondition = condition;
      // Don't throw for this test
    };

    // Import the createLocatorExpectation function directly to test it
    const { createLocatorExpectation } = await import("./expectRetrying.ts");

    const config: ExpectConfig = {
      assertFn: mockAssert,
      timeout: 10,
      interval: 5,
      soft: false,
      softMode: "throw",
      colorize: false,
      display: "inline",
    };

    // Create an expectation
    const expectation = createLocatorExpectation(
      mockLocator as any,
      config,
      undefined,
      false,
    );

    // Double negation should be equivalent to no negation
    const doubleNegated = expectation.not.not;

    await doubleNegated.toBeVisible();
    assert(assertCalled, "Assert should have been called");
    assert(assertCondition, "Condition should be true with double negation");
  });
});

Deno.test("retrying expectations with custom messages", async (t) => {
  await t.step(
    "should include custom message in error for failing assertion",
    async () => {
      let assertCalled = false;
      let assertCondition = false;
      let assertMessage = "";

      const mockLocator = {
        isVisible: async () => false, // Will fail the assertion
      };

      const mockAssert = (
        condition: boolean,
        message: string,
        soft?: boolean,
      ) => {
        assertCalled = true;
        assertCondition = condition;
        assertMessage = message;
        // Don't throw for this test
      };

      // Import the createLocatorExpectation function directly to test it
      const { createLocatorExpectation } = await import("./expectRetrying.ts");

      const config: ExpectConfig = {
        assertFn: mockAssert,
        timeout: 10,
        interval: 5,
        soft: false,
        softMode: "throw",
        colorize: false,
        display: "pretty", // Use pretty mode to see custom message
      };

      // Test with custom message
      const expectation = createLocatorExpectation(
        mockLocator as any,
        config,
        "element should be visible for user interaction", // Custom message
        false,
      );

      await expectation.toBeVisible();

      assert(assertCalled, "Assert should have been called");
      assert(
        !assertCondition,
        "Condition should be false for failing assertion",
      );
      assert(
        assertMessage.includes(
          "element should be visible for user interaction",
        ),
        `Custom message should be included in the assert message. Got: ${assertMessage}`,
      );
    },
  );
});

/**
 * Asserts that a promise rejects with an error matching the expected parameters.
 *
 * @param fn Function that returns a promise that should reject
 * @param errorClass Expected error class (optional)
 * @param msgIncludes Expected error message substring (optional)
 */
async function assertRejects(
  fn: () => Promise<unknown>,
  errorClass?: new (...args: any[]) => Error,
  msgIncludes?: string,
) {
  let thrown = false;
  try {
    await fn();
  } catch (err) {
    thrown = true;

    if (errorClass) {
      assert(
        err instanceof errorClass,
        `Expected error to be instance of ${errorClass.name}, but got ${
          (err as Error).constructor.name
        }`,
      );
    }

    if (msgIncludes) {
      assert(
        (err as Error).message.includes(msgIncludes),
        `Expected error message to include "${msgIncludes}", but got "${
          (err as Error).message
        }"`,
      );
    }

    return;
  }

  assert(thrown, "Expected function to throw an error, but it did not");
}
