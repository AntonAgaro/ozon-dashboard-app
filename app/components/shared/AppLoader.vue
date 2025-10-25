<template>
  <!-- Top progress bar during route navigation -->
  <UProgress
    v-if="isRouteLoading"
    class="fixed inset-x-0 top-0 z-[1000] h-2"
    :value="undefined"
    color="primary"
    size="md"
  />

  <!-- Fullscreen overlay during data fetching (not during route transitions) -->
  <div v-if="showOverlay" class="fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm flex items-center justify-center">
    <div class="flex items-center gap-3 rounded-md bg-white/90 dark:bg-gray-900/90 px-4 py-3 shadow">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="w-6 h-6 animate-spin text-primary-500" />
      <span class="text-sm font-medium">Loading…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLoadingStore } from '~/composables/stores/LoadingStore';

const { isRouteLoading, isDataLoading } = useLoadingStore();

// Show overlay only when data is loading and route is not loading
const showOverlay = computed(() => isDataLoading.value && !isRouteLoading.value);
</script>

<style scoped></style>
