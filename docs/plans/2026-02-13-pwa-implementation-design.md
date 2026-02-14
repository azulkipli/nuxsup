# PWA Implementation Design for Nuxsup

**Date:** February 13, 2026  
**Project:** Nuxsup (Nuxt 4 + Supabase)  
**Module:** @vite-pwa/nuxt

## Overview

Implementasi Progressive Web App (PWA) pada aplikasi Nuxsup dengan fitur offline-first, update prompts, dan push notifications.

## Architecture

### Technology Stack

- **PWA Module:** @vite-pwa/nuxt (v0.21.0+)
- **Strategy:** GenerateSW (auto-generated service worker)
- **Register Type:** Prompt (user controls updates)
- **Push Notifications:** web-push library

### Project Structure

```
nuxsup/
├── public/
│   ├── pwa-192x192.png          # Android icon
│   ├── pwa-512x512.png          # Maskable icon
│   └── apple-touch-icon.png     # iOS icon
├── app/
│   └── components/
│       └── ReloadPrompt.vue     # Update notification UI
├── server/
│   └── api/
│       └── push/
│           ├── subscribe.post.ts   # Subscribe endpoint
│           └── send.post.ts        # Send notification endpoint
└── nuxt.config.ts               # PWA configuration
```

## Caching Strategy

### 1. Offline-First Approach

App dapat diakses offline dengan intelligent caching berdasarkan jenis data.

### 2. Supabase Endpoint Strategies

**Auth Endpoints (`/auth/v1/*`)**

- Strategy: NetworkFirst
- Timeout: 3 seconds
- Cache TTL: 5 minutes
- Rationale: Auth must be fresh, fallback for slow connections

**REST API Data (`/rest/v1/*`)**

- Strategy: StaleWhileRevalidate
- Cache TTL: 24 hours
- Rationale: Show cached data instantly, update in background

**Storage/Files (`/storage/v1/*`)**

- Strategy: CacheFirst
- Cache TTL: 30 days
- Rationale: Files rarely change, prioritize cache for bandwidth

**Realtime (`/realtime/v1/*`)**

- Strategy: NetworkOnly
- No caching
- Rationale: Realtime requires active connection

### 3. Excluded Routes

Routes not handled by service worker:

- `/auth/callback` - OAuth callback flow
- `/api/*` - Server-side API routes

## Update Strategy

### User-Controlled Updates

**Flow:**

1. Service worker detects new version
2. Banner appears: "Update tersedia! 🎉"
3. User chooses:
   - **Reload** → Immediate refresh with new version
   - **Dismiss** → Update applied on next visit

**Component: ReloadPrompt.vue**

- Position: Fixed bottom-right
- Style: Dark theme (bg-slate-800)
- Mobile responsive
- Keyboard accessible
- Uses `$pwa` composable from module

**Integration:**

- Placed in `app/app.vue` with `<ClientOnly>` wrapper
- Avoids SSR hydration mismatch
- Pure Vue 3 Composition API

## Push Notifications

### Architecture

**Server-side (Nitro API):**

- `POST /api/push/subscribe` - Store user subscription
- `POST /api/push/send` - Trigger notification

**Client-side:**

- Permission request component/composable
- VAPID key-based subscription
- Notification click handler

**Service Worker:**

- Listen to `push` events
- Display custom notifications
- Navigate on click

### VAPID Keys Setup

Generate with: `bunx web-push generate-vapid-keys`

Environment variables:

```env
NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY=<public_key>
NUXT_PUSH_VAPID_PRIVATE_KEY=<private_key>
```

### Subscription Storage

- Use Nitro's `useStorage()` for development
- Production: Store in Supabase table
- Key: User ID or session ID
- Value: PushSubscription object

### User Experience

- Optional feature (not forced)
- Activate via settings/profile
- Clear permission context
- Test notification after subscribe

## PWA Manifest

### App Identity

```json
{
  "name": "Nuxsup",
  "short_name": "Nuxsup",
  "description": "Nuxsup Progressive Web App",
  "theme_color": "#1e293b",
  "background_color": "#f8fafc",
  "display": "standalone",
  "orientation": "portrait"
}
```

### Icons

Generated from brand colors (slate theme):

- 192x192 PNG - Standard Android
- 512x512 PNG - Maskable for adaptive icons
- 180x180 PNG - Apple touch icon

## Development

### Dev Mode Configuration

```typescript
devOptions: {
  enabled: true,
  type: 'classic',
  navigateFallbackAllowlist: [/^\/$/]
}
```

Service worker enabled in development for testing.

### Testing Checklist

- [ ] Install prompt appears
- [ ] App works offline
- [ ] Update prompt shows on new version
- [ ] Push notifications work
- [ ] Icons display correctly on home screen
- [ ] Cached data loads offline
- [ ] Auth persists offline

## Implementation Steps

1. Install @vite-pwa/nuxt module
2. Generate PWA icons (192x192, 512x512)
3. Configure nuxt.config.ts with manifest and workbox options
4. Create ReloadPrompt.vue component
5. Add component to app.vue
6. Generate VAPID keys for push notifications
7. Create push notification API routes
8. Test in development mode
9. Test production build
10. Verify PWA requirements (Lighthouse)

## Success Criteria

- App installable on all platforms (Android, iOS, Desktop)
- Works offline with cached content
- Update flow smooth and non-disruptive
- Push notifications functional (optional feature)
- Lighthouse PWA score: 100/100
- Service worker caches appropriate resources
- No hydration errors
- Compatible with Supabase auth flow

## Future Enhancements

- Background sync for offline mutations
- Periodic background sync
- Share target API integration
- Advanced notification strategies
- Offline queue for failed requests
