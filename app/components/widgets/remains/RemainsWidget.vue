<template>
  <UTable :sticky="true" class="sticky-first-col h-[80vh]" :columns="uiColumns" :data="uiRows"> </UTable>
</template>

<script setup lang="ts">
import type { RemainGoodItem } from '~/features/Remains/types';
import type { Cluster } from '~/features/Cluster/types';

const props = defineProps<{
  items: RemainGoodItem[];
}>();

//TODO убрать те, у которых вообще нет товаров
//Список кластеров
const clusterOrder = computed<Cluster[]>(() => {
  const map = new Map<number, string>();
  for (const goodRemainItem of props.items) {
    const { cluster_id, cluster_name } = goodRemainItem;
    if (!map.has(cluster_id)) map.set(cluster_id, cluster_name);
  }
  return Array.from(map, ([id, name]) => ({ id, name }));
});

//Собираем колонки. Первая для товаров, остальные с названиями кластеров
type Col = { accessorKey: string; header: string };
const uiColumns = computed(() => {
  const cols: Col[] = [{ accessorKey: 'goodId', header: 'Товары' }];
  for (const cluster of clusterOrder.value) {
    cols.push({ accessorKey: `cluster-${cluster.id}`, header: cluster.name });
  }
  return cols;
});

// console.log('uiColumns: ', uiColumns.value);
//Собираем строки (data в Utable). Каждая строка - товар, в колонках остатки по каждому кластеру
const uiRows = computed(() => {
  //Название товара: {артикул: строчка, колонки: остатки по каждому кластеру}
  const byGood = new Map<string, { goodId: string; cells: Record<string, number> }>();

  for (const goodRemainItem of props.items) {
    //Артикул, кластер, остаток
    const { offer_id, cluster_id, available_stock_count } = goodRemainItem;

    if (!byGood.has(offer_id)) {
      byGood.set(offer_id, { goodId: offer_id, cells: {} });
    }

    //Формируем колонки по каждому кластеру
    const good = byGood.get(offer_id)!;
    const clusterName = `cluster-${cluster_id}`;
    good.cells[clusterName] = available_stock_count ?? 0;
  }

  // console.log(byGood);

  const rows = Array.from(byGood.values()).map((good) => {
    const row: Record<string, any> = { goodId: good.goodId, class: { td: 'c-red' } };
    for (const cluster of clusterOrder.value) {
      row[`cluster-${cluster.id}`] = good.cells[`cluster-${cluster.id}`] ?? 0;
    }
    return row;
  });

  // console.log('ROWS: ', rows);

  return rows;
});
</script>

<style>
.sticky-first-col td:first-child {
  position: sticky;
  left: 0;
  cursor: pointer;
}

html.dark .sticky-first-col td {
  color: white;
  &:first-child {
    color: oklch(12.9% 0.042 264.695);
    background: oklch(92.4% 0.12 95.746);
  }
}

html.Light .sticky-first-col td {
  color: oklch(12.9% 0.042 264.695);

  &:first-child {
    background: oklch(82.8% 0.111 230.318);
  }
}
</style>
