import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // GitHub Pages deployment configuration
  base: process.env.NODE_ENV === "production" ? "/docker-compose-builder/" : "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
})
