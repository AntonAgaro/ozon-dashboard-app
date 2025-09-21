import { OzonRepository } from '~/repository/OzonRepository/OzonRepository';
import { AuthRepository } from '~/repository/AuthRepository/AuthRepository';

export default defineNuxtPlugin({
  name: 'appFetch',
  parallel: true,
  setup() {
    const appFetch = $fetch.create({
      onRequest: ({ options }) => {
        if (import.meta.browser) {
          options.credentials = 'include';
        }
      },
      onResponse({ response }) {
        if (import.meta.browser) {
          const toast = useToast();
          if (response._data.message) {
            toast.add({
              title: response._data.status === 'success' ? 'Success!' : 'Error!',
              description: response._data.message,
              color: response._data.status,
            });
          }
        }
      },
    });

    const repositories = {
      ozon: new OzonRepository(appFetch),
      auth: new AuthRepository(appFetch),
    };

    return {
      provide: {
        api: repositories,
      },
    };
  },
});
