import { build } from "esbuild";
import * as process from "node:process";

// ESM configuration (default, exposed as jslib)
const esmConfig = {
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

// IIFE configuration (fed to embed.go and embedded in k6's runtime on `import { expect } from k6/test`)
const embedConfig = {
  // Inherit from the ESM configuration, and override some options for embedding in k6
  ...esmConfig,

  // Map source code typescript files to their output files (dist/*.js)
  entryPoints: [{ in: "mod.ts", out: "index.iife" }],

  // Output the IIFE bundle to the embed folder
  outdir: "embed",

  // Use IIFE format for k6/Sobek compatibility
  format: "iife",

  // Set a global name so the exports are accessible
  globalName: "k6Testing",

  // Target ES2018 for k6/Sobek compatibility
  target: "es2018",

  // k6 JS runtime is browser-like.
  platform: "neutral",

  // Inline source maps for k6/Sobek compatibility
  sourcemap: "inline",

  // Add a banner to the output file
  banner: {
    js: "// k6-jslib-testing bundle for Sobek runtime",
  },

  // Add a footer to the output file
  footer: {
    js: `
    // Make expect available globally for k6
    if (typeof globalThis !== 'undefined') {
      globalThis.expect = k6Testing.expect;
    }
    // Return for module loading compatibility
    k6Testing;
    `,
  },
};

// Determine if this is a release build or a development build
if (process.env.DENO_ENV === "production") {
  // Setup release build options for both configurations
  [esmConfig, embedConfig].forEach((config) => {
    Object.assign(config, {
      // Minify the output files
      minify: true,

      // Drop debugger and console statements
      drop: ["debugger", "console"],
    });
  });
}

Promise.all([
  build(esmConfig),
  build(embedConfig),
]).catch(() => process.exit(1));
