import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  
  const { data: plans, error: pError } = await supabase.from('devotion_plans').select('id, title, category_id');
  const { data: cats, error: cError } = await supabase.from('devotion_categories').select('id, name, parent_id');
  
  return NextResponse.json({
    plans: plans,
    plansCount: plans?.length || 0,
    pError,
    cats: cats,
    cError
  });
}
