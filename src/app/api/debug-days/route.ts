import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  
  const { data: days, error } = await supabase.from('devotion_plan_days').select('*').limit(5);
  
  return NextResponse.json({
    days,
    error
  });
}
