import path from "node:path";

import react from "@astrojs/react";
import { hagilight } from "@hagicode/hagilight/integration";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { SUPPORTED_BUILDER_LANGUAGE_CODES } from "./src/i18n/config.ts";

const base = process.env.VITE_BASE_PATH || "/";

// `/rss.xml` always serves the English feed (`root`); every other builder
// language is published as `/rss.<language>.xml`.
const rssLocales = Object.fromEntries(
  SUPPORTED_BUILDER_LANGUAGE_CODES.map((lang) => [lang === "en-US" ? "root" : lang, { lang }]),
);

export default defineConfig({
  site: "https://builder.hagicode.com",
  base,
  output: "static",
  integrations: [react(), hagilight({ rss: { locales: rssLocales, getFeed: "./src/rss-feed.ts" } })],
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
