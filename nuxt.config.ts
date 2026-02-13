// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@vite-pwa/nuxt"],
  css: ["./app/assets/css/main.css"],
  vite: {
    server: {
      allowedHosts: ["dev.nebengyu.web.id"]
    },
    plugins: [tailwindcss() as any],
  },
  supabase: {
    types: false, // disable database types
    redirect: false,
  },
  
  pwa: {
    registerType: 'prompt',
    strategies: 'generateSW',
    
    manifest: {
      name: 'Nuxsup',
      short_name: 'Nuxsup',
      description: 'Nuxsup Progressive Web App',
      theme_color: '#1e293b',
      background_color: '#f8fafc',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ]
    },
    
    workbox: {
      cleanupOutdatedCaches: true,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api/],
      
      runtimeCaching: [
        // Supabase Auth - NetworkFirst
        {
          urlPattern: /\/auth\/v1\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'sb-auth',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Supabase REST API - StaleWhileRevalidate
        {
          urlPattern: /\/rest\/v1\/.*/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'sb-data',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 86400
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Supabase Storage - CacheFirst
        {
          urlPattern: /\/storage\/v1\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'sb-storage',
            expiration: {
              maxEntries: 300,
              maxAgeSeconds: 2592000
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Realtime - NetworkOnly
        {
          urlPattern: /\/realtime\/v1\/.*/,
          handler: 'NetworkOnly'
        }
      ]
    },
    
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true
    }
  },
  
  runtimeConfig: {
    public: {
      pushVapidPublicKey: process.env.NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY || ''
    },
    pushVapidPrivateKey: process.env.NUXT_PUSH_VAPID_PRIVATE_KEY || ''
  },
});
