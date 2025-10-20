// deno-lint-ignore-file

import { assert, assertEquals } from "@std/assert";
import { parseStackTrace } from "./stacktrace.ts";

Deno.test("parseStackTrace", async (t) => {
  await t.step("captures all stack frames fields", async () => {
    const stacktraceText: string = `Error
	at toBe (file:///Users/k6/Dev/k6-testing/expectNonRetrying.ts:157:16(2))`;

    const gotStacktrace = parseStackTrace(stacktraceText);

    assert(gotStacktrace.length === 1);
    assertEquals(gotStacktrace[0].functionName, "toBe");
    assertEquals(
      gotStacktrace[0].filePath,
      "/Users/k6/Dev/k6-testing/expectNonRetrying.ts",
    );
    assertEquals(gotStacktrace[0].lineNumber, 157);
    assertEquals(gotStacktrace[0].columnNumber, 16);
  });

  await t.step("handles multiple stack frames", async () => {
    const stacktraceText: string = `Error
	at toBe (file:///Users/k6/Dev/k6-testing/expectNonRetrying.ts:157:16(2))
	at testToBeChecked (file:///Users/k6/Dev/k6-testing/examples/expect.js:8:20(14))`;

    const gotStacktrace = parseStackTrace(stacktraceText);

    assert(gotStacktrace.length === 2);
    assertEquals(gotStacktrace[0].functionName, "toBe");
    assertEquals(
      gotStacktrace[0].filePath,
      "/Users/k6/Dev/k6-testing/expectNonRetrying.ts",
    );
    assertEquals(gotStacktrace[0].lineNumber, 157);
    assertEquals(gotStacktrace[0].columnNumber, 16);

    assertEquals(gotStacktrace[1].functionName, "testToBeChecked");
    assertEquals(
      gotStacktrace[1].filePath,
      "/Users/k6/Dev/k6-testing/examples/expect.js",
    );
    assertEquals(gotStacktrace[1].lineNumber, 8);
    assertEquals(gotStacktrace[1].columnNumber, 20);
  });

  await t.step(
    "renames default exported function name to <anonymous>",
    async () => {
      const stacktraceText: string = `Error
	at toBe (file:///Users/k6/Dev/k6-testing/expectNonRetrying.ts:157:16(2))
	at file:///Users/k6/Dev/k6-testing/examples/expect.js:8:20(14)`;

      const gotStacktrace = parseStackTrace(stacktraceText);

      assert(gotStacktrace.length === 2);
      assertEquals(gotStacktrace[0].functionName, "toBe");
      assertEquals(gotStacktrace[1].functionName, "<anonymous>");
    },
  );
});
