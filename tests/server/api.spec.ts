import { setup, $fetch } from '@nuxt/test-utils';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// Start Nuxt server to test API routes, provide required env
await setup({
  server: true,
  env: {
    LOGIN: 'admin',
    PASSWORD: 'secret',
    JWT_SECRET: 'test-secret',
    CLIENT_ID: 'cid',
    API_KEY: 'key',
  },
});

describe('Server API routes', () => {
  describe('/api/login', () => {
    const OLD_ENV = { ...process.env };
    beforeAll(() => {
      process.env.LOGIN = 'admin';
      process.env.PASSWORD = 'secret';
      process.env.JWT_SECRET = 'test-secret';
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });
    it('returns error when missing credentials', async () => {
      const res = await $fetch('/api/login', { method: 'POST', body: {} });
      expect(res).toEqual({ status: 'error', message: 'No login or password' });
    });

    it('returns error on wrong credentials', async () => {
      const res = await $fetch('/api/login', { method: 'POST', body: { login: 'nope', password: 'nope' } });
      expect(res).toEqual({ status: 'error', message: 'Incorrect login or password' });
    });

    it.skip('returns success on correct credentials', async () => {
      const res = await $fetch('/api/login', { method: 'POST', body: { login: 'admin', password: 'secret' } });
      expect(res).toEqual({ status: 'success', message: 'Successfully auth' });
    });
  });

  describe('/api/getRemains', () => {
    beforeAll(() => {
      vi.restoreAllMocks();
    });

    it.skip('batches skus and returns combined items', async () => {
      // Mock external OZON fetch used inside the handler
      const mockItems = [
        { offer_id: 'GOOD-1', sku: 1001, cluster_id: 1, cluster_name: 'S1', available_stock_count: 5, ads: 0 },
        { offer_id: 'GOOD-2', sku: 1002, cluster_id: 2, cluster_name: 'S2', available_stock_count: 7, ads: 0 },
      ];

      const originalFetch = global.fetch;
      vi.stubGlobal('fetch', (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as any)?.url;
        if (typeof url === 'string' && url.includes('/v1/analytics/stocks')) {
          return {
            ok: true,
            json: async () => ({ items: mockItems }),
          } as any;
        }
        return (originalFetch as any)(input as any, init as any);
      }) as unknown as typeof fetch);

      const res = await $fetch('/api/getRemains', {
        method: 'POST',
        body: { skus: ['1001', '1002'] },
      });

      expect((res as any).status).toBe('success');
      expect(Array.isArray((res as any).items)).toBe(true);
      expect((res as any).items.length).toBe(2);
      expect((res as any).skus).toEqual(['1001', '1002']);
      expect((res as any).goodsCount).toBe(2);

      vi.unstubAllGlobals();
    });
  });
});
