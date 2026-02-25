import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": "/src",
      "@js": "/js",
    },
  },
  // Handle legacy JS modules
  optimizeDeps: {
    include: ["three"],
  },
});
