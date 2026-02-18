// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Disable SSR for SPA mode (better performance for this use case)
  ssr: false,

  // Disable devtools in production
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
      // Performance: Preconnect to external domains
      link: [
        // Preconnect to Supabase
        { rel: 'preconnect', href: 'https://*.supabase.co' },
        { rel: 'dns-prefetch', href: 'https://*.supabase.co' },
      ],
      // Performance: Add resource hints
      meta: [
        { name: 'theme-color', content: '#1e293b' },
        { name: 'msapplication-TileColor', content: '#1e293b' },
        { name: 'msapplication-config', content: '/browserconfig.xml' },
      ],
    },
  },

  modules: [
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-i18n-micro',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
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

  // Performance optimizations
  experimental: {
    payloadExtraction: true, // Enable payload extraction for better caching
    renderJsonPayloads: true,
    typedPages: true,
    viewTransition: true,
    defaults: {
      nuxtLink: {
        // Performance: Prefetch on hover
        prefetch: true,
        prefetchOn: { interaction: true },
      },
    },
  },

  // Nitro performance optimizations
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      crawlLinks: true,
      routes: ['/'],
    },
    // Enable compression
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    // Performance headers
    routeRules: {
      // Cache static assets aggressively
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Cache images
      '/images/**': {
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
      },
      // Pre-rendered pages
      '/': {
        prerender: true,
      },
      '/about': {
        prerender: true,
      },
    },
  },

  vite: {
    server: {
      allowedHosts: ['dev.nebengyu.web.id'],
    },
    build: {
      sourcemap: false,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
    // Optimize deps
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core'],
    },
  },

  // Supabase configuration
  supabase: {
    types: false,
    redirect: false,
  },

  // Image optimization
  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpg', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          width: 100,
          height: 100,
        },
      },
    },
    // Use ipx for local image optimization
    ipx: {
      maxAge: 60 * 60 * 24 * 30, // 30 days cache
    },
  },

  // PWA configuration with performance optimizations
  pwa: {
    registerType: 'prompt',
    strategies: 'generateSW',
    // Disable in dev to speed up HMR
    disable: process.env.NODE_ENV === 'development',

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
      skipWaiting: true,
      clientsClaim: true,

      runtimeCaching: [
        // Supabase Auth - NetworkOnly
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
        // Images - CacheFirst with longer expiration
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 2592000, // 30 days
            },
          },
        },
      ],
    },

    devOptions: {
      enabled: false, // Disable in dev for faster builds
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
