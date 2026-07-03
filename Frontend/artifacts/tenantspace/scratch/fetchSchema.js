require('dotenv').config({ path: '../../artifacts/tenantspace/.env' });

async function fetchSchema() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const data = await res.json();
  console.log(Object.keys(data.definitions || data.components?.schemas || {}));
}
fetchSchema();
