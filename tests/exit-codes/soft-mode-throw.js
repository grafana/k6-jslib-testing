import { expect as defaultExpect } from "../../dist/index.js";

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  // Configure expect with softMode: 'throw'
  // When a soft assertion fails, it should throw an error (default behavior)
  // k6 should exit with code 110 (failed test)
  const expect = defaultExpect.configure({ softMode: "throw" });

  expect.soft(1 + 1).toBe(3);
}
