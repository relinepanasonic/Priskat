const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('bible_verses').select('translation').limit(100);
  const uniqueTranslations = [...new Set(data.map(d => d.translation))];
  console.log('Translations found in first 100 rows:', uniqueTranslations);
  
  // also check another translation
  const { data: d2 } = await supabase.from('bible_verses').select('translation').neq('translation', 'TB').limit(1);
  console.log('Other translation:', d2);
}

run();
