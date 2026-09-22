import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "./frontend",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
      },
    },
  },
  plugins: [
    tanstackStart(),
    nitro(),
    react({ fastRefresh: false, include: /\.[jt]sx$/ }),
    tsconfigPaths({ projects: ["./jsconfig.json"] }),
    tailwindcss(),
  ],
});
