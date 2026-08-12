import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: `${projectRoot}index.html`,
        flashcards: `${projectRoot}security-plus-flashcards/index.html`,
      },
    },
  },
});
