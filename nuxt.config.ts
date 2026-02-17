// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // ssr: false,

  devtools: { enabled: true },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
  },

  modules: [
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-i18n-micro',
    '@nuxt/eslint',
  ],

  eslint: {
    config: {
      stylistic: false, // disable stylistic rules, use prettier instead
    },
    checker: false, // disable dev server checker
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  i18n: {
    locales: [
      { code: 'id', iso: 'id-ID', dir: 'ltr' },
      { code: 'en', iso: 'en-US', dir: 'ltr' },
    ],
    defaultLocale: 'id',
    translationDir: 'locales',
    strategy: 'prefix_except_default',
    meta: true,
    autoDetectLanguage: false,
    disablePageLocales: false,
    fallbackLocale: 'id',
    localeCookie: 'user-locale',
  },
  css: ['./app/assets/css/main.css'],

  experimental: {
    payloadExtraction: false, // Disable payload.json for SPA builds
  },

  vite: {
    server: {
      allowedHosts: ['dev.nebengyu.web.id'],
    },
    build: {
      sourcemap: false,
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
      orientation: 'any',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },

    workbox: {
      cleanupOutdatedCaches: true,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js', '**/_payload.json'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api/],

      runtimeCaching: [
        // Supabase Auth - NetworkOnly (NEVER cache auth requests)
        {
          urlPattern: /\/auth\/v1\/.*/,
          handler: 'NetworkOnly',
        },
        // Supabase REST API - StaleWhileRevalidate
        {
          urlPattern: /\/rest\/v1\/.*/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'sb-data',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 86400,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // Supabase Storage - CacheFirst
        {
          urlPattern: /\/storage\/v1\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'sb-storage',
            expiration: {
              maxEntries: 300,
              maxAgeSeconds: 2592000,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // Realtime - NetworkOnly
        {
          urlPattern: /\/realtime\/v1\/.*/,
          handler: 'NetworkOnly',
        },
      ],
    },

    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true,
    },
  },

  runtimeConfig: {
    public: {
      appDebug: process.env.APP_DEBUG || 'off',
      pushVapidPublicKey: process.env.NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY || '',
    },
    pushVapidPrivateKey: process.env.NUXT_PUSH_VAPID_PRIVATE_KEY || '',
  },
})
