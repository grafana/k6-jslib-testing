import { expect } from "./dist/index.js";

export default function () {
  const value = {
    a: {
      b: [42],
    },
    c: true,
  };

  expect(value).toHaveProperty("a.b");
  expect(value).toHaveProperty("a.b", [42]);
  expect(value).toHaveProperty("a.b[0]", 42);
}
