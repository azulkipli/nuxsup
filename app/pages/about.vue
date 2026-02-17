<script setup lang="ts">
const { $t } = useI18n()
</script>

<template>
  <section id="pageAbout" class="py-12">
    <div class="container mx-auto px-4 md:px-6 max-w-4xl">
      <UCard class="[&>div]:p-8">
        <UiSectionHeader
          icon="i-lucide-info"
          :title="String($t('title'))"
          :description="String($t('description'))"
        />
      </UCard>
    </div>
  </section>
</template>
