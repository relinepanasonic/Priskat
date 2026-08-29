import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  
  // Find the duplicate plan with ~100 days
  const { data: plans } = await supabase.from('devotion_plans').select('id, title');
  
  if (plans) {
    // We just want to clean up the bad insert. We will delete all "With All Your Heart" plans that are directly under "Love" instead of "Love of God"
    const { data: loveCat } = await supabase.from('devotion_categories').select('id').eq('name', 'Love').is('parent_id', null).single();
    if (loveCat) {
       await supabase.from('devotion_plans').delete().eq('category_id', loveCat.id).eq('title', 'With All Your Heart');
    }
  }
  
  return NextResponse.json({ success: true });
}
