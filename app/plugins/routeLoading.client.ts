import { useLoadingStore } from '~/composables/stores/LoadingStore';

export default defineNuxtPlugin((nuxtApp) => {
  const { incRoute, decRoute } = useLoadingStore();

  nuxtApp.hook('page:start', () => {
    incRoute();
  });

  nuxtApp.hook('page:finish', () => {
    decRoute();
  });

  // In case of errors during navigation, ensure we decrement
  nuxtApp.hook('vue:error', () => {
    decRoute();
  });
});
