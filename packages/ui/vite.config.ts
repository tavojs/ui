import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineTavoViteConfig } from "@tavojs/core/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineTavoViteConfig({
  root: "demo",
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${path.join(root, "src")}/`
      }
    ]
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.join(root, "src")]
      }
    }
  },
  build: {
    outDir: "../demo-dist",
    emptyOutDir: true
  }
});
