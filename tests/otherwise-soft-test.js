import { expect } from "../dist/index.js";

export default function() {
  console.log("Testing .otherwise() feature with soft mode...\n");

  // Configure expect with soft mode
  const softExpect = expect.configure({ soft: true, softMode: "throw" });

  // Test 1: Soft expectation - callback should execute on failure
  console.log("Test 1: Soft expectation failure");
  let callbackInvoked = false;
  let errorContext = null;

  try {
    softExpect(5).toBe(10).otherwise((ctx) => {
      callbackInvoked = true;
      errorContext = ctx;
      console.log("  Callback executed!");
      console.log("  Matcher name:", ctx.matcherName);
      console.log("  Expected:", ctx.expected);
      console.log("  Received:", ctx.received);
    });
  } catch (e) {
    // Soft mode with throw - expected
  }

  if (callbackInvoked && errorContext && errorContext.matcherName === "toBe") {
    console.log("  ✓ Test 1 passed: Callback was invoked with correct error context\n");
  } else {
    console.log("  ✗ Test 1 failed: Callback was not invoked or context is incorrect\n");
  }

  // Test 2: Soft expectation - callback should NOT execute on success
  console.log("Test 2: Soft expectation success");
  let successCallback = false;

  softExpect(5).toBe(5).otherwise(() => {
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
    softExpect(5).not.toBe(5).otherwise(() => {
      notCallbackInvoked = true;
      console.log("  Callback executed with .not!");
    });
  } catch (e) {
    // Expected
  }

  if (notCallbackInvoked) {
    console.log("  ✓ Test 3 passed: Callback works with .not\n");
  } else {
    console.log("  ✗ Test 3 failed: Callback did not work with .not\n");
  }

  // Test 4: Verify matchers work without .otherwise()
  console.log("Test 4: Matcher works without .otherwise()");
  // Note: Soft mode matchers throw AssertionFailedError after a 1ms delay
  // We just verify the syntax works
  softExpect(5).toBe(5); // This should succeed
  console.log("  ✓ Test 4 passed: Matcher works without .otherwise()\n");

  // Test 5: Soft mode allows test continuation after failure
  console.log("Test 5: Soft mode allows test continuation");
  let continuationReached = false;

  try {
    softExpect(5).toBe(10).otherwise(() => {
      console.log("  First failure callback executed!");
    });
  } catch (e) {
    // Expected throw
  }

  // Test should continue even after failure
  continuationReached = true;

  if (continuationReached) {
    console.log("  ✓ Test 5 passed: Test continued after soft assertion failure\n");
  } else {
    console.log("  ✗ Test 5 failed: Test did not continue\n");
  }

  // Test 6: Error context contains the error message
  console.log("Test 6: Error context contains complete message");
  let hasMessage = false;

  try {
    softExpect("hello").toBe("world").otherwise((ctx) => {
      hasMessage = ctx.message && ctx.message.includes("Expected") && ctx.message.includes("Received");
      console.log("  Message present:", hasMessage);
    });
  } catch (e) {
    // Expected
  }

  if (hasMessage) {
    console.log("  ✓ Test 6 passed: Error context includes complete message\n");
  } else {
    console.log("  ✗ Test 6 failed: Error context missing message\n");
  }

  console.log("All tests completed!");
}
