import { expect } from "../dist/index.js";

export default function () {
  console.log("Testing .otherwise() feature with soft mode...\n");

  // Configure expect with soft mode
  const softExpect = expect.configure({ soft: true, softMode: "throw" });

  // Test 1: Soft expectation - callback should execute on failure
  console.log("Test 1: Soft expectation failure");
  let callbackInvoked = false;
  let errorContext = null;

  try {
    softExpect(5).otherwise((ctx) => {
      callbackInvoked = true;
      errorContext = ctx;
      console.log("  Callback executed!");
      console.log("  Matcher name:", ctx.matcherName);
      console.log("  Expected:", ctx.expected);
      console.log("  Received:", ctx.received);
    }).toBe(10);
  } catch (_e) {
    // Soft mode with throw - expected
  }

  if (callbackInvoked && errorContext && errorContext.matcherName === "toBe") {
    console.log(
      "  ✓ Test 1 passed: Callback was invoked with correct error context\n",
    );
  } else {
    console.log(
      "  ✗ Test 1 failed: Callback was not invoked or context is incorrect\n",
    );
  }

  // Test 2: Soft expectation - callback should NOT execute on success
  console.log("Test 2: Soft expectation success");
  let successCallback = false;

  softExpect(5).otherwise(() => {
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
    softExpect(5).otherwise(() => {
      notCallbackInvoked = true;
      console.log("  Callback executed with .not!");
    }).not.toBe(5);
  } catch (_e) {
    // Expected
  }

  if (notCallbackInvoked) {
    console.log("  ✓ Test 3 passed: Callback works with .not\n");
  } else {
    console.log("  ✗ Test 3 failed: Callback did not work with .not\n");
  }

  // Test 4: .otherwise() before .not
  console.log("Test 4: .otherwise() before .not");
  let otherwiseBeforeNot = false;

  try {
    softExpect(5).not.otherwise(() => {
      otherwiseBeforeNot = true;
      console.log("  Callback executed when .otherwise() is after .not!");
    }).toBe(5);
  } catch (_e) {
    // Expected
  }

  if (otherwiseBeforeNot) {
    console.log(
      "  ✓ Test 4 passed: Callback works when .otherwise() is after .not\n",
    );
  } else {
    console.log(
      "  ✗ Test 4 failed: Callback did not work when .otherwise() is after .not\n",
    );
  }

  // Test 5: Multiple .otherwise() calls (last wins)
  console.log("Test 5: Multiple .otherwise() calls");
  let firstCallback = false;
  let secondCallback = false;

  try {
    softExpect(5).otherwise(() => {
      firstCallback = true;
    }).otherwise(() => {
      secondCallback = true;
      console.log("  Second callback executed (as expected)!");
    }).toBe(10);
  } catch (_e) {
    // Expected
  }

  if (!firstCallback && secondCallback) {
    console.log(
      "  ✓ Test 5 passed: Only second callback was invoked (last wins)\n",
    );
  } else {
    console.log("  ✗ Test 5 failed: Wrong callbacks invoked\n");
  }

  // Test 6: Error context contains the error message
  console.log("Test 6: Error context contains complete message");
  let hasMessage = false;

  try {
    softExpect("hello").otherwise((ctx) => {
      hasMessage = ctx.message && ctx.message.includes("Expected") &&
        ctx.message.includes("Received");
      console.log("  Message present:", hasMessage);
    }).toBe("world");
  } catch (_e) {
    // Expected
  }

  if (hasMessage) {
    console.log("  ✓ Test 6 passed: Error context includes complete message\n");
  } else {
    console.log("  ✗ Test 6 failed: Error context missing message\n");
  }

  console.log("All tests completed!");
}
