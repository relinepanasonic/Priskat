const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2].trim();
  return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const titles_id = [
    'gaji tidak cukup',
    'penolakan bukan',
    'luka yang kita bawa',
    'tak tergoyahkan',
    'Rumah yang damai'
  ];
  
  for (const t of titles_id) {
    const { data, error } = await supabase.from('devotion_plans').select('id, title, title_id, cover_image_url').ilike('title_id', '%' + t + '%');
    console.log('--- ' + t + ' ---');
    console.log(data);
  }
}
run();
