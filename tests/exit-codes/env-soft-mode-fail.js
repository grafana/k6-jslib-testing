import { expect } from "../../dist/index.js";

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  // Test that K6_TESTING_SOFT_MODE='fail' environment variable is respected
  // The test runner will set this environment variable before running this script
  // When a soft assertion fails, it marks the test as failed without throwing
  // k6 should exit with code 110 (failed test)

  expect.soft(1 + 1).toBe(3);
}
