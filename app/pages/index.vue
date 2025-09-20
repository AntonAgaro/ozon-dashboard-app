<template>
  <div class="p-4">
    <!--    <h2>INDEX</h2>-->
    <!--    <button @click="getClusters">Склады</button>-->
    <!--    <button @click="getGoods">Товары</button>-->
    <!--    <button @click="getRemains">Остатки</button>-->
    <div v-if="goodsGroup" class="flex flex-col gap-24">
      <div v-for="(value, index) in Object.values(goodsGroup)" :key="index" class="flex flex-col gap-4 p-2 border-2">
        <h2>Артикул: {{ value[0].offerId }}</h2>
        <h2>Название: {{ value[0].name }}</h2>
        <UTable :data="formatDataForTable(value)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const goods = ref([]);
const goodsGroup = ref({});
const { $api } = useNuxtApp();
onMounted(async () => {
  const goodsRes = await $api.ozon.getGoods();

  if (!goodsRes.items) {
    console.error('Error with getting goods!');
    return;
  }

  goods.value = goodsRes.items;

  const skus = [];

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

  const remainsRes = await $fetch('/api/getRemains', {
    method: 'POST',
    body: {
      skus: skus,
    },
  });

  console.log(remainsRes);

  if (!remainsRes.items && !Array.isArray(remainsRes.items)) {
    console.error(`Error with remains getting, skus: ${skus},
    Remains: ${remainsRes}`);
    return;
  }

  remainsRes.items.forEach((goodItem) => {
    if (!goodsGroup.value[goodItem.sku]) {
      goodsGroup.value[goodItem.sku] = [];
    }
    goodsGroup.value[goodItem.sku].push({
      sku: goodItem.sku,
      name: goodItem.name,
      offerId: goodItem.offer_id,
      Cluster: goodItem.cluster_name,
      Warhouse: goodItem.warehouse_name,
      GoodsCount: goodItem.available_stock_count,
      Saled: goodItem.ads_cluster,
    });
  });

  console.log(goodsGroup.value);
});

function formatDataForTable(array) {
  console.log('VALUE: ', array);
  return array.map((value) => {
    return {
      Cluster: value.Cluster,
      Warhouse: value.Warhouse,
      GoodsCount: value.GoodsCount,
      Saled: value.Saled,
      // 'Кол-во доступ. к продаже': value.GoodsCount,
      // 'Среднесут. ко-во прод. за 28 дней': value.Saled,
    };
  });
}

async function getClusters() {
  const res = await $fetch('/api/getClusters', {
    method: 'POST',
    body: {
      id: 123,
      test: '213',
    },
  });

  console.log('res: ', res);
}

async function getGoods() {
  const res = await $fetch('/api/getGoods', {
    method: 'POST',
    body: {
      id: 123,
      test: '213',
    },
  });

  console.log('res: ', res);
}

async function getRemains() {
  const res = await $fetch('/api/getRemains', {
    method: 'POST',
    body: {
      id: 123,
      test: '213',
    },
  });

  console.log(res);
}
</script>

<style scoped></style>
