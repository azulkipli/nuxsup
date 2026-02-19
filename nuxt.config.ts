// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Enable SSR for hybrid rendering (SSG + SSR)
  ssr: false,

  // Disable devtools in production
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  // Set source directory to 'app/' folder
  srcDir: 'app/',

  // Performance: Disable auto-imports for unused composables
  imports: {
    // Auto-import only what's used
    autoImport: true,
    // Disable transpilation of imports
    transpile: false,
    // Import specific Vue composables (tree-shake unused)
    imports: [
      { from: 'vue', name: 'computed' },
      { from: 'vue', name: 'ref' },
      { from: 'vue', name: 'reactive' },
      { from: 'vue', name: 'watch' },
      { from: 'vue', name: 'watchEffect' },
      { from: 'vue', name: 'onMounted' },
      { from: 'vue', name: 'onUnmounted' },
    ],
  },

  // Component imports - only import used components
  components: {
    dirs: [
      {
        path: '~/components',
        extensions: ['.vue'],
        // Only register components when used
        pathPrefix: '',
      },
    ],
    // Enable tree-shaking for components
    global: false,
  },

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
    [
      '@nuxt/ui',
      {
        // Tree-shake unused components
        prefix: 'U',
        // Only include components that are actually used
        global: false,
      },
    ],
    '@nuxt/image',
    'nuxt-vitalizer',
    '@nuxtjs/critters',
    [
      '@nuxt/icon',
      {
        // Tree-shake unused icons - only bundle used icons
        provider: 'iconify',
      },
    ],
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
    // Bundle optimization
    bundle: {
      // Optimize translation messages
      optimizeTranslationDirective: true,
    },
  },

  // CSS path is now relative to srcDir ('app/')
  css: ['./assets/css/main.css'],

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
      // Exclude dev-sw.js from prerendering
      failOnError: false,
    },
    // Enable compression
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    // Hybrid rendering configuration (SSG + SSR)
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
      // Pre-rendered pages (SSG) - generated at build time
      '/': {
        prerender: true,
      },
      '/about': {
        prerender: true,
      },
      // Dynamic routes use SSR with caching
      '/profil/**': {
        ssr: true,
        swr: 300, // Cache for 5 minutes
      },
      // Auth pages are client-side only (no SSR needed)
      '/login': {
        ssr: false,
      },
      '/register': {
        ssr: false,
      },
      // Exclude PWA dev-sw.js routes
      '/dev-sw.js**': {
        prerender: false,
        ssr: false,
        cache: false,
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
      // Rollup options for better tree-shaking
      rollupOptions: {
        output: {
          // Manual chunks for better code splitting
          manualChunks: {
            // Separate vendor chunks
            vendor: ['vue', 'vue-router'],
          },
        },
        // Better tree-shaking
        treeshake: {
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
    // Optimize deps
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core'],
    },
    // Suppress Vue Router warnings for PWA dev-sw
    define: {
      __VUE_PROD_DEVTOOLS__: false,
    },
    // Better tree-shaking for production
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },

  // Supabase configuration
  supabase: {
    types: false,
    redirect: false,
    // Disable auto-import of composables to reduce bundle size
    composables: false,
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

    // Development options
    devOptions: {
      enabled: false, // Keep disabled for faster HMR
      type: 'module',
      suppressWarnings: true, // Suppress dev-sw.js warnings
    },

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
      // Only precache essential assets - reduce initial bundle
      globPatterns: ['**/*.{html,css}'],
      globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js', '**/_payload.json', '**/*.png', '**/*.jpg'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api/],
      skipWaiting: true,
      clientsClaim: true,
      // Reduce bundle size by using minimal workbox build
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
      // Use runtime caching instead of precaching for dynamic content
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

    // Build options to reduce service worker bundle size
    buildOptions: {
      // Minify the service worker
      minify: true,
    },
  },

  runtimeConfig: {
    public: {
      appDebug: process.env.APP_DEBUG || 'off',
      pushVapidPublicKey: process.env.NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY || '',
    },
    pushVapidPrivateKey: process.env.NUXT_PUSH_VAPID_PRIVATE_KEY || '',
  },

  // Vitalizer configuration for LCP optimization
  // Improves Google Lighthouse LCP scores by managing prefetch/preload links
  vitalizer: {
    // Remove prefetch links for dynamic imports (default: 'dynamicImports')
    disablePrefetchLinks: 'dynamicImports',
    // Keep preload links enabled (default: false)
    disablePreloadLinks: false,
    // Don't remove stylesheets by default - requires inlineStyles setup
    disableStylesheets: false,
  },

  // Critters configuration for critical CSS inlining
  // Improves First Contentful Paint (FCP) by inlining critical CSS
  critters: {
    config: {
      // Use 'swap' for better CSS loading strategy
      preload: 'swap',
      // Inline critical CSS needed for initial render
      inlineThreshold: 2048,
      // Minimum size for external CSS file
      minimumExternalSize: 1024,
      // Don't prune unused selectors (let purgecss handle it)
      pruneSource: false,
    },
  },
})
