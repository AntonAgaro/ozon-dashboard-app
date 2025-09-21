<template>
  <UApp>
    <div class="container">
      <AppHeader />
      <slot />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import AppHeader from '~/components/shared/AppHeader.vue';
</script>

<style scoped></style>
