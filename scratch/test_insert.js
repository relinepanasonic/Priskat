const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data: cohorts } = await supabase.from('camp_cohorts').select('id').limit(1);
  if (!cohorts || cohorts.length === 0) return console.log('No cohorts found');
  
  const { data: users } = await supabase.from('profiles').select('id').limit(1);
  if (!users || users.length === 0) return console.log('No users found');

  const cohort_id = cohorts[0].id;
  const user_id = users[0].id;

  const { data, error } = await supabase.from('camp_chats').insert({
    cohort_id: cohort_id,
    user_id: user_id,
    message: 'Test message',
    target_group: 'all'
  });

  console.log('Chat Insert Error:', error);

  const { data: crewData, error: crewError } = await supabase.from('camp_crew').insert({
    cohort_id: cohort_id,
    name: 'Test Crew',
    position: 'Test Position'
  });
  
  console.log('Crew Insert Error:', crewError);
}

testInsert();
