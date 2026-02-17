# Nuxsup

Nuxt 4 application with Supabase authentication and PWA support.

## Features

- Nuxt 4 with Vue 3 Composition API
- TailwindCSS 4 styling
- Supabase Authentication (OAuth, email/password)
- Progressive Web App (PWA) with offline-first caching
- Installable on mobile and desktop
- Push Notifications via VAPID/web-push
- User-controlled app updates (prompt-based)

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Nuxt 4 (`nuxt@^4.3.1`)              |
| Auth      | `@nuxtjs/supabase`                  |
| PWA       | `@vite-pwa/nuxt` (GenerateSW)       |
| Styling   | TailwindCSS 4 (`@tailwindcss/vite`) |
| Push      | `web-push` (VAPID)                  |
| Runtime   | Bun                                 |

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server (PWA enabled)
bun run dev

# Production build
bun run build
bun run preview
```

## PWA

The app is a fully offline-capable Progressive Web App.

### Caching Strategies

Supabase endpoints are cached with purpose-built strategies:

| Endpoint         | Strategy             | TTL     |
| ---------------- | -------------------- | ------- |
| `/auth/v1/*`     | NetworkFirst         | 5 min   |
| `/rest/v1/*`     | StaleWhileRevalidate | 24 hrs  |
| `/storage/v1/*`  | CacheFirst           | 30 days |
| `/realtime/v1/*` | NetworkOnly          | --      |

Static assets (`js`, `css`, `html`, `png`, `svg`, `ico`) are precached at build time.

### App Updates

Register type is `prompt` -- when a new service worker is detected, a `ReloadPrompt` banner appears so the user can choose to reload immediately or defer.

### Excluded Routes

- `/api/*` -- server-side API routes bypass the service worker
- `/auth/callback` -- OAuth callback flow

## Push Notifications

### Setup

1. Generate VAPID keys:

   ```bash
   bunx web-push generate-vapid-keys
   ```

2. Add keys to `.env` (see `.env.example`):
   ```env
   NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY=<public_key>
   NUXT_PUSH_VAPID_PRIVATE_KEY=<private_key>
   ```

### Usage

```vue
<script setup>
const { isSubscribed, subscribe, unsubscribe } = usePushNotifications()
</script>
```

### Server Endpoints

| Method | Path                  | Description             |
| ------ | --------------------- | ----------------------- |
| POST   | `/api/push/subscribe` | Store push subscription |
| POST   | `/api/push/send`      | Send push notification  |

## Environment Variables

See `.env.example` for all required variables:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Push Notifications
NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY=your_public_vapid_key
NUXT_PUSH_VAPID_PRIVATE_KEY=your_private_vapid_key
```

## Project Structure

```
nuxsup/
├── app/
│   ├── assets/css/main.css
│   ├── components/
│   │   └── ReloadPrompt.vue        # PWA update prompt
│   ├── composables/
│   │   └── usePushNotifications.ts  # Push notification composable
│   └── app.vue
├── public/
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── server/
│   └── api/push/
│       ├── subscribe.post.ts
│       └── send.post.ts
├── nuxt.config.ts
└── .env.example
```
