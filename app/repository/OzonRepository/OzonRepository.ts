import { RepositoryFactory } from '~/repository/RepositoryFactory';
import type { getGoodsResponse, getRemainsResponse } from '~/repository/OzonRepository/types';

export class OzonRepository extends RepositoryFactory {
  async getGoods(params: { limit?: number } = {}) {
    const { limit } = params;
    return this.call<getGoodsResponse>('/api/getGoods', {
      method: 'POST',
      body: {
        limit: limit || 1000,
      },
    });
  }

  async getRemains(params: { skus: string[] }) {
    const { skus } = params;
    return this.call<getRemainsResponse>('/api/getRemains', {
      method: 'POST',
      body: {
        skus,
      },
    });
  }
}
