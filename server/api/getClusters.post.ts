export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);

  const CLIENT_ID = process.env.CLIENT_ID;
  const API_KEY = process.env.API_KEY;

  const res = await fetch('https://api-seller.ozon.ru/v1/cluster/list', {
    method: 'POST',
    body: JSON.stringify({
      cluster_type: 'CLUSTER_TYPE_OZON',
    }),
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': CLIENT_ID,
      'Api-Key': API_KEY,
    },
  });

  const json = await res.json();

  // console.log('RES: ', json);
  return { json };
});
