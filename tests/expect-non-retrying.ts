// @ts-types="../dist/index.d.ts"
import { colorize, expect, type ExpectFunction } from "../dist/index.js";
import { dedent, trimEmptyLines } from "./utils.ts";
import execution from "k6/execution";

function flattenTestSuite(testCases: TestCase[]): SingleTestCase[] {
  return testCases.flatMap((testCase) => {
    if (testCase.suite === undefined) {
      return testCase;
    }

    return flattenTestSuite(testCase.children).map((child) => {
      return {
        ...child,
        name: `${testCase.suite} > ${child.name}`,
      };
    });
  });
}

export default async function testExpectNonRetrying() {
  const failed: TestCase[] = [];
  const testCases = [
    TO_BE_TESTS,
    TO_BE_CLOSE_TO_TESTS,
    TO_BE_INSTANCE_OF_TESTS,
    TO_BE_DEFINED_TESTS,
    TO_BE_FALSY_TESTS,
    TO_BE_TRUTHY_TESTS,
    TO_BE_GREATER_THAN_TESTS,
    TO_BE_GREATER_THAN_OR_EQUAL_TESTS,
    TO_BE_LESS_THAN_TESTS,
    TO_BE_LESS_THAN_OR_EQUAL_TESTS,
    TO_BE_NAN_TESTS,
    TO_BE_NULL_TESTS,
    TO_BE_UNDEFINED_TESTS,
    TO_EQUAL_TESTS,
    TO_HAVE_LENGTH_TESTS,
    TO_CONTAIN_TESTS,
    TO_CONTAIN_EQUAL_TESTS,
    TO_HAVE_PROPERTY_TESTS,
    DOUBLE_NEGATION_TEST_CASES,
  ];

  const allTests = flattenTestSuite(testCases);

  for (const testCase of allTests) {
    const passed = await runTestCase(testCase);

    if (!passed) {
      failed.push(testCase);
    }
  }

  if (failed.length > 0) {
    // @ts-expect-error There seems to be some weird interaction with @types/k6 and the k6 package
    execution.test.fail(`${failed.length}/${allTests.length} tests failed.`);
  }
}

interface Context {
  expect: ExpectFunction;
}

interface SingleTestCase {
  name: string;
  suite?: undefined;
  expectedError?: Error | string;
  assertion: (context: Context) => Promise<void> | void;
}

interface TestSuite {
  suite: string;
  children: TestCase[];
}

type TestCase = SingleTestCase | TestSuite;

const TO_BE_TESTS: TestSuite = {
  suite: "toBe",
  children: [
    {
      name: "pass",
      assertion: ({ expect }) => {
        expect(true).toBe(true);
      },
    },
    {
      name: "fail",
      expectedError: dedent`
         Error: expect(received).toBe(expected)
            At: ...

      Expected: false
      Received: true

      Filename: expect-non-retrying.ts
          Line: ...
    `,
      assertion: ({ expect }) => {
        expect(true).toBe(false);
      },
    },
    {
      suite: "negated",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect(1).not.toBe(2);
          },
        },
        {
          name: "not.fail",
          expectedError: dedent`
               Error: expect(received).toBe(expected)
                  At: ...

            Expected: 1
            Received: 1

            Filename: expect-non-retrying.ts
                Line: ...
          `,
          assertion: ({ expect }) => {
            expect(1).not.toBe(1);
          },
        },
      ],
    },
  ],
};

const TO_BE_CLOSE_TO_TESTS: TestSuite = {
  suite: "toBeCloseTo",
  children: [
    {
      name: "pass",
      assertion: ({ expect }) => {
        expect(10).toBeCloseTo(9.9, 0.1);
      },
    },
    {
      name: "fail",
      expectedError: dedent`
                      Error: expect(received).toBeCloseTo(expected, precision)
                         At: ...

         Expected precision: 0.1
        Expected difference: < 0.39716411736214075
        Received difference: 5

                   Filename: expect-non-retrying.ts
                       Line: ...
    `,
      assertion: ({ expect }) => {
        expect(10).toBeCloseTo(5, 0.1);
      },
    },
    {
      suite: "negated",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect(10).not.toBeCloseTo(5, 0.1);
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                          Error: expect(received).toBeCloseTo(expected, precision)
                             At: ...

             Expected precision: 0.1
            Expected difference: < 0.39716411736214075
            Received difference: 0.09999999999999964

                       Filename: expect-non-retrying.ts
                           Line: ...
          `,
          assertion: ({ expect }) => {
            expect(10).not.toBeCloseTo(9.9, 0.1);
          },
        },
      ],
    },
  ],
};

const TO_BE_DEFINED_TESTS: TestSuite = {
  suite: "toBeDefined",
  children: [
    {
      name: "pass",
      assertion: ({ expect }) => {
        expect(10).toBeDefined();
      },
    },
    {
      name: "fail",
      expectedError: dedent`
         Error: expect(received).toBeDefined()
            At: ...

      Received: undefined

      Filename: expect-non-retrying.ts
          Line: ...
    `,
      assertion: ({ expect }) => {
        expect(undefined).toBeDefined();
      },
    },
    {
      suite: "negated",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect(undefined).not.toBeDefined();
          },
        },
        {
          name: "fail",
          expectedError: dedent`
               Error: expect(received).toBeDefined()
                  At: ...

            Received: 10

            Filename: expect-non-retrying.ts
                Line: ...
          `,
          assertion: ({ expect }) => {
            expect(10).not.toBeDefined();
          },
        },
      ],
    },
  ],
};

const TO_BE_FALSY_TESTS: TestSuite = {
  suite: "toBeFalsy",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(false).toBeFalsy();
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeFalsy()
            At: ...

      Received: true

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(true).toBeFalsy();
    },
  }, {
    suite: "negated",
    children: [{
      name: "not.pass",
      assertion: ({ expect }) => {
        expect(true).not.toBeFalsy();
      },
    }, {
      name: "not.fail",
      expectedError: dedent`
           Error: expect(received).toBeFalsy()
              At: ...

        Received: false

        Filename: expect-non-retrying.ts
            Line: ...
      `,
      assertion: ({ expect }) => {
        expect(false).not.toBeFalsy();
      },
    }],
  }],
};

const TO_BE_TRUTHY_TESTS: TestSuite = {
  suite: "toBeTruthy",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(true).toBeTruthy();
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeTruthy()
            At: ...

      Received: false

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(false).toBeTruthy();
    },
  }, {
    suite: "negated",
    children: [{
      name: "not.pass",
      assertion: ({ expect }) => {
        expect(false).not.toBeTruthy();
      },
    }, {
      name: "not.fail",
      expectedError: dedent`
           Error: expect(received).toBeTruthy()
              At: ...

        Received: true

        Filename: expect-non-retrying.ts
            Line: ...
      `,
      assertion: ({ expect }) => {
        expect(true).not.toBeTruthy();
      },
    }],
  }],
};

const TO_BE_GREATER_THAN_TESTS: TestSuite = {
  suite: "toBeGreaterThan",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(2).toBeGreaterThan(1);
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeGreaterThan(expected)
            At: ...

      Expected: > 2
      Received: 1

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(1).toBeGreaterThan(2);
    },
  }, { suite: "negated", children: [] }],
};

const TO_BE_GREATER_THAN_OR_EQUAL_TESTS: TestSuite = {
  suite: "toBeGreaterThanOrEqual",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(2).toBeGreaterThanOrEqual(1);
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeGreaterThanOrEqual(expected)
            At: ...

      Expected: >= 2
      Received: 1

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(1).toBeGreaterThanOrEqual(2);
    },
  }, { suite: "negated", children: [] }],
};

const TO_BE_LESS_THAN_TESTS: TestSuite = {
  suite: "toBeLessThan",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(1).toBeLessThan(2);
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeLessThan(expected)
            At: ...

      Expected: < 1
      Received: 2

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(2).toBeLessThan(1);
    },
  }, { suite: "negated", children: [] }],
};

const TO_BE_LESS_THAN_OR_EQUAL_TESTS: TestSuite = {
  suite: "toBeLessThanOrEqual",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(1).toBeLessThanOrEqual(2);
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeLessThanOrEqual(expected)
            At: ...

      Expected: <= 1
      Received: 2

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(2).toBeLessThanOrEqual(1);
    },
  }, { suite: "negated", children: [] }],
};

const TO_BE_NAN_TESTS: TestSuite = {
  suite: "toBeNaN",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(NaN).toBeNaN();
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeNaN()
            At: ...

      Received: 10

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(10).toBeNaN();
    },
  }, { suite: "negated", children: [] }],
};

const TO_BE_NULL_TESTS: TestSuite = {
  suite: "toBeNull",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(null).toBeNull();
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeNull()
            At: ...

      Received: 1

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(1).toBeNull();
    },
  }, { suite: "negated", children: [] }],
};

const TO_BE_UNDEFINED_TESTS: TestSuite = {
  suite: "toBeUndefined",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect(undefined).toBeUndefined();
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toBeUndefined()
            At: ...

      Received: 1

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(1).toBeUndefined();
    },
  }, {
    suite: "negated",
    children: [{
      name: "not.pass",
      assertion: ({ expect }) => {
        expect(1).not.toBeUndefined();
      },
    }, {
      name: "not.fail",
      expectedError: dedent`
           Error: expect(received).toBeUndefined()
              At: ...

        Received: undefined

        Filename: expect-non-retrying.ts
            Line: ...
      `,
      assertion: ({ expect }) => {
        expect(undefined).not.toBeUndefined();
      },
    }],
  }],
};

const TO_EQUAL_TESTS: TestSuite = {
  suite: "toEqual",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect({ a: 1 }).toEqual({ a: 1 });
    },
  }, {
    name: "fail",
    expectedError: dedent`
         Error: expect(received).toEqual(expected)
            At: ...

      Expected: {"a":2}
      Received: {"a":1}

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect({ a: 1 }).toEqual({ a: 2 });
    },
  }, {
    suite: "negated",
    children: [{
      name: "not.pass",
      assertion: ({ expect }) => {
        expect({ a: 1 }).not.toEqual({ a: 2 });
      },
    }, {
      name: "not.fail",
      expectedError: dedent`
           Error: expect(received).toEqual(expected)
              At: ...

        Expected: {"a":1}
        Received: {"a":1}

        Filename: expect-non-retrying.ts
            Line: ...
      `,
      assertion: ({ expect }) => {
        expect({ a: 1 }).not.toEqual({ a: 1 });
      },
    }],
  }],
};

const TO_HAVE_LENGTH_TESTS: TestSuite = {
  suite: "toHaveLength",
  children: [{
    name: "pass",
    assertion: ({ expect }) => {
      expect([1, 2, 3]).toHaveLength(3);
    },
  }, {
    name: "fail",
    expectedError: dedent`
                Error: expect(received).toHaveLength(expected)
                   At: ...

      Expected length: 5
      Received length: 3
       Received array: undefined

             Filename: expect-non-retrying.ts
                 Line: ...
    `,
    assertion: ({ expect }) => {
      expect([1, 2, 3]).toHaveLength(5);
    },
  }, { suite: "negated", children: [] }],
};

class Example {}

const TO_BE_INSTANCE_OF_TESTS: TestSuite = {
  suite: "toBeInstanceOf",
  children: [
    {
      name: "pass",
      assertion: ({ expect }) => {
        expect(new Example()).toBeInstanceOf(Example);
      },
    },
    {
      name: "fail",
      expectedError: dedent`
                     Error: expect(received).toBeInstanceOf(expected)
                        At: ...

      Expected constructor: Example
      Received constructor: Object

                  Filename: expect-non-retrying.ts
                      Line: ...
    `,
      assertion: ({ expect }) => {
        expect({}).toBeInstanceOf(Example);
      },
    },
    {
      name: "with primitive",
      expectedError: dedent`
                       Error: expect(received).toBeInstanceOf(expected)
                          At: ...

        Expected constructor: Example
        Received constructor: Number

                    Filename: expect-non-retrying.ts
                        Line: ...
      `,
      assertion: ({ expect }) => {
        expect(42).toBeInstanceOf(Example);
      },
    },
  ],
};

const TO_CONTAIN_TESTS: TestSuite = {
  suite: "toContain",
  children: [
    {
      suite: "with string",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect("hello world").toContain("world");
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                        Error: expect(received).toContain(expected)
                           At: ...

          Expected to contain: universe
              Received string: hello world

                     Filename: expect-non-retrying.ts
                         Line: ...
        `,
          assertion: ({ expect }) => {
            expect("hello world").toContain("universe");
          },
        },
        {
          suite: "negated",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect("hello world").not.toContain("universe");
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                Error: expect(received).toContain(expected)
                                   At: ...

              Expected not to contain: world
                      Received string: hello world

                             Filename: expect-non-retrying.ts
                                 Line: ...
            `,
            assertion: ({ expect }) => {
              expect("hello world").not.toContain("world");
            },
          }],
        },
      ],
    },
    {
      suite: "with array",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect([1, 2, 3]).toContain(2);
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                          Error: expect(received).toContain(expected)
                             At: ...

            Expected to contain: 4
                 Received array: [1,2,3]

                       Filename: expect-non-retrying.ts
                           Line: ...
        `,
          assertion: ({ expect }) => {
            expect([1, 2, 3]).toContain(4);
          },
        },
        {
          suite: "negated",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect([1, 2, 3]).not.toContain(4);
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                Error: expect(received).toContain(expected)
                                   At: ...

              Expected not to contain: 2
                       Received array: [1,2,3]

                             Filename: expect-non-retrying.ts
                                 Line: ...
            `,
            assertion: ({ expect }) => {
              expect([1, 2, 3]).not.toContain(2);
            },
          }],
        },
      ],
    },
    {
      suite: "with Set",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect(new Set([1, 2, 3])).toContain(2);
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                          Error: expect(received).toContain(expected)
                             At: ...

            Expected to contain: 4
                   Received set: {}

                       Filename: expect-non-retrying.ts
                           Line: ...
          `,
          assertion: ({ expect }) => {
            expect(new Set([1, 2, 3])).toContain(4);
          },
        },
        {
          suite: "negated",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect(new Set([1, 2, 3])).not.toContain(4);
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                Error: expect(received).toContain(expected)
                                   At: ...

              Expected not to contain: 2
                         Received set: {}

                             Filename: expect-non-retrying.ts
                                 Line: ...
            `,
            assertion: ({ expect }) => {
              expect(new Set([1, 2, 3])).not.toContain(2);
            },
          }],
        },
      ],
    },
    {
      name: "with unsupported type",
      expectedError: new Error(
        "toContain is only supported for strings, arrays, and sets",
      ),
      assertion: ({ expect }) => {
        expect(123).toContain(2);
      },
    },
  ],
};

const TO_CONTAIN_EQUAL_TESTS: TestSuite = {
  suite: "toContainEqual",
  children: [
    {
      suite: "with array",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect([{ id: 1 }, { id: 2 }]).toContainEqual({ id: 1 });
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                                Error: expect(received).toContainEqual(expected)
                                   At: ...

            Expected to contain equal: {"id":5}
                       Received array: [{"id":1},{"id":2}]

                             Filename: expect-non-retrying.ts
                                 Line: ...
          `,
          assertion: ({ expect }) => {
            expect([{ id: 1 }, { id: 2 }]).toContainEqual({ id: 5 });
          },
        },
        {
          suite: "negated",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect([{ id: 1 }, { id: 2 }]).not.toContainEqual({ id: 3 });
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                      Error: expect(received).toContainEqual(expected)
                                         At: ...

              Expected not to contain equal: {"id":1}
                             Received array: [{"id":1},{"id":2}]

                                   Filename: expect-non-retrying.ts
                                       Line: ...
            `,
            assertion: ({ expect }) => {
              expect([{ id: 1 }, { id: 2 }]).not.toContainEqual({ id: 1 });
            },
          }],
        },
      ],
    },
    {
      suite: "with Set",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect(new Set([{ id: 1 }, { id: 2 }])).toContainEqual({ id: 1 });
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                                Error: expect(received).toContainEqual(expected)
                                   At: ...

            Expected to contain equal: {"id":5}
                         Received set: {}

                             Filename: expect-non-retrying.ts
                                 Line: ...
          `,
          assertion: ({ expect }) => {
            expect(new Set([{ id: 1 }, { id: 2 }])).toContainEqual({ id: 5 });
          },
        },
        {
          suite: "negated",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect(new Set([{ id: 1 }, { id: 2 }])).not.toContainEqual({
                id: 3,
              });
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                      Error: expect(received).toContainEqual(expected)
                                         At: ...

              Expected not to contain equal: {"id":1}
                               Received set: {}

                                   Filename: expect-non-retrying.ts
                                       Line: ...
            `,
            assertion: ({ expect }) => {
              expect(new Set([{ id: 1 }, { id: 2 }])).not.toContainEqual({
                id: 1,
              });
            },
          }],
        },
      ],
    },
    {
      name: "with unsupported type",
      expectedError: new Error(
        "toContainEqual is only supported for arrays and sets",
      ),
      assertion: ({ expect }) => {
        expect("string").toContainEqual("s");
      },
    },
  ],
};

const TO_HAVE_PROPERTY_TESTS: TestSuite = {
  suite: "toHaveProperty",
  children: [
    {
      suite: "with simple property",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect({ a: 1 }).toHaveProperty("a");
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                           Error: expect(received).toHaveProperty(keyPath, expected?)
                              At: ...

                   Property path: b
      Expected property to exist: 
                 Received object: {"a":1}

                        Filename: expect-non-retrying.ts
                            Line: ...
        `,
          assertion: ({ expect }) => {
            expect({ a: 1 }).toHaveProperty("b");
          },
        },
      ],
    },
    {
      suite: "with nested property",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect({ a: { b: 2 } }).toHaveProperty("a.b");
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                           Error: expect(received).toHaveProperty(keyPath, expected?)
                              At: ...

                   Property path: a.c
      Expected property to exist: 
                 Received object: {"a":{"b":2}}

                        Filename: expect-non-retrying.ts
                            Line: ...
        `,
          assertion: ({ expect }) => {
            expect({ a: { b: 2 } }).toHaveProperty("a.c");
          },
        },
      ],
    },
    {
      suite: "with array index",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect({ a: [1, 2, 3] }).toHaveProperty("a[1]");
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                           Error: expect(received).toHaveProperty(keyPath, expected?)
                              At: ...

                   Property path: a[5]
      Expected property to exist: 
                 Received object: {"a":[1,2,3]}

                        Filename: expect-non-retrying.ts
                            Line: ...
        `,
          assertion: ({ expect }) => {
            expect({ a: [1, 2, 3] }).toHaveProperty("a[5]");
          },
        },
      ],
    },
    {
      suite: "with expected value",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect({ a: 1 }).toHaveProperty("a", 1);
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                           Error: expect(received).toHaveProperty(keyPath, expected?)
                              At: ...

                   Property path: a
      Expected property to equal: 2
                 Received object: {"a":1}

                        Filename: expect-non-retrying.ts
                            Line: ...
        `,
          assertion: ({ expect }) => {
            expect({ a: 1 }).toHaveProperty("a", 2);
          },
        },
      ],
    },
    {
      suite: "with nested expected value",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect({ a: { b: 2 } }).toHaveProperty("a.b", 2);
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                           Error: expect(received).toHaveProperty(keyPath, expected?)
                              At: ...

                   Property path: a.b
      Expected property to equal: 5
                 Received object: {"a":{"b":2}}

                        Filename: expect-non-retrying.ts
                            Line: ...
        `,
          assertion: ({ expect }) => {
            expect({ a: { b: 2 } }).toHaveProperty("a.b", 5);
          },
        },
      ],
    },
    {
      suite: "with array index and expected value",
      children: [
        {
          name: "pass",
          assertion: ({ expect }) => {
            expect({ a: [1, 2, 3] }).toHaveProperty("a[1]", 2);
          },
        },
        {
          name: "fail",
          expectedError: dedent`
                           Error: expect(received).toHaveProperty(keyPath, expected?)
                              At: ...

                   Property path: a[1]
      Expected property to equal: 5
                 Received object: {"a":[1,2,3]}

                        Filename: expect-non-retrying.ts
                            Line: ...
        `,
          assertion: ({ expect }) => {
            expect({ a: [1, 2, 3] }).toHaveProperty("a[1]", 5);
          },
        },
      ],
    },
    {
      suite: "complex cases",
      children: [
        {
          name: "deeply nested with array index and expected value",
          assertion: ({ expect }) => {
            const complexObj = {
              a: {
                b: [
                  { c: 1 },
                  { c: 2 },
                ],
              },
              d: true,
            };

            expect(complexObj).toHaveProperty("a.b[1].c", 2);
          },
        },
        {
          name: "top-level in complex object",
          assertion: ({ expect }) => {
            const complexObj = {
              a: {
                b: [
                  { c: 1 },
                  { c: 2 },
                ],
              },
              d: true,
            };

            expect(complexObj).toHaveProperty("d", true);
          },
        },
      ],
    },
    {
      name: "toHaveProperty with unsupported type",
      expectedError: new Error("toHaveProperty is only supported for objects"),
      assertion: ({ expect }) => {
        expect("string").toHaveProperty("length");
      },
    },
    {
      suite: "negated",
      children: [
        {
          suite: "missing property",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect({ a: 1 }).not.toHaveProperty("b");
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                       Error: expect(received).toHaveProperty(keyPath, expected?)
                                          At: ...

                               Property path: a
              Expected property not to exist: 
                             Received object: {"a":1}

                                    Filename: expect-non-retrying.ts
                                        Line: ...
            `,
            assertion: ({ expect }) => {
              expect({ a: 1 }).not.toHaveProperty("a");
            },
          }],
        },
        {
          suite: "with existing property but wrong value",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect({ a: 1 }).not.toHaveProperty("a", 2);
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                       Error: expect(received).toHaveProperty(keyPath, expected?)
                                          At: ...

                               Property path: a
              Expected property not to equal: 1
                             Received object: {"a":1}
 
                                    Filename: expect-non-retrying.ts
                                        Line: ...
            `,
            assertion: ({ expect }) => {
              expect({ a: 1 }).not.toHaveProperty("a", 1);
            },
          }],
        },
        {
          suite: "with missing nested property",
          children: [{
            name: "pass",
            assertion: ({ expect }) => {
              expect({ a: { b: 1 } }).not.toHaveProperty("a.c");
            },
          }, {
            name: "fail",
            expectedError: dedent`
                                       Error: expect(received).toHaveProperty(keyPath, expected?)
                                          At: ...

                               Property path: a.b
              Expected property not to exist: 
                             Received object: {"a":{"b":1}}

                                    Filename: expect-non-retrying.ts
                                        Line: ...
            `,
            assertion: ({ expect }) => {
              expect({ a: { b: 1 } }).not.toHaveProperty("a.b");
            },
          }],
        },
        {
          suite: "with array index out of bounds",
          children: [
            {
              name: "pass",
              assertion: ({ expect }) => {
                expect({ a: [1, 2, 3] }).not.toHaveProperty("a[5]");
              },
            },
            {
              name: "fail",
              expectedError: dedent`
                                         Error: expect(received).toHaveProperty(keyPath, expected?)
                                            At: ...

                                 Property path: a[1]
                Expected property not to exist: 
                               Received object: {"a":[1,2,3]}

                                      Filename: expect-non-retrying.ts
                                          Line: ...
              `,
              assertion: ({ expect }) => {
                expect({ a: [1, 2, 3] }).not.toHaveProperty("a[1]");
              },
            },
          ],
        },
      ],
    },
    {
      suite: "Playwright examples",
      children: [
        {
          name: "example 1",
          assertion: ({ expect }) => {
            const value = {
              a: {
                b: [42],
              },
              c: true,
            };
            expect(value).toHaveProperty("a.b");
          },
        },
        {
          name: "example 2",
          assertion: ({ expect }) => {
            const value = {
              a: {
                b: [42],
              },
              c: true,
            };
            expect(value).toHaveProperty("a.b", [42]);
          },
        },
        {
          name: "example 3",
          assertion: ({ expect }) => {
            const value = {
              a: {
                b: [42],
              },
              c: true,
            };
            expect(value).toHaveProperty("a.b[0]", 42);
          },
        },
        {
          name: "example 4",
          assertion: ({ expect }) => {
            const value = {
              a: { b: [42] },
              c: true,
            };
            expect(value).toHaveProperty("c");
          },
        },
        {
          name: "example 5",
          assertion: ({ expect }) => {
            const value = {
              a: {
                b: [42],
              },
              c: true,
            };
            expect(value).toHaveProperty("c", true);
          },
        },
      ],
    },
  ],
};

const DOUBLE_NEGATION_TEST_CASES: TestSuite = {
  suite: "double negation",
  children: [
    {
      name: "pass",
      assertion: ({ expect }) => {
        expect(1).not.not.toBe(1);
      },
    },
    {
      name: "fail",
      expectedError: dedent`
         Error: expect(received).toBe(expected)
            At: ...

      Expected: 2
      Received: 1

      Filename: expect-non-retrying.ts
          Line: ...
    `,
      assertion: ({ expect }) => {
        expect(1).not.not.toBe(2);
      },
    },
  ],
};

class AssertionFailed extends Error {
  constructor(message: string) {
    super(message);
  }
}

const testExpect = expect.configure({
  colorize: false,
  assertFn: (condition, message) => {
    if (!condition) {
      throw new AssertionFailed(message);
    }
  },
});

function fail(testName: string, message: string) {
  console.log(colorize("✗ " + testName + ":\n" + message + "\n", "red"));

  return false;
}

function pass(testName: string) {
  console.log(colorize("✓ " + testName, "green"));

  return true;
}

async function runTestCase(
  testCase: SingleTestCase,
) {
  try {
    await testCase.assertion({ expect: testExpect });

    if (testCase.expectedError) {
      return fail(testCase.name, "Expected test to fail but it passed");
    }

    return pass(testCase.name);
  } catch (error) {
    // Check if the right error was thrown
    if (testCase.expectedError instanceof Error) {
      if (error instanceof Error === false) {
        return fail(
          testCase.name,
          `Expected an Error to be thrown, but got: ${String(error)}`,
        );
      }

      const expectedConstructor = testCase.expectedError.constructor;

      if (error instanceof expectedConstructor === false) {
        return fail(
          testCase.name,
          `Expected error of type ${expectedConstructor.name} but got ${
            Object.getPrototypeOf(error).constructor.name
          }`,
        );
      }

      if (
        testCase.expectedError.message !== "" &&
        testCase.expectedError.message !== error.message
      ) {
        return fail(
          testCase.name,
          `Expected error message to be:\n${testCase.expectedError.message}\n\nBut got:\n${error.message}`,
        );
      }

      return pass(testCase.name);
    }

    if (error instanceof AssertionFailed === false) {
      return fail(
        testCase.name,
        `Unexpected error thrown: ${error}\n${
          error instanceof Error ? error.stack : ""
        }`,
      );
    }

    if (testCase.expectedError === undefined) {
      return fail(
        testCase.name,
        "Expected test to pass but it failed with error: \n" + error.message,
      );
    }

    // Optionally verify the error message matches expected
    const normalized = error.message.replace(/At: .*$/mg, "At: ...").replace(
      /Line: \d+$/mg,
      "Line: ...",
    );

    if (trimEmptyLines(normalized) !== trimEmptyLines(testCase.expectedError)) {
      return fail(
        testCase.name,
        `Formatted error message does not match the expected output.\nExpected:\n${testCase.expectedError}\n\nActual:\n${normalized}`,
      );
    }

    return pass(testCase.name);
  }
}
