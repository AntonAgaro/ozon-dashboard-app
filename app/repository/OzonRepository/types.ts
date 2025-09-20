import type { ApiResponse } from '~/repository/types';
import type { GoodItem } from '~/shared/Good/types';

export type getGoodsResponse = ApiResponse & {
  cursor: string;
  items: GoodItem[];
  total: number;
};
