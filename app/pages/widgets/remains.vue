<template>
  <div class="p-4">
    <UCard>
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2 class="text-xl font-semibold">Остатки товаров</h2>
        <div v-if="totalGoods && totalClusters" class="text-sm text-gray-500">
          <span>{{ totalGoods }} товаров</span>
          <span class="mx-1">•</span>
          <span>{{ totalClusters }} складов / clusters</span>
        </div>
      </div>
    </UCard>

    <RemainsWidget v-if="tableItems.length" class="mt-6" :items="tableItems" />
  </div>
</template>

<script setup lang="ts">
import type { GoodItem } from '~/features/Good/types';
import RemainsWidget from '~/components/widgets/remains/RemainsWidget.vue';
import type { RemainGoodItem } from '~/features/Remains/types';
const tableItems = ref<RemainGoodItem[]>([]);
const goods = ref<GoodItem[]>([]);
const totalGoods = ref(0);
const totalClusters = ref(0);
const { $api } = useNuxtApp();
onMounted(async () => {
  const goodsRes = await $api.ozon.getGoods();

  if (!goodsRes.items) {
    console.error('Error with getting goods!');
    return;
  }

  goods.value = goodsRes.items;
  totalGoods.value = goodsRes.total;

  const skus: string[] = [];

  goods.value.forEach((good) => {
    const stock = good?.stocks[0];

    if (!stock) {
      console.error(`No stocks for ${good}`);
      return;
    }

    if (!stock.sku) {
      console.error(`No sku for ${good}`);
      return;
    }
    skus.push(stock.sku.toString());
  });

  const remainsRes = await $api.ozon.getRemains({ skus: skus });

  console.log(remainsRes);

  if (!remainsRes.items && !Array.isArray(remainsRes.items)) {
    console.error(`Error with remains getting, skus: ${skus},
    Remains: ${remainsRes}`);
    return;
  }

  tableItems.value = remainsRes.items;
});
</script>

<style scoped></style>
