<template>
  <div v-if="needRefresh" class="reload-prompt">
    <div class="reload-prompt-content">
      <span class="reload-prompt-text">Update tersedia! 🎉</span>
      <div class="reload-prompt-actions">
        <button @click="updateServiceWorker()" class="reload-btn">
          Reload
        </button>
        <button @click="closePrompt()" class="dismiss-btn">
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Access $pwa from Nuxt app
const { $pwa } = useNuxtApp()

// Reactive refs from $pwa
const needRefresh = computed(() => $pwa?.needRefresh ?? false)
const offlineReady = computed(() => $pwa?.offlineReady ?? false)

// Methods
const updateServiceWorker = () => {
  $pwa?.updateServiceWorker()
}

const closePrompt = () => {
  $pwa?.closePrompt()
}

// Show console message when offline ready
watch(offlineReady, (ready) => {
  if (ready) {
    console.log('App ready to work offline')
  }
})
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
