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
        // Only precache the app shell (JS/CSS/fonts/config). Audio samples are
        // intentionally left with no runtimeCaching route at all: <audio>
        // elements issue Range requests, which come back as 206 Partial
        // Content and can never be written into Cache Storage, so any
        // caching strategy here would keep hitting the same limitation.
        // With no matching route, the service worker never intercepts these
        // requests and they stream straight from the network, same as a
        // non-PWA app.
        globPatterns: ["**/*.{js,css,html,ttf,svg,png,ico}"],
        globIgnores: ["audio/**"],
        navigateFallbackDenylist: [/^\/audio\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/fonts/"),
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
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
