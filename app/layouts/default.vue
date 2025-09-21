<template>
  <div>
    <AppHeader />
    <slot />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/shared/AppHeader.vue';
</script>

<style scoped></style>
