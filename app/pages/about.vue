<template>
  <section id="pageAbout">
    <h1 class="text-3xl font-bold underline">{{ $t('title') }}</h1>
    <p>
      {{ $t('description') }}
    </p>
  </section>
</template>

<script setup lang="ts">
const { $t } = useI18n()
</script>

<style></style>
