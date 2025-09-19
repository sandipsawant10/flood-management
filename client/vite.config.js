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
    // strictPort: true, // fail if port is busy
    // Removed explicit HMR host and port configuration
    // hmr: {
    //   host: "localhost", // explicit HMR host
    //   protocol: "ws", // or "wss" if using HTTPS
    //   port: 5173,
    // },

    headers: {
      "Cache-Control": "no-store",
    },

    proxy: {
      "/api": "http://localhost:5003", // backend API proxy
    },
  },
});
