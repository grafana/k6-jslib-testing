import { setRootDirectory } from "./execution.ts";

// Set the root directory of this library. This is used to filter out internal
// stack frames from error stack traces.
setRootDirectory(
  import.meta.resolve("./1234.js").replace(/1234\.js$/i, "")
    .replace(/^file:\/\//i, "") // Remove file:// for local dev
    .replace(/dist\/$/i, ""), // Remove dist/ for local dev
);

export { expect } from "./expect.ts";
export { colorize } from "./colors.ts";

export { createTestSuite, type TestSuite } from "./suites/suite.ts";
export { defineSuite, describe, it, test } from "./suites/globals.ts";
