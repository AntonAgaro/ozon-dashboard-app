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

//Докидываю товары, по которым нет данных в ответе по остаткам, чтобы их тоже отобразить в таблице
const uniqueGoodsSkuWithRemainingsData = new Set([...remainsRes.items.map((i) => i.sku.toString())]);
const missingGoodsSku = remainsRes.skus.filter((i) => !uniqueGoodsSkuWithRemainingsData.has(i));
const missingGoodsItemsWithStubsRemainings = missingGoodsSku.map((sku) => {
  const goodObject = remainsRes.allGoods.find((good) => good.stocks[0]?.sku === +sku);
  if (!goodObject) {
    console.log(`good object for sku: ${sku} was not found!`);
  }

  return { sku: +sku, name: goodObject?.offer_id, offer_id: goodObject?.offer_id } as RemainGoodItem;
});

tableItems.value = [...remainsRes.items, ...missingGoodsItemsWithStubsRemainings];

onMounted(() => {
  console.log('Товары без данных по остаткам: ', missingGoodsItemsWithStubsRemainings);

  // const uniqs = new Set([...remainsRes.items.map((i) => i.sku.toString())]);
  // console.log(uniqs);
  // console.log(remainsRes.skus);
  // const missing = remainsRes.skus.filter((i) => !uniqs.has(i));
  // console.log(missing);
  // console.log(remainsRes);
});
</script>

<style scoped></style>
