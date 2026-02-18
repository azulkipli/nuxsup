# Nuxsup - Project Context

## Project Overview

**Nuxsup** is a Progressive Web Application (PWA) built with **Nuxt 4** and **Vue 3**, featuring Supabase authentication, offline-first caching, and push notification support. The app is designed to be installable on mobile and desktop devices with a modern, responsive UI.

### Core Features

- **Nuxt 4** with Vue 3 Composition API (`<script setup>`)
- **Supabase Authentication** (OAuth, email/password)
- **PWA** with offline-first caching strategies via `@vite-pwa/nuxt`
- **Push Notifications** via VAPID/web-push
- **i18n** support (Indonesian default, English)
- **TailwindCSS 4** styling with `@nuxt/ui` components
- **Dark mode** support via `@nuxtjs/color-mode`
- **Image optimization** via `@nuxt/image`

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Nuxt | ^4.3.1 |
| Vue | Vue 3 | ^3.5.27 |
| Auth | @nuxtjs/supabase | 2.0.3 |
| PWA | @vite-pwa/nuxt | ^1.1.1 |
| UI | @nuxt/ui | ^4.4.0 |
| Styling | TailwindCSS 4 | ^4.1.18 |
| i18n | nuxt-i18n-micro | ^3.9.0 |
| Icons | @nuxt/icon | ^2.2.1 |
| Images | @nuxt/image | ^2.0.0 |
| Push | web-push | ^3.6.7 |
| Performance | nuxt-vitalizer | ^2.0.0 |
| Runtime | Bun | - |
| Package Manager | pnpm | - |

---

## Project Structure

```
nuxsup/
├── app/
│   ├── assets/css/main.css       # Global styles, Tailwind imports
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── icons/                # Icon components
│   │   ├── ColorModeToggle.vue
│   │   ├── InstallPrompt.vue     # PWA install prompt
│   │   ├── LanguageSwitcher.vue  # i18n language switcher
│   │   ├── ReloadPrompt.vue      # PWA update prompt
│   │   └── UserAvatar.vue
│   ├── composables/
│   │   └── usePushNotifications.ts  # Push notification composable
│   ├── layouts/                  # App layouts
│   ├── middleware/               # Route middleware
│   ├── pages/                    # File-based routing
│   │   ├── index.vue             # Home page (landing)
│   │   ├── about.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── profil.vue
│   │   └── ...
│   ├── app.config.ts             # App-level config (UI colors)
│   └── app.vue                   # Root component
├── server/
│   └── api/push/
│       ├── subscribe.post.ts     # Store push subscription
│       └── send.post.ts          # Send push notification
├── public/
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── locales/
│   ├── id.json                   # Indonesian (default)
│   └── en.json                   # English
├── docs/plans/                   # Implementation plans
├── .cert/                        # SSL certificates (dev)
├── .vscode/                      # VS Code settings
├── nuxt.config.ts                # Nuxt configuration
├── tsconfig.json                 # TypeScript config
├── eslint.config.mjs             # ESLint flat config
├── .prettierrc                   # Prettier config
└── package.json
```

---

## Building and Running

### Prerequisites

- **Bun** runtime installed
- **pnpm** for package management (lockfile is pnpm)

### Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Production build
bun run build

# Preview production build
bun run preview

# Generate static site
bun run generate

# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Format code with Prettier
bun run format

# Check formatting
bun run format:check

# Post-install (prepare Nuxt types)
bun run postinstall
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in required values:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Push Notifications
NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY=your_public_vapid_key
NUXT_PUSH_VAPID_PRIVATE_KEY=your_private_vapid_key
```

Generate VAPID keys:
```bash
bunx web-push generate-vapid-keys
```

---

## PWA Configuration

### Caching Strategies (Workbox)

| Endpoint | Strategy | TTL | Cache Name |
|----------|----------|-----|------------|
| `/auth/v1/*` | NetworkOnly | - | - |
| `/rest/v1/*` | StaleWhileRevalidate | 24 hrs | sb-data |
| `/storage/v1/*` | CacheFirst | 30 days | sb-storage |
| `/realtime/v1/*` | NetworkOnly | - | - |
| Images (`png,jpg,svg,webp`) | CacheFirst | 30 days | images |

### PWA Settings

- **Register Type**: `prompt` - User must approve updates
- **Strategy**: `generateSW` - Auto-generated service worker
- **Dev Mode**: PWA disabled in development for faster HMR

### Excluded Routes

- `/api/*` - Server API routes bypass service worker
- `/auth/callback` - OAuth callback flow

---

## Development Conventions

### Code Style

- **Semi**: No semicolons
- **Quotes**: Single quotes
- **Tab Width**: 2 spaces
- **Trailing Comma**: ES5 (objects/arrays only)
- **Print Width**: 100 characters
- **Arrow Parens**: Avoid when single param

### ESLint + Prettier

- ESLint flat config enabled (`.eslint.config.mjs`)
- Prettier handles formatting via `eslint-plugin-prettier`
- Format on save enabled in VS Code
- ESLint fixes run on save

### Vue Patterns

- Always use **Composition API** with `<script setup lang="ts">`
- Use `defineAsyncComponent()` for lazy-loading non-critical components
- Composables follow VueUse patterns
- i18n via `useI18n()` composable with `$t()` helper

### TypeScript

- Solution-style tsconfig referencing `.nuxt/` generated configs
- Strict typing for composables and components
- Use `computed()`, `ref()`, `watch()` from Vue

---

## Key Components

### ReloadPrompt.vue

Displays update notification when new service worker is detected. User can choose to reload or dismiss.

```vue
<ClientOnly>
  <ReloadPrompt />
</ClientOnly>
```

### InstallPrompt.vue

Shows install banner for PWA on supported devices.

### usePushNotifications.ts

Composable for managing push notification subscriptions:

```ts
const { isSubscribed, subscribe, unsubscribe } = usePushNotifications()
```

---

## i18n Setup

- **Default Locale**: Indonesian (`id`)
- **Strategy**: `prefix_except_default`
- **Files**: `locales/id.json`, `locales/en.json`
- **Usage**: `const { $t } = useI18n()`

---

## Server API Endpoints

### Push Notifications

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/push/subscribe` | Store push subscription in Nitro storage |
| POST | `/api/push/send` | Send push notification via web-push |

---

## Performance Optimizations

### Nuxt Config

- **SSR**: Disabled (`ssr: false`) for SPA mode
- **Payload Extraction**: Enabled for caching
- **JSON Payloads**: Enabled
- **View Transitions**: Enabled

### Vitalizer (LCP Optimization)

The `nuxt-vitalizer` module improves Google Lighthouse LCP scores:

```ts
vitalizer: {
  disablePrefetchLinks: 'dynamicImports', // Remove prefetch for dynamic imports
  disablePreloadLinks: false,             // Keep preload links
  disableStylesheets: false,              // Don't remove stylesheets by default
}
```

**Features:**
- Removes `<link rel="prefetch">` for dynamic imports only
- Prevents accumulation of unnecessary chunk downloads
- Improves Largest Contentful Paint (LCP) score

### Vite Build

- **Source Maps**: Disabled in production
- **Minify**: Terser with console stripping
- **CSS Code Split**: Enabled
- **Optimize Deps**: Pre-bundle Vue, Vue Router, VueUse

### Nitro

- **Compression**: Brotli + Gzip enabled
- **Route Rules**: Cache headers for static assets (1 year)
- **Prerender**: Home and about pages

### CSS

- Font smoothing optimized
- Reduced motion support for accessibility
- Scrollbar hidden but functional (`.no-scrollbar`)

---

## VS Code Setup

Recommended extensions (`.vscode/extensions.json`):

- `dbaeumer.vscode-eslint`
- `esbenp.prettier-vscode`
- `Vue.volar`
- `bradlc.vscode-tailwindcss`

Settings enable:

- ESLint flat config
- Format on save with Prettier
- ESLint fix on save

---

## Common Tasks

### Adding a New Page

Create file in `app/pages/`:

```vue
<script setup lang="ts">
const { $t } = useI18n()
</script>

<template>
  <div>
    <h1>{{ $t('page.title') }}</h1>
  </div>
</template>
```

### Adding a New Composable

Create file in `app/composables/`:

```ts
// app/composables/useMyFeature.ts
export const useMyFeature = () => {
  const state = ref(null)
  
  const action = async () => {
    // logic
  }
  
  return { state, action }
}
```

### Adding Translations

1. Add key to `locales/id.json` and `locales/en.json`
2. Use via `{{ $t('key.path') }}`

---

## Debugging

### Service Worker

1. Open DevTools → Application → Service Workers
2. Check registration status
3. Test offline mode in Network tab

### PWA Manifest

Visit `/.well-known/manifest.webmanifest` to verify manifest

### Lighthouse

Run PWA audit in DevTools → Lighthouse

---

## Notes

- Service worker requires HTTPS in production (localhost exempt)
- Push notifications require user permission
- `.env` is gitignored - use `.env.example` as template
- PWA disabled in dev mode for faster HMR
- Bun runtime used for development commands
