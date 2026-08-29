require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from('alumni_database').select('*').limit(1);
  console.log(error || Object.keys(data[0]));
}
run();
