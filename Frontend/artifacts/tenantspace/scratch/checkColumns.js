require('dotenv').config({ path: '../../artifacts/tenantspace/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('maintenance_requests').insert([{ fake_col: 1 }]);
  console.log(error);
}
check();
