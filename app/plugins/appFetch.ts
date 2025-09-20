import { OzonRepository } from '~/repository/OzonRepository/OzonRepository';

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
    });

    const repositories = {
      ozon: new OzonRepository(appFetch),
    };

    return {
      provide: {
        api: repositories,
      },
    };
  },
});
