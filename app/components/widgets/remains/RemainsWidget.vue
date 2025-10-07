<template>
  <div>
    <UCard>
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2 class="text-xl font-semibold">Остатки товаров</h2>
        <div v-if="itemsCount && clusterOrder.length" class="text-sm text-gray-500">
          <span>{{ itemsCount }} товаров</span>
          <span class="mx-1">•</span>
          <span>{{ clusterOrder.length }} складов / clusters</span>
        </div>
        <UButton size="sm" @click="exportToCsv">💾 Export CSV</UButton>
      </div>
    </UCard>
    <UTable :sticky="true" class="mt-6 sticky-first-col h-[80vh]" :columns="uiColumns" :data="uiRows"> </UTable>
  </div>
</template>

<script setup lang="ts">
import type { RemainGoodItem } from '#shared/Remains/types';
import type { Cluster } from '#shared/Cluster/types';

const props = defineProps<{
  items: RemainGoodItem[];
  goodsCount: number;
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

const itemsCount = computed(() => {
  const uniques = new Set<number>([...props.items.map((i) => i.sku)]);
  return uniques.size;
});

//Собираем колонки. Товары, Остатки, Остатки по каждому кластеру
type Col = { accessorKey: string; header: string };
const uiColumns = computed(() => {
  const cols: Col[] = [
    { accessorKey: 'goodId', header: 'Товары' },
    { accessorKey: 'remains', header: 'Остаток' },
  ];
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
    good.cells['remains'] = (good.cells['remains'] ?? 0) + (available_stock_count ?? 0);
  }

  // console.log(byGood);

  const rows = Array.from(byGood.values()).map((good) => {
    const row: Record<string, any> = {
      goodId: good.goodId,
      class: { td: 'c-red' },
      remains: good.cells['remains'] ?? 0,
    };
    for (const cluster of clusterOrder.value) {
      row[`cluster-${cluster.id}`] = good.cells[`cluster-${cluster.id}`] ?? 0;
    }
    return row;
  });

  // console.log('ROWS: ', rows);

  return rows;
});

function exportToCsv() {
  const headers = uiColumns.value.map((c) => c.header);
  const keys = uiColumns.value.map((c) => c.accessorKey);

  const escapeCsv = (val: any) => {
    if (val == null) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Excel expects semicolons instead of commas (especially with Russian locale)
  const rows = uiRows.value.map((row) => keys.map((key) => escapeCsv(row[key])).join(';'));

  // UTF-8 BOM + semicolon-delimited content
  const csvContent = '\ufeff' + [headers.map(escapeCsv).join(';'), ...rows].join('\r\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `remains_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
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
