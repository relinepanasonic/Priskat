import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/) || envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  const { data } = await supabase.from('alumni_database').select('*').limit(2);
  console.log(data);
}
