export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const CLIENT_ID = process.env.CLIENT_ID;
  const API_KEY = process.env.API_KEY;
  const res = await fetch('https://api-seller.ozon.ru/v1/analytics/stocks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': CLIENT_ID,
      'Api-Key': API_KEY,
    },
    body: JSON.stringify({
      skus: body?.skus,
    }),
  });

  const json = await res.json();
  return json;
});
