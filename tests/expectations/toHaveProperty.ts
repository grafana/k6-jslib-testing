import { describe, it } from "../helpers/test.ts";

describe("toHaveProperty", () => {
  describe("negated", () => {
    it("should pass when property is missing", ({ expect, spy }) => {
      spy.expect({ a: 1 }).not.toHaveProperty("b");

      expect(spy.result.passed).toBe(true);
    });

    it("should fail when property exists", ({ expect, spy }) => {
      spy.expect({ a: 1 }).not.toHaveProperty("a");

      expect(spy.result.passed).toBe(false);
    });

    it("should pass when value does not match", ({ expect, spy }) => {
      spy.expect({ a: 1 }).not.toHaveProperty("a", 2);

      expect(spy.result.passed).toBe(true);
    });
  });
});
