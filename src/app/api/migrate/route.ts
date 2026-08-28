import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check columns
  const { data, error } = await supabase.from('alumni_database').select('*').limit(2);
  
  if (error) {
    return NextResponse.json({ error });
  }
  
  return NextResponse.json({ data, keys: data.length ? Object.keys(data[0]) : [] });
}
