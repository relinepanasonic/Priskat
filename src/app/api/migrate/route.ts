import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const branches = [
    { kota: 'Jabodetabek', provinsi: 'Jakarta Raya', negara: 'Indonesia' },
    { kota: 'Bandung', provinsi: 'Jawa Barat', negara: 'Indonesia' },
    { kota: 'Semarang', provinsi: 'Jawa Tengah', negara: 'Indonesia' },
    { kota: 'Jogja', provinsi: 'Yogyakarta', negara: 'Indonesia' },
    { kota: 'Solo', provinsi: 'Jawa Tengah', negara: 'Indonesia' },
    { kota: 'Surabaya', provinsi: 'Jawa Timur', negara: 'Indonesia' },
    { kota: 'Kediri', provinsi: 'Jawa Timur', negara: 'Indonesia' },
    { kota: 'Malang', provinsi: 'Jawa Timur', negara: 'Indonesia' },
    { kota: 'Palembang', provinsi: 'Sumatera Selatan', negara: 'Indonesia' },
    { kota: 'Manado', provinsi: 'Sulawesi Utara', negara: 'Indonesia' },
    { kota: 'Makasar', provinsi: 'Sulawesi Selatan', negara: 'Indonesia' },
    { kota: 'Banjarmasin', provinsi: 'Kalimantan Selatan', negara: 'Indonesia' },
    { kota: 'Kasri', provinsi: 'Kalimantan Selatan', negara: 'Indonesia' },
    { kota: 'Atambua', provinsi: 'Nusa Tenggara Timur', negara: 'Indonesia' },
    { kota: 'Keningau', provinsi: 'Sabah', negara: 'Malaysia' },
    { kota: 'Sabah', provinsi: 'Sabah', negara: 'Malaysia' },
  ];

  let inserted = 0;
  for (const b of branches) {
    const { data } = await supabase.from('branches').select('id').eq('kota', b.kota);
    if (!data || data.length === 0) {
      await supabase.from('branches').insert(b);
      inserted++;
    }
  }

  return NextResponse.json({ msg: 'Seeded branches', inserted });
}
