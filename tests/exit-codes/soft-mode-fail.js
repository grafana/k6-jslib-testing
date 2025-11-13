import { expect as defaultExpect } from "../../dist/index.js";

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  // Configure expect with softMode: 'fail'
  // When a soft assertion fails, it marks the test as failed without throwing
  // k6 should exit with code 110 (failed test)
  const expect = defaultExpect.configure({ softMode: "fail" });

  expect.soft(1 + 1).toBe(3);
}
