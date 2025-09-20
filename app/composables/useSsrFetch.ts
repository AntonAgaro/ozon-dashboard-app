import type { AsyncDataOptions } from '#app';

export default async function useSsrFetch<T>(
  key: string,
  promise: () => Promise<T>,
  defaultValue = {},
  asyncDataOptions: AsyncDataOptions<T> = {}
) {
  const { data, error } = await useAsyncData<T>(
    key,
    () => {
      return promise();
    },
    asyncDataOptions
  );

  if (!data || data.value === null || error.value) {
    console.log(`Error or no data with ssr fetching for key: "${key}": `, error.value ?? '');
    return defaultValue as T;
  }

  return data.value as T;
}
