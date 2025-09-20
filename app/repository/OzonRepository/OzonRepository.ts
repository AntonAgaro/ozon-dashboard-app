import { RepositoryFactory } from '~/repository/RepositoryFactory';
import type { getGoodsResponse } from '~/repository/OzonRepository/types';

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
}
