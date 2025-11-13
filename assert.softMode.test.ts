// deno-lint-ignore-file
import { assert as denoAssert } from "@std/assert";
import { assert, AssertionFailedError } from "./assert.ts";
import exec from "k6-execution-shim";
import { expect } from "./expect.ts";

// Store the original functions to restore later
const originalTestFail = exec.test.fail;
const originalTestAbort = exec.test.abort;

// Setup/teardown for all tests
Deno.test({
  name: "softMode tests",
  fn: async (t) => {
    // Run subtests within this test to ensure proper isolation
    await t.step(
      "assert with softMode=throw should throw when soft=true",
      async () => {
        try {
          // Replace mock only within test
          exec.test.fail = () => {};
          let failCalled = false;
          exec.test.fail = (message: string) => {
            failCalled = true;
          };

          try {
            assert(false, "test message", true, "throw");
            denoAssert(false, "assert did not throw");
          } catch (e) {
            denoAssert(e instanceof AssertionFailedError, "wrong error type");
            denoAssert(e.message === "test message", "wrong error message");
            denoAssert(!failCalled, "exec.test.fail was called");
          }
        } finally {
          // Restore original functions
          exec.test.fail = originalTestFail;
        }
      },
    );

    await t.step(
      "assert with softMode=fail should call exec.test.fail when soft=true",
      async () => {
        try {
          // Replace mock only within test
          let failCalled = false;
          let failMessage = "";
          exec.test.fail = (message: string) => {
            failCalled = true;
            failMessage = message;
          };

          // This should not throw but call exec.test.fail
          assert(false, "test message", true, "fail");

          denoAssert(failCalled, "exec.test.fail was not called");
          denoAssert(
            failMessage === "test message",
            "wrong message passed to exec.test.fail",
          );
        } finally {
          // Restore original functions
          exec.test.fail = originalTestFail;
        }
      },
    );

    await t.step(
      "expect.configure with softMode=fail should use exec.test.fail for soft assertions",
      async () => {
        try {
          // Replace mock only within test
          let failCalled = false;
          let failMessage = "";
          exec.test.fail = (message: string) => {
            failCalled = true;
            failMessage = message;
          };

          const customExpect = expect.configure({ softMode: "fail" });

          // This should use exec.test.fail
          customExpect.soft(false).toBeTruthy();

          denoAssert(failCalled, "exec.test.fail was not called");
          denoAssert(
            typeof failMessage === "string" && failMessage.length > 0,
            "exec.test.fail was called with empty message",
          );
        } finally {
          // Restore original functions
          exec.test.fail = originalTestFail;
        }
      },
    );

    await t.step(
      "default expect.soft should call exec.test.fail (softMode='fail' by default)",
      async () => {
        try {
          // Replace mock only within test
          let failCalled = false;
          let failMessage = "";
          exec.test.fail = (message: string) => {
            failCalled = true;
            failMessage = message;
          };

          // Default behavior is now softMode='fail', so it should call exec.test.fail
          expect.soft(false).toBeTruthy();

          denoAssert(failCalled, "exec.test.fail was not called");
          denoAssert(
            failMessage && typeof failMessage === "string" &&
              failMessage.length > 0,
            "exec.test.fail was called with empty message",
          );
        } finally {
          // Restore original functions
          exec.test.fail = originalTestFail;
        }
      },
    );

    await t.step(
      "configured expect with softMode should not affect normal assertions",
      async () => {
        try {
          // Replace mocks only within test
          let abortCalled = false;
          let failCalled = false;

          exec.test.abort = (message: string) => {
            abortCalled = true;
            throw new Error(`Test aborted: ${message}`);
          };

          exec.test.fail = (message: string) => {
            failCalled = true;
          };

          const customExpect = expect.configure({ softMode: "fail" });

          // Non-soft assertions should still abort
          try {
            customExpect(false).toBeTruthy();
            denoAssert(false, "expect did not abort");
          } catch (e) {
            denoAssert(abortCalled, "exec.test.abort was not called");
            denoAssert(!failCalled, "exec.test.fail was called");
          }
        } finally {
          // Restore original functions
          exec.test.abort = originalTestAbort;
          exec.test.fail = originalTestFail;
        }
      },
    );
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
