import { expect } from "../dist/index.js";

export default function() {
  console.log("Testing .otherwise() feature...\n");

  // Test 1: Non-retrying expectation - callback should execute on failure
  console.log("Test 1: Non-retrying expectation failure");
  let callbackInvoked = false;
  let errorContext = null;

  try {
    expect(5).otherwise((ctx) => {
      callbackInvoked = true;
      errorContext = ctx;
      console.log("  Callback executed!");
      console.log("  Error context:", JSON.stringify(ctx, null, 2));
    }).toBe(10);
  } catch (e) {
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

  expect(5).otherwise(() => {
    successCallback = true;
  }).toBe(5);

  if (!successCallback) {
    console.log("  ✓ Test 2 passed: Callback was NOT invoked on success\n");
  } else {
    console.log("  ✗ Test 2 failed: Callback was invoked on success\n");
  }

  // Test 3: Chaining with .not
  console.log("Test 3: Chaining with .not");
  let notCallbackInvoked = false;

  try {
    expect(5).otherwise(() => {
      notCallbackInvoked = true;
      console.log("  Callback executed with .not!");
    }).not.toBe(5);
  } catch (e) {
    // Expected to throw
  }

  if (notCallbackInvoked) {
    console.log("  ✓ Test 3 passed: Callback works with .not\n");
  } else {
    console.log("  ✗ Test 3 failed: Callback did not work with .not\n");
  }

  // Test 4: Multiple .otherwise() calls (last wins)
  console.log("Test 4: Multiple .otherwise() calls");
  let firstCallback = false;
  let secondCallback = false;

  try {
    expect(5).otherwise(() => {
      firstCallback = true;
    }).otherwise(() => {
      secondCallback = true;
      console.log("  Second callback executed!");
    }).toBe(10);
  } catch (e) {
    // Expected to throw
  }

  if (!firstCallback && secondCallback) {
    console.log("  ✓ Test 4 passed: Only second callback was invoked\n");
  } else {
    console.log("  ✗ Test 4 failed: Wrong callbacks invoked\n");
  }

  console.log("All tests completed!");
}
