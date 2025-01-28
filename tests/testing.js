import { colorize } from "../dist/index.js";

export function failTest(testName, message) {
    class TestFailureError extends Error {
      constructor(testName, message) {
        super(colorize(`✗ ${testName}: ${message}`, "red"));
        this.name = 'TestFailureError';
        this.testName = testName;
        this.failureMessage = message;
      }
    }

    throw new TestFailureError(testName, message);
}

export function passTest(testName) {
    console.log(colorize(`✓ ${testName}`, "green"));
}

export function createMockAssertFn() {
    const mockFn = function(condition, message, soft = false) {
      mockFn.called = true;
      mockFn.calls.push({
        condition,
        message,  // TODO (@oleiade, optional): test for message
        soft
      });
    };
  
    // Initialize state
    mockFn.called = false;
    mockFn.calls = [];
    
    return mockFn;
  }
