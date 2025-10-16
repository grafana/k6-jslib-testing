/**
 * Marks the expectation as passed. A `negate` function must be provided in case the
 * expectation was negated using the `not` property.
 */
export function pass(details) {
  return {
    passed: true,
    negate() {
      return fail(
        typeof details.negate === "function"
          ? details.negate()
          : details.negate,
      );
    },
  };
}
/**
 * Marks the expectation as failed. It should report the expected and actual value of the
 * expectation.
 */
export function fail(detail) {
  // Negating the expectation twice should return the initial failed result.
  // We create this cyclic dependency by naming the variables and capturing
  // them in the closure of the respective negate function.
  const negated = pass({
    negate: () => failed.detail,
  });
  const failed = {
    passed: false,
    detail,
    negate: () => negated,
  };
  return failed;
}
