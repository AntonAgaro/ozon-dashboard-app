<template>
  <div class="p-4">
    <RemainsWidget
      v-if="tableItems.length"
      class="mt-6"
      :items="tableItems"
      :goods-count="remainsRes.goodsCount ?? 0"
    />
  </div>
</template>

<script setup lang="ts">
import RemainsWidget from '~/components/widgets/remains/RemainsWidget.vue';
import type { RemainGoodItem } from '#shared/Remains/types';
const tableItems = ref<RemainGoodItem[]>([]);
const { $api } = useNuxtApp();

const remainsRes = await useSsrFetch('remains-res', () => $api.ozon.getRemains());
if (!remainsRes.items && !Array.isArray(remainsRes.items)) {
  console.error(`Error with remains getting,
    Remains: ${remainsRes}`);
}
tableItems.value = remainsRes.items;

// onMounted(() => {
//   const uniqs = new Set([...remainsRes.items.map((i) => i.sku.toString())]);
//   console.log(uniqs);
//   console.log(remainsRes.skus);
//   const missing = remainsRes.skus.filter((i) => !uniqs.has(i));
//   console.log(missing);
// });
</script>

<style scoped></style>
