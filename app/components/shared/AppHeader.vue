<template>
  <header class="p-2 flex items-center gap-4">
    <UButton color="info" to="/">На главную</UButton>
    <ColorModeIcon />
  </header>
</template>

<script setup lang="ts">
import ColorModeIcon from '~/components/shared/ColorModeIcon.vue';
</script>

<style scoped></style>
