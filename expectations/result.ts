export interface ExpectationPassed {
  passed: true;
  negate(): ExpectationFailed;
}

export interface ExpectationFailed {
  passed: false;
  expected: string;
  received: string;
  negate(): ExpectationPassed;
}

export type ExpectationResult = ExpectationPassed | ExpectationFailed;

interface ExpectedReceived {
  expected: string;
  received: string;
}

interface PassOptions {
  negate:
    | (() => ExpectationFailed | ExpectedReceived)
    | ExpectedReceived
    | ExpectationFailed;
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
  details: ExpectedReceived,
): ExpectationFailed {
  // Negating the expectation twice should return the initial failed result.
  // We create this cyclic dependency by naming the variables and capturing
  // them in the closure of the respective negate function.
  const negated = pass({
    negate: () => failed,
  });

  const failed: ExpectationFailed = {
    ...details,
    passed: false,
    negate: () => negated,
  };

  return failed;
}
