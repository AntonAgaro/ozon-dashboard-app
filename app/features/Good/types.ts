export type GoodItem = {
  offer_id: string;
  product_id: number;
  stocks: Stock[];
};

type Stock = {
  present: number;
  reserved: number;
  shipment_type: string;
  sku: number;
  type: string;
  warehouse_ids: string[];
};
