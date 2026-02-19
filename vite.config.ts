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
  // Define environment variables for build-time substitution
  define: {
    // VITE_BAIDU_ANALYTICS_ID: Baidu Analytics ID for builder.hagicode.com (Disabled, migrated to 51LA)
    // Falls back to default ID in index.html if not set
    // Default: 26c9739b2f3cddbe36c649e0823ee2de
    // 'import.meta.env.VITE_BAIDU_ANALYTICS_ID': JSON.stringify(process.env.VITE_BAIDU_ANALYTICS_ID || ''),
    // VITE_51LA_ID: 51LA Analytics ID for builder.hagicode.com
    // Falls back to default ID in index.html if not set
    // Default: L6b88a5yK4h2Xnci
    'import.meta.env.VITE_51LA_ID': JSON.stringify(process.env.VITE_51LA_ID || 'L6b88a5yK4h2Xnci'),
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
