require('dotenv').config({ path: '../../artifacts/tenantspace/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('requests').select('*').limit(1);
  console.log('requests table:', { data, error });
  
  const { data: d2, error: e2 } = await supabase.from('maintenance_requests').select('*').limit(1);
  console.log('maintenance_requests table:', { data: d2, error: e2 });
}
check();
