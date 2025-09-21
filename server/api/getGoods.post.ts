export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const res = await fetch('https://api-seller.ozon.ru/v4/product/info/stocks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': process.env.CLIENT_ID || '',
      'Api-Key': process.env.API_KEY || '',
    },
    body: JSON.stringify({
      filter: {
        visibility: 'ALL',
      },
      limit: body.limit || 1000,
    }),
  });

  return await res.json();
});
