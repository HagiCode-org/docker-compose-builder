import path from "node:path";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const base = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  site: "https://builder.hagicode.com",
  base,
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["cookie"],
    },
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    define: {
      "import.meta.env.VITE_51LA_ID": JSON.stringify(process.env.VITE_51LA_ID || "L6b88a5yK4h2Xnci"),
    },
  },
  build: {
    outDir: "./dist",
  },
});
