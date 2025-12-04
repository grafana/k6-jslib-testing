import { expect } from "../dist/index.js";

export default function () {
  console.log("Testing .otherwise() feature...\n");

  // Test 1: Non-retrying expectation - callback should execute on failure
  console.log("Test 1: Non-retrying expectation failure");
  let callbackInvoked = false;
  let errorContext = null;

  try {
    expect(5).toBe(10).otherwise((ctx) => {
      callbackInvoked = true;
      errorContext = ctx;
      console.log("  Callback executed!");
      console.log("  Error context:", JSON.stringify(ctx, null, 2));
    });
  } catch (_) {
    // Expected to throw
  }

  if (callbackInvoked && errorContext) {
    console.log("  ✓ Test 1 passed: Callback was invoked with error context\n");
  } else {
    console.log("  ✗ Test 1 failed: Callback was not invoked\n");
  }

  // Test 2: Non-retrying expectation - callback should NOT execute on success
  console.log("Test 2: Non-retrying expectation success");
  let successCallback = false;

  expect(5).toBe(5).otherwise(() => {
    successCallback = true;
  });

  if (!successCallback) {
    console.log("  ✓ Test 2 passed: Callback was NOT invoked on success\n");
  } else {
    console.log("  ✗ Test 2 failed: Callback was invoked on success\n");
  }

  // Test 3: Chaining with .not
  console.log("Test 3: Chaining with .not");
  let notCallbackInvoked = false;

  try {
    expect(5).not.toBe(5).otherwise(() => {
      notCallbackInvoked = true;
      console.log("  Callback executed with .not!");
    });
  } catch (_) {
    // Expected to throw
  }

  if (notCallbackInvoked) {
    console.log("  ✓ Test 3 passed: Callback works with .not\n");
  } else {
    console.log("  ✗ Test 3 failed: Callback did not work with .not\n");
  }

  // Test 4: Verify matchers work without .otherwise()
  console.log("Test 4: Matcher works without .otherwise()");
  // Note: This will abort via exec.test.abort() after a 1ms delay
  // We can't catch it with try-catch, so we just verify the syntax works
  expect(5).toBe(5); // This should succeed
  console.log("  ✓ Test 4 passed: Matcher works without .otherwise()\n");

  console.log("All tests completed!");
}
