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
  // Base path configuration
  // Set VITE_BASE_PATH environment variable to override (e.g., VITE_BASE_PATH=/custom-path/)
  // - Defaults to "/" for development
  // - Defaults to "/docker-compose-builder/" for production (GitHub Pages)
  base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === "production" ? "/docker-compose-builder/" : "/"),
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
})
