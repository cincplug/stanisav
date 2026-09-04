import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Audio samples are large and only needed for languages the visitor
      // actually plays, so they're cached at runtime instead of precached.
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
        // Only precache the app shell (JS/CSS/fonts/config); never precache
        // the audio/samples folder, which is downloaded per-language on demand.
        globPatterns: ["**/*.{js,css,html,ttf,svg,png,ico}"],
        globIgnores: ["audio/**"],
        navigateFallbackDenylist: [/^\/audio\//],
        runtimeCaching: [
          {
            // Cache each language sample the first time it's played, so
            // already-heard languages keep working offline afterwards.
            urlPattern: ({ url }) => url.pathname.startsWith("/audio/samples/"),
            handler: "CacheFirst",
            options: {
              cacheName: "audio-samples",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              rangeRequests: true,
            },
          },
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
        // Split heavy, rarely-changing vendor libs into their own chunks so
        // browsers (and the PWA precache) can cache them independently of
        // app code that changes on every deploy.
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
  // Handle legacy JS modules
  optimizeDeps: {
    include: ["three"],
  },
});
