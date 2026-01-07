// @ts-types="../dist/index.d.ts"
import { colorize, expect } from "../dist/index.js";
import { createMockAssertFn, failTest, passTest } from "./testing.ts";
import type { ExpectFunction } from "../expect.ts";
import { dedent } from "./utils.ts";
import execution from "k6/execution";

export default async function testExpectNonRetrying() {
  const failed: TestCase[] = [];
  const testCases = [...TEST_CASES, ...NEGATION_TEST_CASES];

  for (const testCase of testCases) {
    const passed = await runTestCase(testCase);

    if (!passed) {
      failed.push(testCase);
    }
  }

  if (failed.length > 0) {
    // @ts-expect-error There seems to be some weird interaction with @types/k6 and the k6 package
    execution.test.fail(`${failed.length}/${testCases.length} tests failed.`);
  }

  testToBeInstanceOf();
  testToContain();
  testToContainEqual();
  testToHaveProperty();
  testDoubleNegation();
}

interface Context {
  expect: ExpectFunction;
}

interface TestCase {
  name: string;
  expectedError?: string;
  assertion: (context: Context) => Promise<void> | void;
}

const TEST_CASES: TestCase[] = [
  {
    name: "toBe (pass)",
    assertion: ({ expect }) => {
      expect(true).toBe(true);
    },
  },
  {
    name: "toBe (fail)",
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
    name: "toBeCloseTo (pass)",
    assertion: ({ expect }) => {
      expect(10).toBeCloseTo(9.9, 0.1);
    },
  },
  {
    name: "toBeCloseTo (fail)",
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
    name: "toBeDefined (pass)",
    assertion: ({ expect }) => {
      expect(10).toBeDefined();
    },
  },
  {
    name: "toBeDefined (fail)",
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
    name: "toBeFalsy (pass)",
    assertion: ({ expect }) => {
      expect(false).toBeFalsy();
    },
  },
  {
    name: "toBeFalsy (fail)",
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
  },
  {
    name: "toBeGreaterThan (pass)",
    assertion: ({ expect }) => {
      expect(2).toBeGreaterThan(1);
    },
  },
  {
    name: "toBeGreaterThan (fail)",
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
  },
  {
    name: "toBeGreaterThanOrEqual (pass)",
    assertion: ({ expect }) => {
      expect(2).toBeGreaterThanOrEqual(1);
    },
  },
  {
    name: "toBeGreaterThanOrEqual (fail)",
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
  },
  {
    name: "toBeLessThan (pass)",
    assertion: ({ expect }) => {
      expect(1).toBeLessThan(2);
    },
  },
  {
    name: "toBeLessThan (fail)",
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
  },
  {
    name: "toBeLessThanOrEqual (pass)",
    assertion: ({ expect }) => {
      expect(1).toBeLessThanOrEqual(2);
    },
  },
  {
    name: "toBeLessThanOrEqual (fail)",
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
  },
  {
    name: "toBeNaN (pass)",
    assertion: ({ expect }) => {
      expect(NaN).toBeNaN();
    },
  },
  {
    name: "toBeNaN (fail)",
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
  },
  {
    name: "toBeNull (pass)",
    assertion: ({ expect }) => {
      expect(null).toBeNull();
    },
  },
  {
    name: "toBeNull (fail)",
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
  },
  {
    name: "toBeTruthy (pass)",
    assertion: ({ expect }) => {
      expect(true).toBeTruthy();
    },
  },
  {
    name: "toBeTruthy (fail)",
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
  },
  {
    name: "toBeUndefined (pass)",
    assertion: ({ expect }) => {
      expect(undefined).toBeUndefined();
    },
  },
  {
    name: "toBeUndefined (fail)",
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
  },
  {
    name: "toEqual (pass)",
    assertion: ({ expect }) => {
      expect({ a: 1 }).toEqual({ a: 1 });
    },
  },
  {
    name: "toEqual (fail)",
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
  },
  {
    name: "toHaveLength (pass)",
    assertion: ({ expect }) => {
      expect([1, 2, 3]).toHaveLength(3);
    },
  },
  {
    name: "toHaveLength (fail)",
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
  },
  {
    name: "toContain with String (pass)",
    assertion: ({ expect }) => {
      expect("hello world").toContain("world");
    },
  },
  {
    name: "toContain with String (fail)",
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
    name: "toContain with Array (pass)",
    assertion: ({ expect }) => {
      expect([1, 2, 3]).toContain(2);
    },
  },
  {
    name: "toContain with Array (fail)",
    expectedError: dedent`
                    Error: expect(received).toContain(expected)
                       At: ...

      Expected to contain: 5
           Received array: [1,2,3]

                 Filename: expect-non-retrying.ts
                     Line: ...

    `,
    assertion: ({ expect }) => {
      expect([1, 2, 3]).toContain(5);
    },
  },
  {
    name: "toContain with Set (pass)",
    assertion: ({ expect }) => {
      expect(new Set([1, 2, 3])).toContain(2);
    },
  },
  {
    name: "toContain with Set (fail)",
    expectedError: dedent`
                    Error: expect(received).toContain(expected)
                       At: ...

      Expected to contain: 5
             Received set: {}

                 Filename: expect-non-retrying.ts
                     Line: ...
    `,
    assertion: ({ expect }) => {
      expect(new Set([1, 2, 3])).toContain(5);
    },
  },
  {
    name: "toContainEqual with Array (pass)",
    assertion: ({ expect }) => {
      expect([{ id: 1 }, { id: 2 }]).toContainEqual({ id: 1 });
    },
  },
  {
    name: "toContainEqual with Array (fail)",
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
    name: "toContainEqual with Set (pass)",
    assertion: ({ expect }) => {
      expect(new Set([{ id: 1 }, { id: 2 }])).toContainEqual({ id: 1 });
    },
  },
  {
    name: "toContainEqual with Set (fail)",
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
    name: "toHaveProperty with simple property (pass)",
    assertion: ({ expect }) => {
      expect({ a: 1 }).toHaveProperty("a");
    },
  },
  {
    name: "toHaveProperty with simple property (fail)",
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
  {
    name: "toHaveProperty with nested property (pass)",
    assertion: ({ expect }) => {
      expect({ a: { b: 2 } }).toHaveProperty("a.b");
    },
  },
  {
    name: "toHaveProperty with nested property (fail)",
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
  {
    name: "toHaveProperty with array index (pass)",
    assertion: ({ expect }) => {
      expect({ a: [1, 2, 3] }).toHaveProperty("a[1]");
    },
  },
  {
    name: "toHaveProperty with array index (fail)",
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
  {
    name: "toHaveProperty with expected value (pass)",
    assertion: ({ expect }) => {
      expect({ a: 1 }).toHaveProperty("a", 1);
    },
  },
  {
    name: "toHaveProperty with expected value (fail)",
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
  {
    name: "toHaveProperty with nested expected value (pass)",
    assertion: ({ expect }) => {
      expect({ a: { b: 2 } }).toHaveProperty("a.b", 2);
    },
  },
  {
    name: "toHaveProperty with nested expected value (fail)",
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
  {
    name: "toHaveProperty with array index and expected value (pass)",
    assertion: ({ expect }) => {
      expect({ a: [1, 2, 3] }).toHaveProperty("a[1]", 2);
    },
  },
  {
    name: "toHaveProperty with array index and expected value (fail)",
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
];

const NEGATION_TEST_CASES: TestCase[] = [
  {
    name: "not.toBe (pass)",
    assertion: ({ expect }) => {
      expect(1).not.toBe(2);
    },
  },
  {
    name: "not.toBe (fail)",
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
  {
    name: "not.toEqual (pass)",
    assertion: ({ expect }) => {
      expect({ a: 1 }).not.toEqual({ a: 2 });
    },
  },
  {
    name: "not.toEqual (fail)",
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
  },
  {
    name: "not.toBeTruthy (pass)",
    assertion: ({ expect }) => {
      expect(false).not.toBeTruthy();
    },
  },
  {
    name: "not.toBeTruthy (fail)",
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
  },
  {
    name: "not.toBeFalsy (pass)",
    assertion: ({ expect }) => {
      expect(true).not.toBeFalsy();
    },
  },
  {
    name: "not.toBeFalsy (fail)",
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
  },
  {
    name: "not.toBeNull (pass)",
    assertion: ({ expect }) => {
      expect(1).not.toBeNull();
    },
  },
  {
    name: "not.toBeNull (fail)",
    expectedError: dedent`
         Error: expect(received).toBeNull()
            At: ...

      Received: null

      Filename: expect-non-retrying.ts
          Line: ...
    `,
    assertion: ({ expect }) => {
      expect(null).not.toBeNull();
    },
  },
  {
    name: "not.toBeUndefined (pass)",
    assertion: ({ expect }) => {
      expect(1).not.toBeUndefined();
    },
  },
  {
    name: "not.toBeUndefined (fail)",
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
  },
  {
    name: "not.toContain with string (pass)",
    assertion: ({ expect }) => {
      expect("hello world").not.toContain("universe");
    },
  },
  {
    name: "not.toContain with string (fail)",
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
  },
  {
    name: "not.toContain with array (pass)",
    assertion: ({ expect }) => {
      expect([1, 2, 3]).not.toContain(4);
    },
  },
  {
    name: "not.toContain with array (fail)",
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
  },
  {
    name: "not.toContain with set (pass)",
    assertion: ({ expect }) => {
      expect(new Set([1, 2, 3])).not.toContain(4);
    },
  },
  {
    name: "not.toContain with set (fail)",
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
  },
  {
    name: "not.toContainEqual with array (pass)",
    assertion: ({ expect }) => {
      expect([{ id: 1 }, { id: 2 }]).not.toContainEqual({ id: 3 });
    },
  },
  {
    name: "not.toContainEqual with array (fail)",
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
  },
  {
    name: "not.toContainEqual with set (pass)",
    assertion: ({ expect }) => {
      expect(new Set([{ id: 1 }, { id: 2 }])).not.toContainEqual({ id: 3 });
    },
  },
  {
    name: "not.toContainEqual with set (fail)",
    expectedError: dedent`
                              Error: expect(received).toContainEqual(expected)
                                 At: ...

      Expected not to contain equal: {"id":1}
                       Received set: {}

                           Filename: expect-non-retrying.ts
                               Line: ...
    `,
    assertion: ({ expect }) => {
      expect(new Set([{ id: 1 }, { id: 2 }])).not.toContainEqual({ id: 1 });
    },
  },
  {
    name: "not.toHaveProperty with missing property (pass)",
    assertion: ({ expect }) => {
      expect({ a: 1 }).not.toHaveProperty("b");
    },
  },
  {
    name: "not.toHaveProperty with missing property (fail)",
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
  },
  {
    name: "not.toHaveProperty with existing property but wrong value (pass)",
    assertion: ({ expect }) => {
      expect({ a: 1 }).not.toHaveProperty("a", 2);
    },
  },
  {
    name: "not.toHaveProperty with existing property but wrong value (fail)",
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
  },
  {
    name: "not.toHaveProperty with nested missing property (pass)",
    assertion: ({ expect }) => {
      expect({ a: { b: 1 } }).not.toHaveProperty("a.c");
    },
  },
  {
    name: "not.toHaveProperty with nested missing property (fail)",
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
  },
  {
    name: "not.toHaveProperty with array index out of bounds (pass)",
    assertion: ({ expect }) => {
      expect({ a: [1, 2, 3] }).not.toHaveProperty("a[5]");
    },
  },
  {
    name: "not.toHaveProperty with array index out of bounds (fail)",
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
];

class Example {}
function testToBeInstanceOf() {
  const mockAssertFn = createMockAssertFn();
  const testExpect = expect.configure({ assertFn: mockAssertFn });

  testExpect(new Example()).toBeInstanceOf(Example);

  if (!mockAssertFn.called) {
    failTest("toBeInstanceOf", "expected assertFn to be called");
  }

  if (mockAssertFn.calls.length !== 1) {
    failTest("toBeInstanceOf", "expected assertFn to be called once");
  }

  if (mockAssertFn.calls[0].condition !== true) {
    failTest("toBeInstanceOf", "expected assertFn condition to be true");
  }

  if (mockAssertFn.calls[0].soft !== false) {
    failTest(
      "toBeInstanceOf",
      "expected assertFn to be called with soft === false",
    );
  }

  passTest("toBeInstanceOf");
}

function testToContain() {
  // Test with string
  const stringTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect("hello world").toContain("world");
    if (!mockAssertFn.called) {
      failTest("toContain with string", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContain with string",
        "expected condition to be true for string containing substring",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect("hello world").toContain("universe");
    if (!mockAssertFn.called) {
      failTest("toContain with string", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContain with string",
        "expected condition to be false for string not containing substring",
      );
    }

    passTest("toContain with string");
  };

  // Test with array
  const arrayTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect([1, 2, 3]).toContain(2);
    if (!mockAssertFn.called) {
      failTest("toContain with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContain with array",
        "expected condition to be true for array containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect([1, 2, 3]).toContain(4);
    if (!mockAssertFn.called) {
      failTest("toContain with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContain with array",
        "expected condition to be false for array not containing item",
      );
    }

    passTest("toContain with array");
  };

  // Test with Set
  const setTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect(new Set([1, 2, 3])).toContain(2);
    if (!mockAssertFn.called) {
      failTest("toContain with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContain with Set",
        "expected condition to be true for Set containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect(new Set([1, 2, 3])).toContain(4);
    if (!mockAssertFn.called) {
      failTest("toContain with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContain with Set",
        "expected condition to be false for Set not containing item",
      );
    }

    passTest("toContain with Set");
  };

  // Test with unsupported type
  const unsupportedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    try {
      testExpect(123).toContain(2);
      failTest("toContain with unsupported type", "expected to throw an error");
    } catch (error) {
      if (!(error instanceof Error)) {
        failTest(
          "toContain with unsupported type",
          "expected to throw an Error",
        );

        return;
      }

      if (
        !error.message.includes("only supported for strings, arrays, and sets")
      ) {
        failTest(
          "toContain with unsupported type",
          "expected error message to mention supported types",
        );

        return;
      }

      passTest("toContain with unsupported type");
    }
  };

  // Run all tests
  stringTest();
  arrayTest();
  setTest();
  unsupportedTest();
}

function testToContainEqual() {
  // Test with array
  const arrayTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case with primitives
    testExpect([1, 2, 3]).toContainEqual(2);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with array",
        "expected condition to be true for array containing primitive item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect([1, 2, 3]).toContainEqual(4);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with array", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContainEqual with array",
        "expected condition to be false for array not containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test with objects (deep equality)
    testExpect([{ id: 2 }, { id: 1 }, { id: 3 }]).toContainEqual({ id: 1 });
    if (!mockAssertFn.called) {
      failTest(
        "toContainEqual with array objects",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with array objects",
        "expected condition to be true for array containing object with same content",
      );
    }

    passTest("toContainEqual with array");
  };

  // Test with Set
  const setTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case with primitives
    testExpect(new Set([1, 2, 3])).toContainEqual(2);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with Set",
        "expected condition to be true for Set containing primitive item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect(new Set([1, 2, 3])).toContainEqual(4);
    if (!mockAssertFn.called) {
      failTest("toContainEqual with Set", "expected assertFn to be called");
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toContainEqual with Set",
        "expected condition to be false for Set not containing item",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test with objects (deep equality)
    testExpect(new Set([{ id: 2 }, { id: 1 }, { id: 3 }])).toContainEqual({
      id: 1,
    });
    if (!mockAssertFn.called) {
      failTest(
        "toContainEqual with Set objects",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toContainEqual with Set objects",
        "expected condition to be true for Set containing object with same content",
      );
    }

    passTest("toContainEqual with Set");
  };

  // Test with unsupported type
  const unsupportedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    try {
      testExpect("string").toContainEqual("s");
      failTest(
        "toContainEqual with unsupported type",
        "expected to throw an error",
      );
    } catch (error) {
      if (!(error instanceof Error)) {
        failTest(
          "toContainEqual with unsupported type",
          "expected to throw an Error",
        );

        return;
      }

      if (
        !error.message.includes("only supported for arrays and sets")
      ) {
        failTest(
          "toContainEqual with unsupported type",
          "expected error message to mention supported types",
        );

        return;
      }

      passTest("toContainEqual with unsupported type");
    }
  };

  // Run all tests
  arrayTest();
  setTest();
  unsupportedTest();
}

function testToHaveProperty() {
  // Test with simple property
  const simpleTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: 1 }).toHaveProperty("a");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with simple property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with simple property",
        "expected condition to be true for object with property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect({ a: 1 }).toHaveProperty("b");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with missing property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with missing property",
        "expected condition to be false for object without property",
      );
    }

    passTest("toHaveProperty with simple property");
  };

  // Test with nested property
  const nestedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: { b: 2 } }).toHaveProperty("a.b");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with nested property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with nested property",
        "expected condition to be true for object with nested property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case
    testExpect({ a: { c: 2 } }).toHaveProperty("a.b");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with missing nested property",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with missing nested property",
        "expected condition to be false for object without nested property",
      );
    }

    passTest("toHaveProperty with nested property");
  };

  // Test with array index
  const arrayTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: [1, 2, 3] }).toHaveProperty("a[1]");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with array index",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with array index",
        "expected condition to be true for object with array property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case - index out of bounds
    testExpect({ a: [1, 2, 3] }).toHaveProperty("a[5]");
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with out of bounds index",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with out of bounds index",
        "expected condition to be false for array index out of bounds",
      );
    }

    passTest("toHaveProperty with array index");
  };

  // Test with expected value
  const expectedValueTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    // Test passing case
    testExpect({ a: 1 }).toHaveProperty("a", 1);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with expected value",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with expected value",
        "expected condition to be true for matching property value",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test failing case - wrong value
    testExpect({ a: 1 }).toHaveProperty("a", 2);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with wrong expected value",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== false) {
      failTest(
        "toHaveProperty with wrong expected value",
        "expected condition to be false for non-matching property value",
      );
    }

    passTest("toHaveProperty with expected value");
  };

  // Test with complex object
  const complexTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    const complexObj = {
      a: {
        b: [
          { c: 1 },
          { c: 2 },
        ],
      },
      d: true,
    };

    // Test passing cases
    testExpect(complexObj).toHaveProperty("a.b[1].c", 2);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with complex path",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with complex path",
        "expected condition to be true for complex property path",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    testExpect(complexObj).toHaveProperty("d", true);
    if (!mockAssertFn.called) {
      failTest(
        "toHaveProperty with boolean value",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "toHaveProperty with boolean value",
        "expected condition to be true for boolean property",
      );
    }

    passTest("toHaveProperty with complex object");
  };

  // Test with unsupported type
  const unsupportedTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    try {
      testExpect("string").toHaveProperty("length");
      failTest(
        "toHaveProperty with unsupported type",
        "expected to throw an error",
      );
    } catch (error) {
      if (!(error instanceof Error)) {
        failTest(
          "toHaveProperty with unsupported type",
          "expected to throw an Error",
        );

        return;
      }

      if (
        !error.message.includes("only supported for objects")
      ) {
        failTest(
          "toHaveProperty with unsupported type",
          "expected error message to mention supported types",
        );

        return;
      }

      passTest("toHaveProperty with unsupported type");
    }
  };

  // Test Playwright examples
  const playwrightExamplesTest = () => {
    const mockAssertFn = createMockAssertFn();
    const testExpect = expect.configure({ assertFn: mockAssertFn });

    const value = {
      a: {
        b: [42],
      },
      c: true,
    };

    // Test: expect(value).toHaveProperty('a.b');
    testExpect(value).toHaveProperty("a.b");
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 1",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 1",
        "expected condition to be true for a.b property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('a.b', [42]);
    testExpect(value).toHaveProperty("a.b", [42]);
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 2",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 2",
        "expected condition to be true for a.b property with array value",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('a.b[0]', 42);
    testExpect(value).toHaveProperty("a.b[0]", 42);
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 3",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 3",
        "expected condition to be true for a.b[0] property with value 42",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('c');
    testExpect(value).toHaveProperty("c");
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 4",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 4",
        "expected condition to be true for c property",
      );
    }

    // Reset mock
    mockAssertFn.calls = [];
    mockAssertFn.called = false;

    // Test: expect(value).toHaveProperty('c', true);
    testExpect(value).toHaveProperty("c", true);
    if (!mockAssertFn.called) {
      failTest(
        "Playwright example 5",
        "expected assertFn to be called",
      );
    }
    if (mockAssertFn.calls[0].condition !== true) {
      failTest(
        "Playwright example 5",
        "expected condition to be true for c property with value true",
      );
    }

    passTest("Playwright examples for toHaveProperty");
  };

  // Run all tests
  simpleTest();
  nestedTest();
  arrayTest();
  expectedValueTest();
  complexTest();
  unsupportedTest();
  playwrightExamplesTest();
}

function testDoubleNegation() {
  // Test double negation
  const mockAssertFn = createMockAssertFn();
  const testExpect = expect.configure({ assertFn: mockAssertFn });

  testExpect(1).not.not.toBe(1);

  if (!mockAssertFn.called) {
    failTest("not.not.toBe", "expected assertFn to be called");
  }

  if (mockAssertFn.calls.length !== 1) {
    failTest("not.not.toBe", "expected assertFn to be called once");
  }

  if (mockAssertFn.calls[0].condition !== true) {
    failTest("not.not.toBe", "expected assertFn condition to be true");
  }

  passTest("not.not.toBe");
}

class AssertionFailed {
  message: string;

  constructor(message: string) {
    this.message = message;
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
  testCase: TestCase,
) {
  try {
    await testCase.assertion({ expect: testExpect });

    if (testCase.expectedError) {
      return fail(testCase.name, "Expected test to fail but it passed");
    }

    return pass(testCase.name);
  } catch (error) {
    if (error instanceof AssertionFailed === false) {
      throw error;
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

    if (normalized.trim() !== testCase.expectedError.trim()) {
      return fail(
        testCase.name,
        `Formatted error message does not match the expected output.\nExpected:\n${testCase.expectedError}\n\nActual:\n${normalized}`,
      );
    }

    return pass(testCase.name);
  }
}
