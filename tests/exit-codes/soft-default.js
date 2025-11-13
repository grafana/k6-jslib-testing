import { expect } from "../../dist/index.js";

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  // This should fail with a soft assertion
  // expect.soft() now uses softMode='fail' by default
  // k6 should exit with code 110 (failed test)
  expect.soft(1 + 1).toBe(3);
}
