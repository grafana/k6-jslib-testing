import dts from "rollup-plugin-dts";

export default {
  input: "dist/mod.d.ts",
  output: {
    file: "dist/index.d.ts",
    format: "es",
  },
  plugins: [dts()],
  external: [/^k6/], // Mark k6 modules as external
};
