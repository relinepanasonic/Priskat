require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    // Just output an API endpoint that we can call
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  const branches = [
    { kota: "Jabodetabek", provinsi: "Jakarta Raya", negara: "Indonesia" },
    { kota: "Bandung", provinsi: "Jawa Barat", negara: "Indonesia" },
    { kota: "Semarang", provinsi: "Jawa Tengah", negara: "Indonesia" },
    { kota: "Jogja", provinsi: "Yogyakarta", negara: "Indonesia" },
    { kota: "Solo", provinsi: "Jawa Tengah", negara: "Indonesia" },
    { kota: "Surabaya", provinsi: "Jawa Timur", negara: "Indonesia" },
    { kota: "Kediri", provinsi: "Jawa Timur", negara: "Indonesia" },
    { kota: "Malang", provinsi: "Jawa Timur", negara: "Indonesia" },
    { kota: "Palembang", provinsi: "Sumatera Selatan", negara: "Indonesia" },
    { kota: "Manado", provinsi: "Sulawesi Utara", negara: "Indonesia" },
    { kota: "Makasar", provinsi: "Sulawesi Selatan", negara: "Indonesia" },
    { kota: "Banjarmasin", provinsi: "Kalimantan Selatan", negara: "Indonesia" },
    { kota: "Kasri", provinsi: "Kalimantan Selatan", negara: "Indonesia" },
    { kota: "Atambua", provinsi: "Nusa Tenggara Timur", negara: "Indonesia" },
    { kota: "Keningau", provinsi: "Sabah", negara: "Malaysia" },
    { kota: "Sabah", provinsi: "Sabah", negara: "Malaysia" },
  ];

  for (const b of branches) {
    // Check if exists
    const { data } = await supabase.from('branches').select('id').eq('kota', b.kota);
    if (!data || data.length === 0) {
      const { error } = await supabase.from('branches').insert(b);
      if (error) console.error("Error inserting:", b.kota, error.message);
      else console.log("Inserted:", b.kota);
    }
  }
  console.log("Seeding complete!");
}
run();
