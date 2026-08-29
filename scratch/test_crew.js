require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl) return console.log('no db config');
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('camp_crew').select('*').limit(1);
  if (error) console.log('Error:', error.message);
  else console.log('camp_crew exists:', data);
}
run();
