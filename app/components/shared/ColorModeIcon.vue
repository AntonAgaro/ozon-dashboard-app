<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UIcon
      class="cursor-pointer"
      :name="isDark ? 'i-heroicons:moon-solid' : 'i-heroicons:sun'"
      size="32"
      @click="isDark = !isDark"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { AppThemes } from '#shared/UxConfig/types';

const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === AppThemes.Dark;
  },

  set(_isDark) {
    colorMode.preference = _isDark ? AppThemes.Dark : AppThemes.Light;
  },
});
</script>

<style scoped></style>
