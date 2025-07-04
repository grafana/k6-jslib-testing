export interface ExpectedReceived {
  type: "expected-received";
  expected: string;
  received: string;
}

export type ExpectationFailedDetail = ExpectedReceived;

export interface ExpectationPassed {
  passed: true;
  negate(): ExpectationFailed;
}

export interface ExpectationFailed {
  passed: false;
  detail: ExpectationFailedDetail;
  negate(): ExpectationPassed;
}

export type ExpectationResult = ExpectationPassed | ExpectationFailed;

interface PassOptions {
  negate:
    | (() => ExpectationFailedDetail)
    | ExpectationFailedDetail;
}

/**
 * Marks the expectation as passed. A `negate` function must be provided in case the
 * expectation was negated using the `not` property.
 */
export function pass(
  details: PassOptions,
): ExpectationPassed {
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
export function fail(
  detail: ExpectationFailedDetail,
): ExpectationFailed {
  // Negating the expectation twice should return the initial failed result.
  // We create this cyclic dependency by naming the variables and capturing
  // them in the closure of the respective negate function.
  const negated = pass({
    negate: () => failed.detail,
  });

  const failed: ExpectationFailed = {
    passed: false,
    detail,
    negate: () => negated,
  };

  return failed;
}
