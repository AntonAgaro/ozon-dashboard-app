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
        <div class="flex items-center gap-2">
          <UInput v-model="searchQuery" size="sm" placeholder="Поиск товара" />
          <UButton size="sm" @click="exportToCsv">💾 Export CSV</UButton>
          <UButton>TEST</UButton>
        </div>
      </div>
    </UCard>
    <UTable :sticky="true" class="mt-6 sticky-first-col h-[80vh]" :columns="uiColumns" :data="filteredSortedRows">
      <template #goodId-cell="{ row }">
        <span
          class="block w-full h-full px-2 py-1 cursor-pointer"
          :class="{ 'active-good': isActiveGood(row) }"
          @click="onGoodClick(getRowOriginal(row))"
        >
          {{ getGoodIdFromRow(row) }}
        </span>
      </template>
    </UTable>
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
//Список кластеров (базовый порядок)
const clusterOrder = computed<Cluster[]>(() => {
  const map = new Map<number, string>();
  for (const goodRemainItem of props.items) {
    const { cluster_id, cluster_name } = goodRemainItem;
    if (cluster_id && !map.has(cluster_id)) map.set(cluster_id, cluster_name);
  }
  return Array.from(map, ([id, name]) => ({ id, name }));
});

const itemsCount = computed(() => {
  const uniques = new Set<number>([...props.items.map((i) => i.sku)]);
  return uniques.size;
});

// Динамический порядок кластеров для отображения
const activeClusterSortGoodId = ref<string | null>(null);
const displayClusterOrder = computed<Cluster[]>(() => {
  if (!activeClusterSortGoodId.value) {
    return clusterOrder.value;
  }
  // Считаем остатки по кластерам для выбранного товара напрямую из исходных items
  const byCluster = new Map<number, number>();
  for (const item of props.items) {
    if (item.offer_id !== activeClusterSortGoodId.value) continue;
    const clusterId = Number(item.cluster_id);
    if (!Number.isFinite(clusterId)) continue;
    const prev = Number(byCluster.get(clusterId) ?? 0);
    const add = Number(item.available_stock_count ?? 0);
    byCluster.set(clusterId, prev + add);
  }
  // сортируем от большего к меньшему, чтобы самые большие оказались слева
  const baseIndex = new Map<number, number>(clusterOrder.value.map((c, i) => [c.id, i]));
  return [...clusterOrder.value].sort((a, b) => {
    const av = Number(byCluster.get(a.id) ?? 0);
    const bv = Number(byCluster.get(b.id) ?? 0);
    if (av !== bv) return bv - av;
    // стабильная сортировка при равенстве по исходному порядку
    return (baseIndex.get(a.id) ?? 0) - (baseIndex.get(b.id) ?? 0);
  });
});

//Собираем колонки. Товары, Остатки, Остатки по каждому кластеру
type Col = { accessorKey: string; header: string };
const uiColumns = computed(() => {
  const cols: Col[] = [
    { accessorKey: 'goodId', header: 'Товары' },
    { accessorKey: 'remains', header: 'Остаток' },
    { accessorKey: 'sales', header: 'Продажи' },
  ];
  for (const cluster of displayClusterOrder.value) {
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
    const { offer_id, cluster_id, available_stock_count, ads } = goodRemainItem;

    if (!byGood.has(offer_id)) {
      byGood.set(offer_id, { goodId: offer_id, cells: {} });
    }

    //Формируем колонки по каждому кластеру
    const good = byGood.get(offer_id)!;
    const clusterName = `cluster-${cluster_id}`;
    good.cells[clusterName] = (good.cells[clusterName] ?? 0) + (available_stock_count ?? 0);
    good.cells['remains'] = (good.cells['remains'] ?? 0) + (available_stock_count ?? 0);
    good.cells['sales'] = good.cells['sales'] ?? (ads ?? 0) * 28;
  }

  // console.log(byGood);

  const rows = Array.from(byGood.values()).map((good) => {
    const row: Record<string, any> = {
      goodId: good.goodId,
      class: {
        td: 'c-red',
      },
      remains: good.cells['remains'] ?? 0,
      sales: Math.round(good.cells['sales'] ?? 0),
    };
    for (const cluster of displayClusterOrder.value) {
      row[`cluster-${cluster.id}`] = good.cells[`cluster-${cluster.id}`] ?? 0;
    }
    return row;
  });

  return rows;
});

// Поиск и сортировка
const searchQuery = ref('');
const sortDirection = ref<'asc' | 'desc'>('desc');
// value can be 'remains' | `cluster-${id}` or null for no sort
const sortTarget = ref<string | null>(null);

function onGoodClick(row: Record<string, any>) {
  const goodId = row?.goodId as string | undefined;
  if (!goodId) return;
  // toggle: clicking same good removes sorting
  activeClusterSortGoodId.value = activeClusterSortGoodId.value === goodId ? null : goodId;
}

// Helpers for table slot typing
function getRowOriginal(row: unknown): Record<string, any> {
  return (row as any)?.original as Record<string, any>;
}

function getGoodIdFromRow(row: unknown): string {
  const original = getRowOriginal(row);
  return String(original?.goodId ?? '');
}

function isActiveGood(row: unknown): boolean {
  const id = getGoodIdFromRow(row);
  return !!id && activeClusterSortGoodId.value === id;
}

const filteredSortedRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  let rows = uiRows.value;
  if (q) {
    rows = rows.filter((r) => String(r.goodId).toLowerCase().includes(q));
  }

  const key = sortTarget.value;
  if (!key) return rows;
  const dir = sortDirection.value === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = Number(a[key] ?? 0);
    const bv = Number(b[key] ?? 0);
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });
});

function exportToCsv() {
  // Build headers and keys with empty columns after each cluster
  const headers: string[] = [];
  const keys: string[] = [];

  for (const col of uiColumns.value) {
    headers.push(col.header);
    keys.push(col.accessorKey);

    // Add empty column after each cluster column
    if (col.accessorKey.startsWith('cluster-')) {
      headers.push('');
      keys.push('');
    }

    //Add Orders col before clusters
    if (col.accessorKey === 'sales') {
      headers.push('Заказы');
      keys.push('Orders');
    }
  }

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

/* Active good: color the first cell TD background via :has on child span */
.sticky-first-col td:first-child:has(.active-good) {
  background: rgba(10, 196, 78, 0.5); /* brighter green */
}

html.dark .sticky-first-col td {
  color: white;
  &:first-child {
    color: oklch(12.9% 0.042 264.695);
    background: oklch(92.4% 0.12 95.746);
  }
}

/* Dark mode active-good override */
html.dark .sticky-first-col td:first-child:has(.active-good) {
  background: color-mix(in oklab, rgb(22 163 74) 45%, transparent); /* brighter in dark */
}

html.Light .sticky-first-col td {
  color: oklch(12.9% 0.042 264.695);

  &:first-child {
    background: oklch(82.8% 0.111 230.318);
  }
}

/* Light mode active-good override (place after Light block to win) */
html.Light .sticky-first-col td:first-child:has(.active-good) {
  background: rgba(22, 163, 74, 0.5);
}
</style>
