import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Use generateSW for better compatibility with Vite's dev server
      strategies: 'generateSW',
      srcDir: 'src',
      filename: 'service-worker.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      workbox: {
        // Enable source maps only in development
        sourcemap: process.env.NODE_ENV === 'development',
        
        // Optimize precaching
        globPatterns: [
          '**/*.{js,css,html,woff2,woff,ttf}',
          '**/*.{png,jpg,jpeg,svg,gif,webp,ico}',
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        
        // Skip waiting for service worker to activate
        skipWaiting: true,
        clientsClaim: true,
        
        // Optimize runtime caching
        runtimeCaching: [
          // API requests
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Fonts
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Static assets
          {
            urlPattern: /\.(?:js|css|woff2|woff|ttf|eot)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Pages for offline use
          {
            urlPattern: /\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3, // Fallback to cache if no response in 3s
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                purgeOnQuotaError: true
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      // Development options are configured in the root of the VitePWA config
      manifest: {
        name: 'Retos Fútbol',
        short_name: 'RetosFutbol',
        description: 'App de retos de fútbol',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        start_url: '/?source=pwa',
        scope: '/',
        id: '/',
        orientation: 'portrait',
        prefer_related_applications: false,
        // For iOS
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black-translucent',
        appleMobileWebAppTitle: 'Retos Fútbol',
        // For Windows
        msapplicationTileColor: '#1a1a1a',
        // For Android
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        // For Chrome on Android
        related_applications: [],
        categories: ['sports', 'soccer', 'football', 'games'],
        screenshots: [
          {
            src: '/screenshots/screenshot1.png',
            type: 'image/png',
            sizes: '1080x1920',
            form_factor: 'narrow',
            label: 'Pantalla de inicio de Retos Fútbol'
          },
          {
            src: '/screenshots/screenshot2.png',
            type: 'image/png',
            sizes: '1080x1920',
            form_factor: 'narrow',
            label: 'Pantalla de perfil de Retos Fútbol'
          }
        ],
        shortcuts: [
          {
            name: 'Nuevo Reto',
            short_name: 'Nuevo',
            description: 'Crear un nuevo reto',
            url: '/nuevo-reto',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Mis Retos',
            short_name: 'Retos',
            description: 'Ver mis retos',
            url: '/mis-retos',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'monochrome',
            label: 'Retos Fútbol Icon'
          }
        ],
        // iOS specific
        apple: {
          capable: true,
          statusBarStyle: 'black-translucent',
          startupImage: [
            {
              href: '/splashscreens/iphone5_splash.png',
              media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
            },
            {
              href: '/splashscreens/iphone6_splash.png',
              media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
            },
            {
              href: '/splashscreens/iphoneplus_splash.png',
              media: '(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)'
            },
            {
              href: '/splashscreens/iphonex_splash.png',
              media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
            },
            {
              href: '/splashscreens/ipad_splash.png',
              media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)'
            },
            {
              href: '/splashscreens/ipadpro1_splash.png',
              media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)'
            },
            {
              href: '/splashscreens/ipadpro3_splash.png',
              media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)'
            },
            {
              href: '/splashscreens/ipadpro2_splash.png',
              media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)'
            }
          ]
        }
      },
      // Workbox configuration is defined above in the workbox object
      injectRegister: 'script',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
        suppressWarnings: true
      },
    })
  ],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy all API requests to the backend
      '^/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Proxy all other API routes
      '^/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '^/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '^/matches': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  }
})
