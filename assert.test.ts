import { assert } from "@std/assert";
import { assert as myAssert, AssertionFailedError } from "./assert.ts";
import { AbortedTestError } from "./k6-execution-shim.ts";

Deno.test("assert true condition should succeed", () => {
  myAssert(true, "true is true");
});

Deno.test("assert default to hard assertions", () => {
  try {
    myAssert(false, "false is false");
  } catch (e) {
    // In the Deno runtime, the k6/execution module is not available, so
    // the k6-execution-shim module is throwing AbortedTestError instead, whereas
    // in the k6 runtime, the esbuild bundle file will ensure k6/execution is used instead.
    assert(
      e instanceof AbortedTestError,
      "assert did not throw AbortedTestError",
    );
    assert(
      e.message === "Test aborted: false is false",
      "assert did not throw AbortedTestError with correct message",
    );
  }
});

Deno.test("assert soft mode", async (t) => {
  await t.step("true condition should succeed", () => {
    myAssert(true, "true is true", true);
  });

  await t.step("false condition should throw AssertionFailedError", () => {
    try {
      myAssert(false, "false is false", true);
    } catch (e) {
      assert(
        e instanceof AssertionFailedError,
        "assert did not throw AssertionFailedError",
      );
      assert(
        e.message === "false is false",
        "assert did not throw AssertionFailedError with correct message",
      );
    }
  });
});
