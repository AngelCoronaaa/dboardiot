import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'AirCare IoT',
        short_name: 'AirCare',
        description: 'Monitoreo de calidad del aire en tiempo real.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f5f5f7',
        theme_color: '#f5f5f7',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // El socket del backend vive bajo /api: nunca debe responderse con el index.html cacheado.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Último clima conocido para cuando no hay red.
            urlPattern: /^https:\/\/api\.(open-meteo\.com|bigdatacloud\.net)\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'clima',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 10, maxAgeSeconds: 6 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
