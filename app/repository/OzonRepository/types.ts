import type { ApiResponse } from '~/repository/types';
import type { GoodItem } from '~/features/Good/types';
import type { RemainGoodItem } from '~/features/Remains/types';

export type getGoodsResponse = ApiResponse & {
  cursor: string;
  items: GoodItem[];
  total: number;
};

export type getRemainsResponse = ApiResponse & {
  items: RemainGoodItem[];
};
