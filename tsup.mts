import { build, defineConfig } from "tsup";
import * as process from "node:process";

const config = defineConfig({
  // Map source code typescript files to their output files (dist/*.js)
  entry: { index: "mod.ts" },

  // Bundle all dependencies into the output file(s)
  bundle: true,

  // Produce the build results in the dist folder
  outDir: "dist",

  // k6 supports the ES module format, and using it avoids transpiling and leads
  // to faster time to start a test, and better overall test performance.
  format: ["esm"],

  // k6 JS runtime is browser-like.
  platform: "browser",

  // Allow importing modules from the 'k6' package, all its submodules, and
  // all HTTP(S) URLs (jslibs).
  external: [
    "k6",
    /^https:\/\/jslib\.k6\.io\/.*/,
  ],

  // Generate source maps for the output files
  sourcemap: true,

  // By default, no minification is applied
  minify: false,

  // Disable splitting to avoid creating multiple files
  splitting: false,

  // Set the output file extension to .js
  outExtension: () => {
    return {
      js: ".js",
    };
  },

  // Generate TypeScript declaration files
  dts: {
    entry: { index: "mod.ts" },
  },

  esbuildOptions: (options) => {
    // Determine if this is a release build or a development build
    if (process.env.NODE_ENV === "production") {
      // Drop debugger and console statements
      options.drop = ["console", "debugger"];
      // Minify the output files
      options.minify = true;
    }
  },
});

build(config);
