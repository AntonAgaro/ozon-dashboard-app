import type { getGoodsResponse, GoodItem } from '#shared/Good/types';
import type { getRemainsOzonResponse, RemainGoodItem } from '#shared/Remains/types';

export default defineEventHandler(async (event) => {
  const nitro = useNitroApp();
  const body = await readBody(event);
  const CLIENT_ID = process.env.CLIENT_ID ?? '';
  const API_KEY = process.env.API_KEY ?? '';
  const skus: string[] = body?.skus ?? [];
  let allGoods: getGoodsResponse | null = null;
  const goodsWithoutSku: GoodItem[] = [];

  // E2E mode: return deterministic mock without external calls
  if (process.env.E2E === '1' || process.env.NUXT_E2E === '1') {
    const mockSkus = skus.length ? skus : ['1001', '1002'];
    const items: RemainGoodItem[] = [
      { offer_id: 'GOOD-1', sku: Number(mockSkus[0]), cluster_id: 1, cluster_name: 'Склад 1', available_stock_count: 5, ads: 1 } as RemainGoodItem,
      { offer_id: 'GOOD-2', sku: Number(mockSkus[1] ?? '1002'), cluster_id: 2, cluster_name: 'Склад 2', available_stock_count: 7, ads: 1 } as RemainGoodItem,
    ];
    return {
      status: 'success',
      items,
      skus: mockSkus,
      goodsCount: mockSkus.length,
      allGoods: [
        { offer_id: 'GOOD-1', stocks: [{ sku: Number(mockSkus[0]) }] } as any,
        { offer_id: 'GOOD-2', stocks: [{ sku: Number(mockSkus[1] ?? '1002') }] } as any,
      ],
      goodsWithoutSku,
    };
  }

  if (!body?.skus) {
    const goodsRes = await nitro.localFetch('/api/getGoods', {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          visibility: 'ALL',
        },
        limit: 1000,
      }),
    });

    if (!goodsRes.ok) {
      throw new Error(`Failed to fetch goods: ${goodsRes.statusText}`);
    }

    allGoods = (await goodsRes.json()) as getGoodsResponse;

    allGoods.items.forEach((good) => {
      const stock = good?.stocks[0];

      if (!stock) {
        console.error(`No stocks for good with offer_id ${good.offer_id}`);
        goodsWithoutSku.push(good);
        return;
      }

      if (!stock.sku) {
        console.error(`No sku for ${good}`);
        return;
      }
      skus.push(stock.sku.toString());
    });
  }

  //Запрашиваем остатки пачками по 100 skus - ограничение озон апи
  const remains: RemainGoodItem[] = [];
  const batchSize = 100;

  for (let i = 0; i < skus.length; i += batchSize) {
    const batch = skus.slice(i, i + batchSize);
    const res = await fetch('https://api-seller.ozon.ru/v1/analytics/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        'Api-Key': API_KEY,
      },
      body: JSON.stringify({
        skus: batch,
      }),
    });

    const json = (await res.json()) as getRemainsOzonResponse;
    remains.push(...json.items);
    // console.log('Batch length: ', batch.length);
    // console.log('Remains length: ', remains.length);
  }

  return {
    status: 'success',
    items: remains,
    skus: skus,
    goodsCount: skus.length,
    allGoods: allGoods?.items ?? [],
    goodsWithoutSku,
  };
});
