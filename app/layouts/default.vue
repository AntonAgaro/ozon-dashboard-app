<template>
  <UApp>
    <div class="container">
      <AppHeader />
      <AppLoader />
      <slot />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import AppHeader from '~/components/shared/AppHeader.vue';
import AppLoader from '~/components/shared/AppLoader.vue';
</script>

<style scoped></style>
