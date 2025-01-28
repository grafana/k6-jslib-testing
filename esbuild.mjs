import { build } from "esbuild";
import * as process from "node:process";

const buildOptions = {
  // Map source code typescript files to their output files (dist/*.js)
  entryPoints: [{ in: "mod.ts", out: "index" }],

  // Bundle all dependencies into the output file(s)
  bundle: true,

  // Produce the build results in the dist folder
  outdir: "dist",

  // k6 supports the ES module format, and using it avoids transpiling and leads
  // to faster time to start a test, and better overall test performance.
  format: "esm",

  // k6 JS runtime is browser-like.
  platform: "browser",

  alias: {
    // k6-exec-shim is a shim for the k6/execution module, meaning that
    // imports of k6-exec-shim will be replaced with k6/execution in the
    // output bundle file.
    //
    // NOTE (@oleiade): This allows us to avoid relying on the k6/execution module in the
    // Deno runtime, which is not compatible with the k6 runtime. Instead
    // replacing it with a mock implementation that does not abort the test.
    // While making sure that we do replace it with the real k6/execution module
    // when bundling for the k6 runtime.
    "k6-execution-shim": "k6/execution",
  },

  // Allow importing modules from the 'k6' package, all its submodules, and
  // all HTTP(S) URLs (jslibs).
  external: [
    "k6", // Mark the 'k6' package as external
    // "k6/*", // Mark all submodules of 'k6' as external
    "/^https:\\/\\/jslib\\.k6\\.io\\/.*", // Regex to mark all jslib imports as external
  ],

  // Generate source maps for the output files
  sourcemap: true,

  // By default, no minification is applied
  minify: false,
};

// Determine if this is a release build or a development build
if (process.env.NODE_ENV === "production") {
  // Setup release build options
  Object.assign(buildOptions, {
    // Minify the output files
    minify: true,

    // Drop debugger and console statements
    drop: ["debugger", "console"],
  });
}

// Build the project
build(buildOptions).catch(() => process.exit(1));
