import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(
        fileURLToPath(new URL("./src/components", import.meta.url))
      ),
      "@pages": path.resolve(
        fileURLToPath(new URL("./src/pages", import.meta.url))
      ),
      "@services": path.resolve(
        fileURLToPath(new URL("./src/services", import.meta.url))
      ),
      "@store": path.resolve(
        fileURLToPath(new URL("./src/store", import.meta.url))
      ),
    },
  },
  server: {
    port: 5173, // Vite dev server port
    host: "localhost", // Explicitly set host
    strictPort: false, // Allow fallback to different port if busy

    // Configure HMR WebSocket properly
    hmr: {
      host: "localhost",
      port: 24678, // Use different port for HMR to avoid conflicts
      protocol: "ws",
    },

    // Improve WebSocket connection handling
    watch: {
      usePolling: false, // Use native file system events
      interval: 1000,
    },

    headers: {
      "Cache-Control": "no-store",
    },

    proxy: {
      "/api": "http://localhost:5003", // backend API proxy
    },
  },
});
