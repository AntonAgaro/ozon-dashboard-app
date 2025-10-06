import type { getGoodsResponse } from '#shared/Good/types';
import type { getRemainsOzonResponse, RemainGoodItem } from '#shared/Remains/types';

export default defineEventHandler(async (event) => {
  const nitro = useNitroApp();
  const body = await readBody(event);
  const CLIENT_ID = process.env.CLIENT_ID ?? '';
  const API_KEY = process.env.API_KEY ?? '';
  const skus: string[] = body?.skus ?? [];

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

    const goodsJson = (await goodsRes.json()) as getGoodsResponse;

    goodsJson.items.forEach((good) => {
      const stock = good?.stocks[0];

      if (!stock) {
        console.error(`No stocks for ${good}`);
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

  return { status: 'success', items: remains, skus: skus, goodsCount: skus.length };
});
