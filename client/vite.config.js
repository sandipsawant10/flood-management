import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@store": path.resolve(__dirname, "./src/store"),
    },
  },
  server: {
    port: 5173, // Vite dev server port
    strictPort: true, // fail if port is busy
    hmr: {
      host: "localhost", // explicit HMR host
      protocol: "ws", // or "wss" if using HTTPS
      port: 5173,
    },
    proxy: {
      "/api": "http://localhost:5000", // backend API proxy
    },
  },
});
