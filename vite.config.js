import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "fonts/*.ttf", "icons/*.png"],
      /* eslint-disable camelcase -- these are the Web App Manifest spec's field names */
      manifest: {
        name: "Stanisav",
        short_name: "Stanisav",
        description:
          "Stanisav: an animated 3D character who physically visualizes the linguistic properties of the world's languages.",
        theme_color: "#070b0f",
        background_color: "#070b0f",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/pwa-icon.png",
            sizes: "any",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-icon.png",
            sizes: "any",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      /* eslint-enable camelcase */
      workbox: {
        // Audio and selfies use the HTTP cache, not the service worker cache.
        globPatterns: ["**/*.{js,css,ttf,svg,png,ico}"],
        globIgnores: ["audio/**", "selfies/**"],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" &&
              !url.pathname.startsWith("/audio/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              expiration: {
                maxEntries: 20,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 8081,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          r3f: [
            "@react-three/fiber",
            "@react-three/drei",
            "@react-spring/three",
          ],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@js": "/js",
    },
  },
  optimizeDeps: {
    include: ["three"],
  },
});
