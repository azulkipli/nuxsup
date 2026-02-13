# Nuxsup

Nuxt 4 application with Supabase authentication and PWA support.

## Features

- 🔐 Supabase Authentication
- 📱 Progressive Web App (PWA)
- 🎨 TailwindCSS 4
- ⚡ Nuxt 4

## PWA Features

This app is a Progressive Web App with:
- ✅ Offline-first caching
- ✅ Installable on mobile and desktop
- ✅ Push notifications support
- ✅ Automatic updates with user control

### Development

PWA is enabled in development mode. Service worker will be active at http://localhost:3000

```bash
npm run dev
```

### Push Notifications Setup

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Add keys to `.env` (see `.env.example`)

3. Use `usePushNotifications()` composable in components:
   ```vue
   <script setup>
   const { isSubscribed, subscribe, unsubscribe } = usePushNotifications()
   </script>
   ```

### Production Build

```bash
npm run build
npm run preview
```

## Environment Variables

See `.env.example` for required environment variables.
