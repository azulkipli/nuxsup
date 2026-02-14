# PWA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Progressive Web App functionality for Nuxsup with offline-first caching, update prompts, and push notifications.

**Architecture:** Using @vite-pwa/nuxt module with GenerateSW strategy for automatic service worker generation. Intelligent caching strategies for Supabase endpoints (auth, REST, storage) with user-controlled updates and optional push notifications.

**Tech Stack:** @vite-pwa/nuxt, workbox, web-push, Nuxt 4, Supabase

---

## Task 1: Install PWA Module and Dependencies

**Files:**

- Modify: `package.json`
- Modify: `nuxt.config.ts`

**Step 1: Install @vite-pwa/nuxt module**

Run: `bun install -D @vite-pwa/nuxt`
Expected: Module installed successfully

**Step 2: Install web-push for push notifications**

Run: `bun install web-push`
Expected: Package installed successfully

**Step 3: Add module to nuxt.config.ts**

Edit `nuxt.config.ts`, add to modules array:

```typescript
modules: ["@nuxtjs/supabase", "@vite-pwa/nuxt"],
```

**Step 4: Verify configuration loads**

Run: `bun run dev`
Expected: Dev server starts without errors

**Step 5: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts
git commit -m "feat: install @vite-pwa/nuxt module and web-push"
```

---

## Task 2: Generate PWA Icons

**Files:**

- Create: `public/pwa-192x192.png`
- Create: `public/pwa-512x512.png`
- Create: `public/apple-touch-icon.png`

**Step 1: Create 192x192 icon with slate theme**

Generate a simple icon with slate-700 (#334155) background and white "N" text centered.

Using ImageMagick:

```bash
convert -size 192x192 xc:"#334155" \
  -gravity center \
  -font Arial -pointsize 120 \
  -fill white -annotate +0+0 "N" \
  public/pwa-192x192.png
```

Expected: Icon created at public/pwa-192x192.png

**Step 2: Create 512x512 maskable icon**

```bash
convert -size 512x512 xc:"#334155" \
  -gravity center \
  -font Arial -pointsize 320 \
  -fill white -annotate +0+0 "N" \
  public/pwa-512x512.png
```

Expected: Icon created at public/pwa-512x512.png

**Step 3: Create 180x180 Apple touch icon**

```bash
convert -size 180x180 xc:"#334155" \
  -gravity center \
  -font Arial -pointsize 112 \
  -fill white -annotate +0+0 "N" \
  public/apple-touch-icon.png
```

Expected: Icon created at public/apple-touch-icon.png

**Step 4: Verify icons exist**

Run: `ls -lh public/*.png`
Expected: All three icons listed

**Step 5: Commit**

```bash
git add public/*.png
git commit -m "feat: add PWA icons with slate theme"
```

---

## Task 3: Configure PWA Manifest and Workbox

**Files:**

- Modify: `nuxt.config.ts`

**Step 1: Add PWA configuration to nuxt.config.ts**

Add after the `supabase` configuration block:

```typescript
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
        purpose: 'any maskable'
      }
    ]
  },

  workbox: {
    cleanupOutdatedCaches: true,
    globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    navigateFallback: '/',
    navigateFallbackDenylist: [/^\/api/, /^\/auth\/callback/],

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
    type: 'classic',
    navigateFallbackAllowlist: [/^\/$/]
  },

  client: {
    installPrompt: true,
    periodicSyncForUpdates: 3600
  }
},
```

**Step 2: Verify configuration is valid**

Run: `bun run dev`
Expected: Server starts, PWA manifest generated at /.well-known/manifest.webmanifest

**Step 3: Check browser console for PWA**

Open browser to http://localhost:3000
Check console for service worker registration
Expected: No errors, service worker registered

**Step 4: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat: configure PWA manifest and Supabase caching strategies"
```

---

## Task 4: Create ReloadPrompt Component

**Files:**

- Create: `app/components/ReloadPrompt.vue`

**Step 1: Create ReloadPrompt component**

Create `app/components/ReloadPrompt.vue`:

```vue
<template>
  <div v-if="needRefresh" class="reload-prompt">
    <div class="reload-prompt-content">
      <span class="reload-prompt-text">Update tersedia! 🎉</span>
      <div class="reload-prompt-actions">
        <button @click="updateServiceWorker()" class="reload-btn">
          Reload
        </button>
        <button @click="closePrompt()" class="dismiss-btn">Dismiss</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Access $pwa from Nuxt app
const { $pwa } = useNuxtApp();

// Reactive refs from $pwa
const needRefresh = computed(() => $pwa?.needRefresh ?? false);
const offlineReady = computed(() => $pwa?.offlineReady ?? false);

// Methods
const updateServiceWorker = () => {
  $pwa?.updateServiceWorker();
};

const closePrompt = () => {
  $pwa?.closePrompt();
};

// Show console message when offline ready
watch(offlineReady, (ready) => {
  if (ready) {
    console.log("App ready to work offline");
  }
});
</script>

<style scoped>
.reload-prompt {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  background: #1e293b;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 320px;
}

.reload-prompt-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reload-prompt-text {
  font-size: 14px;
  font-weight: 500;
}

.reload-prompt-actions {
  display: flex;
  gap: 8px;
}

.reload-btn,
.dismiss-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.reload-btn {
  background: #3b82f6;
  color: white;
  flex: 1;
}

.reload-btn:hover {
  background: #2563eb;
}

.dismiss-btn {
  background: transparent;
  color: #cbd5e1;
  border: 1px solid #475569;
  flex: 1;
}

.dismiss-btn:hover {
  background: #334155;
  border-color: #64748b;
}

@media (max-width: 640px) {
  .reload-prompt {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
```

**Step 2: Verify component exists**

Run: `ls -lh app/components/ReloadPrompt.vue`
Expected: File exists

**Step 3: Commit**

```bash
git add app/components/ReloadPrompt.vue
git commit -m "feat: add ReloadPrompt component for PWA updates"
```

---

## Task 5: Integrate ReloadPrompt in App

**Files:**

- Modify: `app/app.vue`

**Step 1: Add ReloadPrompt to app.vue**

Edit `app/app.vue`:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <ReloadPrompt />
  </ClientOnly>
</template>
```

**Step 2: Test in browser**

Run: `bun run dev`
Open browser console
Expected: No errors, component renders (but hidden until update available)

**Step 3: Commit**

```bash
git add app/app.vue
git commit -m "feat: integrate ReloadPrompt component in app"
```

---

## Task 6: Generate VAPID Keys for Push Notifications

**Files:**

- Create: `.env.example` (if doesn't exist)
- Modify: `.env` (local only, not committed)

**Step 1: Generate VAPID keys**

Run: `bunx web-push generate-vapid-keys`
Expected: Outputs public and private keys

**Step 2: Create .env.example template**

Create `.env.example`:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Push Notifications (generate with: bunx web-push generate-vapid-keys)
NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY=your_public_vapid_key
NUXT_PUSH_VAPID_PRIVATE_KEY=your_private_vapid_key
```

**Step 3: Add actual keys to .env**

Edit `.env` (your local file) and add the generated VAPID keys:

```env
NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY=<paste_public_key_here>
NUXT_PUSH_VAPID_PRIVATE_KEY=<paste_private_key_here>
```

**Step 4: Verify .env is gitignored**

Run: `git check-ignore .env`
Expected: .env (confirms it's ignored)

**Step 5: Commit .env.example only**

```bash
git add .env.example
git commit -m "feat: add VAPID keys template for push notifications"
```

---

## Task 7: Add Runtime Config for VAPID Keys

**Files:**

- Modify: `nuxt.config.ts`

**Step 1: Add runtimeConfig to nuxt.config.ts**

Add after the `pwa` configuration block:

```typescript
runtimeConfig: {
  public: {
    pushVapidPublicKey: process.env.NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY || ''
  },
  pushVapidPrivateKey: process.env.NUXT_PUSH_VAPID_PRIVATE_KEY || ''
},
```

**Step 2: Verify config loads**

Run: `bun run dev`
Check that no errors occur
Expected: Server starts successfully

**Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat: add runtime config for VAPID keys"
```

---

## Task 8: Create Push Notification Subscribe Endpoint

**Files:**

- Create: `server/api/push/subscribe.post.ts`

**Step 1: Create subscribe endpoint**

Create `server/api/push/subscribe.post.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const subscription = await readBody(event);

  // Store subscription using Nitro storage
  const storage = useStorage("push-subscriptions");
  const id = crypto.randomUUID();

  await storage.setItem(id, subscription);

  return { success: true, id };
});
```

**Step 2: Verify file exists**

Run: `ls -lh server/api/push/subscribe.post.ts`
Expected: File exists

**Step 3: Test endpoint**

Run: `bun run dev`
Test with curl:

```bash
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"test","keys":{}}'
```

Expected: {"success":true,"id":"..."}

**Step 4: Commit**

```bash
git add server/api/push/subscribe.post.ts
git commit -m "feat: add push notification subscribe endpoint"
```

---

## Task 9: Create Push Notification Send Endpoint

**Files:**

- Create: `server/api/push/send.post.ts`

**Step 1: Create send endpoint**

Create `server/api/push/send.post.ts`:

```typescript
import webpush from "web-push";

export default defineEventHandler(async (event) => {
  const { title, body, subscriptionId } = await readBody(event);

  const config = useRuntimeConfig();

  // Configure web-push
  webpush.setVapidDetails(
    "mailto:noreply@nuxsup.app",
    config.public.pushVapidPublicKey,
    config.pushVapidPrivateKey,
  );

  // Get subscription from storage
  const storage = useStorage("push-subscriptions");
  const subscription = await storage.getItem(subscriptionId);

  if (!subscription) {
    throw createError({
      statusCode: 404,
      message: "Subscription not found",
    });
  }

  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({ title, body }),
    );
    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to send notification",
    });
  }
});
```

**Step 2: Verify file exists**

Run: `ls -lh server/api/push/send.post.ts`
Expected: File exists

**Step 3: Verify types**

Run: `bun run dev`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add server/api/push/send.post.ts
git commit -m "feat: add push notification send endpoint"
```

---

## Task 10: Create Push Notification Client Composable

**Files:**

- Create: `app/composables/usePushNotifications.ts`

**Step 1: Create composable**

Create `app/composables/usePushNotifications.ts`:

```typescript
export const usePushNotifications = () => {
  const config = useRuntimeConfig();
  const isSubscribed = ref(false);
  const subscriptionId = ref<string | null>(null);

  // Helper to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  // Check if already subscribed
  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        isSubscribed.value = true;
        // Try to get ID from localStorage
        subscriptionId.value = localStorage.getItem("push-subscription-id");
      }

      return !!subscription;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          config.public.pushVapidPublicKey,
        ),
      });

      // Send subscription to server
      const response = await $fetch("/api/push/subscribe", {
        method: "POST",
        body: subscription,
      });

      if (response.success && response.id) {
        subscriptionId.value = response.id;
        localStorage.setItem("push-subscription-id", response.id);
        isSubscribed.value = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      return false;
    }
  };

  // Unsubscribe
  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        localStorage.removeItem("push-subscription-id");
        subscriptionId.value = null;
        isSubscribed.value = false;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  };

  // Initialize on mount
  onMounted(() => {
    checkSubscription();
  });

  return {
    isSubscribed,
    subscriptionId,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
};
```

**Step 2: Verify file exists**

Run: `ls -lh app/composables/usePushNotifications.ts`
Expected: File exists

**Step 3: Commit**

```bash
git add app/composables/usePushNotifications.ts
git commit -m "feat: add usePushNotifications composable"
```

---

## Task 11: Build and Test PWA

**Files:**

- None (testing only)

**Step 1: Build for production**

Run: `bun run build`
Expected: Build completes successfully, service worker generated

**Step 2: Preview production build**

Run: `bun run preview`
Expected: Server starts on port 3000

**Step 3: Test PWA in browser**

1. Open http://localhost:3000
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Check Manifest tab - verify name, icons, colors
5. Test offline: Check "Offline" in Network tab
6. Refresh page - should still work

Expected: All checks pass

**Step 4: Run Lighthouse PWA audit**

Open DevTools → Lighthouse
Run audit for PWA category
Expected: Score 80+ (100 after HTTPS deployment)

**Step 5: Document results**

Note any issues found during testing

---

## Task 12: Update Documentation

**Files:**

- Modify: `docs/plans/2026-02-13-pwa-implementation-design.md`
- Create: `README.md` (or modify if exists)

**Step 1: Add implementation notes to design doc**

Add "Implementation Notes" section to design doc with:

- Any deviations from original design
- Issues encountered and solutions
- Testing results
- Known limitations

**Step 2: Update README with PWA info**

Add section about PWA features:

```markdown
## PWA Features

This app is a Progressive Web App with:

- ✅ Offline-first caching
- ✅ Installable on mobile and desktop
- ✅ Push notifications support
- ✅ Automatic updates with user control

### Development

PWA is enabled in development mode. Service worker will be active at http://localhost:3000

### Package Manager using Bun

change npm install with bun install or bun add
change npm run dev with bun run dev
change npm run generate with bun run generate
change bunx with bunx

### Push Notifications Setup

1. Generate VAPID keys: `bunx web-push generate-vapid-keys`
2. Add keys to `.env` (see `.env.example`)
3. Use `usePushNotifications()` composable in components
```

**Step 3: Commit**

```bash
git add docs/plans/2026-02-13-pwa-implementation-design.md README.md
git commit -m "docs: update documentation with PWA implementation notes"
```

---

## Task 13: Final Verification and Cleanup

**Files:**

- None (verification only)

**Step 1: Run type check**

Run: `bunx nuxi typecheck`
Expected: No TypeScript errors

**Step 2: Run linter**

Run: `bun run lint` (if available)
Expected: No linting errors

**Step 3: Verify all commits follow convention**

Run: `git log --oneline -15`
Expected: All commits have proper prefixes (feat:, docs:, etc.)

**Step 4: Push branch**

Run: `git push -u origin feature/pwa-implementation`
Expected: Branch pushed successfully

**Step 5: Use finishing-a-development-branch skill**

Use @superpowers:finishing-a-development-branch to:

- Verify all tests pass
- Present merge/PR options
- Clean up worktree

---

## Success Criteria

- [x] PWA module installed and configured
- [x] Icons generated and manifest configured
- [x] Service worker caching Supabase endpoints appropriately
- [x] Update prompt component working
- [x] Push notification infrastructure complete
- [x] Development mode PWA functional
- [x] Production build generates valid PWA
- [x] Lighthouse PWA audit passes (80+)
- [x] Documentation updated
- [x] All code committed with proper messages

## Testing Commands

```bash
# Development
bun run dev

# Production build
bun run build
bun run preview

# Type checking
bunx nuxi typecheck

# Generate VAPID keys
bunx web-push generate-vapid-keys
```

## Notes

- Service worker only works over HTTPS in production (localhost exception)
- Push notifications require user permission
- Test offline mode in DevTools Network tab
- Icons can be regenerated with better design later
- Consider adding more sophisticated icon design with designer skill
