import { computed } from 'vue';
//Используем инкремент чисел для корректного отображения загрузки в случае нескольких параллельных запросов
export function useLoadingStore() {
  const routeCounter = useState<number>('route-loading-counter', () => 0);
  const dataCounter = useState<number>('data-loading-counter', () => 0);

  function incRoute() {
    routeCounter.value += 1;
  }

  function decRoute() {
    routeCounter.value = Math.max(0, routeCounter.value - 1);
  }

  function incData() {
    dataCounter.value += 1;
  }

  function decData() {
    dataCounter.value = Math.max(0, dataCounter.value - 1);
  }

  const isRouteLoading = computed(() => routeCounter.value > 0);
  const isDataLoading = computed(() => dataCounter.value > 0);

  return { incRoute, decRoute, incData, decData, isRouteLoading, isDataLoading };
}
