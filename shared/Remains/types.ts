import type { ApiResponse } from '#shared/types';
import type { getGoodsResponse, GoodItem } from '#shared/Good/types';

export type RemainGoodItem = {
  ads: number;
  ads_cluster: number;
  available_stock_count: number;
  cluster_id: number;
  cluster_name: string;
  days_without_sales: number;
  days_without_sales_cluster: number;
  excess_stock_count: number;
  expiring_stock_count: number;
  idc: number;
  idc_cluster: number;
  item_tags: string[];
  name: string;
  offer_id: string;
  other_stock_count: number;
  requested_stock_count: number;
  return_from_customer_stock_count: number;
  return_to_seller_stock_count: number;
  sku: number;
  stock_defect_stock_count: number;
  transit_defect_stock_count: number;
  transit_stock_count: number;
  turnover_grade: string;
  turnover_grade_cluster: string;
  valid_stock_count: number;
  waiting_docs_stock_count: number;
  warehouse_id: number;
  warehouse_name: string;
};

export type getRemainsOzonResponse = ApiResponse & {
  items: RemainGoodItem[];
};

export type getRemainsApiResponse = ApiResponse & {
  items: RemainGoodItem[];
  goodsCount: number;
  skus: string[];
  allGoods: GoodItem[];
  goodsWithoutSku: GoodItem[];
};
