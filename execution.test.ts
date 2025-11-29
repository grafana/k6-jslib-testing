// deno-lint-ignore-file

import { assert, assertEquals, assertStrictEquals } from "@std/assert";
import { captureExecutionContext, setRootDirectory } from "./execution.ts";
import type { StackFrame, Stacktrace } from "./stacktrace.ts";

Deno.test("captureExecutionContext", async (t) => {
  setRootDirectory("/path/to/internal/");

  await t.step("returns undefined when stacktrace is empty", () => {
    const emptyStacktrace: Stacktrace = [];
    const result = captureExecutionContext(emptyStacktrace);
    assertEquals(result, undefined);
  });

  await t.step(
    "returns undefined when all frames inside the stacktrace are internal",
    () => {
      const stacktrace: Stacktrace = [
        {
          functionName: "testFunction",
          filePath: "/path/to/internal/file.ts",
          fileName: "file.ts",
          lineNumber: 42,
          columnNumber: 10,
        },
      ];
      const result = captureExecutionContext(stacktrace);
      assertEquals(result, undefined);
    },
  );

  await t.step(
    "captures execution context from first non-internal stack frame",
    () => {
      const mockStacktrace: Stacktrace = [
        {
          functionName: "firstFunction",
          filePath: "/path/to/internal/first.ts",
          fileName: "first.ts",
          lineNumber: 10,
          columnNumber: 5,
        },
        {
          functionName: "secondFunction",
          filePath: "/path/to/internal/second.ts",
          fileName: "second.ts",
          lineNumber: 10,
          columnNumber: 5,
        },
        {
          functionName: "thirdFunction",
          filePath: "/path/to/third.ts",
          fileName: "third.ts",
          lineNumber: 20,
          columnNumber: 15,
        },
        {
          functionName: "fifthFunction",
          filePath: "/path/to/internal/fifth.ts",
          fileName: "fifth.ts",
          lineNumber: 10,
          columnNumber: 5,
        },
        {
          functionName: "fourthFunction",
          filePath: "/path/to/fourth.ts",
          fileName: "fourth.ts",
          lineNumber: 20,
          columnNumber: 15,
        },
      ];

      const result = captureExecutionContext(mockStacktrace);

      assert(result !== undefined);
      assertEquals(result?.filePath, "/path/to/third.ts");
      assertEquals(result?.fileName, "third.ts");
      assertEquals(result?.lineNumber, 20);
      assertEquals(result?.columnNumber, 15);
      assertEquals(result?.at, "/path/to/third.ts:20:15");
    },
  );

  await t.step("handles stacktrace with anonymous functions", () => {
    const mockStacktrace: Stacktrace = [
      {
        functionName: "<anonymous>",
        filePath: "/path/to/internal/first.ts",
        fileName: "first.ts",
        lineNumber: 10,
        columnNumber: 5,
      },
      {
        functionName: "<anonymous>",
        filePath: "/path/to/second.ts",
        fileName: "second.ts",
        lineNumber: 20,
        columnNumber: 15,
      },
    ];

    const result = captureExecutionContext(mockStacktrace);

    assert(result !== undefined);
    assertEquals(result?.filePath, "/path/to/second.ts");
    assertEquals(result?.fileName, "second.ts");
    assertEquals(result?.lineNumber, 20);
    assertEquals(result?.columnNumber, 15);
    assertEquals(result?.at, "/path/to/second.ts:20:15");
  });

  await t.step("returns undefined when stacktrace is null or undefined", () => {
    // @ts-ignore - Testing with null even though the type doesn't allow it
    const result1 = captureExecutionContext(null);
    assertEquals(result1, undefined);

    // @ts-ignore - Testing with undefined even though the type doesn't allow it
    const result2 = captureExecutionContext(undefined);
    assertEquals(result2, undefined);
  });
});
