import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/scrolly.js"),
      name: "scrolly",
      formats: ["umd"],
    },
    outDir: "dist",
    rollupOptions: {
      output: [
        {
          entryFileNames: "scrolly.js",
          format: "umd",
          name: "scrolly",
          exports: "named",
          sourcemap: true,
        },
        {
          entryFileNames: "scrolly.min.js",
          format: "umd",
          name: "scrolly",
          exports: "named",
          sourcemap: true,
          plugins: [
            // Built-in terser plugin to minify
            require("rollup-plugin-terser").terser(),
          ],
        },
      ],
    },
    minify: false, // disable default Vite minification, we’re handling it manually
  },
});
